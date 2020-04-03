const express = require('express');
const router = new express.Router();

const routesController = require('../controllers/rooms');
// /rooms [GET POST]
router.route('/')
    .get(routesController.getAll)
    .post(routesController.add);


module.exports = router;
