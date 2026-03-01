const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const timetablePath = path.join(__dirname, 'public', 'timetable.json');

// API: Get timetable
app.get('/api/timetable', (req, res) => {
  fs.readFile(timetablePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read timetable.' });
    res.json(JSON.parse(data));
  });
});

// API: Update timetable (for edit feature)
app.post('/api/timetable', (req, res) => {
  const newData = req.body;
  fs.writeFile(timetablePath, JSON.stringify(newData, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save timetable.' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
