# 99acres.com — Standalone Real Estate Portal

A high-performance, pixel-perfect clone of **[99acres.com](https://www.99acres.com/)** (India's No. 1 Property Portal), built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript.

## Key Routes & Features
- **Homepage (`/`):** Hero search with 6 intent tabs (Buy, Rent, New Projects, Commercial, Plots, PG), locality auto-complete, city selector, curated high-rises, locality price trends, commercial properties, top builders, property services, app download banner, and full directory footer.
- **Properties Search Results (`/properties`):** Live filter sidebar (BHK, Budget, Possession, Verified Only), dynamic sorting, property cards, and instant "Contact Seller" modal.
- **Post Free Property Ad (`/post-property`):** 4-step wizard for individual owners and builders (Intent, Specs, Pricing/Photos, Contact verification) with instant listing ID generation.
- **Property Detail View (`/property/[id]`):** Photo gallery, price break-up, interactive Home Loan EMI Calculator with range sliders, amenities checklist, locality landmark distances, and builder enquiry lead form.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI Primitives:** shadcn/ui base, Lucide React icons, Tailwind CSS v4
- **Design Tokens:** 99acres brand blue (`#0078DB`), navy text, emerald verification tags, and amber accents

## Quick Start

### 1. Install Dependencies
```bash
npm install
```
*(Note: `node_modules` is already pre-copied and ready to use)*

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Verify
```bash
npm run check
# Runs: npm run lint && npm run typecheck && npm run build
```

### 4. Production Start
```bash
npm run build
npm start
```

## Project Structure
```
src/
  app/
    globals.css             # Tailwind v4 tokens & 99acres color scheme
    layout.tsx              # Root layout & OpenGraph metadata
    page.tsx                # 99acres Homepage
    properties/page.tsx     # Property Search & Filter Results (SERP)
    post-property/page.tsx  # Post Free Property Ad 4-step wizard
    property/[id]/page.tsx  # Property & Project Detail View with EMI Tool
  components/
    header.tsx              # City dropdown, navigation tabs, mobile menu, login modal
    hero-search.tsx         # Category tabs, locality autocomplete, filters
    quick-links.tsx         # Fast shortcut feature cards
    featured-projects.tsx   # Curated residential developments
    popular-localities.tsx  # Locality price trends & capital growth metrics
    commercial-showcase.tsx # Corporate offices, retail spaces & tech parks
    top-builders.tsx        # India's premier developers (DLF, Godrej, Prestige, Sobha)
    property-services.tsx   # Home loans, legal checks, valuation, rent agreement
    market-insights.tsx     # Real estate research articles & trends
    app-banner.tsx          # Mobile app promotion & QR code
    city-directory.tsx      # Pan-India 12-city network
    footer.tsx              # Multi-column directory & Info Edge network
    icons.tsx               # 99acres logo & RERA badges
    ui/                     # shadcn/ui primitives
  lib/
    utils.ts                # cn() class utility
public/
  logos/                    # 99acres official brand mark
  images/                   # 15 high-res architectural images
docs/
  brief.md                  # Complete design and technical specification
```

## Brand Design Tokens
- **Brand Blue:** `#0078DB`
- **Brand Blue Hover:** `#0060AE`
- **Dark Navy:** `#151C21`
- **Page Background:** `#F4F5F7`
- **Verified Green:** `#008459`
- **Accent Orange:** `#F95C19`

## Content (headless WordPress)

All listings, projects, builders, localities, cities, insights and hero banners come from WordPress through WPGraphQL. Nothing is hard-coded in `src/`.

- Copy `.env.example` to `.env.local` and fill it in. `WORDPRESS_GRAPHQL_URL` is the public endpoint (no credentials). The other values are secrets: keep them out of git and out of chat.
- The data layer is in `src/lib/cms/` (`client.ts`, `queries.ts`, `mappers.ts`, `data.ts`). Pages are server components with 5-minute ISR.
- To refresh on publish, have WordPress POST `{ "secret": "...", "tag": "listings" }` to `/api/revalidate` (tags: `listings`, `projects`, `builders`, `insights`, `banners`, `cities`, `localities`, or omit for all).
- The content model (ACF field groups) is imported from `wordpress/import/acf-property-details.json`.
- The WordPress plugin `wordpress/acres-submit` receives the Post Property form, the enquiry forms and member login. Listings arrive as Pending Review, and contact details stay private in WordPress. Its shared secret lives in `wordpress/acres-submit/secret.php` (git-ignored) and must equal `WORDPRESS_SUBMIT_SECRET`.
- Login is by emailed 6-digit code (`src/lib/auth/`). Codes are sent through Brevo (`EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`, `EMAIL_FROM`). Set `AUTH_SECRET`; use `AUTH_DEV_MODE=true` on localhost only, where the code is shown on screen instead of emailed.
