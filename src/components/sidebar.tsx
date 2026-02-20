"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { navItems, siteData } from "@/data/site-content";

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isSlideshowView = /^\/works\/[^/]+\/[^/]+\/?$/.test(pathname);

  if (isSlideshowView) {
    return null;
  }

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <nav aria-label="Main navigation" className="top-nav__links">
          {navItems.map((item) => {
            const isExternal = "external" in item && item.external;
            const isActive =
              !isExternal &&
              isHydrated &&
              (item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`));

            if (isExternal) {
              return (
                <a key={item.label} href={item.href} className="nav-link">
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={`nav-link${isActive ? " nav-link--active" : ""}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="top-nav__identity">
          <Link href="/" className="top-nav__brand" aria-label="Go to homepage">
            <span className="top-nav__name">{siteData.site.shortName}</span>
          </Link>
          <a
            href={siteData.site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Instagram"
            className="instagram-link"
          >
            <InstagramIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
