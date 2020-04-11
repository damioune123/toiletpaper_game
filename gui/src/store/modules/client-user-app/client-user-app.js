import { RECEIVED_EVENTS } from "../../../enums/event-types";
import { CLIENT_SOCKET_ACTION_PREFIX } from "../../../enums/socket/socket-action-prefix";
import router from "@/router";
import { showEventInfo } from "../utils";
import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import store from "../../index";

const SOCKET_ACTION_PREFIX = CLIENT_SOCKET_ACTION_PREFIX;

const MODULE_NAME = "Client user module";
const defaultState = () => {
  return {
    connected: false,
    clientHasJoinedRoom: false,
    clientSocket: null
  };
};
const mutations = {
  setConnected(state, connected) {
    state.connected = connected;
  },
  setClientSocket(state, socket) {
    state.clientSocket = socket;
  },
  setClientHasJoinedRoom(state, clientHasJoinedRoom) {
    state.clientHasJoinedRoom = clientHasJoinedRoom;
  }
};

const actions = {
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED]({ commit }) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.CONNECTED,
      " Successfully connected to the Websocket"
    );
    commit("setConnected", true);
  },
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.NEW_PLAYER](context , { newPlayer }) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.NEW_PLAYER,
      " Successfully connected to the Websocket"
    );
    if (newPlayer.userId === context.getters.currentPlayer.userId) {
      context.dispatch("setCurrentPlayer", newPlayer);
      showEventInfo(
        MODULE_NAME,
        RECEIVED_EVENTS.NEW_PLAYER,
        `Current user has successfully joined the room : ${context.getters.roomName}`
      );
      context.commit("setClientHasJoinedRoom", true);
      router.push({ name: "Lobby" });
    } else {
      showEventInfo(
        MODULE_NAME,
        RECEIVED_EVENTS.NEW_PLAYER,
        `A new player has connected to the room - : ${newPlayer.userName}`
      );
    }
  },
  initClientSocket: context => {
    const clientAppSocketInstance = io(process.env.VUE_APP_SOCKET_URL);
    context.commit("setClientSocket", clientAppSocketInstance);
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: clientAppSocketInstance,
        vuex: {
          store,
          actionPrefix: CLIENT_SOCKET_ACTION_PREFIX
        }
      })
    );
  },
  disconnectClientSocket: context => {
    state.clientSocket.disconnect();
    console.log(
      `${MODULE_NAME} - Successfully disconnected from the Websocket`
    );
    context.commit("setConnected", false);
    context.commit("setClientSocket", null);
  }
};

const getters = {
  clientSocket: state => state.clientSocket
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
