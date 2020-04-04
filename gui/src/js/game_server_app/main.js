import axios from 'axios';
import io from 'socket.io-client';
/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 */
const IO = {
  /**
   * This is called when the page is displayed. It connects the Socket.IO client
   * to the Socket.IO server
   */
  init: () =>{
    IO.socket = io(process.env.SOCKET_URL);
    IO.bindEvents();
  },
  /**
   * This reset the IO state
   */
  reset: () =>{
    IO.socket = null;
  },
  /**
   * While connected, Socket.IO will listen to the following events emitted
   * by the Socket.IO server, then run the appropriate function.
   */
  bindEvents : () =>{
    IO.socket.on('connected', IO.onConnected );
    IO.socket.on('new:player', IO.playerJoinedRoom );
    IO.socket.on('update:room', IO.roomUpdated );
    IO.socket.on('disconnected:player', IO.disconnectedPlayer);
    IO.socket.on('server:error', IO.error);
    IO.socket.on('game:start', App.startGame);

    IO.socket.on('error', IO.error );
  },
  /**
   * Broadcast data to palyer
   */
  broadcastToPlayers : (eventType, data = {}) => {
    IO.socket.emit('game-communication', Object.assign(data, { meta: {sendType: 'broadcast', from: App.room.gameServerSocketId, eventType }}, {gameState: App.gameState}));
  },
  /**
   * Send message to a particular player with its player id
   */
  sendMessageToPlayer : (eventType, playerId, data = {}) => {
    const socketId = App.room.roomState.players[playerId].socketId;
    IO.socket.emit('game-communication', Object.assign(data, { meta: {sendType: 'single', to: socketId, from: App.room.gameServerSocketId, eventType}},{gameState: App.gameState}));
  },

  /**
   * The game server app is successfully connected!
   */
  onConnected : () => {
    console.log('Game Server - Successfully connected to the websocket, connecting to the room ...');
    IO.socket.emit('join:room', {roomId: App.room.roomId, isHost: true});

  },
  /**
   * A player has successfully joined the game.
   * @param data {{newPlayer: object}}
   */
  playerJoinedRoom : ({newPlayer}) =>{
    console.log(`Game Server - A new player has connected to the room  - ${newPlayer.userName}`)
  },
  /**
   * The room e has been updated, refreshing local version
   * @param data {{room: object}}
   */
  roomUpdated : ({room}) =>{
    console.log('Game Server - room local copy updated');
    App.room = room;
  },
  /**
   * A player left the room
   * @param data {{player: object}}
   */
  disconnectedPlayer: ({leftPlayer}) =>{
    console.log(`Game Server - a player has disconnected in the room : ${leftPlayer.userName}`);
  },
  /**
   * An error has occurred.
   * @param data
   */
  error :(data) => {
    alert(data.message);
  }

};

const App = {
  API_URL: process.env.API_URL,
  IO:io,
  /**
   * This is the game state of the whole app, the single source of truth that will be modified only by the game server app.
   * of the Socket.IO Room used for the players and host to communicate
   *
   */
  gameState: {},

  /**
   * This is the room copy (modified server-side only)
   *
   */
  room: {},
  /**
   * This reset the APP state
   */
  reset: () =>{
    IO.reset();
    App.gameState = {};
    App.room = {}
  },
  /**
   * This will create a room in the backend and then in init the websocket if the room was successfully created
   * @param roomData
   * @returns Either the room object or false if an error occurred
   */
  createNewRoom: async (roomData)=> {
    let response;
    try{
      response = await axios.post(`${App.API_URL}/rooms`, roomData);
    }catch(error){
      console.log('Error while creating the room', error);
      if(error.response.data.details && error.response.data.details[0] && error.response.data.details[0].message){
        alert(error.response.data.details[0].message);
      }
      else{
        alert(JSON.stringify(error.response ? error.response.data : error));
      }
      return false;
    }
    App.room = response.data;
    IO.init();
    return response.data;
  },
 //ADD HERE ALL FUNCTION THAT WILL change the app state
  startGame: (data) =>{
    console.log('Game Server - game:start event received')
    App.initGameState();
    IO.broadcastToPlayers('game:started',{message: 'Game well started !'})
  },
  initGameState: () =>{
    App.gameState ={
      status: 'running',
      currentRound: 0,
    }
  }

};
export default App;