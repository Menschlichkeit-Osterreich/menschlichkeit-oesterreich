import React from 'react';
import JsonLdScript from './JsonLdScript';

interface JsonLdArticleProps {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  imageUrl?: string;
}

/**
 * Article JSON-LD schema for blog posts.
 */
export default function JsonLdArticle({
  title,
  description,
  url,
  publishedAt,
  modifiedAt,
  authorName = 'Menschlichkeit Österreich',
  imageUrl,
}: JsonLdArticleProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.menschlichkeit-oesterreich.at/#organization',
      name: 'Menschlichkeit Österreich',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.menschlichkeit-oesterreich.at/logo.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  if (imageUrl) {
    schema.image = {
      '@type': 'ImageObject',
      url: imageUrl,
    };
  }

  return <JsonLdScript schema={schema} />;
}
