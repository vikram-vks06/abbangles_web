import { getSiteContent } from "../../../lib/site-content";

export async function GET() {
  const content = await getSiteContent();
  const categories = Array.isArray(content.collections?.categories)
    ? content.collections.categories.filter(
        (category) => category.visible !== false,
      )
    : [];

  return Response.json(
    { categories },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
