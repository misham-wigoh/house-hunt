# House Hunt

House Hunt is a real estate portal for buying, renting and selling property in India. It is a headless site: the pages are built with Next.js, and all content (listings, projects, builders, cities, blog posts) lives in WordPress.

## Features

- **Home (`/`)**: hero search with a rotating banner, quick links, featured projects, rentals, popular localities, commercial spaces, top builders, property services and a city directory.
- **Search (`/properties`)**: filters for type, BHK, budget and possession, sorting, listing cards with a shortlist heart, and a "Contact Seller" form.
- **Property page (`/property/[slug]`)**: photo gallery, price and specification details, amenities, nearby places, floor plan, dealer details, an EMI calculator and enquiry forms.
- **Projects (`/project/[slug]`)**: project details with an enquiry form.
- **Blog (`/blog`, `/blog/[slug]`)**: articles managed in WordPress.
- **Post Property (`/post-property`)**: a 6-step form for owners, brokers and builders. Photos, floor plan, amenities, highlights and nearby places are included. Submissions arrive in WordPress as **Pending Review**.
- **Login and shortlist**: login with an emailed 6-digit code. Logged-in members can save properties at `/account/shortlist`, and the forms pre-fill their name and email.
- **Services (`/services/...`)**: home loan, legal verification, property valuation and rent agreement enquiries.
- **Also**: About, Terms, `sitemap.xml` and `robots.txt`.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 and Lucide icons
- WordPress with WPGraphQL, WPGraphQL for ACF, ACF PRO and Custom Post Type UI
- Brevo (transactional email) for login codes

## Getting started

Requirements: Node.js 20 or newer and a WordPress site set up as described below.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Runs the TypeScript checker |
| `npm run build` | Builds for production |
| `npm start` | Serves the production build |
| `npm run check` | Lint, typecheck and build together |

## Environment variables

Keep `.env.local` private. It is git-ignored.

| Variable | Purpose |
|---|---|
| `WORDPRESS_GRAPHQL_URL` | Public WPGraphQL endpoint of your WordPress site (no credentials) |
| `REVALIDATE_SECRET` | Secret WordPress sends to `/api/revalidate` to refresh pages when content changes |
| `WORDPRESS_SUBMIT_SECRET` | Shared secret between this site and the WordPress submissions plugin |
| `AUTH_SECRET` | Signs login cookies. Use a long random value: `openssl rand -base64 48` |
| `AUTH_DEV_MODE` | `true` only on your own computer: the login code is shown on screen instead of emailed. It is ignored on any host except `localhost` |
| `EMAIL_PROVIDER` | How login codes are emailed: `brevo` (recommended), `resend` or `wordpress` |
| `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` | Brevo key and the verified sender shown on the email |

On a live server, set a new `AUTH_SECRET` and leave `AUTH_DEV_MODE` off.

## How it works

**Content.** Pages are server components that read WordPress through GraphQL (`src/lib/cms/`). Results are cached for 5 minutes and refreshed on demand. WordPress can call `POST /api/revalidate` with `{ "secret": "...", "tag": "listings" }`. The tags are `listings`, `projects`, `builders`, `insights`, `banners`, `cities` and `localities`. Leave the tag out to refresh everything.

**Forms.** The Post Property form and the enquiry forms post to this site's own API routes. The server forwards them to a WordPress plugin (`acres-submit`) with the shared secret. The plugin saves:
- listings as Pending Review, with every answer in its matching ACF field,
- enquiries in a private Enquiries inbox,
- members and their shortlists in a private Members list.

Phone numbers, emails and WhatsApp numbers are stored privately and are never exposed through GraphQL or REST.

**Login.** A visitor enters an email and receives a 6-digit code that expires after 5 minutes. A wrong code can be tried 5 times, and there are limits per email and per IP address. After a correct code, the server sets a signed, httpOnly cookie that lasts 30 days. Codes are not stored anywhere (`src/lib/auth/`).

## WordPress setup

The site expects these on the WordPress side:

1. Plugins: WPGraphQL, WPGraphQL for ACF, ACF PRO, Custom Post Type UI and the submissions plugin `acres-submit`.
2. Post types: property listings, projects, builders, dealers, blog posts, city and locality pages, enquiries and members.
3. ACF field groups for listings, with taxonomies for city, locality, type, BHK, status, possession, amenities and furnishing.
4. The same secret in the plugin and in `WORDPRESS_SUBMIT_SECRET`.

## Project structure

```
src/
  app/
    page.tsx                  Home
    properties/               Search and filters
    property/[slug]/          Property page
    project/[slug]/           Project page
    blog/                     Blog list and article
    post-property/            6-step Post Property form
    account/shortlist/        Saved properties
    services/                 Service enquiry pages
    about/, terms/            Static pages
    api/
      auth/                   Login routes: request-otp, verify-otp, me, logout, profile, shortlist
      post-property/          Receives the Post Property form
      enquiry/                Receives enquiry forms
      revalidate/             Refreshes cached pages from WordPress
    layout.tsx, globals.css, sitemap.ts, robots.ts
  components/
    auth/                     Login box and login state
    sites/house-hunt/         Header, footer, hero search, cards and page sections
  lib/
    cms/                      WordPress client, queries, mappers, types, form submission
    auth/                     Codes, cookies, email sending, member calls
    enquiry.ts                Enquiry form helper
    post-property-options.ts  Choices used by the Post Property form
```

## Security notes

- Secrets live only in `.env.local` and on the server. Never commit them or paste them into chat.
- The login cookie is httpOnly, and requests from other sites are rejected.
- Submitted listings are never public until staff publish them in WordPress.
- Form pages include a hidden anti-spam field and per-IP limits.
