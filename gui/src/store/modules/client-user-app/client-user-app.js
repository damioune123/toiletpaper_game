import { RECEIVED_EVENTS, SEND_EVENTS } from "../../../enums/event-types";
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
    clientHasJoinedRoom: false,
    clientSocket: null
  };
};
const mutations = {
  setClientSocket(state, socket) {
    state.clientSocket = socket;
  },
  setClientHasJoinedRoom(state, clientHasJoinedRoom) {
    state.clientHasJoinedRoom = clientHasJoinedRoom;
  },
  resetClientUserAppState(state) {
    Object.assign(state, defaultState());
  }
};

const actions = {
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.CONNECTED]() {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.CONNECTED,
      " Successfully connected to the Websocket"
    );
  },
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.NEW_PLAYER](context, { newPlayer }) {
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
    router.push({ name: "Home" });
    alert("The server has disconnected - redirecting to home page");
  },
  /**
   * The game server left the game
   */
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.DISCONNECTED_HOST](context) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.DISCONNECTED_HOST,
      "The host has left the game, you have been redirected"
    );
    context.dispatch("resetAppState");
    alert("The host has left the game, you have been redirected");
  },
  /**
   * An error has occurred.
   * @param data
   */
  [SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.SERVER_ERROR](context, data) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.SERVER_ERROR,
      `A server error occurred : ${data.message}`
    );
    alert(data.message);
  },
  initClientSocket: context => {
    if (!state.clientSocket) {
      console.log(
        "No client socket found - Creating and connecting a new socket instance"
      );
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
    } else if (!state.clientSocket.connected) {
      console.log(
        `A game server socket was found but has been disconnected, reconnecting... - Socket id : ${state.clientSocket.id}`
      );
      state.clientSocket.reconnect();
    }
  },
  disconnectClientSocket: context => {
    if(state.clientSocket){
      state.clientSocket.disconnect();
      console.log(
          `${MODULE_NAME} - Successfully disconnected from the Websocket`
      );
      context.commit("setClientSocket", null);
    }
  },
  resetClientUserAppState: context => {
    context.dispatch("disconnectClientSocket");
    context.commit("resetClientUserAppState");
  },
  /**
   * This will create a room in the backend and then in init the websocket if the room was successfully created
   * @param roomData ({userName, roomName, language})
   * @returns True or false if an error occurred
   */
  joinRoom: async function(context, roomData) {
    console.log(`${MODULE_NAME} - Joining room room`);
    const { data } = await this.$rq.joinRoom(roomData);
    if (data) {
      context.dispatch("setRoom", data, { root: true });
      context.dispatch(
        "setCurrentPlayer",
        data.roomState.players[data.currentPlayerId],
        { root: true }
      );
      await context.dispatch("fetchDictionary", { root: true });
      console.log(
        `${MODULE_NAME}- Connecting the client app to the joined room ...`
      );
      state.clientSocket.emit(SEND_EVENTS.JOIN_ROOM, {
        roomId: context.getters.roomId,
        playerId: context.getters.currentPlayer.userId,
        isHost: false
      });
      return true;
    }
    return false;
  }
};

const getters = {
  clientSocket: state => state.clientSocket,
  isClientConnected: state => {
    if (!state.clientSocket) {
      return false;
    }
    return state.clientSocket.connected;
  }
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
