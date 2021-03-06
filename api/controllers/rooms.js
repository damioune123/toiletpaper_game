const rooms = require('../models/rooms');
const Joi = require('joi');
const logger = require('../utils/logger');
const uuid = require('../utils/uuid');
exports.getAll = (req, res, next) => {
    return res.status(200).json(rooms.getRooms());
};

exports.add = async (req, res, next) => {
    const schema = Joi.object().keys({
        userName: Joi.string().alphanum().min(3).max(8).required(),
        roomName:Joi.string().alphanum().min(3).max(15).required(),
        language: Joi.string().valid('fr','en').default('en'),
    });
    let value;
    try{
        value = await Joi.validate(req.body, schema);
    }catch(error){
        logger.log('error', 'An error occurred while creating a room during joi validation',  {error, value: req.body});
        return res.status(400).json(error);
    }
    if(rooms.isRoomNameTaken(value.roomName)){
        logger.log('info', 'This room name is already taken');
        return res.status(400).json('Room name already taken');
    }
    const roomId = uuid.generate();
    const currentPlayerId = uuid.generate();
    const currentPlayer = {
        userId: currentPlayerId,
        socketId: null,
        userName: value.userName,
        isConnected: false,
        isHost: true,
        joinTime: (new Date()).toISOString()
    };
    const room = {
        roomId,
        roomName: value.roomName,
        roomLanguage: value.language,
        gameServerSocketId: null,
        roomState: {
            gameStatus: 'waiting', // can be waiting, running, paused
            players:{}
        },
    };
    room.roomState.players[currentPlayerId] = currentPlayer;
    rooms.addRoom(roomId, room);
    const response = Object.assign({}, room, {currentPlayerId});
    return res.status(201).json(response);
};

exports.join = async (req, res, next) => {
    const schema = Joi.object().keys({
        userName: Joi.string().alphanum().min(3).max(8).required(),
        roomName:Joi.string().alphanum().min(3).max(15).required(),
    });
    let value;
    try{
        value = await Joi.validate(req.query, schema);
    }catch(error){
        logger.log('error', 'An error occurred while joining a room during joi validation',  {error, value: req.query});
        return res.status(400).json(error);
    }
    if(!rooms.isRoomNameTaken(value.roomName)){
        logger.log('info', 'This room name does not exist');
        return res.status(400).json('Room name does not exist');
    }

    const room = rooms.getRoomWithName(value.roomName);
    if(rooms.getPlayerInRoomWithHisName(room, value.userName)){
        logger.log('info', 'A player with a same name has been found');
        return res.status(400).json('Username already taken');
    }
    const currentPlayer = {
        userId: uuid.generate(),
        socketId: null,
        userName: value.userName,
        isConnected: false,
        isHost: false,
        joinTime: (new Date()).toISOString()
    };
    room.roomState.players[currentPlayer.userId] = currentPlayer;
    const response = Object.assign({}, room, {currentPlayerId: currentPlayer.userId});
    return res.status(200).json(response);
};