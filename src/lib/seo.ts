import { siteData } from "@/data/site-content";

export const SITE_URL = "https://ilikecalculus.com";
export const SITE_NAME = siteData.site.name;
export const SITE_TAGLINE = siteData.site.tagline;
export const SITE_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION = "Building software and making art. A photography portfolio by Michael Yuan.";

export const DEFAULT_OG_IMAGE = {
  url: "/media/projects/the-bridge-reconstructed/15.jpg",
  width: 2500,
  height: 1250,
  alt: "The Bridge by Michael Yuan",
} as const;
