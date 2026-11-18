import sanitizeHtml from "sanitize-html";

/**
 * Article bodies are authored in WordPress, but we still never inject raw HTML:
 * only a small set of editorial tags and attributes survives.
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "blockquote",
      "strong",
      "b",
      "em",
      "i",
      "a",
      "hr",
      "figure",
      "figcaption",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
