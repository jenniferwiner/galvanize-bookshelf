'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    firstName: Joi.string().label('First Name').required(),
    lastName: Joi.string().label('Last Name').required(),
    email: Joi.string().label('Email').email().trim().required(),
    password: Joi.string().label('Password').trim().required().min(8).max(25)
  }
};
