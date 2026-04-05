const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Database connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '#Clifjumper4406',
    database: 'anura'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

// Routes will go here

app.listen(port, () => {
    console.log(`Anura server running on port ${port}`);
});