# The Archive — plain HTML journal

A small personal editorial journal, built with **HTML, CSS and vanilla JavaScript only**. No Astro, no npm, no database, no user accounts and no public submissions.

## Open

Extract the folder, then double-click `index.html`. Everything works as ordinary local files. For publishing, upload the complete folder to any static web host.

## Publish your own writing

1. Write and edit your piece first in a text editor or document.
2. Open `js/content.js` and copy an existing publication object (from `{` to `},`).
3. Set a unique `slug`, title, date, type (`article`, `analysis`, `opinion`, `video`, `art`, or `to-read`), summary and body.
4. Paste the text into the `body` HTML template string. Use `<p>` for paragraphs and `<h2>` for subheadings.
5. Optionally add `image: 'images/photo.jpg'` and place that file in `images/`.
6. Set `draft: true` to keep a work-in-progress hidden until you are ready to publish.
7. Save and refresh `index.html`; it will appear automatically in the appropriate section. Upload your updated files to your host when ready.

**Only you publish.** Visitors can read your content but cannot submit, edit or upload anything. Do not add secrets to public JavaScript files.

## Layout

- `index.html`: editorial front page, featured story and compact article vignettes
- `section.html`: category/archive pages
- `post.html`: full publication reader
- `about.html`: personal/about page
- `css/style.css`: all design settings
- `js/content.js`: your content; start here when publishing
- `js/site.js`: card and index rendering
- `js/post.js`: reader rendering
- `js/common.js`: navigation

Illustrative demo entries are placeholders; replace them with your actual writing.
