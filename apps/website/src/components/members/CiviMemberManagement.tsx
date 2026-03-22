import React from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../ui/Alert';

export function CiviMemberManagement() {
  return (
    <Alert variant="info" title="Ins CRM-Cockpit migriert">
      Die frühere Direktansicht wurde in das interne CRM-Cockpit verschoben. Verwenden Sie bitte{' '}
      <Link to="/admin/members" className="font-medium underline">
        /admin/members
      </Link>
      , um Kontakte, Mitgliedschaften, Beiträge und Consent in einer konsistenten Plattformoberfläche zu bearbeiten.
    </Alert>
  );
}

