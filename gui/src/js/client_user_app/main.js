import io from 'socket.io-client';
import axios from 'axios';
import gameServerApp from '../game_server_app/main';

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
                App.showLobbyScreen();

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
            if(App.currentPageId === App.$templateLobbyId){
                App.showLobbyScreen();
            }
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
        currentPageId: null,
        init: () => {
            App.cacheElements();
            App.showInitScreenTemplate();
            App.bindEvents();
            // Initialize the fastclick library
            FastClick.attach(document.body);
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
            App.$gameTemplateId = '#game-template';
        },
        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: () => {
            App.$doc.on('click', '#btnGoToCreateRoom', () => App.showScreenTemplate(App.$templateCreateRoomId));
            App.$doc.on('click', '#btnGoToJoinRoom', () => App.showScreenTemplate(App.$templateJoinRoomId));
            App.$doc.on('click', '#btnCreateRoom', App.createNewRoom);
            App.$doc.on('click', '#btnJoinRoom', App.joinRoom);
            App.$doc.on('click', '#btnStartGame', App.launchGame);
        },

        // Show screen function
        /**
         * Show the initial Title Screen
         * (with Start and Join buttons)
         */
        showInitScreenTemplate: () => {
            App.showScreenTemplate(App.$templateIntroScreenId);
            App.doTextFit('.title');
        },
        /**
         * Show a regular screen template
         * (with Start and Join buttons)
         */
        showLobbyScreen: () => {
            const loadPlayersOnLobby = ()=>{
                $('#lobbyAmountTotalPlayers').empty();
                $('#lobbyAmountTotalPlayers').append(`${Object.keys(App.room.roomState.players).length} players`);
                const ul =  $('#lobbyPlayersList');
                ul.empty();
                let connectedPlayersAmount = 0;
                Object.keys(App.room.roomState.players).forEach((key)=>{
                    const player = App.room.roomState.players[key];
                    if(player.isConnected) connectedPlayersAmount ++;
                    const playerInfo = `Username : ${player.userName} | Connected ${player.isConnected}`;
                    ul.append(`<li>${playerInfo}</li>`);
                });
                $('#lobbyAmountConnectedPlayers').empty();
                $('#lobbyAmountConnectedPlayers').append(`${connectedPlayersAmount} connected players`);
            };

            App.showScreenTemplate(App.$templateLobbyId);
            loadPlayersOnLobby();
        },


        //Business
        /**
         * create a new room
         */
        createNewRoom: async () => {
            const data = {
                roomName : $('#inputRoomNameForNewRoom').val(),
                userName : $('#inputPlayerNameForNewRoom').val()
            };
            const room = await gameServerApp.createNewRoom(data);
            if(room){
                App.room = room;
                App.currentPlayer = room.roomState.players[room.currentPlayerId];
                IO.init();
            }
        },
        /**
         * create a new room
         */
        joinRoom: async () => {
            const data = {
                roomName : $('#inputRoomNameToJoinRoom').val(),
                userName : $('#inputPlayerNameToJoinRoom').val()
            };
            let response;
            try{
                response = await axios.get(`${App.API_URL}/rooms/join`, {params: data});
            }catch(error){
                console.log('Error while joining the room', error.response.data);
                if(error.response.data.details && error.response.data.details[0] && error.response.data.details[0].message){
                    alert(error.response.data.details[0].message);
                }
                else{
                    alert(JSON.stringify(error.response.data));
                }
                return;
            }
            App.room = response.data;
            App.currentPlayer = App.room.roomState.players[App.room.currentPlayerId];
            IO.init();
        },
        /**
         * Launch Game
         *
         */
        launchGame: () => {
            //TODO SOCKET LOGIC TO INIT GAME on the game server app
            App.showScreenTemplate(App.$gameTemplateId);
            App.doTextFit('.title');

        },

        // UTILITY
        /**
         * Show a regular screen template
         */
        showScreenTemplate: (templateId) => {
            App.$gameArea.html($(templateId).html());
            App.currentPageId = templateId;
        },

        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : (el) => {
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

