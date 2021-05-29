const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
   review: {
      type: String,
      required: [true, 'Review can not be empty']
   },
   rating: {
      type: Number,
      min: 1,
      max: 5
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   tour: 
      {
         type: mongoose.Schema.ObjectId,
         ref: 'Tour',
         required: [true, 'Review must be belong to a tour']
      },
   user: 
      {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
         required: [true, 'Review must belong to a user']
      }
},
{
   // Field that is not stored in a DB but can be calculated by using some other fields for DB & shows whenever there is a output.
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
});


reviewSchema.index({ tour: 1, user: 1}, { unique: true });



// populate review with user --> which user created this review
reviewSchema.pre(/^find/, function(next){
   this.populate({
      path: 'user',
      select: 'name photo'
    })

   next();
})



// calculate ratingsQuantity & ratingsAverage for a tour and then update tour with that Data..
reviewSchema.statics.calculateAverageRatings = async function(tourId){
   const stats = await this.aggregate([
      {
         $match: {tour: tourId}
      },
      {
         $group: {
            _id: '$tour',
            nRatings: { $sum: 1 },
            avgRating: { $avg: '$rating' }
         }
      }
   ])

   if(stats.length > 0){
      await Tour.findByIdAndUpdate(tourId, { 
         ratingsQuantity: stats[0].nRatings, 
         ratingsAverage: stats[0].avgRating 
      })
   }else{
      await Tour.findByIdAndUpdate(tourId, { 
         ratingsQuantity: 0, 
         ratingsAverage: 4.5 //default ratingAverage 
      })
   }

}

// Calling post middleware & static method that created above after saving a review to calculate & update the rating of a tour..
reviewSchema.post('save', function(){
   this.constructor.calculateAverageRatings(this.tour);
   
})


// calling query middleware to update averageRating and quantity when user update or delete any review.
// This can be done using two middlewares because in post we dont have access to find query ------------------
reviewSchema.pre(/^findOneAnd/, async function(next){
   this.r = await this.findOne();
   next();
})


reviewSchema.post(/^findOneAnd/, async function(){
   await this.r.constructor.calculateAverageRatings(this.r.tour);
})

// ----------------------------------------------------------------------------------------------------------


const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;