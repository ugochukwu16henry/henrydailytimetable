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
henrydailytimetable/
  public/
    index.html
    styles.css
    app.js
    timetable.json
  server.js
  package.json
  README.md
```

## How to Run Locally

1. Install [Node.js](https://nodejs.org/).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   Or: `node server.js`. The server runs on port 3000 by default (use `PORT=4000 npm start` to override).
4. Open your browser at [http://localhost:3000](http://localhost:3000).

Without the server, you can open `public/index.html` or host the `public/` folder statically; the app will load `timetable.json` directly, but **edit and save** will not persist to the file.

## How to Deploy

- **Static only (view + export, no persistent edit):**
  - Upload the `public/` folder to Netlify or Vercel. The site will load the timetable from `timetable.json`.
- **With backend (edit and save to JSON):**
  - Deploy the full project (including `server.js`) to Render, Railway, Heroku, or a VPS. Set the `PORT` environment variable if required.

## Customizing Your Timetable

- Edit `public/timetable.json` to update your schedule.
- For advanced editing, use the UI (if enabled) or POST to `/api/timetable`.

## Data Format Example

See `public/timetable.json` for the structure. Each activity has a time, label, and category.

## License

MIT
