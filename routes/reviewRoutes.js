const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams for taking tourId from tour routes because every router have their own ids..
const reviewRouter = express.Router({ mergeParams: true });


reviewRouter.use(authController.protect);

reviewRouter
   .route('/')
   .get(reviewController.getAllReviews)
   .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);


reviewRouter
   .route('/:id')
   .get(reviewController.getReview)
   .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
   .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = reviewRouter;