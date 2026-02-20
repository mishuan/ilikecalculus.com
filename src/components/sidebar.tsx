"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, siteData } from "@/data/site-content";

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <Link href="/" className="sidebar__brand" aria-label="Go to homepage">
          <span className="sidebar__name">{siteData.site.shortName}</span>
          <span className="sidebar__tag">{siteData.site.tagline}</span>
        </Link>
      </div>

      <nav aria-label="Main navigation" className="sidebar__nav">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${isActive ? " nav-link--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__social">
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
    </aside>
  );
}
