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

router.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}))

router.get('/token', isAllowed, (req, res, next) => {
  let token = jwt.sign({
    isAuth: true
  }, 'secretpassword');
  res.cookie = token;
  res.set('Content-Type', 'application/json');
  res.send(req.user);
});

router.post('/token', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Bad email or password');
  };

  knex('users')
    .where('email', req.body.email)
    .then(users => {
      if (users.length === 0) {
        res.status(400).send('Bad email or password')
      }
      else {
        console.log('caught before bcrypt')
        console.log(users[0].hashed_password);
        console.log(req.body.password)
        bcrypt.compare(req.body.password, users[0].hashed_password)
          .then(bcryptRes => {
            console.log(bcryptRes)
            if (bcryptRes) {
              console.log('caught in res');
              delete users[0].hashed_password;
              let token = jwt.sign({
                isAuth: true
              }, 'secretpassword');
              res.cookie = token;
              res.send(humps.camelizeKeys(users[0]));
            }
            else {
              console.log('caught in else');
              res.status(400).send('Bad email or password')
            }
          })
      }
    })
});

module.exports = router;
