# AZ Digital PH sales page

A single long-form sales page for AZ Digital PH, plus an interactive demo of eight client dashboards and a Meta Ads audit report. It is plain HTML, CSS and JavaScript. There is no build step, no analytics and no cookies.

All demo data is **sample data** for two fictional brands (Summit Growth Academy and Harbor & Pine Co.). No real client names, staff names or figures are used anywhere.

## What is in the folder

| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `script.js` | The sales page |
| `demo/` | The demo hub (opens at `/demo/`) |
| `demo/data/` | One data file per dashboard, generated from fixed seeds |
| `assets/` | Icons, social image and the photo |
| `copy.md` | The approved page copy, kept as a reference |
| `404.html` | The page shown for a broken link (GitHub Pages uses it automatically) |
| `serve.js` | A small preview server (see below) |
| `CNAME` | Tells GitHub Pages to serve the site at `azdigitalph.com` |
| `reference/` | Your private screenshots. This folder is **git-ignored** and is never published |

## 1. Preview the site on your computer

You need Node.js installed. From the site folder, run:

```bash
node serve.js
```

Then open <http://localhost:5173>. The demo is at <http://localhost:5173/demo/>. Press `Ctrl+C` to stop.

Any static file server also works, for example the Live Server extension in VS Code. Opening `index.html` directly from the folder will not load the demo correctly, so use a server.

## 2. Set the booking link (`BOOKING_URL`)

Open `script.js`. At the very top you will see:

```js
const CONFIG = {
  BOOKING_URL: '#book',
};
```

Replace `'#book'` with your booking link, for example `'https://calendly.com/your-link'`. Every **Book a Call** button on the page uses this one value. While it is still `'#book'`, the buttons scroll to the closing section, so the page never shows a broken link. Real links open in a new tab.

## 3. Swap the photo

The About photo is made of four files in `assets/img/`:

| File | Size |
|---|---|
| `jayvee.jpg` | 680 × 850 px |
| `jayvee@2x.jpg` | 1360 × 1700 px |
| `jayvee.webp` | 680 × 850 px |
| `jayvee@2x.webp` | 1360 × 1700 px |

To use a new photo, export it at those sizes (a 4:5 portrait) and save over the four files with the same names. Keep each under about 200 KB. Update the `alt` text on the `<img>` in the About section of `index.html` so it describes the new photo.

## 4. Edit the copy

The page text lives directly in `index.html`. Open it and find the section by its comment, such as `<!-- 6. WHAT YOU GET -->`, then edit the words between the tags. `copy.md` is the reference version of the text. If you change the page wording, update `copy.md` too so the two stay in step.

Headline and description tags for search results and link previews are at the top of `index.html`, in the `<head>`.

If you change the headline, the social preview image (`assets/img/og.png`) still shows the old one. Ask for a refreshed image, or edit it and save it as a 1200 × 630 PNG with the same name.

## 5. Add a testimonial later

There are no testimonials yet, so there is no testimonial section on the page. A ready-made one is in `index.html`, commented out, just below the About section (search for `TESTIMONIAL COMPONENT`).

1. Replace the placeholder quote, name and role with a real, approved testimonial.
2. Delete the `<!--` line above the section and the `-->` line below it.
3. Add more `<figure class="card">` blocks for more testimonials.

Only use real testimonials that the client has agreed to.

## 6. Add a new demo dashboard

1. **Data.** Create `demo/data/yourname.js`. Follow the pattern of the existing files: read from `window.Summit` (or build your own seeded data with `DemoCore.rng`) and expose a `query(from, to, gran)` function.
2. **View.** In one of the `demo/views-*.js` files, add `V.yourname = function (ctx) { ... }`. Return `{ html: '...', mount: function () { ...draw charts... } }`. The helpers in `demo/ui.js` (`UI.kpis`, `UI.card`, `UI.table`, `UI.mount`) do most of the work.
3. **Register.** In `demo/index.html`, add `<script defer src="data/yourname.js"></script>` before `ui.js`. In `demo/hub.js`, add an entry to the `DASH` list: `{ id: 'yourname', nav: 'Menu name', brand: 'Brand line', ctl: true }`. Set `ctl: false` if the dashboard has its own controls.

Rules for demo data:
- Use fictional names only.
- Keep the numbers consistent (leads are not more than clicks, cash is not more than revenue, parts add up to totals).
- Show "No data" when a value is missing. Never show a quiet `$0`.

## Before you publish

- Set `BOOKING_URL` (section 2).
- Keep `reference/` out of the repository. It is already listed in `.gitignore`.
- Deployment to `azdigitalph.com` happens last. Do not point the domain until you have approved the final site, and make sure the old site is archived first.
