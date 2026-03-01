# Henry's Dynamic Timetable Website

A modern, responsive timetable website using only a JSON file as the data source. No database required.

## Features

- Dynamic table-based timetable (daily, weekly, monthly views)
- Responsive design (mobile, tablet, desktop)
- Category highlights (Spiritual, Academic, Project, Family, Internship, Skill Development, Free Time)
- Edit capability (optional, via backend API)
- Dark/light mode
- Export buttons (PDF/Word - UI only, implementation optional)

## Project Structure

```
public/
  index.html
  styles.css
  app.js
  timetable.json
src/
server.js
README.md
```

## How to Run Locally

1. Install [Node.js](https://nodejs.org/)
2. Install dependencies:
   ```bash
   npm install express
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open your browser at [http://localhost:3000](http://localhost:3000)

## How to Deploy

- **Static only (no edit feature):**
  - Upload the `public/` folder to Netlify or Vercel.
- **With backend (edit feature):**
  - Deploy `server.js` and `public/` to Vercel, Render, or Heroku.

## Customizing Your Timetable

- Edit `public/timetable.json` to update your schedule.
- For advanced editing, use the UI (if enabled) or POST to `/api/timetable`.

## Data Format Example

See `public/timetable.json` for the structure. Each activity has a time, label, and category.

## License

MIT
