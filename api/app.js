// Import the vendor modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

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
    //TODO
    console.log('a user connected');
});

// Create a Node.js based http server on port 8080
http.listen(8080, ()=>{
    console.log('listening on *:8080');
});


