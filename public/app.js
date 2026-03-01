// Time blocks matching timetable.json (03:00 to 21:00 with specific slots)
const TIME_BLOCKS = [
  '03:00', '05:30', '07:00', '08:30', '10:00', '11:30', '12:30',
  '13:30', '14:30', '15:30', '16:30', '17:30', '18:15', '19:00', '20:00', '21:00'
];

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const categories = {
  'Spiritual': 'spiritual',
  'Academic': 'academic',
  'Project': 'project',
  'Family': 'family',
  'Internship': 'internship',
  'Skill Development': 'skill',
  'Free Time': 'free'
};

let fullTimetableData = null;  // full JSON (year, meta, schedule)
let timetableData = {};        // schedule only: { Monday: { "08:30": {...}, ... }, ... }
let currentView = 'weekly';
let currentDay = 'Monday';

const timetableContainer = document.getElementById('timetable-container');
const daySelect = document.getElementById('day-select');
const dailyBtn = document.getElementById('dailyViewBtn');
const weeklyBtn = document.getElementById('weeklyViewBtn');
const monthlyBtn = document.getElementById('monthlyViewBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

function fetchTimetable() {
  const apiUrl = '/api/timetable';
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      fullTimetableData = data;
      timetableData = data.schedule || data.weeks?.[0]?.days || {};
      if (!timetableData || !Object.keys(timetableData).length) {
        timetableContainer.innerHTML = '<p class="error">No schedule data found in JSON.</p>';
        return;
      }
      populateDaySelect();
      renderTimetable();
    })
    .catch(() => {
      fetch('timetable.json')
        .then(res => res.json())
        .then(data => {
          fullTimetableData = data;
          timetableData = data.schedule || data.weeks?.[0]?.days || {};
          if (!timetableData || !Object.keys(timetableData).length) {
            timetableContainer.innerHTML = '<p class="error">No schedule data found in JSON.</p>';
            return;
          }
          populateDaySelect();
          renderTimetable();
        })
        .catch(err => {
          timetableContainer.innerHTML = '<p class="error">Failed to load timetable. Check that timetable.json exists or run the server (npm start).</p>';
          console.error(err);
        });
    });
}

function getTimeBlocks() {
  return TIME_BLOCKS;
}

function getTodayDayName() {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[new Date().getDay()];
}

function getCurrentTimeBlock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMins = h * 60 + m;
  let best = null;
  for (const t of TIME_BLOCKS) {
    const [th, tm] = t.split(':').map(Number);
    const slotMins = th * 60 + tm;
    if (slotMins <= totalMins) best = t;
    else break;
  }
  return best;
}

function populateDaySelect() {
  daySelect.innerHTML = '';
  const days = Object.keys(timetableData).sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  days.forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });
  if (days.length && !days.includes(currentDay)) currentDay = days[0];
  daySelect.value = currentDay;
}

daySelect.addEventListener('change', e => {
  currentDay = e.target.value;
  renderTimetable();
});

