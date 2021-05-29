const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookies = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');


const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//  Middlewares
// implement cors for access-control-allow-origin so that everyone can use our APIs
app.use(cors());


app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

//Serving static files
app.use(express.static(path.join(__dirname, 'public'))); 



// Set Security HTTP headers
app.use(helmet({
  // To show map in UI
  contentSecurityPolicy: false,
}));


// limit apply to all APIs starting with /api
const limiter = rateLimit({ // How many request available per IP
  max: 100, //max-limit
  windowMs: 60 * 60 * 1000, //reset after 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter); 

// stripe WEB-HOOK
app.post('/webhook-checkout', express.raw({ type: 'application/json' }), bookingController.webhookCheckout);


// Used to read JSON & Cookies for authorization
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookies());

// Data Sanitization againt NoSQL query injection like "email": { "$gt": "" }, after JSON middleware
app.use(mongoSanitize());

// Data sanitization against XSS that include malacious HTML code
app.use(xss());

// Prevent parameter pollution like someone put 2 sort query in url --> /api/v1/tours?sort=duration&sort=price -> always uses last one.
app.use(hpp({
  whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'] //except these parameters
}));


// Use for compress user data for deployment..
app.use(compression());


// 2) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);




// handle 404 url...
// * --> all urls after above urls..
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server !`, 404));
});


// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
