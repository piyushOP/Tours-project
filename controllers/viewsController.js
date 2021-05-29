const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getOverview = catchAsync(async (req,res, next) => {
   // 1) Get tour data from DB
   const tours = await Tour.find();


   // 2) Render that template using tour data from DB.
   res.status(200).render('overview', {
      title: 'All Tours',
      tours: tours
   })
})

exports.getTour = catchAsync(async (req,res, next) => {

   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
   });

   if(!tour){
      return next(new AppError('There is no tour with that name', 404));
   }


   res.status(200).render('tour', {
      title: tour.name,
      tour: tour
   })
})

exports.getLoginForm = (req, res) => {

   res.status(200).render('login', {
      title: 'Log into your account'
   })

}


exports.getSignupForm = (req, res) => {

   res.status(200).render('signup', {
      title: 'Sign Up'
   })

}

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'Your account'
   })
}

exports.getMyTours = catchAsync(async (req, res, next) => {

   // 1) Get all Bookings
   const bookings = await Booking.find({ user: req.user.id });


   // 2) Find tours with the current IDs
   const tourIDs = bookings.map(el => el.tour);
   const tours = await Tour.find({ _id: { $in: tourIDs } }); // $in get all tours that has in tourIds array..

   res.status(200).render('overview', {
      title: 'My Tours',
      tours
   })
})