dailyBtn.addEventListener('click', () => {
  currentView = 'daily';
  setActiveView();
  renderTimetable();
});
weeklyBtn.addEventListener('click', () => {
  currentView = 'weekly';
  setActiveView();
  renderTimetable();
});
monthlyBtn.addEventListener('click', () => {
  currentView = 'monthly';
  setActiveView();
  renderTimetable();
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

function setActiveView() {
  dailyBtn.classList.remove('active');
  weeklyBtn.classList.remove('active');
  monthlyBtn.classList.remove('active');
  if (currentView === 'daily') dailyBtn.classList.add('active');
  if (currentView === 'weekly') weeklyBtn.classList.add('active');
  if (currentView === 'monthly') monthlyBtn.classList.add('active');
}

function renderTimetable() {
  if (!timetableData || !Object.keys(timetableData).length) return;
  if (currentView === 'daily') {
    timetableContainer.innerHTML = renderDailyTable(currentDay);
  } else if (currentView === 'weekly') {
    timetableContainer.innerHTML = renderWeeklyTable();
  } else {
    timetableContainer.innerHTML = renderMonthlyTable();
  }
  attachEditCellHandlers();
}

function getEntry(day, time) {
  const dayData = timetableData[day];
  if (!dayData) return null;
  const entry = dayData[time];
  return entry ? { activity: entry.activity, category: entry.category } : null;
}

function isCurrentCell(day, time) {
  const today = getTodayDayName();
  const current = getCurrentTimeBlock();
  return day === today && time === current;
}

function renderDailyTable(day) {
  const times = getTimeBlocks();
  let html = `<table class="timetable"><thead><tr><th>Time</th><th>${day}</th></tr></thead><tbody>`;
  times.forEach(time => {
    const entry = getEntry(day, time);
    const activity = entry ? entry.activity : 'Free Time';
    const category = entry ? (categories[entry.category] || 'free') : 'free';
    const currentClass = isCurrentCell(day, time) ? ' current-time' : '';
    html += `<tr><td>${time}</td><td class="activity ${category}${currentClass}" data-day="${day}" data-time="${time}">${activity}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function renderWeeklyTable() {
  const days = Object.keys(timetableData).sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  const times = getTimeBlocks();
  let html = `<table class="timetable"><thead><tr><th>Time</th>`;
  days.forEach(day => html += `<th>${day}</th>`);
  html += '</tr></thead><tbody>';
  times.forEach(time => {
    html += '<tr><td>' + time + '</td>';
    days.forEach(day => {
      const entry = getEntry(day, time);
      const activity = entry ? entry.activity : 'Free Time';
      const category = entry ? (categories[entry.category] || 'free') : 'free';
      const currentClass = isCurrentCell(day, time) ? ' current-time' : '';
      html += `<td class="activity ${category}${currentClass}" data-day="${day}" data-time="${time}">${activity}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function renderMonthlyTable() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startDay = first.getDay();
  const monthName = first.toLocaleString('default', { month: 'long' });

  let html = `<div class="month-view"><h3>${monthName} ${year}</h3>`;
  html += '<table class="month-calendar"><thead><tr>';
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr></thead><tbody><tr>';

  let cell = 0;
  for (let i = 0; i < startDay; i++) {
    html += '<td class="other-month"></td>';
    cell++;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const isToday = now.getDate() === d && now.getMonth() === month && now.getFullYear() === year;
    const todayClass = isToday ? ' today' : '';
    html += `<td class="day-cell${todayClass}"><span class="day-num">${d}</span><span class="day-name">${dayName}</span><button type="button" class="view-day-btn" data-day="${dayName}">View day</button></td>`;
    cell++;
    if (cell % 7 === 0) html += '</tr><tr>';
  }
  while (cell % 7 !== 0) {
    html += '<td class="other-month"></td>';
    cell++;
  }
  html += '</tr></tbody></table></div>';
  html += `<p class="month-note">Weekly template applies to each day. Use "View day" to see the daily schedule.</p>`;
  return html;
}

function attachEditCellHandlers() {
  timetableContainer.querySelectorAll('td.activity[data-day][data-time]').forEach(td => {
    td.addEventListener('click', () => {
      if (!window.showEditSection) return;
      const day = td.getAttribute('data-day');
      const time = td.getAttribute('data-time');
      const entry = getEntry(day, time);
      document.getElementById('edit-day').value = day;
      document.getElementById('edit-time').value = time;
      document.getElementById('edit-activity').value = entry ? entry.activity : '';
      document.getElementById('edit-category').value = entry ? entry.category : 'Free Time';
      window.showEditSection();
    });
  });
  document.querySelectorAll('.view-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = 'daily';
      currentDay = btn.getAttribute('data-day');
      daySelect.value = currentDay;
      setActiveView();
      renderTimetable();
    });
  });
}

// Edit section
const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit');
const editTimetableBtn = document.getElementById('edit-timetable-btn');

window.showEditSection = function() {
  editSection.style.display = 'block';
  const editDaySelect = document.getElementById('edit-day');
  editDaySelect.innerHTML = '';
  DAYS_ORDER.filter(d => timetableData[d]).forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    opt.textContent = day;
    editDaySelect.appendChild(opt);
  });
};

function hideEditSection() {
  editSection.style.display = 'none';
}

if (cancelEditBtn) cancelEditBtn.addEventListener('click', hideEditSection);

if (editForm) {
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const day = document.getElementById('edit-day').value;
    const timeInput = document.getElementById('edit-time').value.trim();
    const [hh, mm] = timeInput.split(':').map(s => s.padStart(2, '0'));
    const time = (hh && mm) ? `${hh}:${mm}` : timeInput;
    const activity = document.getElementById('edit-activity').value.trim();
    const category = document.getElementById('edit-category').value;
    if (!day || !time || !activity) return;
    if (!fullTimetableData) return;
    if (!fullTimetableData.schedule) fullTimetableData.schedule = {};
    if (!fullTimetableData.schedule[day]) fullTimetableData.schedule[day] = {};
    fullTimetableData.schedule[day][time] = { activity, category };
    timetableData = fullTimetableData.schedule;

    const apiUrl = '/api/timetable';
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullTimetableData)
      })
        .then(res => res.json())
        .then(() => {
          hideEditSection();
          renderTimetable();
        })
        .catch(() => {
          alert('Could not save to file. Run the server (npm start) to persist. Changes applied in memory.');
          hideEditSection();
          renderTimetable();
        });
  });
}

if (editTimetableBtn) editTimetableBtn.addEventListener('click', () => window.showEditSection && window.showEditSection());

// Export
const exportPdfBtn = document.getElementById('export-pdf');
const exportWordBtn = document.getElementById('export-word');

if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', () => {
    window.print();
  });
}

if (exportWordBtn) {
  exportWordBtn.addEventListener('click', () => {
    const title = "Henry's Timetable";
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>' + title + '</title></head><body>';
    html += '<h1>' + title + '</h1>';
    html += '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    const days = Object.keys(timetableData).sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    const times = getTimeBlocks();
    html += '<tr><th>Time</th>' + days.map(d => '<th>' + d + '</th>').join('') + '</tr>';
    times.forEach(time => {
      html += '<tr><td>' + time + '</td>';
      days.forEach(day => {
        const entry = getEntry(day, time);
        html += '<td>' + (entry ? entry.activity : 'Free Time') + '</td>';
      });
      html += '</tr>';
    });
    html += '</table></body></html>';
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'henry-timetable.doc';
    a.click();
    URL.revokeObjectURL(url);
  });
}

const exportDocxBtn = document.getElementById('export-docx');
if (exportDocxBtn) {
  exportDocxBtn.addEventListener('click', () => {
    fetch('/api/timetable.docx')
      .then(res => {
        if (!res.ok) throw new Error('Server not available');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'henry-1year-timetable.docx';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Export .docx requires the server. Run: npm start'));
  });
}

// Initial load
fetchTimetable();
