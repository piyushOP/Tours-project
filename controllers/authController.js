const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");


// Create JWT token
function signToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}


// Create new Token , give response to the user..
function createSendToken (user, statusCode, res) {
  
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production'){
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions); // Saving jwt to cookie rather than local storage for security purpose..

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});



exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email & password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists & password is correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }


  // 3) If everything is ok, send jwt token to client
  createSendToken(user, 200, res);
});


exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  })
}


// Authorization
exports.protect = catchAsync( async (req,res,next) => {

  // 1) Getting token and check if it's there in headers or cookies..
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  }else if(req.cookies.jwt){
    token = req.cookies.jwt;
  }

  if(!token){
    return next(new AppError('You are not logged in! Please login in to get access', 401));
  }


  // 2) Verification of token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);


  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if(!currentUser){
    return next( new AppError('The user belonging ot this token no longer exists', 401));
  }


  // 4) Check if user changed password after the token was issued
  if(currentUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError('User recently changed password! Please login again', 401));
  }

  // Grant access to protected route & set user to currentUser
  req.user = currentUser;
  // For puh templates
  res.locals.user = currentUser;
  next();
})




// Only for render Pages, no errors, to check whether user is logged in or not..
exports.isLoggedin =  async (req,res,next) => {

  if(req.cookies.jwt){

    try{
      // 1)  Verfiy the Token
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);


      // 2) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if(!currentUser){
        return next();
      }


      // 3) Check if user changed password after the token was issued
      if(currentUser.changedPasswordAfter(decoded.iat)){
        return next();
      }

      // There is a logged in user. pug template has access to locals..
      res.locals.user = currentUser;
      return next();
    }catch(err){
      return next();
    }
  }
  
  next();
}





// Restrict user to perform some actions..
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  }
}


// To get reset token & send mail to user with reset password URL...
exports.forgotPassword = catchAsync(async (req, res, next) => {
  
  // 1) Get user based on Posted Email..
  const user = await User.findOne({ email : req.body.email });
  if(!user){
    return next(new AppError("There is not user with this email address", 404));
  }


  // 2) Generate the random token reset token..
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // we modify user data but did not save it and validation for this action is off.


  
  
  // 3) Send it to user's email..
  // If any error occur during sending the email.. 
  try{
    
    const resetURL = req.protocol+"://"+req.get('host')+"/api/v1/users/resetPassword/"+resetToken;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'Success',
      message: "Token sent to Email"
    })

  }catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
})



// Reset Password for user ..
exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1) Get user based on the resetToken
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });


  // 2) If token has not expired, and there is user, set the new password
  if(!user){
    return next(new AppError("Token is invalid or has expired",400));
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // 3) Update changedPasswordAt property for the user using DB pre method
  await user.save();


  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
})



// Update Password for the user..
exports.updatePassword = catchAsync( async (req, res, next) => {
  
  // 1) Get usser from DB
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if curr password is correct or not
  if(!await user.correctPassword(req.body.passwordCurrent, user.password)){
    return next(new AppError("Your current Password is incorrect", 401));
  }

  // 3) If so, update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Login User in, send JWT
  createSendToken(user, 200, res);
})