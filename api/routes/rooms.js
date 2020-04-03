const express = require('express');
const router = new express.Router();

const routesController = require('../controllers/rooms');
// /rooms [GET]
router.route('/').get(routesController.getAll);

module.exports = router;
