/**
 * Choices offered on the Post Property form. They mirror the ACF select fields in WordPress
 * (value = what the ACF field stores), so a submission lands in the right field.
 * Shared by the form (browser) and the validator (server): keep this file free of server-only code.
 */

export interface Option {
  value: string;
  label: string;
}

export const PROPERTY_TYPES = [
  "Flat / Apartment",
  "Independent House",
  "Villa",
  "Builder Floor",
  "Plot / Land",
  "Commercial Office",
] as const;

export const FACING_OPTIONS: Option[] = [
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "north_east", label: "North-East" },
  { value: "north_west", label: "North-West" },
  { value: "south_east", label: "South-East" },
  { value: "south_west", label: "South-West" },
];

export const FURNISHING_OPTIONS = [
  "Fully Furnished",
  "Semi-Furnished",
  "Unfurnished",
  "Bare Shell",
  "Warm Shell",
] as const;

export const AGE_OPTIONS: Option[] = [
  { value: "new", label: "New construction" },
  { value: "lt_1", label: "Less than 1 year" },
  { value: "1_5", label: "1 to 5 years" },
  { value: "5_10", label: "5 to 10 years" },
  { value: "gt_10", label: "More than 10 years" },
];

export const OWNERSHIP_OPTIONS: Option[] = [
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
  { value: "power_of_attorney", label: "Power of Attorney" },
  { value: "co_operative_society", label: "Co-operative Society" },
];

export const AREA_UNITS: Option[] = [
  { value: "sqft", label: "sq.ft" },
  { value: "sqyd", label: "sq.yd" },
  { value: "sqm", label: "sq.m" },
];

export const POSTED_BY_OPTIONS: Option[] = [
  { value: "owner", label: "Owner" },
  { value: "broker", label: "Broker / Agent" },
  { value: "builder", label: "Builder" },
];

/** Values are the existing "Property Status" taxonomy terms. */
export const POSSESSION_STATUS = ["Ready to Move", "Under Construction", "Ready to Construct"] as const;

export const NEARBY_CATEGORIES: Option[] = [
  { value: "transit", label: "Metro / Transport" },
  { value: "school", label: "School" },
  { value: "hospital", label: "Hospital" },
  { value: "shopping", label: "Shopping" },
  { value: "dining", label: "Restaurant / Cafe" },
  { value: "other", label: "Other" },
];

export const AMENITY_OPTIONS = [
  "24x7 Security",
  "24x7 Water Supply",
  "Power Backup",
  "CCTV",
  "Fire Safety",
  "Lift",
  "Gym",
  "Swimming Pool",
  "Clubhouse",
  "Children Play Area",
  "Landscaped Gardens",
  "Jogging Track",
  "Visitor Parking",
  "Community Hall",
  "Gated Security",
  "Central AC",
  "Private Garden",
  "Concierge",
  "Rainwater Harvesting",
  "Intercom",
  "Piped Gas",
  "Vastu Compliant",
] as const;

export const MAX_HIGHLIGHTS = 8;
export const MAX_NEARBY = 8;

export interface NearbyPlace {
  landmark: string;
  distance: string;
  category: string;
}
