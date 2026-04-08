/*
 db.js
 Database connection, connects to MySQL and exports that connection so 
 other files can use it without each one creating their own connection
 */

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Cerplirp&130506',
    database: 'anura'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to anura database!');
});

module.exports = connection;