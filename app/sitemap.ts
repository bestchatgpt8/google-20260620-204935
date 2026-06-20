import type { MetadataRoute } from "next";

const routes = ["", "/tools", "/tutorials", "/cheat-sheets", "/pricing"];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://googlesql.com${route}`,
    lastModified: new Date("2026-06-19"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8
  }));
}
