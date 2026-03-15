import React from 'react';
import JsonLdScript from './JsonLdScript';

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

  return <JsonLdScript schema={schema} />;
}
