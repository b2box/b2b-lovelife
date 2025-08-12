import { useEffect } from "react";

export type Market = "AR" | "CO" | "CN";

interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  hreflang: Array<{ lang: string; href: string }>;
  structuredData: any;
}

const seoConfigs: Record<Market, SEOConfig> = {
  AR: {
    title: "B2BOX Argentina | Productos virales al por mayor desde China",
    description: "Compra productos virales al por mayor en Argentina con envíos ágiles y precios competitivos. B2B e‑commerce directo desde China.",
    canonical: "https://b2box.com/ar",
    hreflang: [
      { lang: "es-AR", href: "https://b2box.com/ar" },
      { lang: "es-CO", href: "https://b2box.com/co" },
      { lang: "x-default", href: "https://b2box.com/" }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "B2BOX Argentina",
      "url": typeof window !== "undefined" ? `${window.location.origin}/ar` : "",
      "logo": "/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AR"
      },
      "sameAs": ["https://facebook.com/b2box", "https://instagram.com/b2box"]
    }
  },
  CO: {
    title: "B2BOX Colombia | Productos virales al por mayor desde China",
    description: "Compra productos virales al por mayor en Colombia con envíos ágiles y precios competitivos. B2B e‑commerce directo desde China.",
    canonical: "https://b2box.com/co",
    hreflang: [
      { lang: "es-CO", href: "https://b2box.com/co" },
      { lang: "es-AR", href: "https://b2box.com/ar" },
      { lang: "x-default", href: "https://b2box.com/" }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "B2BOX Colombia",
      "url": typeof window !== "undefined" ? `${window.location.origin}/co` : "",
      "logo": "/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CO"
      },
      "sameAs": ["https://facebook.com/b2box", "https://instagram.com/b2box"]
    }
  },
  CN: {
    title: "B2BOX Global | Wholesale Viral Products Worldwide",
    description: "Buy viral products wholesale with fast shipping and competitive prices. B2B e‑commerce platform for your online store.",
    canonical: "https://b2box.com/",
    hreflang: [
      { lang: "x-default", href: "https://b2box.com/" },
      { lang: "es-AR", href: "https://b2box.com/ar" },
      { lang: "es-CO", href: "https://b2box.com/co" }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "B2BOX Global",
      "url": typeof window !== "undefined" ? window.location.origin : "",
      "logo": "/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "sameAs": ["https://facebook.com/b2box", "https://instagram.com/b2box"]
    }
  }
};

export function useSEOByMarket(market: Market) {
  useEffect(() => {
    const config = seoConfigs[market];
    
    // Update title
    document.title = config.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description);
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.canonical);
    
    // Remove existing hreflang tags
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());
    
    // Add new hreflang tags
    config.hreflang.forEach(({ lang, href }) => {
      const hreflangLink = document.createElement('link');
      hreflangLink.setAttribute('rel', 'alternate');
      hreflangLink.setAttribute('hreflang', lang);
      hreflangLink.setAttribute('href', href);
      document.head.appendChild(hreflangLink);
    });

    // Update Open Graph tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('og:title', config.title);
    updateMetaTag('og:description', config.description);
    updateMetaTag('og:url', config.canonical);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'B2BOX');
    updateMetaTag('og:image', 'https://b2box.com/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png');

    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', config.title);
    updateTwitterTag('twitter:description', config.description);
    updateTwitterTag('twitter:image', 'https://b2box.com/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png');

    // Add robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Update structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(config.structuredData);
    
  }, [market]);
  
  return seoConfigs[market];
}