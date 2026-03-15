import React from 'react';
import { serializeJsonLd } from '../../utils/jsonLd';

/**
 * Safe base component for all JSON-LD structured data script tags.
 *
 * Security rationale for dangerouslySetInnerHTML:
 * - Input is exclusively internally generated schema.org objects — never user input.
 * - serializeJsonLd() escapes all XSS vectors: <, >, &, U+2028 (LINE SEPARATOR),
 *   U+2029 (PARAGRAPH SEPARATOR), preventing premature </script> injection and
 *   invalid JSON inside HTML script blocks.
 * - This is the standard React pattern for JSON-LD (also used by react-helmet-async).
 *
 * nosemgrep: react/no-danger -- see security rationale above
 */
export default function JsonLdScript({ schema }: { schema: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- serializeJsonLd() escapes all XSS vectors; no user input reaches this
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
