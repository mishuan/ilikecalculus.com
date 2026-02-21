"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
};

export function Reveal({
  children,
  className = "",
  rootMargin = "0px 0px -80px",
  threshold = 0.14,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={`reveal${visible ? " is-visible" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
