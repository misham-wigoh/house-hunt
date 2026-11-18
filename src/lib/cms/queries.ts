/**
 * GraphQL documents. Field names come from the House Hunt content model in WordPress
 * (ACF field groups and CPT UI post types, exposed through WPGraphQL).
 * Contact phone, email, WhatsApp and commission are intentionally NOT exposed
 * by WordPress, so they cannot be queried here.
 */

const MEDIA = `sourceUrl altText`;

const LISTING_CARD = `
  databaseId
  slug
  title
  featuredImage { node { ${MEDIA} } }
  propertyBasicInfo {
    propertyRef listingType propertyPrice propertyPriceType priceOnRequest
    pricePerSqft isVerified listingBadge featuredOnHome possessionLabel
  }
  propertySpecs {
    areaLabel builtUpArea bedrooms floorLabel furnishingStatus furnishingNotes reraNumber
  }
  propertyLocation { societyName locationLine }
  propertyContact { brokerName }
  propertyDetails {
    localityPriceChange
    propertyDealer { nodes { ... on Dealer { title } } }
  }
  propertyCities { nodes { name slug } }
  propertyLocalities { nodes { name slug } }
  propertyTypes { nodes { name slug } }
  propertyStatuses { nodes { name } }
`;

export const LISTINGS_QUERY = `
  query Listings($after: String) {
    propertyListings(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ${LISTING_CARD} }
    }
  }
`;

export const LISTING_SLUGS_QUERY = `
  query ListingSlugs($after: String) {
    propertyListings(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug }
    }
  }
`;

export const LISTING_DETAIL_QUERY = `
  query ListingDetail($slug: ID!) {
    propertyListing(id: $slug, idType: SLUG) {
      ${LISTING_CARD}
      content
      date
      propertyBasicInfo {
        propertyRef listingType propertyPrice propertyPriceType priceOnRequest priceNegotiable
        pricePerSqft isVerified listingBadge featuredOnHome possessionLabel shortDescription
        propertyBuilder { nodes { ... on Builder { slug title } } }
      }
      propertySpecs {
        areaLabel builtUpArea bedrooms floorLabel furnishingStatus furnishingNotes reraNumber
        propertyFacing parkingSpaces
      }
      propertyDetails {
        ownershipType approvedBy gatedSociety openSides cornerProperty facingRoadWidth
        floorsAllowed overlooking boundaryWall constructionDone plotLength plotWidth priceNote
        highlights { highlight }
        localityPriceChange
        priceHistory { period avgRate }
        propertyDealer {
          nodes {
            ... on Dealer {
              title
              dealerInfo {
                dealerCompany dealerReraRegistered dealerReraId dealerExperience
                dealerLocalities dealerAbout dealerAddress
              }
            }
          }
        }
      }
      propertyConnectivity { connectivity { landmark distance category } }
      propertyMedia { propertyGallery { nodes { ${MEDIA} } } propertyVideo }
      propertyMedia { propertyGallery { nodes { ${MEDIA} } } }
      propertyAmenities(first: 50) { nodes { name } }
    }
  }
`;

export const PROJECTS_QUERY = `
  query Projects($after: String) {
    propertyProjects(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId
        slug
        title
        content
        featuredImage { node { ${MEDIA} } }
        propertyCities { nodes { name } }
        projectInfo {
          projectBuilder { nodes { ... on Builder { slug title } } }
          projectTag locationLine priceMin priceMax pricePerSqft unitConfigurations
          possessionLabel projectReraNumber featuredOnHome
          projectGallery { nodes { ${MEDIA} } }
        }
      }
    }
  }
`;

export const PROJECT_DETAIL_QUERY = `
  query ProjectDetail($slug: ID!) {
    propertyProject(id: $slug, idType: SLUG) {
      slug
      title
      content
      featuredImage { node { ${MEDIA} } }
      propertyCities { nodes { name } }
      projectInfo {
        projectBuilder { nodes { ... on Builder { slug title } } }
        projectTag locationLine priceMin priceMax pricePerSqft unitConfigurations
        possessionLabel projectReraNumber featuredOnHome
        projectGallery { nodes { ${MEDIA} } }
      }
    }
  }
`;

export const BUILDERS_QUERY = `
  query Builders($after: String) {
    builders(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        slug
        title
        propertyCities { nodes { name } }
        builderInfo {
          builderTagline experienceLabel builderInitials brandColor brandTextColor
          establishedYear totalProjects displayOrder isFeatured
          builderLogo { node { ${MEDIA} } }
        }
      }
    }
  }
`;

export const INSIGHTS_QUERY = `
  query Insights($after: String) {
    marketInsights(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        slug
        title
        date
        content
        featuredImage { node { ${MEDIA} } }
        insightCategories { nodes { name slug } }
        insightInfo { insightSummary readTime reportSource }
      }
    }
  }
`;

export const INSIGHT_DETAIL_QUERY = `
  query InsightDetail($slug: ID!) {
    marketInsight(id: $slug, idType: SLUG) {
      slug
      title
      date
      content
      featuredImage { node { ${MEDIA} } }
      insightCategories { nodes { name slug } }
      insightInfo { insightSummary readTime reportSource }
    }
  }
`;

export const BANNERS_QUERY = `
  query Banners($after: String) {
    homepageBanners(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        slug
        title
        bannerInfo {
          bannerLocality bannerCity bannerBadge bannerPrice bannerSpecs bannerShortName
          bannerDesktopImage { node { ${MEDIA} } }
          displayOrder bannerActive
        }
      }
    }
  }
`;

export const CITIES_QUERY = `
  query Cities($after: String) {
    propertyCities(first: 100, after: $after, where: { hideEmpty: false }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId
        name
        slug
        count
        cityInfo {
          cityDisplayName cityShortCode cityTagline cityCountLabel
          cityDisplayOrder showInHeader showInDirectory
        }
      }
    }
  }
`;

export const LOCALITIES_QUERY = `
  query Localities($after: String) {
    propertyLocalities(first: 100, after: $after, where: { hideEmpty: false }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId
        name
        slug
        count
        localityInfo {
          localityCity { nodes { name } }
          averagePriceSqft priceChangePercent localityTag localityDisplayOrder
          localityImage { node { ${MEDIA} } }
        }
      }
    }
  }
`;

export const PROPERTY_TYPES_QUERY = `
  query PropertyTypes($after: String) {
    propertyTypes(first: 100, after: $after, where: { hideEmpty: false }) {
      pageInfo { hasNextPage endCursor }
      nodes { name slug }
    }
  }
`;
