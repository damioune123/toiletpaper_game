import gameServerApp from '../game_server_app/main';
import io from 'socket.io-client';

$(() =>{
    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     */
    const IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: () =>{
            IO.socket = io(process.env.SOCKET_URL);
            IO.bindEvents();
        },

        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : () =>{
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('new:player', IO.playerJoinedRoom);
            IO.socket.on('update:room', IO.roomUpdated);
            IO.socket.on('error', IO.error);
        },

        /**
         * The client user app is successfully connected!
         */
        onConnected : () => {
            console.log('Client User - Successfully connected to the Websocket, connecting to the room ...');
            IO.socket.emit('join:room', {roomId: App.room.roomId, playerId: App.currentPlayer.userId, isHost: false});
        },
        /**
         * A player has successfully joined the game.
         * @param data {{newPlayer: object}}
         */
        playerJoinedRoom : ({newPlayer}) =>{
            if(newPlayer.userId === App.currentPlayer.userId){
                App.currentPlayer = newPlayer;
                console.log(`Client user - current user has successfully joined the room - ${App.room.roomName}`);
            }
            else{
                console.log(`Client User - A new player has connected to the room - ${newPlayer.userName}`)
            }
        },
        /**
         * The room e has been updated, refreshing local version
         * @param data {{room: object}}
         */
        roomUpdated : ({room}) =>{
            console.log('Client User - room local copy updated');
            App.room = room;
        },
        /**
         * An error has occurred.
         * @param data
         */
        error :(data) => {
            alert(data.message);
        }

    };

    const App = {
        apiUrl: process.env.API_URL,
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
        init: function () {
            App.cacheElements();
            App.showScreenTemplate(App.$templateIntroScreen);
            App.doTextFit('.title');
            App.bindEvents();
            // Initialize the fastclick library
            FastClick.attach(document.body);
        },
        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            App.$doc.on('click', '#btnCreateRoom', () => App.showScreenTemplate(App.$templateCreateRoom));
            App.$doc.on('click', '#btnStartRoom', App.createNewRoom);
        },

        /**
         * Show a regular screen template
         * (with Start and Join buttons)
         */
        showScreenTemplate: function(template) {
            App.$gameArea.html(template);
        },
        //Business
        /**
         * create a new room
         * (with Start and Join buttons)
         */
        createNewRoom: async function() {
            const data = {
                roomName : $('#inputRoomName').val(),
                userName : $('#inputPlayerName').val()
            };
            const room = await gameServerApp.createNewRoom(data);
            if(room){
                App.room = room;
                App.currentPlayer = room.roomState.players[room.currentPlayerId];
                IO.init();
            }
        },

        // UTILITY
        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateCreateRoom = $('#create-room-template').html();
            App.$templateLobby = $('#lobby-template').html();

        },
        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        }
    };
    App.init();
});

