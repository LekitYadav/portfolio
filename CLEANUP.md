# Cleanup & Optimization Pass

Refactor of the portfolio codebase for cleanliness, performance, and maintainability —
with no change to visible functionality, layout, or content.

## 1. Dead code removed

| Item | Location | Why |
| :--- | :--- | :--- |
| `BrutalistBuilding.astro` (13.4 KB) | `src/components/` | Reverted experiment — no longer imported anywhere |
| `DraggableContactCard.tsx` (3.7 KB) | `src/components/` | Reverted experiment — no longer imported |
| `ProjectCard.astro` | `src/components/` | Unused component (projects render via `DraggableProjects.tsx`) |
| `HighlightText.astro` | `src/components/` | Imported but never used in the template |
| `.highlight` rule | `global.css` | Only `HighlightText` used it |
| `.row` / `.col-*` grid system | `global.css` | Leftover Bootstrap-style clone, no usage |
| `.projects-grid` | `global.css` | No usage |
| `.project-card` + all sub-rules | `global.css` | Only dead `ProjectCard.astro` used them |
| `.project-gallery` + `img` | `global.css` | No usage |
| `.info-section h2` / `.info-section p, li` / `.skills-table` | `global.css` | Duplicated by `index.astro` scoped styles; skills table content removed |
| `.info-list`, `.experience-*`, `.achievements-*` | `index.astro` scoped | Education/Skills/Experience/Achievements sections removed earlier |
| `.contact-list` + `a` | `global.css` | No usage |
| `.placeholder-img` | `global.css` | Only dead `ProjectCard.astro` used it |
| `.bg-rings` rule | `letter-ring.css` | BaseLayout background-ring wrapper removed earlier |

## 2. Duplication consolidated

- Removed duplicated `.info-section` / `.skills-table` rules from `global.css`
  (now solely in `index.astro` scoped styles).

## 3. SEO & metadata

- Added Open Graph + Twitter Card meta tags to `BaseLayout.astro`.
- Added `public/robots.txt` and `public/sitemap.xml`.

## 4. Docs

- Rewrote `README.md` (was the Astro starter boilerplate) with accurate setup,
  structure, and deploy instructions.
- Created this `CLEANUP.md` and `CHANGELOG.md`.

## Remaining issues (not fixed, with reason)

- **`lekit-card.png` (724 KB)** — large PNG. Not compressed because it's a
  high-fidelity identity card; converting to WebP/AVIF may reduce sharpness.
  Recommend converting if size matters for deploy.
- **`index.astro` is a ~600-line monolith** — home + 3 overlays + inline script +
  scoped styles. Could be split into per-overlay components, but deferred to avoid
  churn/risk since it's functional and self-contained.
- **`.project-detail` CSS duplicated** between `global.css` and the two project
  detail pages' inline `<style is:global>` blocks. Left as-is because the detail
  pages rely on a mix of both; consolidating risks subtle layout regressions.
- **Hardcoded email** (`lekityadav@gmail.com`) in `Nav.astro`, `Footer.astro`, and
  the contact form. Intentional for a public portfolio — not moved to env vars.
- **No git repository** — the project has no `.git`. Commit history/`git blame`
  was therefore not preserved (nothing to commit to). Recommend `git init` before
  further work.
- **External Unsplash images** load without explicit lazy-loading (they're CSS
  `background-image` divs inside the React island, not `<img>` tags). Acceptable
  for a small static site; add IntersectionObserver-based lazy loading if needed.
