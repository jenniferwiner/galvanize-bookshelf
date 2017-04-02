'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const humps = require('humps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieSession = require('cookie-session');

// set cookie session
router.use(cookieSession({
  name: 'session',
  keys: ['chocolatechip'],
  maxAge: 24 * 60 * 60 * 1000
}));

router.get('/token', isAuthen, (req, res, next) => {
  res.send(req.user)
});

router.post('/token', (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password || email === '' || password === '') {
    res.status(400).send('Bad email or password');
  }
  else {
    knex('users')
      .where('email', email)
      .returning('id', 'first_name', 'last_name', 'email', 'hashed_password')
      .then(users => {
        if (users.length === 0) {
          res.set('Content-Type', 'plain/html')
          res.status(400).send('Bad email or password');
        }
        else {
        let user = users[0];
        bcrypt.compare(password, user.hashed_password)
          .then(result => {
            if (result) {
              let token = jwt.sign({
                isAuthen: true
              }, 'shhhh');

              req.session.jwt = token;

              res.cookie('token', token, {
                httpOnly: true
              });
              delete user.hashed_password;
              res.send(humps.camelizeKeys(user));
            }
            else {
              res.set('Content-Type', 'plain/html');
              res.status(400).send('Bad email or password');
            }
          });
        }
      });
  }
});

router.delete('/token', (req, res, next) => {
  res.cookie('token', '');
  res.send(true);
});

function isAuthen(req, res, next) {
  if (req.session.jwt) {
    jwt.verify(req.session.jwt, 'shhhh', function(err, decoded) {
      if (err) {
        res.sendStatus(403);
      }
      else {
        req.user = true;
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
