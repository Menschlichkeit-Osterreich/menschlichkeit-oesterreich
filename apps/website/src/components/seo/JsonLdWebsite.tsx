import React from 'react';
import JsonLdScript from './JsonLdScript';
import { getWebsiteSchema } from '../../config/siteConfig';

export default function JsonLdWebsite() {
  return <JsonLdScript schema={getWebsiteSchema()} />;
}
