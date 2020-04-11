import { RECEIVED_EVENTS } from "../../../enums/event-types";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import store from "../../index";
const SOCKET_ACTION_PREFIX = "CLIENT_APP_SOCKET_";

const MODULE_NAME = "Client user module";
const defaultState = () => {
  return {
    connected: false,
    socket: null,
    gameServerSocketId: null
  };
};
const mutations = {
  setConnected(state, connected) {
    state.connected = connected;
  },
  setSocket(state, socket) {
    state.socket = socket;
  }
};

const actions = {
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED]({ commit }) {
    console.log(`${MODULE_NAME} - Successfully connected to the Websocket`);
    console.log(`${MODULE_NAME} - SOCKET ID`, state.socket.id);
    commit("setConnected", true);
  },
  initClientSocket: context => {
    const clientAppSocketInstance = io(process.env.VUE_APP_SOCKET_URL);
    context.commit("setSocket", clientAppSocketInstance);
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: clientAppSocketInstance,
        vuex: {
          store,
          actionPrefix: SOCKET_ACTION_PREFIX
        }
      })
    );
  },
  disconnectClientSocket: context => {
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
  }
};

const getters = {
  clientSocket: state => state.socket,
  gameServerSocketId: state => state.socket.id
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
