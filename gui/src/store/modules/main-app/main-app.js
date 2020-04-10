import { RECEIVED_EVENTS } from "../../../enums/event-types";
import { SOCKET_ACTION_PREFIX } from "../../../enums/global";

const APP_NAME = "Main app";
const defaultState = () => {
  return {
    connected: false
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
    commit("setConnected", true);
  }
};

const getters = {
  connected: state => state.connected
};

const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
