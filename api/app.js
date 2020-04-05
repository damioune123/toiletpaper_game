//vendor
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
//own
const lockDownRaceSocketHandler = require('./socket/lockdown_race_socket_handler');
const dictionaries = require('./models/dictionary/dictionaries');

const init = async ()=>{
    await dictionaries.buildDictionaries();
};
(async ()=>{
    await init();
    // Create a new instance of Express and socket io
    const app = express();
    const http = require('http').createServer(app);
    const io = require('socket.io')(http);

//middlewares
    app.use(cors());
    app.use(bodyParser.json());

// Serve static html, js, css, and image files from the built frontend 'dist'
    app.use(express.static(path.normalize(path.join(__dirname,'../gui/dist'))));

//add routes for REST API
    app.use('/api', require('./routes'));

    io.set('log level', 1);

//Connect the websocket
    io.on('connection', (socket)=>{
        console.log('a user has connected');
        lockDownRaceSocketHandler.handleSocket(io, socket);
        //Disonnect the websocket
        socket.on('disconnect', ()=>{
            console.log('a user has disconnected');
            lockDownRaceSocketHandler.handleDisconnectedSocket(io, socket);
        });
    });


    const port = process.env.PORT || 8080;
// Create a Node.js based http server on port 8080
    http.listen(port,()=>{
        console.log('listening on *:'+port);
    });
})();



