# Arbuda Studio · Web Admin

Standalone React + Vite administration workspace for managing website content per company. The complete example content payload is in `src/data/site-content.json`; `scripts/create-seed.mjs` regenerates its products and categories from the storefront catalogue and fills in all editable site content.

All view and route selection lives in `src/App.jsx`, as requested. The app includes:

- A responsive sign-in screen and workspace shell.
- A tenant selector keyed by `company_id`.
- Page and section editing with editable fields, visibility, add, remove and reorder controls.
- Product and category editing, including add and remove.
- Header, navigation, footer, company, brand and theme settings.
- A media reference view, JSON import/export, save feedback, and API/local demo adapters.

## Run

```sh
npm install
npm run dev
```

The Vite app uses port `5174`. In demo mode, any non-empty email and password will open the UI. Data is saved to this browser's `localStorage`, isolated by company ID. Demo mode is for layout and content review; it is not secure authentication.

For the actual API integration, copy `.env.example` to `.env.local` and configure `VITE_ADMIN_API_URL` and `VITE_SITE_ORIGIN`. See `API-CONTRACT.md` for the request contract and tenant isolation expectations. The SQL model is in `database/schema.sql`.

The Node.js backend is in `api/`. Follow [api/README.md](api/README.md) to configure its MariaDB connection and create an admin account.

## Content workflow

1. Select a company in the sidebar. The API receives that `company_id` on each scoped request.
2. Edit a page section, catalogue record, or global site setting.
3. Save changes. Without an API URL, changes are stored locally in this browser.
4. Import or export the same content document as JSON when needed.

The content API accepts and returns the full document shape in `src/data/site-content.json`. A server can persist that document in the normalized tables from `database/schema.sql` and assemble it back into the same shape for the storefront.
