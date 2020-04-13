import { RECEIVED_EVENTS, SEND_EVENTS } from "../../../enums/event-types";
import { GAME_SERVER_SOCKET_ACTION_PREFIX } from "../../../enums/socket/socket-action-prefix";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import store from "../../index";
import { showEventInfo } from "../utils";
import {
  getGameServerSocketInstance,
  getClientSocketInstance
} from "../../../socket/socket-instances";
const VueLocalStorage = window.localStorage;
const MODULE_NAME = "Game server module";
const SOCKET_ACTION_PREFIX = GAME_SERVER_SOCKET_ACTION_PREFIX;

const DEFAULT_GAME_STATE = {
  game: 0,
  round: 0,
  nextRound: 1,
  roundScoresPositive: {},
  roundScoresNegative: {},
  gameScores: {},
  caddy: {}
};

let gameServerSocket;

const defaultState = () => {
  return {
    gameServerState: DEFAULT_GAME_STATE
  };
};
const mutations = {
  resetGameServerAppState(state) {
    Object.assign(state, defaultState());
  }
};
const actions = {
  //RECEIVED EVENTS on websockets
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED](context) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.CONNECTED,
      "Successfully connected to the Websocket"
    );
    console.log(
      `${MODULE_NAME}- Successfully connected to the websocket, connecting to the game server to the created room ...`
    );
    gameServerSocket.emit(SEND_EVENTS.JOIN_ROOM, {
      roomId: context.getters.roomId,
      isHost: true
    });
    console.log(
      `${MODULE_NAME}- Connecting the client app to the created room ...`
    );
    getClientSocketInstance().emit(SEND_EVENTS.JOIN_ROOM, {
      roomId: context.getters.roomId,
      playerId: context.getters.currentPlayer.userId,
      isHost: false
    });
  },
  /**
   * A player left the room
   * @param data {{player: object}}
   */
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.DISCONNECTED_PLAYER](
    context,
    { leftPlayer }
  ) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.DISCONNECTED_PLAYER,
      `A player has disconnected in the room : ${leftPlayer.userName}`
    );
  },
  /**
   * The backend server shuts down
   */
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.DISCONNECT]() {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.DISCONNECT,
      "The server has disconnected"
    );
  },
  resetGameServerAppState: context => {
    context.dispatch("disconnectGameServerSocket");
    context.commit("resetGameServerAppState");
  },
  /**
   * Broadcast data to player
   */
  broadcastToPlayers: (context, { eventType, data = {} }) => {
    gameServerSocket.emit(
      SEND_EVENTS.GAME_COMMUNICATION,
      Object.assign(
        data,
        {
          meta: {
            sendType: "broadcast",
            from: VueLocalStorage.getItem("gameServerSocketUUID"),
            eventType
          }
        },
        { gameState: state.gameServerState }
      )
    );
  },
  /**
   * Send message to a particular player with its player id
   */
  sendMessageToPlayer: (context, { eventType, playerId, data = {} }) => {
    const socketUUID = context.getters.players[playerId].socketUUID;
    gameServerSocket.emit(
      SEND_EVENTS.GAME_COMMUNICATION,
      Object.assign(
        data,
        {
          meta: {
            sendType: "single",
            to: socketUUID,
            from: VueLocalStorage.getItem("gameServerSocketUUID"),
            eventType
          }
        },
        { gameState: state.gameServerState }
      )
    );
  },
  initGameServerSocket: () => {
    console.log(`${MODULE_NAME} - Init game server socket`);
    console.log(
      "No game server socket found - Creating and connecting a new socket instance"
    );
    gameServerSocket = getGameServerSocketInstance();
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: gameServerSocket,
        vuex: {
          store,
          actionPrefix: GAME_SERVER_SOCKET_ACTION_PREFIX
        }
      })
    );
  },
  disconnectGameServerSocket: () => {
    if (gameServerSocket) {
      gameServerSocket.disconnect();
      console.log(
        `${MODULE_NAME} - Successfully disconnected from the Websocket`
      );
      gameServerSocket = null;
    }
  },
  /**
   * This will create a room in the backend and then in init the websocket if the room was successfully created
   * @param roomData ({userName, roomName, language})
   * @returns True or false if an error occurred
   */
  createRoom: async function(context, roomData) {
    console.log(`${MODULE_NAME} - Creating new room`);
    const { data } = await this.$rq.createRoom(roomData);
    if (data) {
      context.dispatch("setRoom", data, { root: true });
      context.dispatch(
        "setCurrentPlayer",
        data.roomState.players[data.currentPlayerId],
        { root: true }
      );
      context.dispatch("initGameServerSocket");
      await context.dispatch("fetchDictionary", { root: true });
      return true;
    }
    return false;
  }
};

const getters = {};

const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
