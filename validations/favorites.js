'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    bookId: Joi.number().label('Book ID').integer().positive().required()
  }
};
