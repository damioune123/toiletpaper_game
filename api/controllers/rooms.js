const rooms = require('../models/rooms');

exports.getAll = (req, res, next) => {
    return res.status(200).json(rooms.getRooms());
};