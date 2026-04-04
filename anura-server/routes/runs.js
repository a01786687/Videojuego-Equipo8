/*
 routes/runs.js
 Run endpoints for start, get, and update runs
 It handles everything run related, creating a new run, getting a saved
 run, and updating run progress like mosquitos, bosses defeated, etc.
 */
const express = require('express');
const router = express.Router();
const db = require('../db.js');

// START RUN
router.post('/start', (req, res) => {
    const { sessionId } = req.body;
    db.query(
        'INSERT INTO runs (run_sesion_id, mosquitoes_collected, bosses_defeated, victory, start_time) VALUES (?, 0, 0, FALSE, NOW())',
        [sessionId],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error.' });
            res.json({ success: true, message: 'Run started!', runId: results.insertId });
        }
    );
});

// GET LAST RUN
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
    db.query(
        `SELECT runs.* FROM runs 
         JOIN sesions ON runs.run_sesion_id = sesions.sesion_id 
         WHERE sesions.sesion_user_id = ? 
         AND runs.victory = FALSE 
         AND runs.end_time IS NULL
         ORDER BY runs.start_time DESC 
         LIMIT 1`,
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error.' });
            if (results.length === 0) {
                return res.json({ success: false, message: 'No saved run found.' });
            }
            res.json({ success: true, run: results[0] });
        }
    );
});

// UPDATE RUN
router.put('/:runId', (req, res) => {
    const { runId } = req.params;
    const { mosquitoes_collected, bosses_defeated, run_time, victory } = req.body;
    db.query(
        'UPDATE runs SET mosquitoes_collected = ?, bosses_defeated = ?, run_time = ?, victory = ? WHERE run_id = ?',
        [mosquitoes_collected, bosses_defeated, run_time, victory, runId],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error.' });
            res.json({ success: true, message: 'Run updated!' });
        }
    );
});

module.exports = router; // always last line