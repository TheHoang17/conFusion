const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const dishRouter = require('./routes/dishRouter');
const usersRouter = require('./routes/usersRouter');
const uploadRouter = require('./routes/uploadRouter');
const authenticate = require('./authenticate');
const config = require('./config');

const app = express();
const port = 3000;

// Connect to MongoDB
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  (db) => {
    console.log('Connected to the database');

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  },
  (err) => {
    console.error('Error connecting to the database:', err);
  }
);

// Session 
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Mount routers
app.use('/users', usersRouter);
app.use(authenticate.verifyUser); // Using JWT for authentication
app.use('/dishes', dishRouter);
	app.use('/imageUpload',uploadRouter);
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers","Content-Type");
  next();

})