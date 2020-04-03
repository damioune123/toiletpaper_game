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
    gameSocket.emit('connected', { message: "You are connected!"});
    // Global Events
    gameSocket.on('join:room', joinRoom);

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
        return;
    }
    const room = rooms.getRoom(roomId);
    if(isHost) room.gameServerSocketId = this.id;
    else if (room.roomState.players[playerId]){
        room.roomState.players[playerId].isConnected = true;
        room.roomState.players[playerId].socketId = this.id;
    }
    else{
        const msg = 'The player does not exist in the room';
        logger.log('error', msg);
        this.emit('error', msg);
        return;
    }
    // Join the Room and wait for the players
    this.join(room.roomId);
    if(!isHost){
        io.to(room.roomId).emit('new:player', {newPlayer: room.roomState.players[playerId]})
    }
    io.to(room.roomId).emit('update:room', {room})

}

