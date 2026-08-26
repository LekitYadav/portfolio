# Changelog

## [0.2.0] — 2026-08-26 — Cleanup & Optimization

### Removed
- Dead components: `BrutalistBuilding`, `DraggableContactCard`, `ProjectCard`, `HighlightText`
- Dead CSS in `global.css`: `.highlight`, `.row`/`.col-*` grid, `.projects-grid`,
  `.project-card*`, `.project-gallery`, `.info-section` duplicates, `.skills-table`,
  `.contact-list`, `.placeholder-img`
- Dead scoped CSS in `index.astro`: `.info-section h2`, `.info-list`, `.experience-*`,
  `.achievements-*`
- Dead `.bg-rings` rule in `letter-ring.css`

### Added
- Open Graph + Twitter Card meta tags in `BaseLayout.astro`
- `public/robots.txt` + `public/sitemap.xml`
- `CLEANUP.md` (this pass's full report)
- Rewritten `README.md`

### Changed
- No visible functionality, layout, or content changes

## [0.1.0] — 2026-08 — Initial build
- Single-page brutalist portfolio: home hero (3D looping rings), projects
  (draggable grayscale→color panels), about me, contact (black form + identity card)
