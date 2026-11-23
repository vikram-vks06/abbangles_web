import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCompanies,
  getContent,
  getMedia,
  getSession,
  isDemoMode,
  login,
  logout,
  saveContent,
  createMediaFolder,
  deleteMedia,
  renameMedia,
  uploadMedia,
} from "./api";

const routes = [
  { path: "/dashboard", label: "Overview", icon: "◫", group: "Workspace" },
  { path: "/content", label: "Page content", icon: "▤", group: "Workspace" },
  {
    path: "/catalog",
    label: "Products & categories",
    icon: "◇",
    group: "Commerce",
  },
  { path: "/media", label: "Media library", icon: "▧", group: "Commerce" },
  { path: "/site", label: "Site settings", icon: "⚙", group: "Website" },
];
const pageNames = {
  home: "Home page",
  about: "About us",
  products: "Products",
  catalogue: "Catalogue",
  gallery: "Gallery",
  contact: "Contact",
};
const groupNames = ["Workspace", "Commerce", "Website"];
const adminRouteBase = import.meta.env.PROD ? "/webadmin" : "";
const appPath = (pathname) => {
  const path =
    adminRouteBase && pathname.startsWith(`${adminRouteBase}/`)
      ? pathname.slice(adminRouteBase.length)
      : pathname === adminRouteBase
        ? "/"
        : pathname;
  return path === "/index.html" ? "/" : path;
};
const initialPath = () => {
  const path = appPath(window.location.pathname);
  return path === "/" ? (getSession() ? "/dashboard" : "/login") : path;
};
const titleCase = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
const dateLabel = () =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

