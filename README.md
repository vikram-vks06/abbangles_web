# Arbuda Bangles · Next.js

Responsive App Router storefront converted from the original catalogue. All page selection and route content live in `app/storefront.jsx`; the optional catch all route entry at `app/[[...slug]]/page.jsx` keeps every path on the same SPA shell. Shared layout and metadata live in `app/layout.jsx`.

## Run locally

```sh
npm install
npm install --prefix webadmin
npm run dev
```

Build for production with `npm run build`, then run `npm start`. The build prepares a standalone Node.js server, including the static and public assets. Images are served from `public/assets`. The original CSS is carried into `app/legacy.css`, with responsive storefront rules in `app/globals.css`.

## Database-backed website content

The storefront fetches the complete content document from `NEXT_PUBLIC_CONTENT_API_URL` on every server-rendered page request without caching. This public content API is the source for products and categories, page copy and sections, the navbar, header, footer, slider, team, client reviews, and video. Products and categories are read from their normalized database tables; the remaining content is read from the company's settings and page-section records.

Edit page sections, navigation, header/footer details, and product/category records in the web admin. The public content shape is defined in `webadmin/src/data/site-content.json`, and the database read/write mapping is in `webadmin/api/src/content-store.js`. `GET /api/categories` returns the database-backed category list as `{ "categories": [...] }`. If the content API is unreachable or returns an error, storefront requests fail rather than silently displaying stale seed content.

## Routes

The route switch and page presentation are in `app/storefront.jsx`; editable copy and tenant content live in `webadmin/src/data/site-content.json`. Current routes: `/`, `/about`, `/products`, `/product?id=…`, `/catalogue`, `/gallery`, and `/contact`. Navigation uses Next links for client side transitions. Update business phone numbers and WhatsApp details in that file before launch.

## Web admin

A React + Vite content management app is in `webadmin/` and is served at `/webadmin` on the storefront domain. The root development and production build scripts generate its static bundle before starting/building Next.js. The app can also be run separately with `npm run dev --prefix webadmin` on port 5174. Set `VITE_SITE_ORIGIN=https://abbangles.com` and configure `VITE_ADMIN_API_URL` in `webadmin/.env.local` before the production build. The complete sample content document is `webadmin/src/data/site-content.json`; the multi-company SQL schema is `webadmin/database/schema.sql`, and the API contract is in `webadmin/API-CONTRACT.md`.

The storefront reads its site content, pages, navigation, products, categories, and settings from the public content API backed by MariaDB. Configure `NEXT_PUBLIC_CONTENT_API_URL` in the project-root `.env.local` (for the local setup: `http://127.0.0.1:4000/public/v1/companies/A1B1/content`). The API is in `webadmin/api/`.

The same category list is available from the storefront at `GET /api/categories`, returning `{ "categories": [...] }`.

## Enquiry form delivery

The contact page and enquiry popup submit to the same-origin `/api/contactus` route. The Next.js server forwards enquiries to `CONTACT_API_URL`, avoiding browser cross-origin restrictions. Set this variable in the production Node.js app environment (the default is `https://abedobiz.abbangles.com/api/contactus`). The upstream service must accept URL-encoded `name`, `email`, `phone`, and `message` fields and return JSON with `success: true` when accepted.

## Deploying to Hostinger

This is a server-rendered Next.js app, not a static site. Use Hostinger VPS or a hosting plan that supports Node.js applications; uploading the files to `public_html` alone will not run it. The root production build creates `.next/standalone` and copies in the required `public` and `.next/static` files. Start it with `npm start`; configure the Node.js app to use the port supplied by Hostinger.

Before building for production:

1. Use Node.js 20.19+ or 22.12+.
2. Install root and admin dependencies: `npm ci` and `npm ci --prefix webadmin`.
3. Configure the root environment, including `NEXT_PUBLIC_CONTENT_API_URL` and `CONTACT_API_URL`. `NEXT_PUBLIC_*` values are embedded at build time.
4. Configure `webadmin/.env.local` with the production `VITE_SITE_ORIGIN=https://abbangles.com` and the reachable `VITE_ADMIN_API_URL`; these Vite values are also embedded at build time.
5. Run `npm run build`, then start with `npm start`.

The admin app's Node.js API and MariaDB database must also be hosted and reachable for admin sign-in and saved content. Configure `CORS_ORIGINS=https://abbangles.com` on the API if it is hosted on another origin. If your Hostinger plan does not offer a Node.js app or VPS, host this Next.js app on a Node.js platform and point the domain's DNS records there instead. The exact DNS values are provided by the selected hosting platform.
