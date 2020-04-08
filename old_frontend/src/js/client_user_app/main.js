import io from 'socket.io-client';
import axios from 'axios';
import gameServerApp from '../game_server_app/main';
import utils from '../utils';
$(() => {
    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     */
    const IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: () => {
            IO.socket = io(process.env.SOCKET_URL);
            IO.bindEvents();
        },
        /**
         * This reset the IO state
         */
        reset: () => {
            IO.socket = null;
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents: () => {
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('disconnect', IO.disconnectedServer);
            IO.socket.on('new:player', IO.playerJoinedRoom);
            IO.socket.on('update:room', IO.roomUpdated);
            IO.socket.on('disconnected:player', IO.disconnectedPlayer);
            IO.socket.on('disconnected:host', IO.disconnectedHost);
            IO.socket.on('server:error', IO.error);
            IO.socket.on('error', IO.error);
            IO.socket.on('game:started', App.onGameStarted);
        },
        /**
         * Broadcast data to palyer
         */
        broadcastToPlayers: (eventType, data = {}) => {
            IO.socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'broadcast', from: App.currentPlayer.socketId, eventType } }));
        },
        /**
         * Send message to host
         */
        sendMessageToHost: (eventType, data = {}) => {
            IO.socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'single', to: App.room.gameServerSocketId, from: App.currentPlayer.socketId, eventType } }));
        },
        /**
         * Send message to a particular player with its player id
         */
        sendMessageToPlayer: (eventType, playerId, data = {}) => {
            const socketId = App.room.roomState.players[playerId].socketId;
            IO.socket.emit('game-communication', Object.assign(data, { meta: { sendType: 'single', to: socketId, from: App.currentPlayer.socketId, eventType } }));
        },

        /**
         * The client user app is successfully connected!
         */
        onConnected: () => {
            console.log('Client User - Successfully connected to the Websocket, connecting to the room ...');
            IO.socket.emit('join:room', { roomId: App.room.roomId, playerId: App.currentPlayer.userId, isHost: false });
        },
        /**
         * A player has successfully joined the game.
         * @param data {{newPlayer: object}}
         */
        playerJoinedRoom: ({ newPlayer }) => {
            if (newPlayer.userId === App.currentPlayer.userId) {
                App.currentPlayer = newPlayer;
                console.log(`Client user - current user has successfully joined the room - ${App.room.roomName}`);
                App.showLobbyScreen();

            }
            else {
                console.log(`Client User - A new player has connected to the room - ${newPlayer.userName}`)
            }
        },
        /**
         * The room e has been updated, refreshing local version
         * @param data {{room: object}}
         */
        roomUpdated: ({ room }) => {
            console.log('Client User - room local copy updated');
            App.room = room;
            if (App.currentPageId === App.$templateLobbyId) {
                App.showLobbyScreen();
            }
        },
        /**
         * A player left the room
         * @param data {{player: object}}
         */
        disconnectedPlayer: ({ leftPlayer }) => {
            console.log(`Client User - a player has disconnected in the room : ${leftPlayer.userName}`);
        },
        /**
         * The game server left the game
         */
        disconnectedServer: () => {
            console.log(`Client User - The server has disconnected`);
            App.reset();
            alert('The server has disconnected - redirecting to home page');
        },
        /**
         * The game server left the game
         */
        disconnectedHost: () => {
            console.log(`Client User - The game server (host) left the game`);
            App.reset();
            alert('The host has left the game, you have been redirected');
        },
        /**
         * An error has occurred.
         * @param data
         */
        error: (data) => {
            alert(data.message);
        }

    };

    const App = {
        API_URL: process.env.API_URL,
        /**
         * This is a local copy of the  game state
         *
         */
        gameServerApp,

        /**
         * This is a local copy of the  game state
         *
         */
        gameState: {},

        /**
         * This is a local copy of the currentPlayer
         *
         */
        currentPlayer: {},

        /**
         * This is the room copy  (modified server-side only)
         *
         */
        room: {},
        /**
         * This is the id of the current page
         *
         */
        currentPageId: null,
        /**
         * The word dictionary fetched from backend
         *
         */
        dictionary: {},
        init: () => {
            App.cacheElements();
            App.showInitScreenTemplate();
            App.bindEvents();
            // Initialize the fastclick library
            FastClick.attach(document.body);
        },
        /**
         * This reset the APP state
         */
        reset: () => {
            IO.reset();
            App.gameState = {};
            App.room = {};
            App.currentPlayer = {};
            App.currentPageId = null;
            App.init();
        },
        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: () => {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreenId = '#intro-screen-template';
            App.$templateCreateRoomId = '#create-room-template';
            App.$templateJoinRoomId = '#join-room-template';
            App.$templateLobbyId = '#lobby-template';
            App.$animScreenTemplatedId = '#anim-screen-template';
        },
        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: () => {
            App.$doc.on('click', '#btnGoToCreateRoom', () => App.showScreenTemplate(App.$templateCreateRoomId));
            App.$doc.on('click', '#btnGoToJoinRoom', () => App.showScreenTemplate(App.$templateJoinRoomId));
            App.$doc.on('click', '#btnCreateRoom', App.createNewRoom);
            App.$doc.on('click', '#btnJoinRoom', App.joinRoom);
            App.$doc.on('click', '#btnStartGame', App.askHostToLaunchGame);
        },

        // Show screen function
        /**
         * Show the initial Title Screen
         * (with Start and Join buttons)
         */
        showInitScreenTemplate: () => {
            App.showScreenTemplate(App.$templateIntroScreenId);
        },
        /**
         * Show a regular screen template
         * (with Start and Join buttons)
         */
        showLobbyScreen: () => {
            const loadPlayersOnLobby = () => {
                $('#lobbyAmountTotalPlayers').empty();
                $('#lobbyAmountTotalPlayers').append(`${Object.keys(App.room.roomState.players).length} players`);
                const ul = $('#lobbyPlayersList');
                ul.empty();
                let connectedPlayersAmount = 0;
                Object.keys(App.room.roomState.players).forEach((key) => {
                    const player = App.room.roomState.players[key];
                    if (player.isConnected) connectedPlayersAmount++;
                    const playerInfo = `${player.userName}`; //| Connected ${player.isConnected}`;
                    ul.append(`<li>${playerInfo}</li>`);
                });
                $('#lobbyAmountConnectedPlayers').empty();
                $('#lobbyAmountConnectedPlayers').append(`${connectedPlayersAmount} connected players`);
            };

            App.showScreenTemplate(App.$templateLobbyId);
            $('#lobbyRoomName').empty();
            $('#lobbyRoomName').append(`${App.room.roomName}`);
            $('#lobbyCurrentUser').empty();
            $('#lobbyCurrentUser').append(`${App.currentPlayer.userName}`);
            loadPlayersOnLobby();
        },


        //Business
        /**
         * create a new room
         */
        createNewRoom: async () => {
            const data = {
                roomName: $('#inputRoomNameForNewRoom').val(),
                userName: $('#inputPlayerNameForNewRoom').val()
            };
            const room = await gameServerApp.createNewRoom(data);
            if (room) {
                App.room = room;
                App.currentPlayer = room.roomState.players[room.currentPlayerId];
                await App.fetchDictionary();
                IO.init();
            }
        },
        /**
         * create a new room
         */
        joinRoom: async () => {
            const data = {
                roomName: $('#inputRoomNameToJoinRoom').val(),
                userName: $('#inputPlayerNameToJoinRoom').val()
            };
            let response;
            try{
                response = await axios.get(`${App.API_URL}/rooms/join`, {params: data});
            }catch(error){
                utils.handleApiError(error, 'Error while joining the room');
                return;
            }
            App.room = response.data;
            App.currentPlayer = App.room.roomState.players[App.room.currentPlayerId];
            await App.fetchDictionary();
            IO.init();
        },
        /**
         * Fetch the room dictionary (according to the room language)
         */
        fetchDictionary: async () => {
            console.log('Client user - fetch dictionary from backend');
            const data = {
                language : App.room.language,
            };
            let response;
            try{
                response = await axios.get(`${App.API_URL}/dictionaries`, {params: data});
            }catch(error){
                utils.handleApiError(error, 'Error while fetching the room dictionary');
                return;
            }
            App.dictionary = response.data;
        },
        /**
         * Ask game server to Launch Game
         *
         */
        askHostToLaunchGame: () => {
            console.log('ask host to launch game')
            IO.sendMessageToHost('game:start');
        },
        /**
         * onGameStarted
         *
         */
        onGameStarted: (data) => {
            console.log('Client user - on game:started event received ', data);
            App.showScreenTemplate(App.$animScreenTemplatedId);
            App.gameState = data.gameState;

            console.log('App room ', App.room);
            console.log('App room players ', App.room.roomState.players);

            let players = getPlayersAsList();
            players.forEach(p => {
                $('.round-main').append('<div>coucou</div>')
                $('.round-main').eq(0).append(`
                <div class="round-player-line flex-container-row">
                <div class="round-player-name flex-item-line">${p.userName}</div>
                <div class="round-player-input1 flex-item-line"> <label class="input-label" for="input1">Animal</label> <input type="text" class="input-self bg-green" name="input1-player1"><button class="btn-input bg-green"> <img style="width: 2.4rem;" src="img/valid.png" alt="" srcset=""></button></div>
                <div class="round-player-input2 flex-item-line"> <label class="input-label" for="input2">Animal</label> <input disabled type="text" class="input-other bg-red" name="input1-player1"><button class="btn-input bg-red">OK</button></div>
                <div class="round-player-time flex-item-line">time</div>
                `)
            });
            let round_player_line = $('.round-player-line')
            //round-main
            //round-player-line

        },

        // UTILITY
        /**
         * Show a regular screen template
         */
        showScreenTemplate: (templateId) => {
            App.$gameArea.html($(templateId).html());
            App.currentPageId = templateId;
        },
    };
    App.init();


    function getPlayersAsList () {
        return Object.keys(App.room.roomState.players).reduce((players, playerKey) => {
            players.push(App.room.roomState.players[playerKey]);
            return players;
        }, []);
    }




});

