import { RECEIVED_EVENTS, SEND_EVENTS } from "../../../enums/event-types";
import { GAME_SERVER_SOCKET_ACTION_PREFIX } from "../../../enums/socket/socket-action-prefix";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import store from "../../index";
import { showEventInfo } from "../utils";

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

const defaultState = () => {
  return {
    gameServerState: DEFAULT_GAME_STATE,
    gameServerSocket: null
  };
};
const mutations = {
  setGameServerSocket(state, socket) {
    state.gameServerSocket = socket;
  },
  setConnected(state, connected) {
    state.connected = connected;
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
    context.commit("setConnected", true);
    console.log(
      `${MODULE_NAME}- Successfully connected to the websocket, connecting to the game server to the created room ...`
    );
    state.gameServerSocket.emit(SEND_EVENTS.JOIN_ROOM, {
      roomId: context.getters.roomId,
      isHost: true
    });
    console.log(
      `${MODULE_NAME}- Connecting to the client app to the created room ...`
    );
    context.getters.clientSocket.emit(SEND_EVENTS.JOIN_ROOM, {
      roomId: context.getters.roomId,
      playerId: context.getters.currentPlayer.userId,
      isHost: false
    });
  },
  /**
   * Broadcast data to player
   */
  broadcastToPlayers: (context, { eventType, data = {} }) => {
    state.gameServerSocket.emit(
      SEND_EVENTS.GAME_COMMUNICATION,
      Object.assign(
        data,
        {
          meta: {
            sendType: "broadcast",
            from: state.gameServerSocketId,
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
    const socketId = context.getters.players[playerId].socketId;
    state.gameServerSocket.emit(
      SEND_EVENTS.GAME_COMMUNICATION,
      Object.assign(
        data,
        {
          meta: {
            sendType: "single",
            to: socketId,
            from: state.gameServerSocketId,
            eventType
          }
        },
        { gameState: state.gameServerState }
      )
    );
  },
  initGameServerSocket: context => {
    console.log(`${MODULE_NAME} - Init game server socket`);
    const gameServerAppSocketInstance = io(process.env.VUE_APP_SOCKET_URL);
    context.commit("setGameServerSocket", gameServerAppSocketInstance);
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: gameServerAppSocketInstance,
        vuex: {
          store,
          actionPrefix: GAME_SERVER_SOCKET_ACTION_PREFIX
        }
      })
    );
  },
  disconnectGameServerSocket: context => {
    state.gameServerSocket.disconnect();
    console.log(
      `${MODULE_NAME} - Successfully disconnected from the Websocket`
    );
    console.log(
      `${MODULE_NAME} - SOCKET ID`,
      state.gameServerSocket.id,
      state.gameServerSocket.connected
    );
    context.commit("setConnected", false);
    context.commit("setGameServerSocket", null);
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
