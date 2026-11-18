import Image from "next/image";

interface CmsImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Fills its (relatively positioned) parent with a WordPress media-library
 * image, or a neutral block when the CMS record has no image yet.
 */
export function CmsImage({ src, alt, className, sizes = "(min-width: 1024px) 33vw, 100vw", priority }: CmsImageProps) {
  if (!src) {
    return <div className="absolute inset-0 bg-[#fafafa]" role="img" aria-label={alt} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />;
}
