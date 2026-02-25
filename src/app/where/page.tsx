import { Suspense } from "react";
import { WherePage } from "@/components/where/where-page";
import { whereLocations } from "@/data/site-content";

export default function WhereRoutePage() {
  return (
    <Suspense fallback={null}>
      <WherePage initialLocations={whereLocations} />
    </Suspense>
  );
}
