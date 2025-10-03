import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * SEO Head Component für dynamische Meta-Tags
 * Optimiert für Google, Facebook, Twitter
 */
export function SEOHead({
  title = 'Verein Menschlichkeit Österreich - Soziale Gerechtigkeit & Demokratie',
  description = 'Gemeinnütziger Verein für soziale Gerechtigkeit, Menschenrechte und demokratische Bildung in Österreich. Interaktive Democracy Games, Community-Forum und vieles mehr.',
  keywords = 'Menschenrechte, Demokratie, Österreich, NGO, soziale Gerechtigkeit, politische Bildung, Brücken Bauen, Democracy Games, Verein',
  image = 'https://menschlichkeit-oesterreich.at/logo-og.jpg',
  url = 'https://menschlichkeit-oesterreich.at',
  type = 'website',
  author = 'Menschlichkeit Österreich',
  publishedTime,
  modifiedTime
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);

    // Open Graph Tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Menschlichkeit Österreich', 'property');
    updateMetaTag('og:locale', 'de_AT', 'property');

    // Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Article-specific tags
    if (type === 'article' && publishedTime) {
      updateMetaTag('article:published_time', publishedTime, 'property');
    }
    if (type === 'article' && modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, 'property');
    }

    // Canonical URL
    updateLinkTag('canonical', url);

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);

  return null; // This component doesn't render anything
}

function updateMetaTag(name: string, content: string, attributeName: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attributeName}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

// Structured Data (JSON-LD) für NGO
export function NGOStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Verein Menschlichkeit Österreich",
    "alternateName": "Menschlichkeit Österreich",
    "url": "https://menschlichkeit-oesterreich.at",
    "logo": "https://menschlichkeit-oesterreich.at/logo-square.png",
    "image": "https://menschlichkeit-oesterreich.at/logo-og.jpg",
    "description": "Gemeinnütziger Verein für soziale Gerechtigkeit, Menschenrechte und demokratische Bildung in Österreich.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AT",
      "addressLocality": "Wien",
      "postalCode": "1010",
      "streetAddress": "Beispielstraße 1"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+43-1-234-5678",
      "contactType": "Customer Service",
      "email": "kontakt@menschlichkeit-oesterreich.at",
      "availableLanguage": ["German", "English"]
    },
    "sameAs": [
      "https://facebook.com/menschlichkeit.oesterreich",
      "https://twitter.com/menschlichkeit_at",
      "https://instagram.com/menschlichkeit.oesterreich"
    ],
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AT",
        "addressLocality": "Wien"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Austria"
    },
    "slogan": "Für eine menschlichere Gesellschaft"
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'ngo-structured-data';
    
    // Remove existing if present
    const existing = document.getElementById('ngo-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('ngo-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

export default SEOHead;