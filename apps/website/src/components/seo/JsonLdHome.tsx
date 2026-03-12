import React from 'react';

const JsonLdHome = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Menschlichkeit Österreich",
    "alternateName": "Verein zur Förderung von Demokratie, Menschenrechten und Zivilgesellschaft",
    "url": "https://menschlichkeit-oesterreich.at",
    "logo": "https://menschlichkeit-oesterreich.at/logo.png",
    "nonprofitStatus": "https://schema.org/Nonprofit501c3", // Adaptiert, da es kein spezifisches österr. Schema gibt
    "sameAs": [
      "https://www.facebook.com/menschlichkeit.oesterreich",
      "https://www.instagram.com/menschlichkeit.oesterreich",
      "https://www.linkedin.com/company/menschlichkeit-oesterreich",
      "https://x.com/menschlichkeitAT"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "kontakt@menschlichkeit-oesterreich.at",
      "contactType": "customer service",
      "areaServed": "AT",
      "availableLanguage": ["German"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Pottenbrunner Hauptstraße 108/Top 1",
      "addressLocality": "Pottenbrunn",
      "postalCode": "3140",
      "addressCountry": "AT"
    },
    "potentialAction": [
      {
        "@type": "DonateAction",
        "name": "Spenden",
        "description": "Unterstützen Sie unsere Arbeit für Demokratie und Menschenrechte mit einer Spende.",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://menschlichkeit-oesterreich.at/spenden"
        }
      },
      {
        "@type": "JoinAction",
        "name": "Mitglied werden",
        "description": "Werden Sie Teil unserer Gemeinschaft und engagieren Sie sich für eine offene Gesellschaft.",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://menschlichkeit-oesterreich.at/mitglied-werden"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JsonLdHome;
