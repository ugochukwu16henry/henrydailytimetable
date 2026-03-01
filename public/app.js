// Dynamic Timetable Logic
const timetableContainer = document.getElementById('timetable-container');
const daySelect = document.getElementById('day-select');
const dailyBtn = document.getElementById('dailyViewBtn');
const weeklyBtn = document.getElementById('weeklyViewBtn');
const monthlyBtn = document.getElementById('monthlyViewBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

let timetableData = {};
let currentView = 'weekly';
let currentDay = 'Monday';

const categories = {
  'Spiritual': 'spiritual',
  'Academic': 'academic',
  'Project': 'project',
  'Family': 'family',
  'Internship': 'internship',
  'Skill Development': 'skill',
  'Free Time': 'free'
};

function fetchTimetable() {
  fetch('timetable.json')
    .then(res => res.json())
    .then(data => {
      timetableData = data.schedule;
      populateDaySelect();
      renderTimetable();
    });
}

function populateDaySelect() {
  daySelect.innerHTML = '';
  Object.keys(timetableData).forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });
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
  if (currentView === 'daily') {
    timetableContainer.innerHTML = renderDailyTable(currentDay);
  } else if (currentView === 'weekly') {
    timetableContainer.innerHTML = renderWeeklyTable();
  } else {
    timetableContainer.innerHTML = renderMonthlyTable();
  }
}

function renderDailyTable(day) {
  const times = getTimeBlocks();
  let html = `<table class="timetable"><thead><tr><th>Time</th><th>${day}</th></tr></thead><tbody>`;
  times.forEach(time => {
    const entry = timetableData[day][time];
    let activity = entry ? entry.activity : 'Free Time';
    let category = entry ? categories[entry.category] : 'free';
    html += `<tr><td>${time}</td><td class="activity ${category}">${activity}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function renderWeeklyTable() {
  const days = Object.keys(timetableData);
  const times = getTimeBlocks();
  let html = `<table class="timetable"><thead><tr><th>Time</th>`;
  days.forEach(day => html += `<th>${day}</th>`);
  html += '</tr></thead><tbody>';
  times.forEach(time => {
    html += `<tr><td>${time}</td>`;
    days.forEach(day => {
      const entry = timetableData[day][time];
      let activity = entry ? entry.activity : 'Free Time';
      let category = entry ? categories[entry.category] : 'free';
      html += `<td class="activity ${category}">${activity}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function renderMonthlyTable() {
  // For simplicity, show weekly view with a note
  return `<div><p>Monthly view coming soon. For now, see weekly overview below:</p>${renderWeeklyTable()}</div>`;
}

function getTimeBlocks() {
  // 03:00 to 21:00 in 1 hour blocks
  const times = [];
  for (let h = 3; h <= 21; h++) {
    let hour = h < 10 ? `0${h}` : `${h}`;
    times.push(`${hour}:00`);
  }
  return times;
}

// Initial load
fetchTimetable();
