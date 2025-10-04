import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-2 text-2xl font-semibold text-primary-700">Willkommen</h1>
      <p className="mb-6 text-secondary-700">React + Tailwind mit zentralen Design‑Tokens.</p>

      <Card className="p-4">
        <h2 className="mb-2 text-xl font-medium">Schnelltest</h2>
        <p className="mb-3 text-secondary-700">Die Buttons unten nutzen Token‑Farben und Fokus‑Ringe.</p>
        <div className="flex flex-wrap gap-2">
          <Button>Primär</Button>
          <Button variant="secondary">Sekundär</Button>
          <Button variant="success">Erfolg</Button>
          <Button variant="danger">Gefahr</Button>
        </div>
      </Card>

      <Card className="mt-6 p-4">
        <h2 className="mb-2 text-xl font-medium">Datenschutz</h2>
        <p className="mb-3 text-secondary-700">Verwalte deine Datenschutzeinstellungen und kontobezogene Anfragen.</p>
        <Link className="text-blue-600 underline" to="/account/privacy">Mein Konto löschen (DSGVO Art. 17)</Link>
      </Card>
    </div>
  );
}
