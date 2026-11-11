# Anjaneya Tiwari - Software Engineer

Backend, AI and full-stack engineer. I build software that works beyond the demo: an orchestration layer over 500+ APIs, a geospatial matching backend for a deployed marketplace, and voice-AI infrastructure handling 1,000+ concurrent requests.

Live portfolio: <https://codebyanjaneya.github.io>

## What's on the site

- **Home** (`index.html`): hero, five featured case studies (XENOM Intelligence, Rooftop Rush, Email Triage Assistant, LoadPulse, AgentForge), an index of smaller builds, experience timeline and expertise, about, contact.
- **Projects** (`projects.html`): six smaller builds (DermaCam, AutoApply Bot, LLM Gate, Nudge, H.E.R.C.S, VitalAI), each with its own colour field and a small diagram.

## Design approach

An editorial engineering journal rather than a template. The idea is "the parts demos skip": the hero opens with numbers from real work, and every featured project is told as problem, approach, trade-off and result.

- **Palette:** concrete-green paper, near-black ink, one vermilion signal colour, plus a flat colour field per project.
- **Type:** Archivo (condensed display and body), Newsreader italic for the editorial voice, IBM Plex Mono for labels and data.
- **Signature:** a three-bar trace-waterfall mark that labels sections; experience is drawn as a real month-by-month timeline.
- **Honest diagrams:** each project has an interactive diagram that explains how the system works. They are tagged *Measured* (a result from real runs), *Illustrative* (a simulation of the mechanism) or *Real gameplay*. Nothing shows live or fabricated data.

## Interactions

Plain JavaScript in `app.js` (no libraries). Claim-to-source tracing, an annotated real gameplay screenshot with a flight and landing-safety schematic, a 200 → 15 API-call scrubber, a request-flow and latency simulation, a step-through orchestration diagram, and small diagrams for the smaller builds.

- Respects `prefers-reduced-motion`, and a footer button pauses all animation. Every control still works with motion off.
- Keyboard operable, with visible focus states and labelled controls. Live regions stay quiet while a diagram auto-plays.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Home page and case studies |
| `projects.html` | Smaller builds |
| `style.css` | Design system and all diagram styles |
| `app.js` | Interactive diagrams |
| `assets/` | Real gameplay screenshot for Rooftop Rush (two sizes) |

## Tech

HTML5, CSS3 and vanilla JavaScript. Fonts from Google Fonts (Archivo, Newsreader, IBM Plex Mono) with system fallbacks. No framework, no build step, no dependencies. Hosted on GitHub Pages.

## Local development

```bash
git clone https://github.com/codebyanjaneya/codebyanjaneya.github.io.git
cd codebyanjaneya.github.io
python -m http.server 8000
```

Open <http://localhost:8000>.

## Deployment

GitHub Pages serves the root of the `main` branch. Pushing to `main` publishes the site within a few minutes; there is nothing to build.
