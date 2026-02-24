import { Suspense } from "react";
import { WorksIndex } from "@/components/works-index";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <WorksIndex />
    </Suspense>
  );
}
