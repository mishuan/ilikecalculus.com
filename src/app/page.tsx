import type { Metadata } from "next";
import { Suspense } from "react";
import { WorksIndex } from "@/components/works-index";
import { SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    description: SITE_DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <WorksIndex />
    </Suspense>
  );
}
