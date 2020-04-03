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
    IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
    IO.socket.on('newRoomState', IO.playerJoinedRoom );
    IO.socket.on('error', IO.error );
  },

  /**
   * The game server app is successfully connected!
   */
  onConnected : () => {
    console.log('Game Server - Successfully connected to the room');
  },
  /**
   * A player has successfully joined the game.
   * @param data {{newPlayer: object}}
   */
  playerJoinedRoom : ({newPlayer}) =>{
    console.log('Game Server - A new player has connected to the room ', newPlayer)
  },
  /**
   * The room state has been updated, refreshing local version
   * @param data {{roomState: object}}
   */
  newRoomState : ({roomState}) =>{
    console.log('Game Server - New room state', roomState);
    App.roomState= roomState;
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
   * This is the room state of the whole app (modified server-side only)
   *
   */
  roomState: {},
  /**
   * This will create a room in the backend and then in init the websocket if the room was successfully created
   *
   * @param roomData
   */
  createNewRoom: async (roomData)=> {
    let response;
    try{
      response = await axios.post(`${App.API_URL}/rooms`, roomData);
      console.log('response')
    }catch(error){
      console.error('Error while creating the room', error)
    }
    App.roomState = response;
    IO.init();
  },
 //ADD HERE ALL FUNCTION THAT WILL change the app state

};
export default App;