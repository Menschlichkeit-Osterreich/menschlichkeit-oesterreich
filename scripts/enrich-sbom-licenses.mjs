#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sbomDir = path.join(repoRoot, 'security', 'sbom');

const manifestPath = path.join(sbomDir, 'manifest.json');

const concurrency = 8;
const cache = new Map();

function nowIso() {
  return new Date().toISOString();
}

function parsePurl(purl) {
  if (!purl || typeof purl !== 'string') {
    return null;
  }

  const match = /^pkg:([^/]+)\/([^@]+)@([^?]+)(?:\?.*)?$/.exec(purl);
  if (!match) {
    return null;
  }

  const ecosystem = match[1];
  const name = decodeURIComponent(match[2]);
  const version = decodeURIComponent(match[3]);

  return { ecosystem, name, version };
}

function normalizeLicense(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const list = raw
      .map(entry => normalizeLicense(entry))
      .filter(Boolean)
      .flat();
    return list.length ? Array.from(new Set(list)) : null;
  }

  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) return null;
    return [text];
  }

  if (typeof raw === 'object') {
    if (raw.type) return normalizeLicense(raw.type);
    if (raw.name) return normalizeLicense(raw.name);
  }

  return null;
}

function extractLicenseFromNpm(versionData, packageData) {
  return (
    normalizeLicense(versionData?.license) ||
    normalizeLicense(versionData?.licenses) ||
    normalizeLicense(packageData?.license) ||
    normalizeLicense(packageData?.licenses) ||
    null
  );
}

function extractLicenseFromPyPi(data) {
  const info = data?.info;
  const direct = normalizeLicense(info?.license);
  if (direct) return direct;

  const classifiers = info?.classifiers || [];
  const licenseEntries = classifiers
    .filter(entry => entry.startsWith('License ::'))
    .map(entry => entry.split('::').pop()?.trim())
    .filter(Boolean);

  return licenseEntries.length ? Array.from(new Set(licenseEntries)) : null;
}

function extractLicenseFromPackagist(versionData) {
  return normalizeLicense(versionData?.license);
}

async function fetchNpmLicense(name, version) {
  const encoded = encodeURIComponent(name);
  const url = `https://registry.npmjs.org/${encoded}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return { status: 'unresolved', reason: `npm registry HTTP ${res.status}` };
    }

    const data = await res.json();
    const versionData = data.versions?.[version];
    const license = extractLicenseFromNpm(versionData, data);

    if (license) {
      return {
        status: 'resolved',
        license,
        source: 'npm registry',
        homepage: versionData?.homepage || data.homepage || null,
      };
    }

    const fallbackVersion = data['dist-tags']?.latest;
    if (fallbackVersion && fallbackVersion !== version) {
      const fallback = extractLicenseFromNpm(data.versions?.[fallbackVersion], data);
      if (fallback) {
        return {
          status: 'resolved',
          license: fallback,
          source: `npm registry (fallback ${fallbackVersion})`,
          homepage: data.versions?.[fallbackVersion]?.homepage || data.homepage || null,
        };
      }
    }

    return { status: 'unresolved', reason: 'license field missing' };
  } catch (error) {
    return { status: 'unresolved', reason: `npm fetch error: ${error.message}` };
  }
}

async function fetchPyPiLicense(name, version) {
  const encoded = encodeURIComponent(name);
  const url = `https://pypi.org/pypi/${encoded}/${encodeURIComponent(version)}/json`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return { status: 'unresolved', reason: `PyPI HTTP ${res.status}` };
    }

    const data = await res.json();
    const license = extractLicenseFromPyPi(data);

    if (license) {
      return {
        status: 'resolved',
        license,
        source: 'PyPI API',
        homepage: data?.info?.project_url || data?.info?.home_page || null,
      };
    }

    return { status: 'unresolved', reason: 'license field missing' };
  } catch (error) {
    return { status: 'unresolved', reason: `PyPI fetch error: ${error.message}` };
  }
}

async function fetchPackagistLicense(name, version) {
  const encoded = encodeURIComponent(name);
  const url = `https://repo.packagist.org/p/${encoded}.json`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return { status: 'unresolved', reason: `Packagist HTTP ${res.status}` };
    }

    const data = await res.json();
    const versions = data.packages?.[name];
    const versionData = versions?.[version];
    const license = extractLicenseFromPackagist(versionData);

    if (license) {
      return {
        status: 'resolved',
        license,
        source: 'Packagist API',
        homepage: versionData?.homepage || versionData?.support?.source || null,
      };
    }

    return { status: 'unresolved', reason: 'license field missing' };
  } catch (error) {
    return { status: 'unresolved', reason: `Packagist fetch error: ${error.message}` };
  }
}

