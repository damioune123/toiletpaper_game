const express = require('express');
const router = new express.Router();

router.use('/rooms', require('./rooms'));
router.use('/dictionaries', require('./dictionaries'));

module.exports = router;
