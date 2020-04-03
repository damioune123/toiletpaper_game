// Import the Express module
const express = require('express');
// Import the 'path' module (packaged with Node.js)
const path = require('path');
// Create a new instance of Express
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static html, js, css, and image files from the built frontend 'dist'
app.use(express.static(path.normalize(path.join(__dirname,'../gui/dist'))));
app.use('/api', require('./routes'));
// Create a Node.js based http server on port 8080


io.set('log level',1);

io.on('connection', (socket)=>{
    console.log('a user connected');
});

http.listen(8080, ()=>{
    console.log('listening on *:8080');
});


