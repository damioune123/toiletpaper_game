import { RECEIVED_EVENTS, SEND_EVENTS } from "../../../enums/event-types";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import store from "../../index";
const MODULE_NAME = "Game server module";
const SOCKET_ACTION_PREFIX = "GAME_SERVER_APP_SOCKET_";

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
    gameServerSocketId: null,
    socket: null
  };
};
const mutations = {
  setSocket(state, socket) {
    state.socket = socket;
  },
  setConnected(state, connected) {
    state.connected = connected;
  }
};
const actions = {
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED]({ commit }) {
    console.log(`${MODULE_NAME} - Successfully connected to the Websocket`);
    console.log(
      `${MODULE_NAME} - SOCKET ID`,
      state.socket.id,
      state.socket.connected
    );
    commit("setConnected", true);
  },
  /**
   * Broadcast data to player
   */
  broadcastToPlayers: (context, { eventType, data = {} }) => {
    state.socket.emit(
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
    state.socket.emit(
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
    context.commit("setSocket", gameServerAppSocketInstance);
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: gameServerAppSocketInstance,
        vuex: {
          store,
          actionPrefix: SOCKET_ACTION_PREFIX
        }
      })
    );
  },
  disconnectGameServerSocket: context => {
    state.socket.disconnect();
    console.log(
      `${MODULE_NAME} - Successfully disconnected from the Websocket`
    );
    console.log(
      `${MODULE_NAME} - SOCKET ID`,
      state.socket.id,
      state.socket.connected
    );
    context.commit("setConnected", false);
    context.commit("setSocket", null);
  },
  /**
   * This will create a room in the backend and then in init the websocket if the room was successfully created
   * @param roomData ({userName, roomName, language})
   * @returns Either the room object or false if an error occurred
   */
  createRoom: async (context, roomData) => {
    console.log(`${MODULE_NAME} - Creating new room`);
    const { data } = await this.$rq.createRoom(roomData);
    if (data) {
      context.commit("setRoom", data, { root: true });
      context.dispatch("initGameServerSocket");
      await context.dispatch("fetchDictionary", { root: true });
      return data;
    }
    return false;
  }
};



const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
