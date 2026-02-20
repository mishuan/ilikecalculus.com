import { redirect } from "next/navigation";
import { siteData } from "@/data/site-content";

export default function BlogRedirectPage() {
  redirect(siteData.site.blogUrl);
}
