const rooms = require('../models/rooms');
const logger = require('../utils/logger');
let io;
const metaInfo = {};
/**
 * This function is called by index.js to handle every event on a connected socket
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.handleSocket = function(sio, socket){
    io = sio;
    if(!metaInfo[socket.id]) metaInfo[socket.id] = {};
    socket.emit('connected', { message: "You are connected!"});
    // Global Events
    socket.on('join:room', joinRoom);

    // Host Events

    // Player Events
    //TODO
};

/**
 * This function is called by index.js to handle every event on a disconnected socket
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the disconnected client.
 */
exports.handleDisconnectedSocket = function(sio, socket){
    io = sio;
    if(!metaInfo[socket.id]){
        const msg = 'An unregistered socket tried to disconnect';
        logger.log('error', msg);
        return;
    }
    const currentMetaInfo = metaInfo[socket.id];
    if(currentMetaInfo.isHost){
        io.to(currentMetaInfo.room.roomId).emit('disconnected:host', {message: 'The game server has disconnected'});
        const socketsOfTheRoom = getAllConnectedSocketsFromARoom(currentMetaInfo.room.roomId);
        //disconnect all the players in the room
        socketsOfTheRoom.forEach((socket)=>{
            delete metaInfo[socket.id];
            socket.disconnect();
        });
        //delete the room
        rooms.removeRoom(currentMetaInfo.room.roomId);
        //delete the game server meta info
        delete metaInfo[socket.id];
    }
    else{
        io.to(currentMetaInfo.room.roomId).emit('disconnected:player', {leftPlayer: currentMetaInfo.player});
        currentMetaInfo.player.isConnected = false;
        currentMetaInfo.player.socketId = null;
        delete metaInfo[socket.id];
        io.to(currentMetaInfo.room.roomId).emit('update:room', {room: currentMetaInfo.room });
    }
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
    if(!rooms.getRoomWithId(roomId)){
        const msg = 'the room id does not exist';
        logger.log('error', msg);
        this.emit('server:error', msg);
        return;
    }
    const room = rooms.getRoomWithId(roomId);
    if(isHost) room.gameServerSocketId = this.id;
    else if (room.roomState.players[playerId]){
        room.roomState.players[playerId].isConnected = true;
        room.roomState.players[playerId].socketId = this.id;
    }
    else{
        const msg = 'The player does not exist in the room';
        logger.log('error', msg);
        this.emit('server:error', msg);
        return;
    }
    // Join the Room and wait for the players
    this.join(room.roomId);
    if(!isHost){
        io.to(room.roomId).emit('new:player', {newPlayer: room.roomState.players[playerId]});
    }
    io.to(room.roomId).emit('update:room', {room});
    metaInfo[this.id] = {
        isHost,
        player: isHost ? null : room.roomState.players[playerId],
        room: room,
        socket: this
    };
}

function getAllConnectedSocketsFromARoom (roomId){
    const room = rooms.getRoomWithId(roomId);
    if(!room){
        const msg = `No room exist with this room id ${roomId}`;
        logger.log('error', msg);
    }
    return Object.keys(room.roomState.players).reduce((sockets, playerKey)=>{
        const player = room.roomState.players[playerKey];
        if(player.isConnected){
            sockets.push(metaInfo[player.socketId].socket);
        }
        return sockets;
    },[]);
}

