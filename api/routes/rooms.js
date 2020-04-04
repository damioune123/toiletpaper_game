const express = require('express');
const router = new express.Router();

const routesController = require('../controllers/rooms');
// /rooms [GET POST]
router.route('/')
    .get(routesController.getAll)
    .post(routesController.add);
// /rooms/join [GET]
router.route('/join')
    .get(routesController.join);

module.exports = router;
