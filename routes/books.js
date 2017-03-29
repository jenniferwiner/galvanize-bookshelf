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
  knex('books')
  .where('id', id)
  .then(data => {
    res.send(humps.camelizeKeys(data[0]));
  });
});

router.post('/books', (req, res, next) => {
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

router.patch('/books/:id', (req, res, next) => {
  let id = req.params.id;
  knex('books')
  .where('id', id)
  .update(humps.decamelizeKeys(req.body))
  .returning('*')
  .then(data => {
    res.send(humps.camelizeKeys(data[0]));
  });
});

router.delete('/books/:id', (req, res, next) => {
  let id = req.params.id;
  knex('books')
  .where('id', id)
  .returning(['title', 'author', 'genre', 'description', 'cover_url'])
  .del()
  .then(data => {
    res.send(humps.camelizeKeys(data[0]));
  });
});

module.exports = router;
