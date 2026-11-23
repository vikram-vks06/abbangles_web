import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { mkdir, readFile, rename as renameFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./db.js";
import { getDocument, saveDocument } from "./content-store.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET;
const defaultContentPath = fileURLToPath(
  new URL("../../src/data/site-content.json", import.meta.url),
);
const publicRoot = fileURLToPath(new URL("../../../public/", import.meta.url));
const publicUploadsPath = path.join(publicRoot, "assets", "uploads");
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);
const maximumUploadBytes = 8 * 1024 * 1024;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters.");
}

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));
app.use(express.json({ limit: "12mb" }));

async function ensureMediaSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS web_media_folders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      company_id VARCHAR(80) NOT NULL,
      folder_name VARCHAR(120) NOT NULL,
      folder_slug VARCHAR(140) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by BIGINT UNSIGNED NULL,
      updated_by BIGINT UNSIGNED NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_media_folders_company_slug (company_id, folder_slug),
      UNIQUE KEY uq_media_folders_id_company (id, company_id),
      CONSTRAINT fk_media_folders_company FOREIGN KEY (company_id)
        REFERENCES web_companies(company_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const [columns] = await pool.execute("SHOW COLUMNS FROM web_media_assets LIKE 'folder_id'");
  if (!columns.length) {
    await pool.execute("ALTER TABLE web_media_assets ADD COLUMN folder_id BIGINT UNSIGNED NULL AFTER company_id");
  }
  const [indexes] = await pool.execute("SHOW INDEX FROM web_media_assets WHERE Key_name = 'idx_media_assets_company_folder'");
  if (!indexes.length) {
    await pool.execute("ALTER TABLE web_media_assets ADD KEY idx_media_assets_company_folder (company_id, folder_id)");
  }
}

function mediaDiskPath(storageKey, companyId) {
  const companySlug = companyId.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const segments = String(storageKey || "").split("/");
  const safeSegments = segments.every((part) => part && part !== "." && part !== ".." && /^[a-zA-Z0-9._-]+$/.test(part));
  if (safeSegments && segments.length === 4 && segments[0] === "assets" && segments[1] === "images" && segments[2] === "products" && /\.(jpe?g|png|webp|gif|avif)$/i.test(segments[3])) {
    return path.join(publicRoot, ...segments);
  }
  if (
    segments.length !== 5 ||
    segments[0] !== "assets" ||
    segments[1] !== "uploads" ||
    segments[2] !== companySlug ||
    !safeSegments
  ) {
    throw Object.assign(new Error("Media file path is invalid."), { status: 400 });
  }
  return path.join(publicUploadsPath, ...segments.slice(2));
}

function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

async function authenticate(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return fail(res, 401, "Authentication required.");
  let claims;
  try {
    claims = jwt.verify(token, jwtSecret);
  } catch {
    return fail(res, 401, "Session is invalid or expired.");
  }

  try {
    const [memberships] = await pool.execute(
      `SELECT u.company_id
       FROM web_admin_users u
       INNER JOIN web_companies c ON c.company_id = u.company_id
       WHERE u.id = ? AND u.status = 'active' AND c.status = 'active'`,
      [claims.sub],
    );
    if (!memberships.length) return fail(res, 401, "Admin account is no longer active.");
    req.user = { ...claims, companyIds: memberships.map((row) => row.company_id) };
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorizeCompany(req, res, next) {
  const companyId = req.params.companyId;
  if (!companyId || !req.user.companyIds.includes(companyId)) {
    return fail(res, 403, "You do not have access to this company.");
  }
  if (req.get("X-Company-Id") && req.get("X-Company-Id") !== companyId) {
    return fail(res, 400, "Company header does not match the requested company.");
  }
  req.companyId = companyId;
  return next();
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/public/v1/companies/:companyId/content", async (req, res, next) => {
  try {
    const document = await getDocument(pool, req.params.companyId);
    res.set("Cache-Control", "no-store");
    return res.json(document);
  } catch (error) {
    if (error.status === 404) return fail(res, 404, error.message);
    return next(error);
  }
});

app.post("/admin/v1/auth/login", async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return fail(res, 400, "Email and password are required.");

    const [rows] = await pool.execute(
      `SELECT u.id, u.company_id, u.email, u.password_hash, u.full_name, u.role,
              c.company_name
       FROM web_admin_users u
       INNER JOIN web_companies c ON c.company_id = u.company_id
       WHERE LOWER(u.email) = ? AND u.status = 'active' AND c.status = 'active'`,
      [email],
    );

    const matches = [];
    for (const row of rows) {
      if (await bcrypt.compare(password, row.password_hash)) matches.push(row);
    }
    if (!matches.length) return fail(res, 401, "Email or password is incorrect.");

    const first = matches[0];
    const companyIds = [...new Set(matches.map((row) => row.company_id))];
    const accessToken = jwt.sign(
      { sub: String(first.id), email: first.email, companyIds },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );
    await pool.execute(
      `UPDATE web_admin_users SET last_login_at = CURRENT_TIMESTAMP
       WHERE id = ? AND company_id = ?`,
      [first.id, first.company_id],
    );

    return res.json({
      access_token: accessToken,
      user: { name: first.full_name, email: first.email, role: first.role },
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/admin/v1/companies", authenticate, async (req, res, next) => {
  try {
    if (!req.user.companyIds.length) return res.json([]);
    const placeholders = req.user.companyIds.map(() => "?").join(",");
    const [companies] = await pool.execute(
      `SELECT company_id, company_name, domain
       FROM web_companies
       WHERE status = 'active' AND company_id IN (${placeholders})
       ORDER BY company_name`,
      req.user.companyIds,
    );
    return res.json(companies);
  } catch (error) {
    return next(error);
  }
});

app.get(
  "/admin/v1/companies/:companyId/media",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    try {
      const [[folders], [assets]] = await Promise.all([
        pool.execute(
          "SELECT id, folder_name AS name, folder_slug AS slug, created_at FROM web_media_folders WHERE company_id = ? ORDER BY folder_name",
          [req.companyId],
        ),
        pool.execute(
          `SELECT a.id, a.folder_id AS folderId, f.folder_name AS folderName,
                  a.file_name AS fileName, a.public_url AS url, a.mime_type AS mimeType,
                  a.file_size AS fileSize, a.alt_text AS altText, a.created_at AS createdAt
           FROM web_media_assets a
           LEFT JOIN web_media_folders f ON f.id = a.folder_id AND f.company_id = a.company_id
           WHERE a.company_id = ? ORDER BY a.created_at DESC, a.id DESC`,
          [req.companyId],
        ),
      ]);
      return res.json({ folders, assets });
    } catch (error) {
      return next(error);
    }
  },
);

app.post(
  "/admin/v1/companies/:companyId/media/folders",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name || name.length > 120) return fail(res, 400, "Folder name must be 1 to 120 characters.");
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 140);
    if (!slug) return fail(res, 400, "Enter a folder name with letters or numbers.");
    try {
      const [result] = await pool.execute(
        "INSERT INTO web_media_folders (company_id, folder_name, folder_slug) VALUES (?, ?, ?)",
        [req.companyId, name, slug],
      );
      return res.status(201).json({ id: result.insertId, name, slug });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, 409, "A folder with this name already exists.");
      return next(error);
    }
  },
);

