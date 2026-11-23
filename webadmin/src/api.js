import seedContent from "./data/site-content.json";

const API_URL = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
const DEMO_AUTH_KEY = "arbuda.webadmin.session";

export const getDemoCompanies = () => [
  {
    company_id: "A1B1",
    company_name: "Arbuda Bangles",
    domain: "abbangles.com",
  },
  {
    company_id: "demo-store",
    company_name: "Demo Store",
    domain: "example.com",
  },
];

async function request(path, { companyId, token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(companyId ? { "X-Company-Id": companyId } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export async function login(email, password) {
  if (API_URL)
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  if (!email.trim() || !password)
    throw new Error("Enter your email and password.");
  const session = {
    access_token: "demo-session",
    user: { name: email.split("@")[0], email, role: "Content administrator" },
  };
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(DEMO_AUTH_KEY);
}

export async function getCompanies(token) {
  if (API_URL) return request("/companies", { token });
  return getDemoCompanies();
}

export async function getContent(companyId, token) {
  if (API_URL) {
    return request(`/companies/${encodeURIComponent(companyId)}/content`, {
      companyId,
      token,
    });
  }
  const saved = localStorage.getItem(`arbuda.content.${companyId}`);
  if (saved) return JSON.parse(saved);
  return {
    ...structuredClone(seedContent),
    company: {
      ...seedContent.company,
      id: companyId,
      name:
        companyId === seedContent.company.id
          ? seedContent.company.name
          : "Demo Store",
    },
  };
}

export async function saveContent(companyId, content, token) {
  const payload = {
    ...content,
    company: { ...content.company, id: companyId },
  };
  if (API_URL) {
    return request(`/companies/${encodeURIComponent(companyId)}/content`, {
      method: "PUT",
      companyId,
      token,
      body: JSON.stringify(payload),
    });
  }
  localStorage.setItem(`arbuda.content.${companyId}`, JSON.stringify(payload));
  return payload;
}

export async function getMedia(companyId, token) {
  if (!API_URL) return { folders: [], assets: [] };
  return request(`/companies/${encodeURIComponent(companyId)}/media`, {
    companyId,
    token,
  });
}

export async function createMediaFolder(companyId, name, token) {
  return request(`/companies/${encodeURIComponent(companyId)}/media/folders`, {
    method: "POST",
    companyId,
    token,
    body: JSON.stringify({ name }),
  });
}

export async function uploadMedia(companyId, folderId, file, token) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return request(`/companies/${encodeURIComponent(companyId)}/media/upload`, {
    method: "POST",
    companyId,
    token,
    body: JSON.stringify({
      folderId,
      fileName: file.name,
      mimeType: file.type,
      base64: btoa(binary),
    }),
  });
}

export async function renameMedia(companyId, assetId, fileName, token) {
  return request(`/companies/${encodeURIComponent(companyId)}/media/assets/${encodeURIComponent(assetId)}`, {
    method: "PATCH",
    companyId,
    token,
    body: JSON.stringify({ fileName }),
  });
}

export async function deleteMedia(companyId, assetId, token) {
  return request(`/companies/${encodeURIComponent(companyId)}/media/assets/${encodeURIComponent(assetId)}`, {
    method: "DELETE",
    companyId,
    token,
  });
}

export const isDemoMode = !API_URL;
