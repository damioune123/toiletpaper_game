const express = require('express');
const router = new express.Router();

router.use('/rooms', require('./rooms'));

module.exports = router;
