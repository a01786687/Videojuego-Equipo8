/*
 routes/auth.js
 Authentication endpoints for register and login
 Handles everything login and register related, when the game sends a username
 and password, this file checks the database and responds
 
 */

const express = require('express');
const router = express.Router();
const db = require('../db.js');

// REGISTER
// POST http://127.0.0.1:8080/auth/register
// Body: { username, email, password }
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // check if username or email already exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Username or email already exists.' });
        }

        // insert new user
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error.' });
            res.json({ success: true, message: 'Account created!', userId: results.insertId });
        });
    });
});

// LOGIN
// POST http://127.0.0.1:8080/auth/login
// Body: { username, password }
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // check if user exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found. Please register.' });
        }

        const user = results[0];

        // check password
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        // create a session for the user
        db.query('INSERT INTO sesions (sesion_user_id) VALUES (?)', [user.user_id], (err, sessionResult) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error.' });

            res.json({
                success: true,
                message: `Welcome, ${user.username}!`,
                userId: user.user_id,
                username: user.username,
                sessionId: sessionResult.insertId
            });
        });
    });
});

module.exports = router;