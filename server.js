const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./results.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create table if not exists
db.run(`
    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        time TEXT,
        coupon_name TEXT,
        number TEXT
    )
`);

// API to get results by date
app.get('/getResults', (req, res) => {
    const { date } = req.query;
    const query = date
        ? `SELECT id, date, time, coupon_name, number FROM results WHERE date = ? ORDER BY time ASC`
        : `SELECT id, date, time, coupon_name, number FROM results ORDER BY date DESC, time ASC`;

    db.all(query, [date], (err, rows) => {
        if (err) {
            console.error('Error fetching results:', err);
            res.status(500).send('Error fetching results');
        } else {
            res.json(rows);
        }
    });
});

// API to upload new results
app.post('/uploadResult', (req, res) => {
    const { date, time, coupon_name, number } = req.body;
    const query = `INSERT INTO results (date, time, coupon_name, number) VALUES (?, ?, ?, ?)`;
    db.run(query, [date, time, coupon_name, number], function (err) {
        if (err) {
            res.status(500).send('Error uploading result');
        } else {
            res.send('Result uploaded successfully!');
        }
    });
});

// API to delete a result by id
app.delete('/deleteResult/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM results WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Error deleting result:', err);
            res.status(500).send('Error deleting result');
        } else {
            res.send('Result deleted successfully!');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
