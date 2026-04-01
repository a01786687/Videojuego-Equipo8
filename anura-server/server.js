/*
 server.js
 main Express server for Anura
 It's the bridge for connecting our backend to our frontend, routes, and starts the server.
 It's the main file that starts everything, sets up express, connects to database, and tells the server which routes exist
 */


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// no longer importing mysql2 directly because that's now something that db.js will do, -> removed: const mysql = require('mysql2');

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:3000'
}));

// Database connection
require('./db.js'); // runs the connection code 

// Routes
const authRoutes = require('./routes/auth.js');
const runRoutes = require('./routes/runs.js');

app.use('/auth', authRoutes);
app.use('/runs', runRoutes);

app.listen(port, () => {
    console.log(`Anura server running on port ${port}`);
});


/* NOTES:

*/