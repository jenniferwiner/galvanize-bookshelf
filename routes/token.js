'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');

// Requiring npm packages
const humps = require('humps');
const bcrypt = require('bcrypt-as-promised');
var cookieSession = require('cookie-session');
var jwt = require('jsonwebtoken');

// YOUR CODE HERE
router.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}))

router.get('/token', isAllowed, (req, res, next) => {
  let token = jwt.sign({ isAuth: true }, 'secretpassword');
  req.session.jwt = token;
  res.set('Content-Type', 'application/json')
  res.send(req.user);
})

router.post('/token', (req, res, next) => {

})

function isAllowed(req, res, next) {
  if (req.session.jwt) {
    jwt.verify(req.session.jwt, 'secretpassword', (err, decoded) => {
      if (err) {
        res.sendStatus(403);
      }
      else {
        req.user = decoded;
        next();
      }
    });
  }
  else {
    req.user = false;
    next();
  }
}

module.exports = router;
