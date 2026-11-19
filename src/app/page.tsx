import { Header } from "@/components/sites/house-hunt/header";
import { HeroSearch } from "@/components/sites/house-hunt/hero-search";
import { QuickLinks } from "@/components/sites/house-hunt/quick-links";
import { FeaturedProjects } from "@/components/sites/house-hunt/featured-projects";
import { RentalShowcase } from "@/components/sites/house-hunt/rental-showcase";
import { PopularLocalities } from "@/components/sites/house-hunt/popular-localities";
import { CommercialShowcase } from "@/components/sites/house-hunt/commercial-showcase";
import { TopBuilders } from "@/components/sites/house-hunt/top-builders";
import { PropertyServices } from "@/components/sites/house-hunt/property-services";
import { MarketInsights } from "@/components/sites/house-hunt/market-insights";
import { AppBanner } from "@/components/sites/house-hunt/app-banner";
import { CityDirectory } from "@/components/sites/house-hunt/city-directory";
import { Footer } from "@/components/sites/house-hunt/footer";
import {
  getAllProjects,
  getCities,
  getCommercialListingPool,
  getFeaturedBuilders,
  getFeaturedCommercialListings,
  getFeaturedProjects,
  getFeaturedRentalListings,
  getHeroBanners,
  getInsights,
  getListings,
  getLocalities,
  getRentalListingPool,
  getSearchOptions,
} from "@/lib/cms/data";

export default async function Home() {
  const [
    banners,
    searchOptions,
    projects,
    rentals,
    localities,
    commercial,
    builders,
    insights,
    cities,
    listings,
    allProjects,
    rentalPool,
    commercialPool,
  ] = await Promise.all([
    getHeroBanners(),
    getSearchOptions(),
    getFeaturedProjects(),
    getFeaturedRentalListings(4),
    getLocalities(),
    getFeaturedCommercialListings(),
    getFeaturedBuilders(),
    getInsights(4),
    getCities(),
    getListings(),
    getAllProjects(),
    getRentalListingPool(4),
    getCommercialListingPool(),
  ]);

  return (
    <div className="min-h-dvh bg-white flex flex-col font-sans antialiased text-[#262626] selection:bg-[#008ae8] selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 bg-white">
        {/* Hero Section with Tabs & Search Filter */}
        <HeroSearch slides={banners} searchOptions={searchOptions} />

        {/* Quick Utility Feature Bar */}
        <QuickLinks />

        {/* Featured Residential Projects & Gated Townships */}
        <FeaturedProjects projects={projects} pool={allProjects} />

        {/* Verified Homes & Flats for Rent */}
        <RentalShowcase listings={rentals} pool={rentalPool} />

        {/* Locality Insights & Capital Appreciation Rates */}
        <PopularLocalities localities={localities} />

        {/* Commercial Real Estate, Offices & Retail */}
        <CommercialShowcase listings={commercial} pool={commercialPool} />

        {/* Top Reputed Builders & Developers in India */}
        <TopBuilders builders={builders} />

        {/* Real Estate Financial & Legal Services */}
        <PropertyServices />

        {/* Market Research, News & Investment Trends */}
        <MarketInsights articles={insights} />

        {/* Mobile App Promotion & QR Code */}
        <AppBanner />

        {/* Pan-India Cities Network Directory */}
        <CityDirectory cities={cities} listings={listings} projects={projects} />
      </main>

      {/* House Hunt Global Footer */}
      <Footer />
    </div>
  );
}
