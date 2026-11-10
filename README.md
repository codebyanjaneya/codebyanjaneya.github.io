# Anjaneya Tiwari — Software Engineer

Backend, AI and full-stack engineer. I build software that works beyond the demo: an orchestration layer over 500+ APIs, a geospatial matching engine for a deployed marketplace, and voice-AI infrastructure handling 1,000+ concurrent requests.

**Live portfolio:** <https://codebyanjaneya.github.io>

## What's on the site

- **Home**: positioning, availability and primary links.
- **Selected work**: six case studies (XENOM Intelligence, Rooftop Rush, Email Triage Assistant, LoadPulse, Gleska marketplace, AgentForge), each covering the problem, what was built, the engineering decisions and the outcome.
- **Projects directory** (`projects.html`): additional builds grouped by kind.
- **Experience**: Rootstock Technology, Gleska, Telogo Communications and Motivus Innovation.
- **Expertise**: skills grouped by engineering area rather than as a badge list.
- **About and contact**.

## Tech stack

HTML5, CSS3 and Google Fonts (Instrument Serif, Inter, JetBrains Mono), hosted on GitHub Pages. No framework, no build step, no JavaScript.

## Repository layout

| File | Purpose |
|------|---------|
| `index.html` | Home page and case studies |
| `projects.html` | Projects directory |
| `style.css` | Shared styles |

## Local development

```bash
git clone https://github.com/codebyanjaneya/codebyanjaneya.github.io.git
cd codebyanjaneya.github.io
python -m http.server 8000
```

Open <http://localhost:8000>.

## Deployment

GitHub Pages serves the root of the `main` branch. Pushing to `main` publishes the site within a few minutes; there is nothing to build.
