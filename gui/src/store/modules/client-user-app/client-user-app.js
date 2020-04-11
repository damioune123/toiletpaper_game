import { SOCKET_ACTION_PREFIX } from "../../../enums/global";
import { RECEIVED_EVENTS } from "../../../enums/event-types";
import { clientAppSocketInstance } from "../../../socket/socket-instance";

const APP_NAME = "Client user app";
const defaultState = () => {
  return {
    connected: false,
    socket: clientAppSocketInstance
  };
};
const mutations = {
  setConnected(state, connected) {
    state.connected = connected;
  }
};

const actions = {
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED]({ commit }) {
    console.log(`${APP_NAME} - Successfully connected to the Websocket`);
    console.log(`${APP_NAME} - SOCKET ID`, state.socket.id);
    commit("setConnected", true);
  }
};

const getters = {
  clientSocket: state => state.socket
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
