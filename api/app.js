// Import the Express module
const express = require('express');

// Import the 'path' module (packaged with Node.js)
const path = require('path');

// Create a new instance of Express
const app = express();
// Serve static html, js, css, and image files from the built frontend 'dist'
app.use(express.static(path.normalize(path.join(__dirname,'../gui/dist'))));
app.use('/api', require('./routes'));
// Create a Node.js based http server on port 8080
app.listen(8080, () => console.log('app listening on port 8080!'));

