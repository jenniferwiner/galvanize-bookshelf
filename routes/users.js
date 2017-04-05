'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const humps = require('humps');
const boom = require('boom');

// YOUR CODE HERE
router.post('/', (req, res, next) => {
  let password = req.body.password;
  let email = req.body.email;
  let first_name = req.body.firstName;
  let last_name = req.body.lastName;

  if (!email || email === '') {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || password.length < 8) {
    return next(boom.create(400, 'Password must be at least 8 characters long'));
  }

  knex('users')
    .where('email', email)
    .then(emails => {
      if (emails.length !== 0) {
        return next(boom.create(400, 'Email already exists'));
      }

      bcrypt.hash(password, 12)
        .then(hashed_password => {
          return knex('users')
            .insert({ first_name, last_name, email, hashed_password }, '*')
            .then(insertedUser => {
              delete insertedUser[0].hashed_password;
              res.send(humps.camelizeKeys(insertedUser[0]));
            });
        });
    })
    .catch(err => {
      throw err;
    });
});

module.exports = router;
