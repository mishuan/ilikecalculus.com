import type { MetadataRoute } from "next";
import { projects } from "@/data/site-content";
import { SITE_URL } from "@/lib/seo";

function toUrl(pathname: string) {
  return `${SITE_URL}${pathname}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: toUrl("/press"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: toUrl("/where"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const projectPaths = new Set(
    projects.flatMap((project) =>
      project.categories.flatMap((category) => [
        `/works/${category}/${project.slug}`,
        `/works/${category}/${project.slug}/thumbnails`,
      ]),
    ),
  );

  const projectRoutes: MetadataRoute.Sitemap = [...projectPaths].map((path) => ({
    url: toUrl(path),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
