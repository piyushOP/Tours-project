const mongoose = require("mongoose");
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A Tour must have a name"],
    unique: true,
    trim: true,
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A Tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A Tour must have a difficulty"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'rating should be above 1.0'],
    max: [5, 'rating should be below 1.0'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A Tour must have a price"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, "A Tour must have a summary"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A Tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// set index for price and ratings for performance purposes. By Setting an index DB don't have to go through all the docs in DB to retrieve data based of price and ratingsAverage query..
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });



// Virtual populate the reviews for a tour
tourSchema.virtual('reviews', {
  ref: 'Review', // reference
  foreignField: 'tour', // which field should be selected in reviewModel
  localField: '_id' // what field of this document is present in (tour field of reviewModel).
});



// DOCUMENT MIDDLEWARE: to save the name as slug for url cause id looks weird..
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});



// Populate every tour with its guide before any find query
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  
  next();
})


const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
