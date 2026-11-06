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

- `src/lib/data.ts`: profile, focus areas and skills, plus the fallback/seed content
- `src/db/schema.ts`: Postgres tables (Drizzle ORM)
- `src/lib/repo.ts`: data access layer used by the page, the public API and the admin API
- `src/app/admin`, `src/components/admin`: the admin page
- `src/app/api/*`: read-only REST API serving the same content as JSON
- `src/components/*`: page sections and animation components
- `public/`: screenshots, certificates and photos

## Admin (single user)

`/admin` lets me add, edit and remove projects, experience and certificates. Content lives in Postgres (Neon); uploads go to Vercel Blob. Without `DATABASE_URL` the site falls back to `src/lib/data.ts` and the admin stays off.

Security:
- one password, stored only as a scrypt hash (`ADMIN_PASSWORD_HASH`), compared in constant time
- session in a signed (HMAC-SHA256), expiring, `HttpOnly`, `SameSite=Strict`, `Secure` cookie; the signing key is `SESSION_SECRET` or, if unset, derived from the password hash
- failed logins counted in the database: 5 failures per IP in 15 minutes locks login
- write endpoints also reject cross-site `Origin` headers
- all input validated with Zod; uploads checked by type, size (4 MB) and magic bytes
- `/admin` is `noindex` and `no-store`

Setup:

```bash
cp .env.example .env.local   # fill DATABASE_URL (Vercel sets it in production)
npm run dev                  # then open /admin/setup to make ADMIN_PASSWORD_HASH (local only)
npm run db:push              # create the tables
npm run db:seed              # copy the current content into the database
```

Writes from the admin call `revalidatePath("/")`, so the static home page updates without a redeploy.

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

Admin endpoints (session required): `GET/POST /api/admin/{projects,roles,certifications}`, `PUT/DELETE /api/admin/{projects,roles,certifications}/{id}`, `POST /api/admin/upload`, `POST /api/auth/login`, `POST /api/auth/logout`.
