#!/usr/bin/env node
import fs from 'node:fs/promises';

const marketplaceEndpoint =
  'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.2-preview.1';

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

function collectExtensionIds(extensionsJson, devcontainerJson) {
  const ids = new Set();
  for (const id of extensionsJson.recommendations ?? []) {
    ids.add(String(id).toLowerCase());
  }
  for (const id of devcontainerJson.customizations?.vscode?.extensions ?? []) {
    ids.add(String(id).toLowerCase());
  }
  return [...ids].sort();
}

async function queryMarketplace(extensionIds) {
  const body = {
    filters: [
      {
        criteria: extensionIds.map(id => ({ filterType: 7, value: id })),
        pageNumber: 1,
        pageSize: extensionIds.length,
        sortBy: 0,
        sortOrder: 0,
      },
    ],
    assetTypes: [],
    flags: 914,
  };

  const response = await fetch(marketplaceEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json;api-version=7.2-preview.1;excludeUrls=true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Marketplace query failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const found = new Set();
  for (const result of data.results ?? []) {
    for (const extension of result.extensions ?? []) {
      const publisher = extension.publisher?.publisherName;
      const name = extension.extensionName;
      if (publisher && name) {
        found.add(`${publisher}.${name}`.toLowerCase());
      }
    }
  }
  return found;
}

async function main() {
  const extensionsJson = await readJson('.vscode/extensions.json');
  const devcontainerJson = await readJson('.devcontainer/devcontainer.json');
  const extensionIds = collectExtensionIds(extensionsJson, devcontainerJson);
  const skippedUnwanted = (extensionsJson.unwantedRecommendations ?? []).length;
  const found = await queryMarketplace(extensionIds);

  console.log(`Checking ${extensionIds.length} active extension id(s).`);
  console.log(`Skipping ${skippedUnwanted} unwantedRecommendation id(s); those are policy entries.`);

  let missingCount = 0;
  for (const extensionId of extensionIds) {
    if (found.has(extensionId)) {
      console.log(`FOUND ${extensionId}`);
      continue;
    }
    missingCount += 1;
    console.warn(`MISSING ${extensionId}`);
  }

  if (missingCount > 0) {
    console.warn(
      `Marketplace lookup did not find ${missingCount} extension id(s). This optional check is informational and not a CI gate.`
    );
  }
}

main().catch(error => {
  console.warn(`[workspace:extensions:verify:online] ${error.message}`);
  console.warn('Optional online extension verification is informational and not a CI gate.');
});
