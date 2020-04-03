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
   * While connected, Socket.IO will listen to the following events emitted
   * by the Socket.IO server, then run the appropriate function.
   */
  bindEvents : () =>{
    IO.socket.on('connected', IO.onConnected );
    IO.socket.on('new:player', IO.playerJoinedRoom );
    IO.socket.on('update:room', IO.roomUpdated );
    IO.socket.on('error', IO.error );
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
    console.log('Client User - room local copy updated');
    App.room = room;
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
      alert(error.response.data);
      return false;
    }
    App.room = response.data;
    IO.init();
    return response.data;


  },
 //ADD HERE ALL FUNCTION THAT WILL change the app state

};
export default App;