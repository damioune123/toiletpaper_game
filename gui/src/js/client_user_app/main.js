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
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('newRoomState', IO.playerJoinedRoom );
            IO.socket.on('error', IO.error );
        },

        /**
         * The client user app is successfully connected!
         */
        onConnected : () => {
            console.log('Client User - Successfully connected to the room');
        },
        /**
         * A player has successfully joined the game.
         * @param data {{newPlayer: object}}
         */
        playerJoinedRoom : ({newPlayer}) =>{
            console.log('Client User - A new player has connected to the room ', newPlayer)
        },
        /**
         * The room state has been updated, refreshing local version
         * @param data {{roomState: object}}
         */
        newRoomState : ({roomState}) =>{
            console.log('Client User - New room state', roomState);
            App.roomState= roomState;
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
         * This is the room state copy of the whole app (modified server-side only)
         *
         */
        roomState: {},

        init: function () {
            console.log('Client User - init');
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            // Initialize the fastclick library
            FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateCreateRoom = $('#create-room-template').html();
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            App.$doc.on('click', '#btnCreateRoom', App.showCreateRoomScreen);
            App.$doc.on('click', '#btnStartRoom', App.createNewRoom);
        },
        /**
         * Show the initial Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
            App.doTextFit('.title');
        },
        /**
         * Show the create room screen
         * (with Start and Join buttons)
         */
        showCreateRoomScreen: async function() {
            App.$gameArea.html(App.$templateCreateRoom);
        },
        /**
         * create a new room
         * (with Start and Join buttons)
         */
        createNewRoom: async function() {
            const data = {
                roomName : $('#inputRoomName').val(),
                userName : $('#inputPlayerName').val()
            };
            await gameServerApp.createNewRoom(data);
        },

        // UTILITY
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
    IO.init();
    App.init();
});

