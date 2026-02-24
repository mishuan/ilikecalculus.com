import { Suspense } from "react";
import { WorksIndex } from "@/components/works-index";

export default function WorksPage() {
  return (
    <Suspense fallback={null}>
      <WorksIndex />
    </Suspense>
  );
}
