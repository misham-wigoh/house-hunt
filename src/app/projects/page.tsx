import type { Metadata } from "next";
import { getAllProjects } from "@/lib/cms/data";
import { ProjectsClient } from "./projects-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "New Builder Projects in India | Apartments, Villas & Plotted Townships",
  description:
    "Explore new launch and ready-to-move builder projects across India: apartments, villas and plotted townships with starting prices, possession dates and builder details on House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
  openGraph: {
    title: "New Builder Projects in India - House Hunt .com",
    description: "Browse new builder projects, apartments, villas and plotted townships across India on House Hunt .com.",
    url: `${siteUrl}/projects`,
    type: "website",
  },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <ProjectsClient projects={projects} />
    </>
  );
}
