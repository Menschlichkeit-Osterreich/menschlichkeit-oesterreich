import React from 'react';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export default function StatutenPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <Breadcrumb items={[{ label: 'Statuten' }]} />
      <h1 className="text-2xl font-semibold">Statuten</h1>
      <Card className="p-4 space-y-3">
        <p>
          Hier finden Sie die Statuten des Vereins. Die verbindliche Fassung steht als PDF zum Download zur Verfügung.
        </p>
        <a
          className="inline-block px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
          href="/docs/statuten.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Statuten (PDF) herunterladen
        </a>
        <p className="text-sm text-secondary-700">
          Hinweis: Falls der Download fehlt, bitte die finale PDF unter <code>frontend/public/docs/statuten.pdf</code> ablegen.
        </p>
      </Card>
    </div>
  );
}

