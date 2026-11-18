"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { useAuth } from "@/components/auth/auth-context";

export interface ShortlistItem {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string | null;
  type: string;
  area: string;
  bhk: number;
  reference: string;
}

export function ShortlistView({ items }: { items: ShortlistItem[] }) {
  const { member, ready, shortlist, shortlistReady, toggleShortlist, openLogin } = useAuth();
  const byId = new Map(items.map((i) => [i.id, i]));
  // Newest saved first; slugs of listings that were unpublished are skipped.
  const saved = shortlist.map((id) => byId.get(id)).filter((i): i is ShortlistItem => Boolean(i));

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626]">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-light tracking-normal">My Shortlist</h1>
          {member && shortlistReady && <p className="text-xs text-[#757577] mt-1">{saved.length} saved {saved.length === 1 ? "property" : "properties"}</p>}

          {!ready || (member && !shortlistReady) ? (
            <p className="mt-10 text-sm text-[#757577]">Loading…</p>
          ) : !member ? (
            <div className="mt-10 rounded-2xl bg-white border border-[#aeaeaf]/40 p-8 text-center max-w-md">
              <Heart className="w-8 h-8 text-[#008ae8] mx-auto mb-3" />
              <h2 className="text-lg font-medium">Log in to see your saved properties</h2>
              <p className="text-sm text-[#757577] mt-1">Your shortlist follows you on every device.</p>
              <button
                type="button"
                onClick={() => openLogin()}
                className="mt-5 py-2.5 px-6 rounded-full font-medium text-sm bg-[#008ae8] text-white hover:bg-[#0077c8] transition-colors"
              >
                Login
              </button>
            </div>
          ) : saved.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-white border border-[#aeaeaf]/40 p-8 text-center max-w-md">
              <Heart className="w-8 h-8 text-[#aeaeaf] mx-auto mb-3" />
              <h2 className="text-lg font-medium">Nothing saved yet</h2>
              <p className="text-sm text-[#757577] mt-1">Tap the heart on any listing to keep it here.</p>
              <Link href="/properties" className="inline-block mt-5 py-2.5 px-6 rounded-full font-medium text-sm bg-[#008ae8] text-white hover:bg-[#0077c8] transition-colors">
                Browse Properties
              </Link>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map((item) => (
                <li key={item.id} className="rounded-2xl bg-white border border-[#aeaeaf]/40 overflow-hidden flex flex-col">
                  <Link href={`/property/${item.id}`} className="relative block aspect-4/3 bg-[#fafafa]">
                    <CmsImage src={item.image} alt={item.title} className="object-cover" />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col gap-1">
                    <p className="text-lg font-medium text-[#262626]">{item.price}</p>
                    <Link href={`/property/${item.id}`} className="text-sm font-medium text-[#262626] hover:text-[#008ae8] line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="text-xs text-[#757577]">{item.location}</p>
                    <p className="text-xs text-[#757577]">
                      {item.type}
                      {item.area ? ` · ${item.area}` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleShortlist(item.id)}
                      className="mt-3 self-start inline-flex items-center gap-1.5 text-xs font-medium text-[#757577] hover:text-red-600"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
