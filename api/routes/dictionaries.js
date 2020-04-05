const express = require('express');
const router = new express.Router();

const dictionariesController = require('../controllers/dictionaries');
// /dictionaries [GET]
router.route('/')
    .get(dictionariesController.get)
module.exports = router;
