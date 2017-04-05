'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const humps = require('humps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session');
const boom = require('boom');

// set cookie session
router.use(cookieSession({
  name: 'session',
  keys: ['chocolatechip'],
  maxAge: 24 * 60 * 60 * 1000
}));

router.get('/', (req, res, next) => {
  if (req.session.jwt) {
    jwt.verify(req.session.jwt, 'shhhh', function(err, decoded) {
      if (err) {
        return next(boom.create(403));
      }
      res.send(true);
    });
  }
  else {
    res.send(false);
  }
});

router.post('/', (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || email === '') {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || password === '') {
    return next(boom.create(400, 'Password must not be blank'));
  }

  knex('users')
    .where('email', email)
    .returning('id', 'first_name', 'last_name', 'email', 'hashed_password')
    .then(users => {
      if (users.length === 0) {
        return next(boom.create(400, 'Bad email or password'));
      }

      let user = users[0];
      bcrypt.compare(password, user.hashed_password)
        .then(result => {
          if (!result) {
            return next(boom.create(400, 'Bad email or password'));
          }

          let token = jwt.sign({
            isAuthen: true
          }, 'shhhh');
          req.session.jwt = token;

          res.cookie('token', token, {
            httpOnly: true
          });

          delete user.hashed_password;
          res.send(humps.camelizeKeys(user));
        });
    });
});

router.delete('/', (req, res, next) => {
  res.cookie('token', '');
  res.send(true);
});

module.exports = router;
