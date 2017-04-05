'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const cookieSession = require('cookie-session');
const boom = require('boom');

// YOUR CODE HERE
const confirmToken = (req, res, next) => {
  if (!req.cookies.token) {
    return next(boom.create(401, 'Unauthorized'));
  }
  next();
};

router.get('/check', confirmToken, (req, res, next) => {
  let bookId = req.query.bookId;

  if (isNaN(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

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
});

router.get('/', confirmToken, (req, res) => {
  knex('favorites')
    .innerJoin('books', 'favorites.book_id', 'books.id')
    .then(favorites => {
      res.send(humps.camelizeKeys(favorites));
    });
});

router.post('/', confirmToken, (req, res, next) => {
  let bookId = req.body.bookId;

  if (isNaN(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }
  knex('books')
    .where('id', bookId)
    .then(books => {
      if (books.length === 0) {
        return next(boom.create(404, 'Book not found'));
      }

      return knex('favorites')
        .insert({
          'book_id': bookId,
          'user_id': 1
        })
        .returning('*')
        .then(favoriteAdd => {
          res.send(humps.camelizeKeys(favoriteAdd[0]));
        });
    })
});

router.delete('/', confirmToken, (req, res, next) => {
  let bookId = req.body.bookId;
  if (isNaN(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }
  knex('favorites')
  .where('book_id', bookId)
  .then(favorites => {
    if (favorites.length === 0) {
      return next(boom.create(404, 'Favorite not found'));
    }
    knex('favorites')
      .where('book_id', bookId)
      .returning(['book_id', 'user_id'])
      .del()
      .then(favoriteDel => {
        res.send(humps.camelizeKeys(favoriteDel[0]));
      });
  });
});

module.exports = router;
