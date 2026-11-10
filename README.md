# codebyanjaneya.github.io

Personal portfolio of Anjaneya Tiwari, a backend and AI systems engineer. Live at <https://codebyanjaneya.github.io>.

Plain HTML and CSS: no framework, no build step, no JavaScript, no runtime dependencies. Only external request is Google Fonts (Instrument Serif, Inter, JetBrains Mono), with system fallbacks.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Home: hero, six featured case studies, experience, expertise, about, contact |
| `projects.html` | Directory of additional projects, grouped by kind |
| `style.css` | Shared design system (warm paper background, charcoal text, cobalt accent) |
| `resume.pdf` | Resume linked from the nav, hero and contact section |

Featured case studies: XENOM Intelligence, Rooftop Rush, Email Triage Assistant, LoadPulse, Gleska workforce marketplace, AgentForge. Each pairs verified facts with a small diagram built in HTML/CSS.

## Local development

```bash
git clone https://github.com/codebyanjaneya/codebyanjaneya.github.io.git
cd codebyanjaneya.github.io
python -m http.server 8000
```

Open <http://localhost:8000>. Edit the files and refresh.

## Deployment

Hosted on GitHub Pages from the `main` branch root (Settings → Pages → Deploy from a branch). Pushing to `main` publishes the site; there is nothing to build.

## Content

Experience and project details are taken from the author's resume. Update `index.html` and `projects.html` directly when they change.
