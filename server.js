const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const timetablePath = path.join(__dirname, 'public', 'timetable.json');

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = [
  '03:00', '05:30', '07:00', '08:30', '10:00', '11:30', '12:30',
  '13:30', '14:30', '15:30', '16:30', '17:30', '18:15', '19:00', '20:00', '21:00'
];

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

// API: Export timetable as .docx (1-year timetable, 3:00 AM–10:00 PM, table format)
app.get('/api/timetable.docx', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(timetablePath, 'utf8'));
    const schedule = data.schedule || (data.weeks && data.weeks[0] && data.weeks[0].days) || {};
    const docx = require('docx');
    const { Document, Packer, Paragraph, Table, TableRow, TableCell } = docx;

    const days = Object.keys(schedule).sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    if (days.length === 0) return res.status(500).send('No schedule data.');

    const getActivity = (day, time) => {
      const d = schedule[day] && schedule[day][time];
      return (d && d.activity) ? d.activity : 'Free Time';
    };

    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Time' })] }),
          ...days.map(d => new TableCell({ children: [new Paragraph({ text: d })] }))
        ]
      }),
      ...TIME_BLOCKS.map(time =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: time })] }),
            ...days.map(day => new TableCell({ children: [new Paragraph({ text: getActivity(day, time) })] }))
          ]
        })
      )
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "Henry's 1-Year Detailed Timetable" }),
          new Paragraph({ text: `Daily schedule: 3:00 AM – 10:00 PM | Year ${data.year || new Date().getFullYear()}` }),
          new Table({ rows: tableRows })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="henry-1year-timetable.docx"');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate .docx');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
