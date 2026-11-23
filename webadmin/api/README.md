# Web admin content API

Node.js API for the webadmin app. It uses the existing MariaDB schema and saves
pages, sections, menus, categories, products, and company settings in their
company-scoped tables inside one database transaction.

## Setup

1. Create the `web_edobizclients` database and import `../database/schema.sql`.
2. Copy `.env.example` to `.env`. Configure the MariaDB root password and set
   `JWT_SECRET` to a random secret of at least 32 characters.
3. Install dependencies with `npm install`.
4. Seed the Arbuda Bangles company, normalized starter content, and an owner account:

   ```sh
   npm run bootstrap:arbuda
   ```

   The command prints a randomly generated temporary password once. Save it.
   Set `INITIAL_ADMIN_EMAIL` in `.env` first if you want a different email.

   For other companies, create the company row first, then create its owner account:

   ```sh
   npm run create-user -- A1B1 admin@example.com 'your-password' 'Admin Name'
   ```

5. Start the API with `npm run dev`.
6. Set `VITE_ADMIN_API_URL=http://127.0.0.1:4000/admin/v1` in
   `webadmin/.env.local`, then restart Vite.

The API listens on `127.0.0.1:4000` by default. Set `HOST=0.0.0.0` only when it
needs to accept connections from other machines, and add the webadmin origin to
`CORS_ORIGINS`.

The login token contains the company IDs attached to that user's account. All
content reads and writes check both the authenticated memberships and the
requested company. Passwords are stored as bcrypt hashes.
