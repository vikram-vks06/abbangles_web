import Storefront from "../storefront";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const content = await getSiteContent();
  const { slug = [] } = await params;
  const pageKey = slug[0] || "home";
  const page = content.pages?.[pageKey] || content.pages?.home;
  return {
    title: page?.title ? `${page.title} | ${content.company?.name || ""}` : content.site?.title || "Website",
    description: page?.description || content.site?.description || "",
  };
}

export default async function Page() {
  const content = await getSiteContent();
  return <Storefront initialContent={content} />;
}
