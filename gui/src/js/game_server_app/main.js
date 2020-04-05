import axios from 'axios';
import io from 'socket.io-client';
import utils from '../utils';

const DEFAULT_GAME_STATE = {
  game: 0,
  round: 0,
  nextRound: 1,
  roundScoresPositive: {},
  roundScoresNegative: {},
  gameScores: {},
  caddy: {}
};
const AVAILABLE_ITEMS = {
  toiletPaper: "Toilet paper",
  pizza: "Pizza",
  beer: "Beer",
  sock: "Sock",
  magnet: "Magnet"
};
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
    IO.socket.on('disconnect', App.reset);
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
   * The word dictionary fetched from backend
   *
   */
  dictionary: {},
  /**
   * This reset the APP state
   */
  reset: () =>{
    IO.reset();
    App.gameState = {};
    App.room = {};
    App.dictionary = {};
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
      utils.handleApiError(error, 'Error while creating the room');
      return false;
    }
    App.room = response.data;
    await App.fetchDictionary();
    IO.init();
    return response.data;
  },
  /**
   * Fetch the room dictionary (according to the room language)
   */
  fetchDictionary: async () => {
    console.log('Game server - fetch dictionary from backend');
    const data = {
      language : App.room.language,
    };
    let response;
    try{
      response = await axios.get(`${App.API_URL}/dictionaries`, {params: data});
    }catch(error){
      utils.handleApiError(error, 'Error while fetching the room dictionary');
      return;
    }
    App.dictionary = response.data;
  },
 //ADD HERE ALL FUNCTION THAT WILL change the app state
  startGame: (data) =>{
    console.log('Game Server - game:start event received');
    App.initGameState();
    IO.broadcastToPlayers('game:started');
  },
  initGameState: () =>{
    App.gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
    const players = App.getPlayersAsList();
    players.forEach((player)=>{
      App.gameState.roundScoresPositive[player.userId] = 0;
      App.gameState.roundScoresNegative[player.userId] = 0;
      App.gameState.gameScores[player.userId] = 0;
      App.gameState.caddy[player.userId] = [];
    })
  },
  getPlayersAsList :()=>{
    return Object.keys(App.room.roomState.players).reduce((players, playerKey)=>{
      players.push(App.room.roomState.players[playerKey]);
      return players;
    },[]);
  }

};
export default App;