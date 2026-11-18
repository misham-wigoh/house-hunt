import type { Metadata } from "next";
import { getListings } from "@/lib/cms/data";
import { ShortlistView, type ShortlistItem } from "./shortlist-view";

export const metadata: Metadata = {
  title: "My Shortlist",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function ShortlistPage() {
  const listings = await getListings();
  // Only what the cards show: the member's own saved slugs are read in the browser after login.
  const items: ShortlistItem[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    location: l.location,
    price: l.price,
    image: l.image,
    type: l.type,
    area: l.area,
    bhk: l.bhk,
    reference: l.reference,
  }));
  return <ShortlistView items={items} />;
}
