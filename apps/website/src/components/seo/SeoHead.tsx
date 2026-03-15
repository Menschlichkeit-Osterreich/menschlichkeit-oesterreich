import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { serializeJsonLd } from '../../utils/jsonLd';

const SITE_NAME = 'Menschlichkeit Österreich';
const SITE_URL = 'https://www.menschlichkeit-oesterreich.at';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  /** Additional JSON-LD schemas rendered inline via Helmet */
  structuredData?: object | object[];
}

export default function SeoHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  structuredData,
}: SeoHeadProps) {
  const location = useLocation();
  const resolvedCanonical = canonical ?? `${SITE_URL}${location.pathname}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} – ${SITE_NAME}`;

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="de_AT" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Per-page structured data — safe serialization via serializeJsonLd */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}
    </Helmet>
  );
}
