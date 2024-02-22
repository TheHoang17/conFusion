const express = require('express');
const usersRouter = express.Router();
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('../models/user');
const authenticate = require('../authenticate');

usersRouter.use(bodyParser.json());

usersRouter.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id }); // Generate JWT token
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' }); // Include token in response
});


usersRouter.get('/logout', authenticate.verifyUser, (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'Logout Successful!' });
});


module.exports = usersRouter;
