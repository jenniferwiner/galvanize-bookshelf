'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const boom = require('boom');

const ev = require('express-validation');
const validations = require('../validations/books');

// YOUR CODE HERE

router.get('/', (req, res, next) => {
  knex('books')
    .orderBy('title', 'asc')
    .then(data => {
      res.send(humps.camelizeKeys(data));
    });
});

router.get('/:id', (req, res, next) => {
  let id = req.params.id;

  if (isNaN(id)) {
    return next(boom.create(404));
  }

  knex('books')
    .where('id', id)
    .then(data => {
      if (data.length === 0) {
        return next(boom.create(404));
      }
      res.send(humps.camelizeKeys(data[0]));
    });
});

router.post('/', ev(validations.post), (req, res, next) => {
  // Error handling
  if (!req.body.title) {
    return next(boom.create(400, 'Title must not be blank'));
  }
  if (!req.body.author) {
    return next(boom.create(400, 'Author must not be blank'));
  }
  if (!req.body.genre) {
    return next(boom.create(400, 'Genre must not be blank'));
  }
  if (!req.body.description) {
    return next(boom.create(400, 'Description must not be blank'));
  }
  if (!req.body.coverUrl) {
    return next(boom.create(400, 'Cover URL must not be blank'));
  }

  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    }, '*')
    .then(data => {
      res.send(humps.camelizeKeys(data[0]));
    });
});

router.patch('/:id', (req, res, next) => {
  let id = req.params.id;

  if (isNaN(id) || id < 0) {
    return next(boom.create(404));
  }

  knex('books')
    .max('id')
    .returning('id')
    .then(maxID => {
      if (maxID[0].max <= id) {
        return next(boom.create(404));
      }

      return knex('books')
        .where('id', id)
        .update(humps.decamelizeKeys(req.body))
        .returning('*')
        .then(data => {
          res.send(humps.camelizeKeys(data[0]));
        });
    });
});

router.delete('/:id', (req, res, next) => {
  let id = req.params.id;

  if (isNaN(id)) {
    return next(boom.create(404));
  }

  knex('books')
    .where('id', id)
    .returning(['title', 'author', 'genre', 'description', 'cover_url'])
    .del()
    .then(data => {
      if (data.length === 0) {
        res.sendStatus(404);
      }
      else {
        res.send(humps.camelizeKeys(data[0]));
      }
    });
});

module.exports = router;
