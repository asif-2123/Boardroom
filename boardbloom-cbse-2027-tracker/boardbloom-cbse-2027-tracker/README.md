# BoardBloom — CBSE Class XII PCMB Tracker (2027)

A responsive, browser-based study tracker for students preparing for CBSE Class 12 Physics, Chemistry, Mathematics and Biology.

## Features

- Dashboard with overall and subject-wise syllabus completion
- Chapter checklist and progress stages: Not Started, Learning, Practising PYQs, Completed
- Mock-test log with percentages, notes and recent score visualisation
- Revision planner with overdue and completed revisions
- Daily study log with hours, focus rating and a seven-day chart
- Export/import JSON backups
- Responsive layout for desktop, tablet and mobile
- No account, backend, database or paid service required

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local development server, you can use VS Code's Live Server extension, or run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `boardbloom-cbse-tracker`.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish the site. The published URL will appear on the Pages settings screen.

## Data and privacy

- Tracker data is stored in the browser's `localStorage` on the device and browser being used.
- Data does not automatically sync between devices or browsers.
- Use **Export my data** to save a JSON backup and **Import backup** to restore it.
- Clearing browser site data can delete the saved tracker. Export backups periodically.
- Google Fonts are loaded from Google Fonts when internet access is available; the app otherwise uses fallback fonts.

## Syllabus note

The chapter lists are a planning checklist, not a substitute for the official CBSE 2026–27 curriculum. CBSE may make syllabus or assessment updates. Verify the current official syllabus and sample papers at:

- https://cbseacademic.nic.in/curriculum_2027.html
- https://cbseacademic.nic.in/SQP_CLASSXII_2026-27.html

The app does not predict board questions or guarantee marks.

## Technology

HTML, CSS and vanilla JavaScript. No build step or framework required.
