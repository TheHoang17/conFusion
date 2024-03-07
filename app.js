const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const logger = require('morgan');
const path = require('path');
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
app.all('*',(req,res,next) => {
  if(req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
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
    // app.listen(port, () => {
    //   console.log(`Server is running on http://localhost:${port}`);
    // });
  },
  (err) => {
    console.error('Error connecting to the database:', err);
  }
);
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
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
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
module.exports = app;
