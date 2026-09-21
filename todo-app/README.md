# Soulreaper's To Do list

**Version: 0.1.0**

A dependency-free, local-first to-do app that runs directly from `index.html`.

## Features

- Create multiple named lists and add, edit, complete, filter, delete, and share tasks.
- Import text, CSV, JSON, DOCX, XLSX, and PPTX files for local improvement analysis.
- Turn detected improvement areas into concrete fix tasks.
- Use multiple interface languages, including Arabic RTL layout.
- Keep separate local profiles protected by a PIN.
- Generate read-only snapshot links for sharing without edit access.

## File guide

- `index.html` — page structure and accessible controls.
- `styles.css` — visual design, responsive layout, themes, and animations.
- `app.js` — application wiring, task/list state, profiles, sharing, and persistence.
- `translations.js` — interface translations and starter task text.
- `file-review.js` — local document extraction and improvement analysis.

There are no packages or build steps. Open `index.html` in a browser to run it. Data stays in browser `localStorage`; imported files are read locally and are not sent to a server.