async function resolveLicense(ecosystem, name, version) {
  const cacheKey = `${ecosystem}:${name}@${version}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  let result;

  switch (ecosystem) {
    case 'npm':
      result = await fetchNpmLicense(name, version);
      break;
    case 'pypi':
      result = await fetchPyPiLicense(name, version);
      break;
    case 'composer':
      result = await fetchPackagistLicense(name, version);
      break;
    default:
      result = { status: 'skipped', reason: `ecosystem ${ecosystem} not supported` };
  }

  cache.set(cacheKey, result);
  return result;
}

async function processSbom(sbomPath) {
  const content = await readFile(sbomPath, 'utf8');
  const sbom = JSON.parse(content);
  const components = Array.isArray(sbom.components) ? sbom.components : [];

  const tasks = [];
  const enrichedComponents = components.map(component => ({ ...component }));
  const resolvedEntries = [];
  const unresolvedEntries = [];
  const skippedEntries = [];

  for (let index = 0; index < enrichedComponents.length; index += 1) {
    const component = enrichedComponents[index];
    const hasLicense = Array.isArray(component.licenses) && component.licenses.length > 0;
    if (hasLicense) continue;

    const parsed = parsePurl(component.purl);
    if (!parsed) {
      skippedEntries.push({
        name: component.name,
        version: component.version || 'unknown',
        reason: 'no valid purl',
      });
      continue;
    }

    tasks.push({ index, parsed });
  }

  let position = 0;

  async function worker() {
    while (position < tasks.length) {
      const current = tasks[position];
      position += 1;

      const { index, parsed } = current;
      const component = enrichedComponents[index];

      const result = await resolveLicense(parsed.ecosystem, parsed.name, parsed.version);

      if (result.status === 'resolved') {
        component.licenses = result.license.map(entry => ({ license: { id: entry } }));
        resolvedEntries.push({
          ecosystem: parsed.ecosystem,
          name: parsed.name,
          version: parsed.version,
          license: result.license,
          source: result.source,
          homepage: result.homepage,
        });
      } else if (result.status === 'unresolved') {
        unresolvedEntries.push({
          ecosystem: parsed.ecosystem,
          name: parsed.name,
          version: parsed.version,
          reason: result.reason,
        });
      } else {
        skippedEntries.push({
          ecosystem: parsed.ecosystem,
          name: parsed.name,
          version: parsed.version,
          reason: result.reason,
        });
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);

  return {
    sbom: { ...sbom, components: enrichedComponents },
    resolvedEntries,
    unresolvedEntries,
    skippedEntries,
  };
}

function groupByLicense(resolvedEntries) {
  const groups = new Map();
  for (const entry of resolvedEntries) {
    const key = entry.license.join(' AND ');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }
  return groups;
}

function createNoticesMarkdown(resolved, unresolved) {
  const grouped = groupByLicense(resolved);
  const sections = [];

  sections.push('# Third-Party Notices');
  sections.push('');
  sections.push(`Generiert am ${nowIso()}. Basierend auf kuratierten SBOM-Daten.`);
  sections.push('');

  sections.push('## Zusammenfassung');
  sections.push('');
  sections.push(`- Aufgelöste Lizenzen: ${resolved.length}`);
  sections.push(`- Nicht auflösbare Einträge: ${unresolved.length}`);
  sections.push('');

  sections.push('## Lizenz-Gruppen');
  sections.push('');

  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [license, entries] of sortedGroups) {
    sections.push(`### ${license}`);
    sections.push('');
    sections.push('| Ecosystem | Paket | Version | Quelle | Homepage |');
    sections.push('| --------- | ----- | ------- | ------ | -------- |');

    const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of sortedEntries) {
      const homepage = entry.homepage ? `[Link](${entry.homepage})` : '';
      sections.push(
        `| ${entry.ecosystem} | ${entry.name} | ${entry.version} | ${entry.source} | ${homepage} |`
      );
    }

    sections.push('');
  }

  if (unresolved.length) {
    sections.push('## Manuelle Nachbearbeitung erforderlich');
    sections.push('');
    sections.push('| Ecosystem | Paket | Version | Grund |');
    sections.push('| --------- | ----- | ------- | ----- |');
    const sortedUnresolved = unresolved.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of sortedUnresolved) {
      sections.push(
        `| ${entry.ecosystem ?? ''} | ${entry.name} | ${entry.version} | ${entry.reason} |`
      );
    }
    sections.push('');
  }

  return sections.join('\n');
}

async function main() {
  const manifestRaw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  const sboms = manifest.sboms || [];
  const globalResolved = [];
  const globalUnresolved = [];
  const globalSkipped = [];

  for (const descriptor of sboms) {
    const sbomPath = path.join(repoRoot, descriptor.path);
    const { sbom, resolvedEntries, unresolvedEntries, skippedEntries } =
      await processSbom(sbomPath);

    const enrichedPath = sbomPath.replace(/\.json$/, '.enriched.json');
    await writeFile(enrichedPath, JSON.stringify(sbom, null, 2));

    globalResolved.push(...resolvedEntries.map(entry => ({ ...entry, sbom: descriptor.name })));
    globalUnresolved.push(...unresolvedEntries.map(entry => ({ ...entry, sbom: descriptor.name })));
    globalSkipped.push(...skippedEntries.map(entry => ({ ...entry, sbom: descriptor.name })));
  }

  const curationPath = path.join(sbomDir, 'license-curation.json');
  await writeFile(
    curationPath,
    JSON.stringify(
      {
        generatedAt: nowIso(),
        resolvedCount: globalResolved.length,
        unresolvedCount: globalUnresolved.length,
        skippedCount: globalSkipped.length,
        resolved: globalResolved,
        unresolved: globalUnresolved,
        skipped: globalSkipped,
      },
      null,
      2
    )
  );

  const noticesPath = path.join(repoRoot, 'docs', 'security', 'THIRD-PARTY-NOTICES.md');
  const noticesContent = createNoticesMarkdown(globalResolved, globalUnresolved);
  await writeFile(noticesPath, noticesContent, 'utf8');

  console.log('SBOM license enrichment completed.');
  console.log(`Resolved: ${globalResolved.length}`);
  console.log(`Unresolved: ${globalUnresolved.length}`);
  console.log(`Skipped: ${globalSkipped.length}`);
}

main().catch(error => {
  console.error('Failed to enrich SBOM licenses:', error);
  process.exitCode = 1;
});
