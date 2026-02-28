"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { classNames } from "@/components/ui/class-names";
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
  const whereItem = navItems.find((item) => !("external" in item && item.external) && item.href === "/where");
  const topLinks = navItems.filter((item) => ("external" in item && item.external) || item.href !== "/where");
  const isWhereActive = isHydrated && (pathname === "/where" || pathname.startsWith("/where/"));

  if (isSlideshowView) {
    return null;
  }

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <nav aria-label="Main navigation" className="top-nav__links">
          {topLinks.map((item) => {
            const isExternal = "external" in item && item.external;
            const isActive =
              !isExternal &&
              isHydrated &&
              (item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`));

            if (isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames("nav-link", isActive && "nav-link--active")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="top-nav__brand" aria-label="Go to homepage">
          <Image
            src="/branding/ilikecalculus-logo-no-text.png"
            alt=""
            width={1028}
            height={420}
            className="top-nav__logo-mark"
            priority
          />
          <Image
            src="/branding/ilikecalculus-website-logo.png"
            alt=""
            width={620}
            height={620}
            className="top-nav__logo-icon"
            priority
          />
        </Link>

        <div className="top-nav__identity">
          {whereItem ? (
            <Link
              href={whereItem.href}
              className={classNames("nav-link", "top-nav__where", isWhereActive && "nav-link--active")}
            >
              {whereItem.label}
            </Link>
          ) : null}
          <span className="top-nav__name">{siteData.site.name}</span>
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
