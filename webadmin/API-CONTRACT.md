# Web admin API contract

The React admin is independent of the Next.js storefront. Set `VITE_ADMIN_API_URL` in `webadmin/.env.local` to use your API. When it is empty, the app uses the included JSON seed and browser `localStorage` so the screens can be reviewed without a backend.

Every request after login is scoped to one company. The client sends both the company path and `X-Company-Id`; the server must verify that the authenticated user can access that company. Never trust the header alone for authorization.

## Endpoints

| Method | Endpoint | Expected response |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ "access_token": "…", "user": { "name": "…", "email": "…", "role": "…" } }` |
| `GET` | `/companies` | `[{ "company_id": "A1B1", "company_name": "Arbuda Bangles", "domain": "abbangles.com" }]` |
| `GET` | `/companies/:companyId/content` | The complete content JSON document for that company |
| `PUT` | `/companies/:companyId/content` | Accept the complete content JSON document and return the saved document |

The `PUT` endpoint should validate the payload and update normalized SQL records in one database transaction. The returned `GET` document must use the structure in `src/data/site-content.json`. Include `company_id` on every inserted/updated row and scope reads, updates, and deletes by both the row ID and `company_id`.

For production, issue short-lived access tokens, store passwords as a strong one-way hash, enforce role checks, validate image uploads on the server, and keep the API origin out of source code by using environment configuration.

## Local preview

```sh
cd webadmin
npm install
npm run dev
```

The demo login accepts any non-empty email and password and stores content only in this browser. It is for UI/content review only; it is not authentication. The default website image previews point to `http://localhost:3000`; set `VITE_SITE_ORIGIN` for another storefront host.
