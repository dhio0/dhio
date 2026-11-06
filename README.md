# dhio-portfolio

**Live: [dhio-eight.vercel.app](https://dhio-eight.vercel.app)**

Source of my personal portfolio. I'm Dhio Padda, a Computer Science student at BINUS University focused on cybersecurity: I build security tools, write web exploitation challenges for CTF contests, and practise detection and incident response in a home lab with Wazuh and Splunk.

The project screenshots on the site come from my own runs of [webforensics](https://github.com/dhio0/webforensics) and the [Registry CTF challenge](https://github.com/dhio0/ctf-challenge-authoring), not from their READMEs.

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Motion and Lenis for scroll animation
- **Backend:** Next.js route handlers serving a REST API, Postgres on Neon through Drizzle ORM, Vercel Blob for uploads
- **Hosting:** Vercel; every push to `main` deploys, and database migrations run automatically on build

## Admin

A private `/admin` page lets me add, edit and remove projects, experience and certificates (with image and PDF uploads) without touching code. Changes show up on the site right away.

It is built to be locked down properly:

- one password, stored only as a scrypt hash and compared in constant time
- session in a signed (HMAC-SHA256), expiring, `HttpOnly`, `SameSite=Strict`, `Secure` cookie
- login locks for 15 minutes after 5 failed attempts from the same IP
- write requests from other sites are rejected
- every input is validated; uploads are checked by type, size and file signature (magic bytes)
- the admin area is hidden from search engines and never cached

## API

The same content the site shows is available as JSON:

| Endpoint | Returns |
|---|---|
| [`GET /api`](https://dhio-eight.vercel.app/api) | List of endpoints |
| [`GET /api/profile`](https://dhio-eight.vercel.app/api/profile) | Profile and focus areas |
| [`GET /api/projects`](https://dhio-eight.vercel.app/api/projects) | All projects, optional `?stack=python` filter |
| `GET /api/projects/{slug}` | One project, 404 if unknown |
| [`GET /api/experience`](https://dhio-eight.vercel.app/api/experience) | Organisations and roles |
| [`GET /api/certifications`](https://dhio-eight.vercel.app/api/certifications) | Certificates |
| [`GET /api/skills`](https://dhio-eight.vercel.app/api/skills) | Skills with where each was used |

## Contact

[LinkedIn](https://www.linkedin.com/in/dhioo/) · [GitHub](https://github.com/dhio0)
