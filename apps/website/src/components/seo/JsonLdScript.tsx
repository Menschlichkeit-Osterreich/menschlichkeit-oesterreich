import React from 'react';
import { serializeJsonLd } from '../../utils/jsonLd';

/**
 * Safe base component for all JSON-LD structured data script tags.
 * Uses serializeJsonLd() to prevent XSS via premature </script> injection.
 */
export default function JsonLdScript({ schema }: { schema: unknown }) {
  return (
    <script
      type="application/ld+json"
      // serializeJsonLd escapes <, >, &, U+2028, U+2029 — safe for HTML embedding
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
