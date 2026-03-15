import React from 'react';

interface JsonLdPersonProps {
  name: string;
  jobTitle?: string;
  description?: string;
  url?: string;
}

/**
 * Person JSON-LD schema. Used on Team page.
 */
export default function JsonLdPerson({ name, jobTitle, description, url }: JsonLdPersonProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    worksFor: {
      '@type': 'Organization',
      '@id': 'https://www.menschlichkeit-oesterreich.at/#organization',
      name: 'Menschlichkeit Österreich',
    },
  };

  if (jobTitle) schema.jobTitle = jobTitle;
  if (description) schema.description = description;
  if (url) schema.url = url;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
