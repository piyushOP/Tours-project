const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful !');
  });

  // console.log(process.env.NODE_ENV);
  

// SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server is on ' + port);
});


process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down !');
  server.close(() => {
    console.log('💥 Process terminated!');
  })
})