function Icon({ children, className = "" }) {
  return (
    <span className={`icon ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

function LoginPage({ onLogin, error, busy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="login-shell">
      <div className="login-art">
        <div className="art-orb art-orb-one" />
        <div className="art-orb art-orb-two" />
        <div className="brand-lockup light">
          <span className="brand-mark">A</span>
          <span>
            ARB<span className="brand-accent">UDA</span>
            <small>CONTENT STUDIO</small>
          </span>
        </div>
        <div className="login-art-copy">
          <span className="eyebrow light-eyebrow">YOUR DIGITAL SHOWROOM</span>
          <h1>
            Every detail,
            <br />
            <em>beautifully</em> managed.
          </h1>
          <p>
            One calm workspace for every page, product and story your brand
            shares with the world.
          </p>
        </div>
        <div className="art-bottom">
          <span>✳</span> Crafted for teams who care about every detail.
        </div>
      </div>
      <section className="login-panel">
        <div className="login-mobile-brand">
          <span className="brand-mark">A</span> Arbuda Studio
        </div>
        <div className="login-card">
          <div className="login-icon-wrap">
            <Icon>✦</Icon>
          </div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your studio</h2>
          <p className="muted">
            Manage your website content and keep every page in step with your
            brand.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onLogin(email, password);
            }}
          >
            <label>
              Email address
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </label>
            <div className="login-options">
              <label className="checkline">
                <input type="checkbox" /> Keep me signed in
              </label>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  window.alert(
                    "Connect the password reset endpoint in the admin API to enable recovery.",
                  )
                }
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="primary-button login-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to workspace"}
              <span>↗</span>
            </button>
          </form>
          <div className="login-foot">
            <span className="secure-dot" /> Secure multi-company workspace
          </div>
          {isDemoMode && (
            <div className="demo-note">
              <strong>Preview mode</strong>
              <br />
              Connect <code>VITE_ADMIN_API_URL</code> for production
              authentication.
            </div>
          )}
        </div>
        <p className="login-copyright">
          © {new Date().getFullYear()} Arbuda Studio · All rights reserved
        </p>
      </section>
    </main>
  );
}

function FieldEditor({ value, onChange, depth = 0 }) {
  if (Array.isArray(value)) {
    const isObjectArray = value.some(
      (item) => item && typeof item === "object",
    );
    const add = () =>
      onChange([
        ...value,
        isObjectArray
          ? value.find((item) => item && typeof item === "object")
            ? Object.fromEntries(
                Object.keys(
                  value.find((item) => item && typeof item === "object"),
                ).map((key) => [key, ""]),
              )
            : {}
          : "",
      ]);
    return (
      <div className={`array-editor depth-${Math.min(depth, 2)}`}>
        <div className="array-heading">
          <span>
            {value.length} {isObjectArray ? "items" : "values"}
          </span>
          <button type="button" className="quiet-button" onClick={add}>
            ＋ Add item
          </button>
        </div>
        {value.map((item, index) => (
          <div
            className={isObjectArray ? "array-object" : "array-value"}
            key={`${index}-${typeof item}`}
          >
            {isObjectArray ? (
              <div className="object-card">
                <div className="object-card-head">
                  <span>Item {String(index + 1).padStart(2, "0")}</span>
                  <button
                    type="button"
                    className="icon-button danger"
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  >
                    ×
                  </button>
                </div>
                <FieldEditor
                  value={item}
                  depth={depth + 1}
                  onChange={(next) =>
                    onChange(
                      value.map((entry, i) => (i === index ? next : entry)),
                    )
                  }
                />
              </div>
            ) : (
              <>
                <input
                  value={String(item ?? "")}
                  onChange={(event) =>
                    onChange(
                      value.map((entry, i) =>
                        i === index ? event.target.value : entry,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="icon-button danger"
                  aria-label={`Remove value ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
        {!value.length && (
          <p className="empty-hint">No items yet. Add one to get started.</p>
        )}
      </div>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div className={`object-fields depth-${Math.min(depth, 2)}`}>
        {Object.entries(value).map(([key, child]) => (
          <label
            className={`editor-field ${typeof child === "boolean" ? "boolean-field" : ""}`}
            key={key}
          >
            {typeof child === "boolean" ? (
              <>
                <span>{titleCase(key)}</span>
                <input
                  type="checkbox"
                  checked={child}
                  onChange={(event) =>
                    onChange({ ...value, [key]: event.target.checked })
                  }
                />
              </>
            ) : (
              <>
                <span className="field-label">{titleCase(key)}</span>
                <FieldEditor
                  value={child}
                  depth={depth + 1}
                  onChange={(next) => onChange({ ...value, [key]: next })}
                />
              </>
            )}
          </label>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean")
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  if (typeof value === "number")
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  const stringValue = String(value ?? "");
  if (stringValue.length > 100 || stringValue.includes("\n")) {
    return (
      <textarea
        rows={Math.min(7, Math.max(3, stringValue.split("\n").length + 1))}
        value={stringValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <input
      value={stringValue}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function StatCard({ label, value, detail, icon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <Icon>{icon}</Icon>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function App() {
  const [path, setPath] = useState(initialPath);
  const [session, setSession] = useState(getSession);
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState(
    localStorage.getItem("arbuda.webadmin.company") || "A1B1",
  );
  const [content, setContent] = useState(null);
  const [mediaLibrary, setMediaLibrary] = useState({ folders: [], assets: [] });
  const [mediaLoading, setMediaLoading] = useState(false);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedSection, setSelectedSection] = useState(-1);
  const [catalogTab, setCatalogTab] = useState("products");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [siteTab, setSiteTab] = useState("header");

  const dirty = content && JSON.stringify(content) !== baseline;
  const navigate = (nextPath) => {
    const url = `${adminRouteBase}${nextPath}`;
    if (url !== window.location.pathname)
      window.history.pushState({}, "", url);
    setPath(nextPath);
    setNotice("");
  };
  useEffect(() => {
    const pop = () => setPath(initialPath());
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!session) return;
    let active = true;
    getCompanies(session.access_token)
      .then((result) => {
        if (!active) return;
        setCompanies(result);
        const selectedCompanyId =
          localStorage.getItem("arbuda.webadmin.company") || companyId;
        if (result.length && !result.some((company) => company.company_id === selectedCompanyId)) {
          const firstCompanyId = result[0].company_id;
          setCompanyId(firstCompanyId);
          localStorage.setItem("arbuda.webadmin.company", firstCompanyId);
        }
      })
      .catch(() => setCompanies([]));
    return () => {
      active = false;
    };
  }, [session]);
  useEffect(() => {
    if (!session || !companyId) return;
    let active = true;
    setLoading(true);
    getContent(companyId, session.access_token)
      .then((result) => {
        if (!active) return;
        const next = {
          ...result,
          company: { ...result.company, id: companyId },
        };
        setContent(next);
        setBaseline(JSON.stringify(next));
        setLoading(false);
      })
      .catch((error) => {
        if (active) {
          setNotice(error.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [session, companyId]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!session || !companyId || path !== "/media") return;
    let active = true;
    setMediaLoading(true);
    getMedia(companyId, session.access_token)
      .then((result) => {
        if (active) setMediaLibrary(result);
      })
      .catch((error) => {
        if (active) setNotice(`Could not load media: ${error.message}`);
      })
      .finally(() => {
        if (active) setMediaLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, companyId, path]);

  async function handleCreateMediaFolder(name) {
    const folder = await createMediaFolder(companyId, name, session?.access_token);
    setMediaLibrary((current) => ({
      ...current,
      folders: [...current.folders, folder].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    return folder;
  }

  async function handleMediaUpload(folderId, file) {
    const asset = await uploadMedia(companyId, folderId, file, session?.access_token);
    setMediaLibrary((current) => ({
      ...current,
      assets: [asset, ...current.assets],
    }));
    return asset;
  }

  async function handleMediaRename(assetId, fileName) {
    const renamed = await renameMedia(companyId, assetId, fileName, session?.access_token);
    setMediaLibrary((current) => ({
      ...current,
      assets: current.assets.map((asset) => asset.id === assetId ? { ...asset, ...renamed } : asset),
    }));
    return renamed;
  }

  async function handleMediaDelete(assetId) {
    await deleteMedia(companyId, assetId, session?.access_token);
    setMediaLibrary((current) => ({
      ...current,
      assets: current.assets.filter((asset) => asset.id !== assetId),
    }));
  }

  const page = content?.pages?.[selectedPage];
  const section =
    selectedSection < 0
      ? page &&
        Object.fromEntries(
          Object.entries(page).filter(([key]) => key !== "sections"),
        )
      : page?.sections?.[selectedSection];
  const records = content?.collections?.[catalogTab] || [];
  const media = useMemo(() => {
    if (!content) return [];
    const result = new Set();
    const walk = (value) => {
      if (
        typeof value === "string" &&
        /\.(png|jpe?g|webp|avif|svg)(\?.*)?$/i.test(value)
      )
        result.add(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(content);
    return [...result];
  }, [content]);

  function updateAt(pathParts, nextValue) {
    setContent((current) => {
      const copy = structuredClone(current);
      let cursor = copy;
      for (const part of pathParts.slice(0, -1)) cursor = cursor[part];
      cursor[pathParts.at(-1)] = nextValue;
      return copy;
    });
  }
  function updateSection(next) {
    if (selectedSection < 0)
      updateAt(["pages", selectedPage], { ...page, ...next });
    else updateAt(["pages", selectedPage, "sections", selectedSection], next);
  }
  function addSection() {
    setContent((current) => {
      const list = current.pages[selectedPage].sections || [];
      return {
        ...current,
        pages: {
          ...current.pages,
          [selectedPage]: {
            ...current.pages[selectedPage],
            sections: [
              ...list,
              {
                id: `new-section-${Date.now()}`,
                type: "textBlock",
                visible: true,
                eyebrow: "",
                title: "New section",
                description: "Add your content here.",
                button: "",
                buttonHref: "",
              },
            ],
          },
        },
      };
    });
    setSelectedSection(page?.sections?.length || 0);
  }
  function removeSection() {
    if (selectedSection < 0) return;
    if (
      !window.confirm(
        "Remove this section from the page? It will be removed when you save.",
      )
    )
      return;
    setContent((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [selectedPage]: {
          ...current.pages[selectedPage],
          sections: current.pages[selectedPage].sections.filter(
            (_, index) => index !== selectedSection,
          ),
        },
      },
    }));
    setSelectedSection(Math.max(0, selectedSection - 1));
  }
  function moveSection(direction) {
    if (selectedSection < 0) return;
    const sections = [...(page?.sections || [])];
    const target = selectedSection + direction;
    if (target < 0 || target >= sections.length) return;
    [sections[selectedSection], sections[target]] = [
      sections[target],
      sections[selectedSection],
    ];
    updateAt(["pages", selectedPage, "sections"], sections);
    setSelectedSection(target);
  }
  function updateRecord(next) {
    const index = records.findIndex(
      (record) => record.id === records[selectedRecord]?.id,
    );
    if (index >= 0) updateAt(["collections", catalogTab, index], next);
  }
  function addRecord() {
    const isProducts = catalogTab === "products";
    const next = isProducts
      ? {
          id: Date.now(),
          name: "New product",
          categoryId: 1,
          image: "",
          description: "",
        }
      : { id: Date.now(), name: "New category", image: "" };
    setContent((current) => ({
      ...current,
      collections: {
        ...current.collections,
        [catalogTab]: [...current.collections[catalogTab], next],
      },
    }));
    setSelectedRecord(records.length);
    setCatalogSearch("");
  }
  function removeRecord() {
    if (
      !window.confirm(
        `Delete this ${catalogTab === "products" ? "product" : "category"}?`,
      )
    )
      return;
    setContent((current) => ({
      ...current,
      collections: {
        ...current.collections,
        [catalogTab]: current.collections[catalogTab].filter(
          (_, index) => index !== selectedRecord,
        ),
      },
    }));
    setSelectedRecord(Math.max(0, selectedRecord - 1));
  }
  async function handleLogin(email, password) {
    setLoginBusy(true);
    setLoginError("");
    try {
      const result = await login(email, password);
      localStorage.setItem("arbuda.webadmin.session", JSON.stringify(result));
      setSession(result);
      navigate("/dashboard");
    } catch (error) {
      setLoginError(
        error.message || "Unable to sign in. Check your details and try again.",
      );
    } finally {
      setLoginBusy(false);
    }
  }
  async function handleSave() {
    setSaving(true);
    try {
      const saved = await saveContent(
        companyId,
        content,
        session?.access_token,
      );
      const normalized = {
        ...content,
        ...(saved || {}),
        company: { ...content.company, id: companyId },
      };
      setContent(normalized);
      setBaseline(JSON.stringify(normalized));
      setNotice("Your website content has been saved.");
    } catch (error) {
      setNotice(`Could not save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }
  function handleLogout() {
    logout();
    setSession(null);
    setContent(null);
    navigate("/login");
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${companyId}-site-content.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported.pages || !imported.company || !imported.collections)
        throw new Error("This JSON does not match the website content format.");
      setContent({
        ...imported,
        company: { ...imported.company, id: companyId },
      });
      setNotice("JSON imported. Save changes to apply it to this company.");
    } catch (error) {
      setNotice(error.message || "Could not read that JSON file.");
    }
    event.target.value = "";
  }

  if (!session || path === "/login")
    return (
      <LoginPage onLogin={handleLogin} error={loginError} busy={loginBusy} />
    );
  if (loading)
    return (
      <div className="boot-screen">
        <span className="spinner" /> Loading your workspace…
      </div>
    );
  if (!content)
    return (
      <div className="boot-screen">
        <div className="boot-error" role="alert">
          <strong>Could not load your workspace.</strong>
          <p>{notice || "The content service did not return website data."}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              logout();
              setSession(null);
              navigate("/login");
            }}
          >
            Return to sign in
          </button>
        </div>
      </div>
    );

  const route = routes.find((item) => item.path === path) || routes[0];
  const title = route.label;
  const pageSectionCount = Object.values(content.pages || {}).reduce(
    (sum, item) => sum + (item.sections?.length || 0),
    0,
  );

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">A</span>
          <span>
            ARB<span className="brand-accent">UDA</span>
            <small>CONTENT STUDIO</small>
          </span>
        </div>
        <div className="tenant-select">
          <span className="tenant-caption">CURRENT WEBSITE</span>
          <div className="tenant-control">
            <span className="tenant-avatar">
              {content.company.name.slice(0, 1)}
            </span>
            <select
              aria-label="Select company website"
              value={companyId}
              onChange={(event) => {
                const next = event.target.value;
                setCompanyId(next);
                localStorage.setItem("arbuda.webadmin.company", next);
              }}
            >
              {companies.length ? (
                companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))
              ) : (
                <option value={companyId}>{content.company.name}</option>
              )}
              {!companies.some(
                (company) => company.company_id === companyId,
              ) && <option value={companyId}>{companyId}</option>}
            </select>
            <span className="select-chevron">⌄</span>
          </div>
          <small className="tenant-domain">{companyId}</small>
        </div>
        <nav className="side-nav" aria-label="Admin navigation">
          {groupNames.map((group) => (
            <div className="nav-group" key={group}>
              <p>{group}</p>
              {routes
                .filter((item) => item.group === group)
                .map((item) => (
                  <button
                    type="button"
                    key={item.path}
                    className={`nav-item ${path === item.path ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon>{item.icon}</Icon>
                    <span>{item.label}</span>
                    {item.path === "/content" && (
                      <small>{pageSectionCount}</small>
                    )}
                  </button>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-spark">✳</span>
            <strong>Need a hand?</strong>
            <span>Your studio is ready for your next great update.</span>
            <button
              type="button"
              onClick={() => window.open("mailto:info@abbangles.com", "_blank")}
            >
              Contact support <span>↗</span>
            </button>
          </div>
          <button type="button" className="profile-row" onClick={handleLogout}>
            <span className="profile-avatar">
              {session.user?.name?.slice(0, 1).toUpperCase() || "A"}
            </span>
            <span className="profile-copy">
              <strong>{session.user?.name || "Site administrator"}</strong>
              <small>{session.user?.role || "Administrator"}</small>
            </span>
            <span className="profile-menu">•••</span>
          </button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <div className="today-chip">
              <span>◷</span>
              {dateLabel()}
            </div>
            <a
              className="view-site"
              href={import.meta.env.VITE_SITE_ORIGIN || "http://localhost:3000"}
              target="_blank"
              rel="noreferrer"
            >
              <span>↗</span> View website
            </a>
            <button
              className="avatar-small"
              type="button"
              title="Sign out"
              onClick={handleLogout}
            >
              {session.user?.name?.slice(0, 1).toUpperCase() || "A"}
            </button>
          </div>
        </header>
        <div className="workspace-content">
          {notice && (
            <div
              className={`toast ${notice.startsWith("Could not") ? "toast-error" : ""}`}
              role="status"
            >
              <span>{notice.startsWith("Could not") ? "!" : "✓"}</span>
              {notice}
              <button type="button" onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}
          {path === "/dashboard" && (
            <Dashboard
              content={content}
              dirty={dirty}
              pageSectionCount={pageSectionCount}
              onNavigate={navigate}
              onExport={exportJson}
            />
          )}
          {path === "/content" && (
            <ContentPage
              content={content}
              selectedPage={selectedPage}
              setSelectedPage={(next) => {
                setSelectedPage(next);
                setSelectedSection(-1);
              }}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              page={page}
              section={section}
              onSectionChange={updateSection}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onMoveSection={moveSection}
              onExport={exportJson}
              onImport={importJson}
            />
          )}
          {path === "/catalog" && (
            <CatalogPage
              content={content}
              tab={catalogTab}
              setTab={(next) => {
                setCatalogTab(next);
                setSelectedRecord(0);
              }}
              search={catalogSearch}
              setSearch={setCatalogSearch}
              records={records}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              onChange={updateRecord}
              onAdd={addRecord}
              onDelete={removeRecord}
              onExport={exportJson}
            />
          )}
          {path === "/media" && (
            <MediaPage
              media={media}
              folders={mediaLibrary.folders}
              assets={mediaLibrary.assets}
              loading={mediaLoading}
              siteOrigin={import.meta.env.VITE_SITE_ORIGIN || "http://localhost:3000"}
              onCreateFolder={handleCreateMediaFolder}
              onUpload={handleMediaUpload}
              onRename={handleMediaRename}
              onDelete={handleMediaDelete}
            />
          )}
          {path === "/site" && (
            <SitePage
              content={content}
              tab={siteTab}
              setTab={setSiteTab}
              onChange={(value) => updateAt(value.path, value.value)}
            />
          )}
        </div>
        <footer className="workspace-footer">
          <span>© {new Date().getFullYear()} Arbuda Studio</span>
          <span>
            Content stays organized, one update at a time <b>✦</b>
          </span>
        </footer>
      </main>
      {dirty && (
        <div className="save-dock">
          <span>
            <i /> You have unpublished changes
          </span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setContent(JSON.parse(baseline));
              setNotice("Unsaved changes were discarded.");
            }}
          >
            Discard
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save changes"}
            <span>↗</span>
          </button>
        </div>
      )}
      {isDemoMode && (
        <div className="demo-pill">
          <span /> DEMO MODE
        </div>
      )}
    </div>
  );
}

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function PageMetaEditor({ value, onChange }) {
  return (
    <div className="page-meta-editor">
      <div className="meta-note">
        <span>✦</span>
        <p>
          Page-level copy, field labels and search metadata live here.
          Section-based pages also keep their content blocks below.
        </p>
      </div>
      <FieldEditor value={value} onChange={onChange} />
    </div>
  );
}

function Dashboard({ content, dirty, pageSectionCount, onNavigate, onExport }) {
  const recentlyEdited = [
    {
      name: "Homepage hero carousel",
      page: "Home page",
      time: "Just now",
      color: "peach",
      icon: "✦",
    },
    {
      name: "Wholesale enquiry banner",
      page: "Home page",
      time: "Yesterday",
      color: "mint",
      icon: "▤",
    },
    {
      name: "Contact details",
      page: "Contact page",
      time: "2 days ago",
      color: "lilac",
      icon: "⌖",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow={`${dateLabel().toUpperCase()} · YOUR WEBSITE IS IN GOOD HANDS`}
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${content.company.name.split(" ")[0]}.`}
        description="Here’s what’s happening across your digital showroom today."
        actions={
          <button className="secondary-button" type="button" onClick={onExport}>
            ↓ Export content
          </button>
        }
      />
      <div className="stat-grid">
        <StatCard
          label="Website pages"
          value={Object.keys(content.pages || {}).length}
          detail={`${pageSectionCount} editable sections`}
          icon="▤"
          tone="stat-green"
        />
        <StatCard
          label="Products"
          value={content.collections.products.length}
          detail={`${content.collections.categories.length} collections`}
          icon="◇"
          tone="stat-peach"
        />
        <StatCard
          label="Content status"
          value={dirty ? "Draft" : "Published"}
          detail={dirty ? "Changes ready to save" : "All changes are saved"}
          icon="✦"
          tone="stat-blue"
        />
        <StatCard
          label="Company workspace"
          value="Active"
          detail={content.company.id}
          icon="⌂"
          tone="stat-lilac"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Recently updated</h2>
              <p>Your latest website changes</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate("/content")}
            >
              View all <span>→</span>
            </button>
          </div>
          <div className="recent-list">
            {recentlyEdited.map((item) => (
              <button
                type="button"
                className="recent-item"
                key={item.name}
                onClick={() => onNavigate("/content")}
              >
                <span className={`recent-icon ${item.color}`}>{item.icon}</span>
                <span className="recent-copy">
                  <strong>{item.name}</strong>
                  <small>{item.page}</small>
                </span>
                <span className="recent-time">{item.time}</span>
                <span className="recent-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="recent-foot">
            <span className="live-indicator" /> Content API ready to connect{" "}
            <span className="api-tag">JSON</span>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Jump straight into your work</p>
            </div>
            <span className="sparkle-small">✳</span>
          </div>
          <button
            type="button"
            className="quick-action"
            onClick={() => onNavigate("/content")}
          >
            <span className="quick-icon quick-peach">＋</span>
            <span>
              <strong>Edit page content</strong>
              <small>Update sections, copy and buttons</small>
            </span>
            <b>→</b>
          </button>
          <button
            type="button"
            className="quick-action"
            onClick={() => onNavigate("/catalog")}
          >
            <span className="quick-icon quick-green">◇</span>
            <span>
              <strong>Manage catalogue</strong>
              <small>Products, categories and images</small>
            </span>
            <b>→</b>
          </button>
          <button
            type="button"
            className="quick-action"
            onClick={() => onNavigate("/site")}
          >
            <span className="quick-icon quick-lilac">⚙</span>
            <span>
              <strong>Website settings</strong>
              <small>Brand, navigation and footer</small>
            </span>
            <b>→</b>
          </button>
        </section>
      </div>
      <section className="welcome-banner">
        <div className="banner-decoration">✳</div>
        <div>
          <span>YOUR BRAND, YOUR WAY</span>
          <h2>Make every scroll feel like Arbuda.</h2>
          <p>
            Keep your collections, story and contact details fresh from one easy
            place.
          </p>
        </div>
        <button
          type="button"
          className="light-button"
          onClick={() => onNavigate("/content")}
        >
          Update your website <span>↗</span>
        </button>
      </section>
    </>
  );
}

function ContentPage({
  content,
  selectedPage,
  setSelectedPage,
  selectedSection,
  setSelectedSection,
  page,
  section,
  onSectionChange,
  onAddSection,
  onRemoveSection,
  onMoveSection,
  onExport,
  onImport,
}) {
  const sections = page?.sections || [];
  return (
    <>
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Page content"
        description="Edit every page section, message, image and button in your website."
        actions={
          <>
            <label className="secondary-button import-button">
              ↑ Import JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={onImport}
              />
            </label>
            <button
              className="secondary-button"
              type="button"
              onClick={onExport}
            >
              ↓ Export JSON
            </button>
          </>
        }
      />
      <div className="content-toolbar">
        <div className="page-tabs">
          {Object.keys(content.pages).map((key) => (
            <button
              type="button"
              key={key}
              className={selectedPage === key ? "selected" : ""}
              onClick={() => setSelectedPage(key)}
            >
              {pageNames[key] || titleCase(key)}
            </button>
          ))}
        </div>
        <span className="section-count">{sections.length} sections</span>
      </div>
      <div className="content-layout">
        <aside className="section-list">
          <div className="section-list-top">
            <span>PAGE SECTIONS</span>
            <span>{sections.length + 1}</span>
          </div>
          <button
            type="button"
            className={`section-row ${selectedSection < 0 ? "active" : ""}`}
            onClick={() => setSelectedSection(-1)}
          >
            <span className="section-drag">⌂</span>
            <span className="section-row-copy">
              <strong>Page setup</strong>
              <small>Page copy & settings</small>
            </span>
          </button>
          {sections.map((item, index) => (
            <button
              type="button"
              className={`section-row ${selectedSection === index ? "active" : ""}`}
              key={item.id || index}
              onClick={() => setSelectedSection(index)}
            >
              <span className="section-drag">⠿</span>
              <span className="section-row-copy">
                <strong>{titleCase(item.id || item.type)}</strong>
                <small>{titleCase(item.type || "section")}</small>
              </span>
              <span
                className={`visibility-dot ${item.visible === false ? "hidden" : ""}`}
              />
            </button>
          ))}
          <button className="section-add" type="button" onClick={onAddSection}>
            ＋ Add section
          </button>
          <div className="section-help">
            <span>✦</span>
            <strong>Sections stay flexible</strong>
            <p>
              Each section can carry its own copy, image, links, items and
              visibility settings.
            </p>
          </div>
        </aside>
        <section className="panel editor-panel">
          <div className="editor-panel-head">
            <div>
              <span className="editor-kicker">
                {pageNames[selectedPage] || titleCase(selectedPage)} /{" "}
                {selectedSection < 0
                  ? "PAGE SETUP"
                  : `SECTION ${String(selectedSection + 1).padStart(2, "0")}`}
              </span>
              <h2>
                {selectedSection < 0
                  ? "Page setup"
                  : titleCase(section?.id || section?.type || "Section")}
              </h2>
              <p>Changes are saved to the selected company website.</p>
            </div>
            <div className="editor-head-actions">
              <button
                className="icon-button"
                type="button"
                aria-label="Move section up"
                disabled={selectedSection <= 0}
                onClick={() => onMoveSection(-1)}
              >
                ↑
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Move section down"
                disabled={
                  selectedSection < 0 || selectedSection >= sections.length - 1
                }
                onClick={() => onMoveSection(1)}
              >
                ↓
              </button>
              <button
                className="icon-button danger"
                type="button"
                disabled={selectedSection < 0 || !section}
                onClick={onRemoveSection}
                aria-label="Delete section"
              >
                ⌫
              </button>
              <span className="editable-pill">
                <i /> Editable
              </span>
            </div>
          </div>
          {section ? (
            <div className="fields-wrap">
              {selectedSection < 0 ? (
                <PageMetaEditor value={section} onChange={onSectionChange} />
              ) : (
                <FieldEditor value={section} onChange={onSectionChange} />
              )}
            </div>
          ) : (
            <div className="empty-editor">
              This page has no structured sections yet. Add one to begin.
            </div>
          )}
          <div className="editor-panel-foot">
            <span>
              <Icon>⌘</Icon> Content is tenant scoped to{" "}
              <b>{content.company.id}</b>
            </span>
            <span>JSON-backed fields</span>
          </div>
        </section>
      </div>
    </>
  );
}

function CatalogPage({
  content,
  tab,
  setTab,
  search,
  setSearch,
  records,
  selectedRecord,
  setSelectedRecord,
  onChange,
  onAdd,
  onDelete,
  onExport,
}) {
  const shownRecords = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) =>
      JSON.stringify(record).toLowerCase().includes(search.toLowerCase()),
    );
  const current = records[selectedRecord];
  return (
    <>
      <PageHeader
        eyebrow="PRODUCT CATALOGUE"
        title="Products & categories"
        description="Keep your catalogue accurate, organized and ready for every customer."
        actions={
          <>
            <button
              className="secondary-button"
              type="button"
              onClick={onExport}
            >
              ↓ Export JSON
            </button>
            <button className="primary-button" type="button" onClick={onAdd}>
              ＋ Add {tab === "products" ? "product" : "category"}
            </button>
          </>
        }
      />
      <section className="panel catalog-panel">
        <div className="catalog-head">
          <div className="segmented-tabs">
            <button
              type="button"
              className={tab === "products" ? "selected" : ""}
              onClick={() => setTab("products")}
            >
              Products <span>{content.collections.products.length}</span>
            </button>
            <button
              type="button"
              className={tab === "categories" ? "selected" : ""}
              onClick={() => setTab("categories")}
            >
              Categories <span>{content.collections.categories.length}</span>
            </button>
          </div>
          <label className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${tab}…`}
            />
          </label>
        </div>
        <div className="catalog-layout">
          <div className="record-list">
            {shownRecords.map(({ record, index }) => (
              <button
                type="button"
                key={`${record.id}-${index}`}
                className={`record-row ${selectedRecord === index ? "active" : ""}`}
                onClick={() => setSelectedRecord(index)}
              >
                <span className="record-thumb">
                  {record.image ? (
                    <img
                      src={`${import.meta.env.VITE_SITE_ORIGIN || "http://localhost:3000"}/${record.image.replace(/^\//, "")}`}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Icon>◇</Icon>
                  )}
                </span>
                <span className="record-copy">
                  <strong>{record.name}</strong>
                  <small>
                    {tab === "products"
                      ? `Product #${record.id} · Category ${record.categoryId}`
                      : `Collection #${record.id}`}
                  </small>
                </span>
                <span className="record-arrow">›</span>
              </button>
            ))}
            {!shownRecords.length && (
              <p className="empty-hint">No matching records.</p>
            )}
          </div>
          <div className="record-editor">
            {current ? (
              <>
                <div className="record-editor-title">
                  <div>
                    <span className="editor-kicker">
                      {titleCase(tab.slice(0, -1))} DETAILS
                    </span>
                    <h2>{current.name}</h2>
                  </div>
                  <div className="editor-head-actions">
                    <span className="record-id">ID {current.id}</span>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={onDelete}
                      aria-label={`Delete ${current.name}`}
                    >
                      ⌫
                    </button>
                  </div>
                </div>
                <div className="fields-wrap">
                  <FieldEditor value={current} onChange={onChange} />
                </div>
              </>
            ) : (
              <div className="empty-editor">
                Select a {tab === "products" ? "product" : "category"} to edit
                its details.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function MediaPage({ media, folders, assets, loading, siteOrigin, onCreateFolder, onUpload, onRename, onDelete }) {
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folderName, setFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);
  const references = media.map((source) => {
    const parts = source.split("/").filter(Boolean);
    const name = parts.length > 2 ? parts.at(-2) : "Other";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const folder = folders.find((item) => item.slug === slug);
    return { id: "ref:" + source, url: source.startsWith("/") ? source : "/" + source, fileName: source.split("/").at(-1), folderId: folder?.id ?? null, folderName: folder?.name || name, referenced: true };
  });
  const items = [...assets, ...references.filter((ref) => !assets.some((asset) => asset.url === ref.url))];
  const names = [...new Set(references.map((asset) => asset.folderName))];
  const folderItems = [
    { key: "all", name: "All media", count: items.length },
    ...folders.map((folder) => ({ key: "db:" + folder.id, name: folder.name, count: items.filter((item) => String(item.folderId) === String(folder.id)).length })),
    ...(assets.some((asset) => !asset.folderId) ? [{ key: "ref:Unfiled", name: "Unfiled", count: assets.filter((asset) => !asset.folderId).length }] : []),
    ...names.filter((name) => !folders.some((folder) => folder.name.toLowerCase() === name.toLowerCase())).map((name) => ({ key: "ref:" + name, name, count: references.filter((item) => item.folderName === name).length })),
  ];
  const visible = items.filter((item) => selectedFolder === "all" || (selectedFolder.startsWith("db:") ? String(item.folderId) === selectedFolder.slice(3) : item.folderName === selectedFolder.slice(4)));
  const selectedFolderId = selectedFolder.startsWith("db:") ? selectedFolder.slice(3) : null;
  async function submitFolder(event) {
    event.preventDefault();
    if (!folderName.trim()) return;
    setBusy(true); setMessage("");
    try {
      const folder = await onCreateFolder(folderName.trim());
      setFolderName(""); setSelectedFolder("db:" + folder.id); setMessage("Created “" + folder.name + "”.");
    } catch (error) { setMessage(error.message || "Could not create folder."); }
    finally { setBusy(false); }
  }
  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      setMessage(file.size > 8 * 1024 * 1024 ? "Images must be smaller than 8 MB." : "Choose an image file.");
      event.target.value = ""; return;
    }
    setBusy(true); setMessage("");
    try {
      let folderId = selectedFolderId;
      if (selectedFolder.startsWith("ref:")) {
        const folder = await onCreateFolder(selectedFolder.slice(4));
        folderId = folder.id;
        setSelectedFolder("db:" + folder.id);
      }
      await onUpload(folderId, file);
      setMessage("Uploaded “" + file.name + "”.");
    } catch (error) { setMessage(error.message || "Could not upload image."); }
    finally { setBusy(false); event.target.value = ""; }
  }
  async function renameAsset(asset) {
    const requestedName = window.prompt("Rename image", asset.fileName);
    if (!requestedName || requestedName.trim() === asset.fileName) return;
    try {
      await onRename(asset.id, requestedName.trim());
      setMessage("Image renamed to “" + requestedName.trim() + "”.");
    } catch (error) { setMessage(error.message || "Could not rename image."); }
  }
  async function deleteAsset(asset) {
    if (!window.confirm("Delete “" + asset.fileName + "” permanently? Any website content using this image may stop displaying it.")) return;
    try {
      await onDelete(asset.id);
      setMessage("Deleted “" + asset.fileName + "”.");
    } catch (error) { setMessage(error.message || "Could not delete image."); }
  }
  return (
    <>
      <PageHeader eyebrow="ASSET LIBRARY" title="Media library" description="Upload and organize company images in folders. Existing website images are grouped by their current folders."
        actions={<><input ref={fileInput} className="media-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={uploadFile} /><button className="secondary-button" type="button" disabled={busy} onClick={() => fileInput.current?.click()}>{busy ? "Working…" : "↑ Upload image"}</button></>} />
      <div className="media-toolbar">
        <form className="media-folder-form" onSubmit={submitFolder}>
          <input value={folderName} maxLength={120} placeholder="New folder name" aria-label="New folder name" onChange={(event) => setFolderName(event.target.value)} />
          <button className="primary-button" type="submit" disabled={busy || !folderName.trim()}>＋ Create folder</button>
        </form>
        <span className="media-secure-note">Company scoped · JPG, PNG, WebP, GIF, AVIF · 8 MB max</span>
      </div>
      {message && <p className="media-notice" role="status">{message}</p>}
      <div className="media-summary"><span className="media-count">{items.length}</span><div><strong>Images</strong><small>{folders.length} folders · {assets.length} uploaded · {media.length} referenced</small></div><span className="api-tag">TENANT SCOPED</span></div>
      <div className="media-workspace">
        <nav className="media-folders" aria-label="Media folders">{folderItems.map((folder) => <button type="button" className={selectedFolder === folder.key ? "selected" : ""} key={folder.key} onClick={() => setSelectedFolder(folder.key)}><span aria-hidden="true">{folder.key === "all" ? "▦" : "▰"}</span><span>{folder.name}</span><small>{folder.count}</small></button>)}</nav>
        <div className="media-content">{loading ? <p className="empty-hint">Loading media library…</p> : visible.length ? <div className="media-grid">{visible.map((asset) => {
          const imageUrl = asset.url.startsWith("http") ? asset.url : siteOrigin + asset.url;
          return <article className="media-card" key={asset.id || asset.url}><div className="media-preview"><img src={imageUrl} alt={asset.altText || asset.fileName} loading="lazy" onError={(event) => event.currentTarget.parentElement.classList.add("media-missing")} /><span className="media-missing-icon">▧</span></div><div className="media-meta"><strong>{asset.fileName}</strong><small>{asset.folderName || "Unfiled"} · {asset.referenced ? "Website image" : Math.max(1, Math.round((asset.fileSize || 0) / 1024)) + " KB"}</small><button type="button" onClick={() => navigator.clipboard?.writeText(asset.url.replace(/^\//, ""))}>Copy website path</button>{!asset.referenced && <div className="media-actions"><button type="button" onClick={() => renameAsset(asset)}>Rename</button><button type="button" className="danger" onClick={() => deleteAsset(asset)}>Delete</button></div>}</div></article>;
        })}</div> : <div className="media-empty">This folder is empty. Upload an image to add it here.</div>}</div>
      </div>
    </>
  );
}
function SitePage({ content, tab, setTab, onChange }) {
  const tabs = [
    "header",
    "navigation",
    "enquiryForm",
    "footer",
    "site",
    "company",
  ];
  const value = content[tab];
  return (
    <>
      <PageHeader
        eyebrow="GLOBAL WEBSITE CONTROLS"
        title="Site settings"
        description="Manage shared brand details, menus, calls to action and footer information."
      />
      <div className="content-toolbar">
        <div className="page-tabs">
          {tabs.map((item) => (
            <button
              type="button"
              className={tab === item ? "selected" : ""}
              key={item}
              onClick={() => setTab(item)}
            >
              {titleCase(item)}
            </button>
          ))}
        </div>
        <span className="section-count">Applies to {content.company.name}</span>
      </div>
      <section className="panel settings-panel">
        <div className="editor-panel-head">
          <div>
            <span className="editor-kicker">
              GLOBAL CONTENT / {tab.toUpperCase()}
            </span>
            <h2>{titleCase(tab)}</h2>
            <p>
              These settings are stored with this company and delivered by the
              content API.
            </p>
          </div>
          <span className="editable-pill">
            <i /> Tenant scoped
          </span>
        </div>
        <div className="fields-wrap">
          <FieldEditor
            value={value}
            onChange={(next) => onChange({ path: [tab], value: next })}
          />
        </div>
      </section>
    </>
  );
}
