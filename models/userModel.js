const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require('crypto');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide your email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type:String,
    default: 'default.jpg'
  },
  role:{
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (item) {
        return item === this.password;
      },
      message: "Password are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});


//Hashing password before saving into the Database
userSchema.pre("save", async function (next) {
  //if password is not modified just go to next middleware..
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  this.passwordConfirm = undefined;

  next();
});


// For forgot or reset password where we change passwordChangedAt property..
userSchema.pre("save", function(next){
  if(!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})




// For unactive user means user who deleted themselves from app...
userSchema.pre(/^find/, function(next){
  this.find({ active: {$ne : false} });
  next();
})




//check password for login
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


// Check whether the token is issued before the password change or not.
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);  //change time stamp as JWt time stamp

    return changedTimeStamp > JWTTimeStamp;
  }
  
  // false means NOT Changed
  return false;
}


// Password reset token for forget and reset Password API.
userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex'); // Create token with crypto - inbuilt in node modules.

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // save encrypted token to DB so, this token is useless for hacker to change the password..
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // valid for 10 mins


  return resetToken; // send this token in mail
}


const User = new mongoose.model("User", userSchema);

module.exports = User;
