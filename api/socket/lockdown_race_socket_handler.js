const rooms = require('../models/rooms');
const logger = require('../utils/logger');
let io;
const metaInfo = {};

const getSocketUUID =(socket) =>{
    return socket.handshake.query.socketUUID;
};

/**
 * This function is called by index.js to handle every event on a connected socket
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.handleSocket = function(sio, socket){
    io = sio;
    if(!metaInfo[getSocketUUID(socket)]) {
        console.log('new client', getSocketUUID(socket));
        metaInfo[getSocketUUID(socket)] = {};
    }
    else{
        console.log('restore', getSocketUUID(socket));
        restoreAppState.bind(socket)();
    }

    socket.emit('connected', { message: "You are connected!"});
    // Global Events
    socket.on('join:room', joinRoom);

    // Game communication events
    socket.on('game-communication', forwardGameMessage);
};

/**
 * This function is called by index.js to handle every event on a disconnected socket
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the disconnected client.
 */
exports.handleDisconnectedSocket = function(sio, socket){
    io = sio;
    if(!metaInfo[getSocketUUID(socket)]){
        const msg = 'An unregistered socket tried to disconnect';
        logger.log('error', msg);
        return;
    }
    const currentMetaInfo = metaInfo[getSocketUUID(socket)];
    if(!currentMetaInfo || !currentMetaInfo.room){
        logger.info(getSocketUUID(socket)+ " has disconnected and was not connected to a room");
        if(currentMetaInfo){
            delete metaInfo[getSocketUUID(socket)];
        }
        return;
    }
    if(currentMetaInfo.isHost){
        console.log(currentMetaInfo.isHost, socket.id)
        io.to(currentMetaInfo.room.roomId).emit('disconnected:host', {message: 'The game server has disconnected'});
        const socketsOfTheRoom = getAllConnectedSocketsFromARoom.bind(socket)(currentMetaInfo.room.roomId);
        if(socketsOfTheRoom){
            //disconnect all the players in the room
            socketsOfTheRoom.forEach((socket)=>{
                const playerMetaInfo = metaInfo[getSocketUUID(socket)];
                playerMetaInfo.player.isConnected = false;
                playerMetaInfo.player.isHost = false;
                socket.disconnect();
                playerMetaInfo.socket = null;
            });
        }
        console.log(currentMetaInfo.room.roomState.players);
        //delete the game server meta info
        delete metaInfo[currentMetaInfo.gameServerSocketUUID];
    }
    else{
        io.to(currentMetaInfo.room.roomId).emit('disconnected:player', {leftPlayer: currentMetaInfo.player});
        currentMetaInfo.player.isConnected = false;
        io.to(currentMetaInfo.room.roomId).emit('update:room', {room: currentMetaInfo.room });
    }
};

function restoreAppState (){
    const currentMetaInfo = metaInfo[getSocketUUID(this)];
    if(!currentMetaInfo.room){
        logger.info(`${getSocketUUID(this)} try to restore state, but not in a room`);
        metaInfo[getSocketUUID(this)]= {};
        return;
    }
    const room = rooms.getRoomWithId(currentMetaInfo.room.roomId);
    const playerId = currentMetaInfo.player.userId;
    currentMetaInfo.player.isConnected = true;
    currentMetaInfo.socket = this;
    console.log('ici 5', room.roomState.players[playerId])
    this.emit('restore:state', {
        room,
        gameState: room.gameState || {},
        player: Object.assign(room.roomState.players[playerId], {
            isConnected: true,
        })
    });
}
/**
 * Forward game message
 * @params room, the room to join
 */
function forwardGameMessage(data) {
    const dataMeta = data.meta;
    const currentMetaInfo = metaInfo[getSocketUUID(this)];
    if(!currentMetaInfo){
        const msg = 'An unregistered socket tried to forward message';
        logger.log('error', msg)
    }
    if(dataMeta.sendType === 'broadcast'){
        //broadcasting to the room
        if(data.gameState){
            currentMetaInfo.room.gameState = data.gameState;
        }
        io.to(currentMetaInfo.room.roomId).emit(dataMeta.eventType, data);
    }
    else if(dataMeta.sendType === 'single'){
        //sending a message to particular client
        if(metaInfo[dataMeta.to] && (metaInfo[dataMeta.to].isHost || metaInfo[dataMeta.to].player && metaInfo[dataMeta.to].player.isConnected)){
            const recipientSocket = metaInfo[dataMeta.to].socket;
            recipientSocket.emit(dataMeta.eventType, data);
        }
        else{
            const msg = 'Could not find the socket uuid of the recipient or the client disconnected';
            logger.log('error', msg);
        }
    }
}

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
    if(isHost) room.gameServerSocketUUID = getSocketUUID(this);
    else if (room.roomState.players[playerId]){
        room.roomState.players[playerId].isConnected = true;
        room.roomState.players[playerId].socketUUID = getSocketUUID(this);
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
    metaInfo[getSocketUUID(this)] = {
        isHost,
        player: isHost ? null : room.roomState.players[playerId],
        room: Object.assign(room, {gameServerState: undefined}),
        socket: this
    };
}

function getAllConnectedSocketsFromARoom (roomId){
    const room = rooms.getRoomWithId(roomId);
    if(!room){
        const msg = `No room exist with this room id ${roomId}`;
        logger.log('error', msg);
        return;
    }
    return Object.keys(room.roomState.players).reduce((sockets, playerKey)=>{
        const player = room.roomState.players[playerKey];
        if(player.isConnected){
            sockets.push(metaInfo[player.socketUUID].socket);
        }
        return sockets;
    },[]);
}

