const uuid = require('../utils/uuid');
const rooms = require('../models/rooms');
const logger = require('../utils/logger');
let io;
let gameSocket;

/**
 * This function is called by index.js to handle every event on a socket
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.handleSocket = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!", success: true});
    // Global Events
    gameSocket.on('joinRoom', joinRoom);

    // Host Events

    // Player Events
    //TODO
};

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */

/**
 * This is trigger when a game
 * @params room, the room to join
 */
function joinRoom({roomId, playerId, isHost = false}) {
    if(!rooms.getRoom(roomId)){
        const msg = 'the room id does not exist';
        logger.log('error', msg);
        this.emit('error', msg);
    }
    const room = rooms.getRoom(roomId);
    if(isHost) room.gameServerSocketId = this.id;
    else if (rooms.players[playerId]){
        room.players[playerId].isConnected = true;
        room.players[playerId].socketId = this.id;
    }
    else{
        const msg = 'The player does not exist in the room';
        logger.log('error', msg);
        this.emit('error', msg);
    }
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('joinRoom', {roomState: room, success: true});

    // Join the Room and wait for the players
    this.join(room.roomId);
    io.to(room.roomId).emit('joinRoom', {roomState: room, newPlayer: room.players[playerId]})
};

