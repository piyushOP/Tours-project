const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require("./reviewRoutes");


const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkID); //Check id for invalid id

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours); //use alias middleware to change the url's query like sort and limit;

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


tourRouter
  .route('/tours-within/:distance/centre/:latlng/unit/:unit')
  .get(tourController.getToursWithin);


tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances)

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createNewTour);


tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages,tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);  //First check whether user is logged in or not. Secondly only those user which is passed to restrictTo() middleware has permission to delete a tour.



// user middleware for this url because review belong to a tour, so we get any url of this type we use reviewRouter.
tourRouter.use('/:tourId/reviews', reviewRouter);

module.exports = tourRouter;
