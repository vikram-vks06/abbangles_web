import { getSiteContent } from "./site-content";

export async function getCatalog() {
  const content = await getSiteContent();
  return content.collections;
}
