-- MySQL 8+ schema for the multi-company website content API.
-- Every business table carries company_id. Scope every API query by this column.

CREATE TABLE web_companies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  company_name VARCHAR(180) NOT NULL,
  domain VARCHAR(255) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_website_companies_company_id (company_id),
  KEY idx_website_companies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(180) NOT NULL,
  role ENUM('owner', 'admin', 'editor', 'viewer') NOT NULL DEFAULT 'editor',
  status ENUM('active', 'invited', 'disabled') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_company_email (company_id, email),
  UNIQUE KEY uq_admin_users_id_company (id, company_id),
  KEY idx_admin_users_company_role (company_id, role),
  CONSTRAINT fk_admin_users_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  setting_key VARCHAR(120) NOT NULL,
  setting_value JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_settings_company_key (company_id, setting_key),
  KEY idx_site_settings_updated_by (company_id, updated_by),
  CONSTRAINT fk_site_settings_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_menus (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  menu_key VARCHAR(80) NOT NULL,
  label VARCHAR(120) NOT NULL,
  href VARCHAR(500) NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_site_menus_company_key_order (company_id, menu_key, sort_order),
  KEY idx_site_menus_company_parent (company_id, parent_id),
  UNIQUE KEY uq_site_menus_id_company (id, company_id),
  CONSTRAINT fk_site_menus_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_site_menus_parent FOREIGN KEY (parent_id, company_id) REFERENCES web_menus(id, company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_pages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  page_key VARCHAR(100) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_site_pages_company_key (company_id, page_key),
  UNIQUE KEY uq_site_pages_company_route (company_id, route_path),
  KEY idx_site_pages_company_status_order (company_id, status, sort_order),
  UNIQUE KEY uq_site_pages_id_company (id, company_id),
  CONSTRAINT fk_site_pages_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_page_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  page_id BIGINT UNSIGNED NOT NULL,
  section_key VARCHAR(120) NOT NULL,
  section_type VARCHAR(100) NOT NULL,
  content_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_page_sections_company_page_key (company_id, page_id, section_key),
  UNIQUE KEY uq_page_sections_id_company (id, company_id),
  KEY idx_page_sections_company_page_order (company_id, page_id, sort_order),
  CONSTRAINT fk_page_sections_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id, company_id) REFERENCES web_pages(id, company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_content_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  section_id BIGINT UNSIGNED NULL,
  item_key VARCHAR(140) NULL,
  item_type VARCHAR(100) NOT NULL,
  content_json JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_content_items_company_section_order (company_id, section_id, sort_order),
  KEY idx_content_items_company_key (company_id, item_key),
  CONSTRAINT fk_content_items_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_content_items_section FOREIGN KEY (section_id, company_id) REFERENCES web_page_sections(id, company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_media_folders (
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
  CONSTRAINT fk_media_folders_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_media_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  folder_id BIGINT UNSIGNED NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(700) NOT NULL,
  public_url VARCHAR(1200) NOT NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT UNSIGNED NULL,
  alt_text VARCHAR(500) NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_media_assets_company_created (company_id, created_at),
  KEY idx_media_assets_company_folder (company_id, folder_id),
  KEY idx_media_assets_company_storage (company_id, storage_key(191)),
  UNIQUE KEY uq_media_assets_id_company (id, company_id),
  CONSTRAINT fk_media_assets_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_media_assets_folder FOREIGN KEY (folder_id, company_id) REFERENCES web_media_folders(id, company_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  external_id VARCHAR(100) NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image_asset_id BIGINT UNSIGNED NULL,
  image_url VARCHAR(1200) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_categories_company_slug (company_id, slug),
  KEY idx_product_categories_company_order (company_id, sort_order),
  KEY idx_product_categories_company_external (company_id, external_id),
  UNIQUE KEY uq_product_categories_id_company (id, company_id),
  CONSTRAINT fk_product_categories_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_product_categories_image FOREIGN KEY (image_asset_id, company_id) REFERENCES web_media_assets(id, company_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  external_id VARCHAR(100) NULL,
  category_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  image_asset_id BIGINT UNSIGNED NULL,
  image_url VARCHAR(1200) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_company_slug (company_id, slug),
  KEY idx_products_company_category (company_id, category_id, status),
  KEY idx_products_company_order (company_id, sort_order),
  KEY idx_products_company_external (company_id, external_id),
  CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id, company_id) REFERENCES web_categories(id, company_id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_image FOREIGN KEY (image_asset_id, company_id) REFERENCES web_media_assets(id, company_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_form_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  form_key VARCHAR(100) NOT NULL,
  source_page VARCHAR(255) NULL,
  submission_json JSON NOT NULL,
  status ENUM('new', 'in_progress', 'resolved', 'spam') NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_form_submissions_company_status_date (company_id, status, submitted_at),
  KEY idx_form_submissions_company_form (company_id, form_key),
  CONSTRAINT fk_form_submissions_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_content_revisions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id VARCHAR(80) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  revision_json JSON NOT NULL,
  changed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_content_revisions_company_entity_date (company_id, entity_type, entity_id, created_at),
  KEY idx_content_revisions_company_user (company_id, changed_by),
  CONSTRAINT fk_content_revisions_company FOREIGN KEY (company_id) REFERENCES web_companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
