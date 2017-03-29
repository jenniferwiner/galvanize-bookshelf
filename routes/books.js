'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex')
const humps = require('humps')

// YOUR CODE HERE
router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title', 'asc')
    .then(data => {
      res.send(humps.camelizeKeys(data));
    });
});

router.get('/books/:id', (req, res, next) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.sendStatus(404);
  }
  else {
    knex('books')
      .where('id', id)
      .then(data => {
        if (data.length === 0) {
          res.sendStatus(404);
        }
        else {
          res.send(humps.camelizeKeys(data[0]));
        }
      });
  }
});

router.post('/books', (req, res, next) => {

  if (!req.body.title) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Title must not be blank');
  }
  else if (!req.body.author) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Author must not be blank');
  }
  else if (!req.body.genre) {
    res.set('Content-Type', 'text/plain')
    res.status(400).send('Genre must not be blank');
  }
  else if (!req.body.description) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Description must not be blank');
  }
  else if (!req.body.coverUrl) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Cover URL must not be blank');
  }
  else {
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
  }
});

router.patch('/books/:id', (req, res, next) => {
  let id = req.params.id;
  if (isNaN(id) || id < 0) {
    res.sendStatus(404);
  }
  else {
    knex('books')
      .max('id')
      .returning('id')
      .then(maxID => {
        if (maxID[0].max <= id) {
          res.sendStatus(404);
        }
        else {
          return knex('books')
            .where('id', id)
            .update(humps.decamelizeKeys(req.body))
            .returning('*')
            .then(data => {
              res.send(humps.camelizeKeys(data[0]));
            });
        }
      });
  }
});

router.delete('/books/:id', (req, res, next) => {
  let id = req.params.id;
  if (isNaN(id)) {
    res.sendStatus(404);
  }
  else {
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
  }
});

module.exports = router;
