-- Rename the Arbuda Bangles tenant and keep all tenant-scoped rows aligned.
USE web_edobizclients;

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

UPDATE web_companies SET company_id = 'A1B1'
WHERE company_id = 'arbuda-bangles' AND company_name = 'Arbuda Bangles';

UPDATE web_admin_users SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_settings SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_menus SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_pages SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_page_sections SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_content_items SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_media_assets SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_categories SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_products SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_form_submissions SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';
UPDATE web_content_revisions SET company_id = 'A1B1' WHERE company_id = 'arbuda-bangles';

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
