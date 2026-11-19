import type { MetadataRoute } from "next";
import { getListingSlugs, getProjectSlugs, getAllInsights, getCities } from "@/lib/cms/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties?type=commercial`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/properties?intent=rent`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/services/home-loan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/legal-verification`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/rent-agreement`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/property-valuation`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/post-property`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const [listingSlugs, projectSlugs, articles, cities] = await Promise.all([
      getListingSlugs().catch(() => []),
      getProjectSlugs().catch(() => []),
      getAllInsights().catch(() => []),
      getCities().catch(() => []),
    ]);

    const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
      url: `${baseUrl}/property/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
      url: `${baseUrl}/project/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => {
      const parsedDate = article.date ? new Date(article.date) : now;
      const validDate = isNaN(parsedDate.getTime()) ? now : parsedDate;
      return {
        url: `${baseUrl}/blog/${article.id}`,
        lastModified: validDate,
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${baseUrl}/properties?city=${encodeURIComponent(city.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...listingRoutes, ...projectRoutes, ...blogRoutes, ...cityRoutes];
  } catch {
    return staticRoutes;
  }
}
