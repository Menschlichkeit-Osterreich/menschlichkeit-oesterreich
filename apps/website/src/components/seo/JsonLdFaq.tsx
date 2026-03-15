import React from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface JsonLdFaqProps {
  items: FaqItem[];
}

/**
 * FAQPage JSON-LD schema component.
 *
 * Usage:
 *   <JsonLdFaq items={[
 *     { question: 'Wie werde ich Mitglied?', answer: 'Füllen Sie das Formular ...' },
 *   ]} />
 */
export default function JsonLdFaq({ items }: JsonLdFaqProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
