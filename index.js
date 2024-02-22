const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const authenticate = require('./authenticate'); // Assuming this file contains Passport authentication logic

const usersRouter = require('./routes/usersRouter');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const config = require('./config');


const hostname = 'localhost';
const port = 3000;
const url = config.mongoUrl;

const app = express();

app.use(cookieParser('12345-67890'));

const connect = mongoose.connect(url);
connect.then((db) => {
    console.log("Connected correctly to sever");
}, (err) => { console.log(err); });

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

function auth (req, res, next) {
    console.log(req.session);


  if(!req.session.user) {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
  }
  else {
    if (req.session.user === 'authenticated') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
}


app.use('/users', usersRouter);
app.use(auth); // Ensure authentication for the routes below

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
