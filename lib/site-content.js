const contentUrl =
  process.env.NEXT_PUBLIC_CONTENT_API_URL ||
  `${process.env.NEXT_PUBLIC_CONTENT_API_BASE || "http://127.0.0.1:5000/public/v1"}/companies/${encodeURIComponent(process.env.NEXT_PUBLIC_COMPANY_ID || "A1B1")}/content`;

export async function getSiteContent() {
  const response = await fetch(contentUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Content API returned ${response.status}`);
  }
  return response.json();
}
