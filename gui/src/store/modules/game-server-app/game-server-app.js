// import { RECEIVED_EVENTS } from "../../../enums/event-types";
// import { SOCKET_ACTION_PREFIX } from "../../../enums/global";
//
// const APP_NAME = "Game server app";
import $socket from '../../../socket/socket-instance';

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
     gameServerSocketId: null
  };
};
const mutations = {};
const actions = {
  /**
   * Broadcast data to player
   */
  broadcastToPlayers : (context, {eventType, data = {}}) => {
    $socket.emit('game-communication', Object.assign(
        data,
        { meta: {sendType: 'broadcast', from: state.gameServerSocketId, eventType }},
        {gameState: state.gameServerState}
        ));
  },
  /**
   * Send message to a particular player with its player id
   */
  sendMessageToPlayer : (context, {eventType, playerId, data = {}}) => {
    const socketId = context.getters.players[playerId].socketId;
    $socket.emit('game-communication', Object.assign(
        data,
        { meta: {sendType: 'single', to: socketId, from: state.gameServerSocketId, eventType}},
        {gameState: state.gameServerState})
    );
  },
};

const getters = {};

const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};
