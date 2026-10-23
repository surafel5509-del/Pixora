import { useEffect } from "react";
import { SITE, SITE_URL } from "@/lib/env";

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attribute: "content" | "href", value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    const name = selector.match(/\[(?:name|property)="([^"]+)"\]/)?.[1];
    if (!name) return;
    element.setAttribute(selector.includes("property=") ? "property" : "name", name);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

/** Declarative document head management — no extra dependency required. */
export function Seo({ title, description, path = "/", image, type = "website", noIndex, jsonLd }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
    const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const metaDescription = description ?? SITE.description;

    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", metaDescription);
    setMeta(
      'meta[name="robots"]',
      "content",
      noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", metaDescription);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:site_name"]', "content", SITE.name);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", metaDescription);
    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
      setMeta('meta[name="twitter:image"]', "content", image);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify({ "@context": "https://schema.org", ...jsonLd });
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, path, image, type, noIndex, jsonLd]);

  return null;
}
