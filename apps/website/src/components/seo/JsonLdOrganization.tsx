import React from 'react';
import JsonLdScript from './JsonLdScript';
import { getOrganizationSchema } from '../../config/siteConfig';

export default function JsonLdOrganization() {
  return <JsonLdScript schema={getOrganizationSchema()} />;
}
