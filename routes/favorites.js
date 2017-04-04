'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const cookieSession = require('cookie-session');

// YOUR CODE HERE
const confirmToken = (req, res, next) => {
  if (req.cookies.token) {
    next();
  }
  else {
    res.set('Content-Type', 'plain/html');
    res.status(401).send('Unauthorized');
  }
};

router.get('/favorites/check', confirmToken, (req, res) => {
  let bookId = req.query.bookId;

  if (isNaN(bookId)) {
    res.set('Content-Type', 'plain.html');
    res.status(400).send('Book ID must be an integer');
  }
  else {
    knex('favorites')
      .innerJoin('books', 'favorites.book_id', 'books.id')
      .where('book_id', bookId)
      .then(favorites => {
        if (favorites.length === 0) {
          res.send(false);
        }
        else {
          res.send(true);
        }
      });
  }
});

router.get('/favorites', confirmToken, (req, res) => {
  knex('favorites')
    .innerJoin('books', 'favorites.book_id', 'books.id')
    .then(favorites => {
      res.send(humps.camelizeKeys(favorites));
    });
});

router.post('/favorites', confirmToken, (req, res) => {
  let bookId = req.body.bookId;
  knex('favorites')
    .insert({
      'book_id': bookId,
      'user_id': 1
    })
    .returning('*')
    .then(favoriteAdd => {
      res.send(humps.camelizeKeys(favoriteAdd[0]));
    });
});

router.delete('/favorites', confirmToken, (req, res) => {
  let bookId = req.body.bookId;
  knex('favorites')
    .where('book_id', bookId)
    .returning(['book_id', 'user_id'])
    .del()
    .then(favoriteDel => {
      res.send(humps.camelizeKeys(favoriteDel[0]));
    });
});

module.exports = router;
