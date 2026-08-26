# Lekit Yadav — Portfolio

A single-page brutalist portfolio built with [Astro](https://astro.build) + React.

B.Tech CSE (AI & ML) student focused on backend development and software engineering.

## Stack

- **Astro** (static output) + **React** (islands for interactive components)
- Space Mono typography, brutalist styling
- No runtime dependencies beyond React

## Commands

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Start dev server at `http://localhost:4321` |
| `npm run build`   | Build production site to `./dist/`        |
| `npm run preview` | Preview the production build locally      |

## Structure

```text
/
├── public/                 # static assets (favicon, identity card, robots, sitemap)
└── src/
    ├── components/         # Astro/React components
    │   ├── DraggableProjects.tsx   # draggable project panels (React island)
    │   ├── LetterRing.astro        # 3D looping text ring
    │   ├── Nav.astro               # fixed nav (projects / about me / contact)
    │   └── Footer.astro
    ├── layouts/
    │   └── BaseLayout.astro        # HTML shell + meta/SEO tags
    ├── pages/
    │   ├── index.astro             # home + 3 overlays (projects, about me, contact)
    │   └── projects/               # project detail pages
    └── styles/
        ├── global.css              # tokens, reset, nav, footer, overlays
        └── letter-ring.css         # ring animation
```

## The site

A single-page experience: **projects**, **about me**, and **contact** are full-screen
overlays toggled from the nav (opening one closes the others). Projects are draggable
panels — grayscale by default, full color on hover.

## Deploy

The build is fully static (`dist/`), deployable anywhere:

```sh
npm run build
# deploy dist/ to Vercel, Netlify, GitHub Pages, etc.
```

Update the domain in `public/robots.txt` and `public/sitemap.xml` (currently
`https://lekityadav.me`) to match your production host.
