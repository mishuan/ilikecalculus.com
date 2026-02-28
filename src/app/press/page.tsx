import type { Metadata } from "next";
import { PressList } from "@/components/press/press-list";
import type { PressItem } from "@/data/site-content";
import workspaceContent from "../../../content/workspace.json";

const description = "Press coverage and features on Michael Yuan's photography projects.";

export const metadata: Metadata = {
  title: "Press",
  description,
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    url: "/press",
    title: "Press",
    description,
  },
  twitter: {
    title: "Press",
    description,
  },
};

export default function PressPage() {
  const pressItems = workspaceContent.press as PressItem[];

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Press Coverage</h1>
      </header>

      <PressList items={pressItems} />
    </section>
  );
}
