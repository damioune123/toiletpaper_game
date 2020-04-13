import { RECEIVED_EVENTS } from "../../../enums/event-types";
import {
  GAME_SERVER_SOCKET_ACTION_PREFIX,
  CLIENT_SOCKET_ACTION_PREFIX
} from "../../../enums/socket/socket-action-prefix";

const MODULE_NAME = "Room module";

import { showEventInfo } from "../utils";

const defaultState = () => {
  return {
    room: null,
    currentPlayer: null
  };
};
const mutations = {
  setRoom(state, room) {
    state.room = room;
  },
  setCurrentPlayer(state, currentPlayer) {
    state.currentPlayer = currentPlayer;
  },
  resetRoomState(state) {
    Object.assign(state, defaultState());
  }
};

const actions = {
  [CLIENT_SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.UPDATE_ROOM](
    context,
    { room }
  ) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.UPDATE_ROOM,
      "On client app socket"
    );
    context.dispatch("setRoom", room);
  },
  [GAME_SERVER_SOCKET_ACTION_PREFIX + RECEIVED_EVENTS.UPDATE_ROOM](
    context,
    { room }
  ) {
    showEventInfo(
      MODULE_NAME,
      RECEIVED_EVENTS.UPDATE_ROOM,
      "On game server app socket"
    );
    context.dispatch("setRoom", room);
  },
  resetRoomState: context => {
    context.commit("resetRoomState");
  },
  setRoom: (context, room) => {
    console.log(`${MODULE_NAME} - Setting room`);
    context.commit("setRoom", room);
  },
  setCurrentPlayer: (context, currentPlayer) => {
    console.log(`${MODULE_NAME} - Setting currentPlayer`);
    context.commit("setCurrentPlayer", currentPlayer);
  }
};

const getters = {
  room: state => state.room,
  playersAsMapByUserId: state => state.room.roomState.players,
  playersAsList: state => {
    return Object.keys(state.room.roomState.players).reduce(
      (players, playerKey) => {
        players.push(state.room.roomState.players[playerKey]);
        return players;
      },
      []
    );
  },
  roomName: state => state.room.roomName,
  language: state => state.room.roomLanguage,
  gameServerSocketUUID: state => state.room.gameServerSocketUUID,
  roomId: state => state.room.roomId,
  currentPlayer: state => state.currentPlayer,
  isReadyForGame: context => {
    return (
      context.state.room &&
      context.state.currentPlayer &&
      context.getters.gameServerSocketUUID &&
      context.getters.dictionary
    );
  }
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
