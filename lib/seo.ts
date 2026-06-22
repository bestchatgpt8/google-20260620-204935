export const siteUrl = "https://googlesql.com";

export type PublicRoute = {
  path: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

export const publicRoutes: PublicRoute[] = [
  {
    path: "",
    lastModified: "2026-06-21",
    changeFrequency: "weekly",
    priority: 1
  },
  {
    path: "/tools",
    lastModified: "2026-06-21",
    changeFrequency: "weekly",
    priority: 0.9
  },
  {
    path: "/tutorials",
    lastModified: "2026-06-19",
    changeFrequency: "monthly",
    priority: 0.85
  },
  {
    path: "/docs",
    lastModified: "2026-06-22",
    changeFrequency: "weekly",
    priority: 0.9
  },
  {
    path: "/cheat-sheets",
    lastModified: "2026-06-19",
    changeFrequency: "monthly",
    priority: 0.85
  },
  {
    path: "/pricing",
    lastModified: "2026-06-21",
    changeFrequency: "monthly",
    priority: 0.6
  }
];

export const privateRobotsPaths = [
  "/admin",
  "/login",
  "/api/",
  "/api/auth/",
  "/_next/"
];
