import React from 'react';
import { Card } from '../components/ui/Card';
import { Breadcrumb } from '../components/ui/Breadcrumb';

export default function BeitragsordnungPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <Breadcrumb items={[{ label: 'Beitragsordnung 2025' }]} />
      <h1 className="text-2xl font-semibold">Beitragsordnung 2025</h1>
      <Card className="p-4 space-y-3">
        <p>
          Die Beitragsordnung 2025 regelt Mitgliedsbeiträge (Standard, Ermäßigt, Härtefall). Die verbindliche Fassung steht als PDF zum Download bereit.
        </p>
        <a
          className="inline-block px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
          href="/docs/beitragsordnung-2025.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Beitragsordnung (PDF) herunterladen
        </a>
        <p className="text-sm text-secondary-700">
          Hinweis: Finale PDF unter <code>frontend/public/docs/beitragsordnung-2025.pdf</code> ablegen.
        </p>
      </Card>
    </div>
  );
}

