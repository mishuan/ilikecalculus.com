import type { Metadata } from "next";
import { Suspense } from "react";
import { WherePage } from "@/components/where/where-page";
import { whereLocations } from "@/data/site-content";

const description = "Follow where Michael Yuan is currently traveling and photographing.";

export const metadata: Metadata = {
  title: "Where Is",
  description,
  alternates: {
    canonical: "/where",
  },
  openGraph: {
    url: "/where",
    title: "Where Is",
    description,
  },
  twitter: {
    title: "Where Is",
    description,
  },
};

export default function WhereRoutePage() {
  return (
    <Suspense fallback={null}>
      <WherePage initialLocations={whereLocations} />
    </Suspense>
  );
}
