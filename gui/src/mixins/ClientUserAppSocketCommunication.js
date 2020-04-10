import { mapGetters } from "vuex";

export const ClientUserAppSocketCommunication = {
    computed:{
        ...mapGetters({
            connected: 'connected',
            players: 'players',
            currentPlayer: 'currentPlayer',
            gameServerSocketId: 'gameServerSocketId'
        })
    },
    methods: {
        /**
         * Broadcast data to player
         */
        broadcastToPlayers: (eventType, data = {}) => {
            this.$socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'broadcast', from: this.currentPlayer.socketId, eventType } }));
        },
        /**
         * Send message to host
         */
        sendMessageToHost: (eventType, data = {}) => {
            this.$socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'single', to: this.gameServerSocketId, from: this.currentPlayer.socketId, eventType } }));
        },
        /**
         * Send message to a particular player with its player id
         */
        sendMessageToPlayer: (eventType, playerId, data = {}) => {
            const socketId = this.players[playerId].socketId;
            this.$socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'single', to: socketId, from: this.currentPlayer.socketId, eventType } }));
        },
    }
};