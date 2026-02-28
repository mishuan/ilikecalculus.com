import type { Metadata } from "next";
import { Suspense } from "react";
import { WorksIndex } from "@/components/works-index";

const description = "Browse photography projects by Michael Yuan across personal, film, and portrait work.";

export const metadata: Metadata = {
  title: "Works",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "Works",
    description,
  },
  twitter: {
    title: "Works",
    description,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function WorksPage() {
  return (
    <Suspense fallback={null}>
      <WorksIndex />
    </Suspense>
  );
}