app.post(
  "/admin/v1/companies/:companyId/media/upload",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    const { folderId = null, fileName, mimeType, base64 } = req.body || {};
    const extension = allowedImageTypes.get(mimeType);
    if (!extension) return fail(res, 400, "Upload a JPG, PNG, WebP, GIF, or AVIF image.");
    if (typeof base64 !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) {
      return fail(res, 400, "The image upload is invalid.");
    }
    const data = Buffer.from(base64, "base64");
    if (!data.length || data.length > maximumUploadBytes || data.toString("base64") !== base64) {
      return fail(res, 413, "Images must be smaller than 8 MB.");
    }
    const signatures = {
      "image/jpeg": data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
      "image/png": data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "image/webp": data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP",
      "image/gif": data.toString("ascii", 0, 3) === "GIF",
      "image/avif": data.toString("ascii", 4, 12).includes("ftypavif"),
    };
    if (!signatures[mimeType]) return fail(res, 400, "The uploaded file does not match its image type.");

    let folder = null;
    try {
      if (folderId != null) {
        const [rows] = await pool.execute(
          "SELECT id, folder_name AS folderName, folder_slug FROM web_media_folders WHERE id = ? AND company_id = ?",
          [folderId, req.companyId],
        );
        if (!rows.length) return fail(res, 404, "Media folder not found.");
        folder = rows[0];
      }
      const companySlug = req.companyId.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      const folderSlug = folder?.folder_slug || "unfiled";
      const storedName = `${randomUUID()}.${extension}`;
      const relativePath = path.posix.join("assets", "uploads", companySlug, folderSlug, storedName);
      const destination = path.join(publicUploadsPath, companySlug, folderSlug, storedName);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, data, { flag: "wx" });
      try {
        const cleanFileName = typeof fileName === "string" ? path.basename(fileName).slice(0, 255) : storedName;
        const [result] = await pool.execute(
          `INSERT INTO web_media_assets
             (company_id, folder_id, file_name, storage_key, public_url, mime_type, file_size, alt_text, metadata_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.companyId, folder?.id ?? null, cleanFileName || storedName, relativePath, `/${relativePath}`, mimeType, data.length, "", JSON.stringify({ originalFileName: cleanFileName })],
        );
        return res.status(201).json({
          id: result.insertId,
          folderId: folder?.id ?? null,
          folderName: folder?.folderName || "Unfiled",
          fileName: cleanFileName || storedName,
          url: `/${relativePath}`,
          mimeType,
          fileSize: data.length,
        });
      } catch (error) {
        await unlink(destination).catch(() => {});
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  },
);

app.patch(
  "/admin/v1/companies/:companyId/media/assets/:assetId",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    const requestedName = typeof req.body?.fileName === "string" ? req.body.fileName.trim() : "";
    if (!requestedName || requestedName.length > 255 || /[\\/]/.test(requestedName)) {
      return fail(res, 400, "Enter an image name without a folder path.");
    }
    try {
      const [rows] = await pool.execute(
        "SELECT id, folder_id AS folderId, file_name AS fileName, storage_key AS storageKey, mime_type AS mimeType, file_size AS fileSize FROM web_media_assets WHERE id = ? AND company_id = ?",
        [req.params.assetId, req.companyId],
      );
      if (!rows.length) return fail(res, 404, "Uploaded image not found.");
      const asset = rows[0];
      const extension = allowedImageTypes.get(asset.mimeType);
      if (!extension) return fail(res, 400, "This image type cannot be renamed.");
      const displayStem = requestedName.replace(/\.(jpe?g|png|webp|gif|avif)$/i, "").trim();
      const safeStem = displayStem
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
      if (!safeStem) return fail(res, 400, "Enter a name containing letters or numbers.");
      const displayName = `${displayStem}.${extension}`;
      await pool.execute(
        "UPDATE web_media_assets SET file_name = ?, metadata_json = JSON_SET(COALESCE(metadata_json, JSON_OBJECT()), '$.displayName', ?) WHERE id = ? AND company_id = ?",
        [displayName, displayName, asset.id, req.companyId],
      );
      return res.json({
        id: asset.id,
        folderId: asset.folderId,
        fileName: displayName,
        url: `/${asset.storageKey}`,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
      });
    } catch (error) {
      return next(error);
    }
  },
);

app.delete(
  "/admin/v1/companies/:companyId/media/assets/:assetId",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        "SELECT id, storage_key AS storageKey FROM web_media_assets WHERE id = ? AND company_id = ?",
        [req.params.assetId, req.companyId],
      );
      if (!rows.length) return fail(res, 404, "Uploaded image not found.");
      const asset = rows[0];
      const filePath = mediaDiskPath(asset.storageKey, req.companyId);
      const tombstonePath = `${filePath}.${randomUUID()}.deleted`;
      let movedFile = false;
      try {
        await renameFile(filePath, tombstonePath);
        movedFile = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      try {
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          const fallbackImage = "assets/images/bangles-10.svg";
          const productImageMatch = [req.companyId, asset.id, asset.storageKey, `/${asset.storageKey}`];
          await connection.execute(
            `UPDATE web_products
             SET image_asset_id = NULL, image_url = ?,
                 metadata_json = JSON_SET(COALESCE(metadata_json, JSON_OBJECT()), '$.image', ?)
             WHERE company_id = ? AND (image_asset_id = ? OR image_url = ? OR image_url = ?)`,
            [fallbackImage, fallbackImage, ...productImageMatch],
          );
          await connection.execute(
            `UPDATE web_categories
             SET image_asset_id = NULL, image_url = ?,
                 metadata_json = JSON_SET(COALESCE(metadata_json, JSON_OBJECT()), '$.image', ?)
             WHERE company_id = ? AND (image_asset_id = ? OR image_url = ? OR image_url = ?)`,
            [fallbackImage, fallbackImage, ...productImageMatch],
          );
          await connection.execute("DELETE FROM web_media_assets WHERE id = ? AND company_id = ?", [asset.id, req.companyId]);
          await connection.commit();
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
        if (movedFile) await unlink(tombstonePath).catch(() => {});
        return res.status(204).end();
      } catch (error) {
        if (movedFile) await renameFile(tombstonePath, filePath).catch(() => {});
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
          return fail(res, 409, "This image is still attached to a product or category.");
        }
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  },
);

app.get(
  "/admin/v1/companies/:companyId/content",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    try {
      const [settings] = await pool.execute(
        `SELECT setting_value FROM web_settings
         WHERE company_id = ? AND setting_key = 'content:schemaVersion'`,
        [req.companyId],
      );
      if (!settings.length) {
        const [companies] = await pool.execute(
          `SELECT company_id, company_name FROM web_companies
           WHERE company_id = ? AND status = 'active'`,
          [req.companyId],
        );
        if (!companies.length) return fail(res, 404, "Company not found.");
        const seed = JSON.parse(await readFile(defaultContentPath, "utf8"));
        seed.company = {
          ...seed.company,
          id: companies[0].company_id,
          name: companies[0].company_name,
        };
        await saveDocument(pool, req.companyId, seed);
      }
      return res.json(await getDocument(pool, req.companyId));
    } catch (error) {
      return next(error);
    }
  },
);

app.put(
  "/admin/v1/companies/:companyId/content",
  authenticate,
  authorizeCompany,
  async (req, res, next) => {
    const document = req.body;
    if (!document || typeof document !== "object" || Array.isArray(document)) {
      return fail(res, 400, "Content must be a JSON object.");
    }
    if (document.company?.id !== req.companyId) {
      return fail(res, 400, "Content company.id must match the requested company.");
    }
    try {
      await saveDocument(pool, req.companyId, document);
      return res.json(document);
    } catch (error) {
      return next(error);
    }
  },
);

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error." });
});

await ensureMediaSchema();

app.listen(port, process.env.HOST || "127.0.0.1", () => {
  console.log(`Content API listening on http://${process.env.HOST || "127.0.0.1"}:${port}`);
});
