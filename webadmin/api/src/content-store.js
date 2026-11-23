const json = (value) => JSON.stringify(value ?? null);
const parseJson = (value, fallback = null) => {
  if (value == null) return fallback;
  return typeof value === "string" ? JSON.parse(value) : value;
};
const slugify = (value, fallback) => {
  const slug = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 240);
  return slug || fallback;
};
const routeFor = (key) =>
  ({ home: "/", about: "/about", products: "/products", catalogue: "/catalogue", gallery: "/gallery", contact: "/contact" })[key] || `/${key}`;

async function saveDocument(pool, companyId, document) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [companies] = await connection.execute(
      "SELECT company_id FROM web_companies WHERE company_id = ? AND status = 'active' FOR UPDATE",
      [companyId],
    );
    if (!companies.length) throw Object.assign(new Error("Company not found."), { status: 404 });

    const categoryIdMap = new Map();
    const categories = Array.isArray(document.collections?.categories) ? document.collections.categories : [];
    const categorySlugs = new Set();
    for (const category of categories) {
      if (category?.id != null) categoryIdMap.set(String(category.id), category);
    }

    await connection.execute("DELETE FROM web_content_items WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_page_sections WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_pages WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_menus WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_products WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_categories WHERE company_id = ?", [companyId]);
    await connection.execute("DELETE FROM web_settings WHERE company_id = ?", [companyId]);

    const [companyUpdate] = await connection.execute(
      "UPDATE web_companies SET company_name = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?",
      [String(document.company?.name || companyId).slice(0, 180), companyId],
    );
    if (!companyUpdate.affectedRows) throw Object.assign(new Error("Company not found."), { status: 404 });

    const pageAttributes = {};
    const pages = document.pages && typeof document.pages === "object" ? Object.entries(document.pages) : [];
    for (let index = 0; index < pages.length; index += 1) {
      const [pageKey, page] = pages[index];
      const route = routeFor(pageKey);
      await connection.execute(
        `INSERT INTO web_pages (company_id, page_key, route_path, title, description, status, sort_order)
         VALUES (?, ?, ?, ?, ?, 'published', ?)`,
        [companyId, pageKey.slice(0, 100), route, String(page?.title || pageKey).slice(0, 255), page?.description ?? null, index],
      );
      const [pageRows] = await connection.execute(
        "SELECT id FROM web_pages WHERE company_id = ? AND page_key = ?",
        [companyId, pageKey],
      );
      const pageId = pageRows[0].id;
      const { title: _title, description: _description, sections, ...attributes } = page || {};
      pageAttributes[pageKey] = attributes;
      for (let sectionIndex = 0; sectionIndex < (Array.isArray(sections) ? sections.length : 0); sectionIndex += 1) {
        const section = sections[sectionIndex] || {};
        const sectionKey = String(section.id || `${section.type || "section"}-${sectionIndex}`).slice(0, 120);
        await connection.execute(
          `INSERT INTO web_page_sections
             (company_id, page_id, section_key, section_type, content_json, sort_order, is_visible)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [companyId, pageId, sectionKey, String(section.type || "section").slice(0, 100), json(section), sectionIndex, section.visible === false ? 0 : 1],
        );
      }
    }

    const navigation = Array.isArray(document.navigation) ? document.navigation : [];
    for (let index = 0; index < navigation.length; index += 1) {
      const item = navigation[index] || {};
      await connection.execute(
        `INSERT INTO web_menus
           (company_id, menu_key, label, href, sort_order, is_visible, open_in_new_tab)
         VALUES (?, 'primary', ?, ?, ?, ?, ?)`,
        [companyId, String(item.label || "").slice(0, 120), String(item.href || "").slice(0, 500), index, item.visible === false ? 0 : 1, item.openInNewTab ? 1 : 0],
      );
    }

    const insertedCategories = new Map();
    for (const category of categories) {
      const categoryId = category?.id;
      const name = String(category?.name || "Untitled category").slice(0, 255);
      let slug = slugify(category?.slug || name, `category-${categoryId ?? insertedCategories.size}`).slice(0, 255);
      if (categorySlugs.has(slug)) slug = `${slug.slice(0, 220)}-${slugify(categoryId ?? insertedCategories.size, String(insertedCategories.size))}`;
      categorySlugs.add(slug);
      await connection.execute(
        `INSERT INTO web_categories
           (company_id, external_id, name, slug, description, image_url, sort_order, is_visible, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyId, categoryId == null ? null : String(categoryId).slice(0, 100), name, slug, category.description ?? null, category.image ?? category.imageUrl ?? null, insertedCategories.size, category.visible === false ? 0 : 1, json(category)],
      );
      const [rows] = await connection.execute(
        "SELECT id FROM web_categories WHERE company_id = ? AND external_id <=> ?",
        [companyId, categoryId == null ? null : String(categoryId).slice(0, 100)],
      );
      if (categoryId != null) insertedCategories.set(String(categoryId), rows[0].id);
    }

    const products = Array.isArray(document.collections?.products) ? document.collections.products : [];
    const productSlugs = new Set();
    for (let index = 0; index < products.length; index += 1) {
      const product = products[index] || {};
      const name = String(product.name || "Untitled product").slice(0, 255);
      let slug = slugify(product.slug || name, `product-${product.id ?? index}`).slice(0, 255);
      if (productSlugs.has(slug)) slug = `${slug.slice(0, 220)}-${slugify(product.id ?? index, String(index))}`;
      productSlugs.add(slug);
      const metadata = { ...product, _apiDocumentId: product.id ?? null };
      await connection.execute(
        `INSERT INTO web_products
           (company_id, external_id, category_id, name, slug, description, image_url,
            status, sort_order, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
        [companyId, product.id == null ? null : String(product.id).slice(0, 100), insertedCategories.get(String(product.categoryId)) ?? null, name, slug, product.description ?? null, product.image ?? product.imageUrl ?? null, index, json(metadata)],
      );
    }

    const settings = {
      ...Object.fromEntries(Object.entries(document).filter(([key]) => !["pages", "navigation", "collections"].includes(key))),
      page_attributes: pageAttributes,
      navigation_attributes: navigation,
    };
    for (const [key, value] of Object.entries(settings)) {
      await connection.execute(
        "INSERT INTO web_settings (company_id, setting_key, setting_value) VALUES (?, ?, ?)",
        [companyId, `content:${key}`.slice(0, 120), json(value)],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getDocument(pool, companyId) {
  const [[companyRows], [settingsRows], [pageRows], [sectionRows], [menuRows], [categoryRows], [productRows]] = await Promise.all([
    pool.execute("SELECT company_id, company_name FROM web_companies WHERE company_id = ? AND status = 'active'", [companyId]),
    pool.execute("SELECT setting_key, setting_value FROM web_settings WHERE company_id = ?", [companyId]),
    pool.execute("SELECT id, page_key, title, description, seo_title, seo_description, status, sort_order FROM web_pages WHERE company_id = ? ORDER BY sort_order, id", [companyId]),
    pool.execute("SELECT page_id, section_key, content_json, sort_order FROM web_page_sections WHERE company_id = ? ORDER BY sort_order, id", [companyId]),
    pool.execute("SELECT label, href, sort_order, is_visible, open_in_new_tab FROM web_menus WHERE company_id = ? AND menu_key = 'primary' ORDER BY sort_order, id", [companyId]),
    pool.execute("SELECT id, external_id, name, slug, description, image_url, sort_order, is_visible, metadata_json FROM web_categories WHERE company_id = ? ORDER BY sort_order, id", [companyId]),
    pool.execute("SELECT external_id, category_id, name, slug, description, image_url, sort_order, metadata_json FROM web_products WHERE company_id = ? ORDER BY sort_order, id", [companyId]),
  ]);
  if (!companyRows.length) throw Object.assign(new Error("Company not found."), { status: 404 });

  const settings = Object.fromEntries(settingsRows.map((row) => [row.setting_key, parseJson(row.setting_value)]));
  const document = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!key.startsWith("content:")) continue;
    const name = key.slice("content:".length);
    if (!["page_attributes", "navigation_attributes"].includes(name)) document[name] = value;
  }
  const sectionMap = new Map();
  for (const section of sectionRows) {
    if (!sectionMap.has(String(section.page_id))) sectionMap.set(String(section.page_id), []);
    sectionMap.get(String(section.page_id)).push(parseJson(section.content_json, {}));
  }
  const pageAttributes = settings["content:page_attributes"] || {};
  document.pages = Object.fromEntries(pageRows.map((page) => [
    page.page_key,
    {
      ...(pageAttributes[page.page_key] || {}),
      title: page.title,
      ...(page.description == null ? {} : { description: page.description }),
      ...(page.seo_title == null ? {} : { seoTitle: page.seo_title }),
      ...(page.seo_description == null ? {} : { seoDescription: page.seo_description }),
      sections: sectionMap.get(String(page.id)) || [],
    },
  ]));
  const navigationAttributes = settings["content:navigation_attributes"] || [];
  document.navigation = menuRows.map((item, index) => ({
    ...(navigationAttributes[index] || {}),
    label: item.label,
    href: item.href,
    visible: Boolean(item.is_visible),
    ...(item.open_in_new_tab ? { openInNewTab: true } : {}),
  }));

  const categoriesByDbId = new Map();
  document.collections = {
    categories: categoryRows.map((row) => {
      const metadata = parseJson(row.metadata_json, {}) || {};
      const category = { ...metadata, id: metadata.id ?? row.external_id, name: row.name, slug: row.slug, description: row.description, image: row.image_url, visible: Boolean(row.is_visible) };
      categoriesByDbId.set(String(row.id), category.id);
      return category;
    }),
    products: productRows.map((row) => {
      const metadata = parseJson(row.metadata_json, {}) || {};
      const product = { ...metadata, id: metadata.id ?? row.external_id, name: row.name, slug: row.slug, description: row.description, image: row.image_url };
      if (row.category_id != null && categoriesByDbId.has(String(row.category_id))) product.categoryId = categoriesByDbId.get(String(row.category_id));
      return product;
    }),
  };
  document.company = {
    ...(document.company || {}),
    id: companyRows[0].company_id,
    name: companyRows[0].company_name,
  };
  return document;
}

export { getDocument, saveDocument };
