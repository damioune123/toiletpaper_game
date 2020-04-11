import { RECEIVED_EVENTS, SEND_EVENTS } from "../../../enums/event-types";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import store from "../../index";
const APP_NAME = "Game server app";
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
    console.log(`${APP_NAME} - Successfully connected to the Websocket`);
    console.log(
      `${APP_NAME} - SOCKET ID`,
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
    console.log(`${APP_NAME} - Successfully disconnected from the Websocket`);
    console.log(
      `${APP_NAME} - SOCKET ID`,
      state.socket.id,
      state.socket.connected
    );
    context.commit("setConnected", false);
    context.commit("setSocket", null);
  }
};

const getters = {
  gameServerSocket: state => state.socket
};

const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
