'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt-as-promised');
const humps = require('humps')

// YOUR CODE HERE
router.post('/users', (req, res, next) => {
  bcrypt.hash(req.body.password, 12)
  .then((hashed_password) => {
    return knex('users')
    .insert({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      hashed_password: hashed_password
    })
    .returning(['id', 'first_name', 'last_name', 'email']);
  })
  .then(users => {
    res.send(humps.camelizeKeys(users[0]));
  })
})

module.exports = router;
