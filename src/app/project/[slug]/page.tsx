import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { ReraBadge } from "@/components/sites/house-hunt/icons";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { getProjectBySlug, getProjectSlugs } from "@/lib/cms/data";
import { ProjectEnquiry } from "./project-enquiry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  const title = `${project.name} by ${project.builder} in ${project.city}`;
  const description = `${project.name} in ${[project.location, project.city].filter(Boolean).join(", ")}. Configurations: ${project.bhk}. Possession: ${project.possession}. Pricing: ${project.price}. 100% RERA verified builder project on House Hunt .com.`;
  const canonicalUrl = `${siteUrl}/project/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: project.image ? [{ url: project.image, alt: project.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const projectUrl = `${siteUrl}/project/${slug}`;
  const images = [project.image, ...project.gallery].filter((u): u is string => Boolean(u));
  const specs = [
    { label: "Configurations", value: project.bhk },
    { label: "Possession", value: project.possession },
    { label: "Price per sq.ft", value: project.pricePerSqFt },
    { label: "Developer", value: project.builder },
  ].filter((s) => s.value);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${siteUrl}/properties?tab=new-projects`,
      },
      ...(project.city
        ? [
          {
            "@type": "ListItem",
            position: 3,
            name: project.city,
            item: `${siteUrl}/properties?city=${encodeURIComponent(project.city)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: project.name,
            item: projectUrl,
          },
        ]
        : [
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
            item: projectUrl,
          },
        ]),
    ],
  };

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "HousingComplex",
    name: project.name,
    description: project.overview.join(" ") || `${project.name} by ${project.builder}`,
    url: projectUrl,
    image: images.length > 0 ? images : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.location,
      addressLocality: project.location,
      addressRegion: project.city,
      addressCountry: "IN",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      price: project.price,
    },
  };

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <Header />

      <div className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center gap-2 text-xs text-[#757577]">
          <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
          <span>/</span>
          <span className="font-semibold text-[#262626]">{project.name}</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 flex-1 w-full space-y-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#aeaeaf]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {project.tag && (
                <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#1c1c1e] text-white">{project.tag}</span>
              )}
              {project.rera && <ReraBadge reraId={project.rera} />}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">{project.name}</h1>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#757577] mt-1">
              <MapPin className="w-4 h-4 text-[#008ae8] shrink-0" />
              <span>{[project.location, project.city].filter(Boolean).join(", ")}</span>
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-[#757577] block font-medium uppercase">Price</span>
            <span className="text-2xl sm:text-3xl font-light text-[#262626] block">{project.price}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {images.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-[#aeaeaf]/40 space-y-3">
                <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-[#fafafa]">
                  <CmsImage src={images[0]} alt={project.name} priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((img, idx) => (
                      <div key={img} className="relative aspect-16/10 rounded-lg overflow-hidden bg-[#fafafa]">
                        <CmsImage src={img} alt={`${project.name} photo ${idx + 2}`} sizes="25vw" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {specs.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                <h2 className="text-base font-medium text-[#262626] mb-4">Project Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-[#fafafa]">
                      <span className="text-[#757577] block text-[11px] uppercase font-medium">{s.label}</span>
                      <strong className="text-sm font-medium text-[#262626] block truncate">{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.overview.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40 space-y-3">
                <h2 className="text-base font-medium text-[#262626]">Project Overview</h2>
                {project.overview.map((p, i) => (
                  <p key={i} className="text-sm text-[#757577] leading-relaxed">{p}</p>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40 sticky top-20">
              <h3 className="text-base font-medium text-[#262626]">Contact {project.builder || "the Developer"}</h3>
              <p className="text-xs text-[#757577] mt-1 mb-4">
                Get the price list, floor plans and book a private site visit.
              </p>
              <ProjectEnquiry builder={project.builder} projectName={project.name} projectId={project.id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
