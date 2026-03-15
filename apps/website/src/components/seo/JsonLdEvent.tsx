import React from 'react';
import JsonLdScript from './JsonLdScript';

interface JsonLdEventProps {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline?: boolean;
  url: string;
  organizer?: string;
}

/**
 * Event JSON-LD schema.
 */
export default function JsonLdEvent({
  name,
  description,
  startDate,
  endDate,
  location,
  isOnline = false,
  url,
  organizer = 'Menschlichkeit Österreich',
}: JsonLdEventProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    endDate: endDate ?? startDate,
    url,
    organizer: {
      '@type': 'Organization',
      '@id': 'https://www.menschlichkeit-oesterreich.at/#organization',
      name: organizer,
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
  };

  if (location) {
    schema.location = isOnline
      ? { '@type': 'VirtualLocation', url }
      : {
          '@type': 'Place',
          name: location,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'AT',
          },
        };
  }

  return <JsonLdScript schema={schema} />;
}
