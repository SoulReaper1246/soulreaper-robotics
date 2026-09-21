# To-do app

A dependency-free, local-first to-do app that runs directly from `index.html`.

## File guide

- `index.html` ? page structure and accessible controls. Edit this when adding or rearranging UI elements.
- `styles.css` ? all visual design, responsive layout, color themes, and animations.
- `app.js` ? application wiring and event handlers: adding, editing, filtering, completing, deleting, list switching, persistence, and language updates.
- `translations.js` ? interface translations and starter task text. Add a language here, then add its option in `index.html`.
- `file-review.js` ? local document extraction and improvement analysis for text, CSV, JSON, DOCX, XLSX, and PPTX files.

There are no packages or build steps. Open `index.html` in a browser to run it. Data stays in browser `localStorage`; uploaded files are read locally and are not sent to a server.
