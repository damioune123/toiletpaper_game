
// CSS
require('../css/styles.css');

// JS

//vendor
window.$ = require('jquery');
window.textFit = require('textfit');
window.io = require('socket.io-client');
window.FastClick = require('fastclick');

//own
require('./game_server_app/main.js');
require('./client_user_app/main.js');