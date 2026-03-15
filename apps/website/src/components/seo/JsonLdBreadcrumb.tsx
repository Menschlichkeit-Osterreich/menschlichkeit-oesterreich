import React from 'react';
import JsonLdScript from './JsonLdScript';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface JsonLdBreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList JSON-LD schema component.
 *
 * Usage:
 *   <JsonLdBreadcrumb items={[
 *     { name: 'Start', url: 'https://www.menschlichkeit-oesterreich.at/' },
 *     { name: 'Themen', url: 'https://www.menschlichkeit-oesterreich.at/themen' },
 *     { name: 'Demokratie', url: 'https://www.menschlichkeit-oesterreich.at/themen/demokratie' },
 *   ]} />
 */
export default function JsonLdBreadcrumb({ items }: JsonLdBreadcrumbProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript schema={schema} />;
}
