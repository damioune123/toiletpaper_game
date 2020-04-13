import { mapGetters, mapActions } from "vuex";
import { getClientSocketInstance } from "../socket/socket-instances";

export default {
  data () {
    return {
      clientSocket: getClientSocketInstance()
    }
  },
  computed: {
    ...mapGetters({
      connected: "connected",
      players: "players",
      currentPlayer: "currentPlayer",
      gameServerSocketUUID: "gameServerSocketUUID"
    })
  },
  methods: {
    ...mapActions({
      initClientSocket: "initClientSocket",
      resetAppState: "resetAppState"
    }),
    /**
     * Broadcast data to player
     */
    broadcastToPlayers: (eventType, data = {}) => {
      this.clientSocket.emit(
        "game-communication",
        Object.assign(data, {
          meta: {
            sendType: "broadcast",
            from: this.currentPlayer.socketUUID,
            eventType
          }
        })
      );
    },
    /**
     * Send message to host
     */
    sendMessageToHost: (eventType, data = {}) => {
      this.clientSocket.emit(
        "game-communication",
        Object.assign(data, {
          meta: {
            sendType: "single",
            to: this.gameServerSocketUUID,
            from: this.currentPlayer.socketUUID,
            eventType
          }
        })
      );
    },
    /**
     * Send message to a particular player with its player id
     */
    sendMessageToPlayer: (eventType, playerId, data = {}) => {
      const socketUUID = this.players[playerId].socketUUID;
      this.clientSocket.emit(
        "game-communication",
        Object.assign(data, {
          meta: {
            sendType: "single",
            to: socketUUID,
            from: this.currentPlayer.socketUUID,
            eventType
          }
        })
      );
    }
  }
};
