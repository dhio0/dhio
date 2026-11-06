# dhio-portfolio

Personal portfolio of Dhio Padda, a cybersecurity-focused Computer Science student at BINUS University.

Built with Next.js (App Router), TypeScript and Tailwind CSS, with Motion and Lenis for scroll animation. The project screenshots on the site were captured from my own local runs of [webforensics](https://github.com/dhio0/webforensics) and the [Registry CTF challenge](https://github.com/dhio0/ctf-challenge-authoring).

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Structure

- `src/lib/data.ts`: all site content (profile, projects, experience, certificates, skills)
- `src/lib/repo.ts`: data access layer used by both the page and the API
- `src/app/api/*`: read-only REST API serving the same content as JSON
- `src/components/*`: page sections and animation components
- `public/`: screenshots, certificates and photos

## API

| Endpoint | Returns |
|---|---|
| `GET /api` | List of endpoints |
| `GET /api/profile` | Profile and focus areas |
| `GET /api/projects` | All projects, optional `?stack=python` filter |
| `GET /api/projects/{slug}` | One project, 404 if unknown |
| `GET /api/experience` | Organisations and roles |
| `GET /api/certifications` | Certificates |
| `GET /api/skills` | Skills with where each was used |
