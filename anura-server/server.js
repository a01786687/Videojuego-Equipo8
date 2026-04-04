const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// app.js


// Create a connection to the database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Cerplirp&130506',
    // database: 'anura'

});

// Connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log('¡Conectado! Investigando bases de datos...');

    connection.query('SHOW DATABASES', (err, results) => {
        if (err) throw err;
        console.log('Bases de datos que ve Node.js:', results);
    });
});