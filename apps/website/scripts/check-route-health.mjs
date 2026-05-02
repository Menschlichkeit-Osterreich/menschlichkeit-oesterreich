#!/usr/bin/env node

const [baseUrl, ...paths] = process.argv.slice(2);

if (!baseUrl || paths.length === 0) {
  console.error(
    'Usage: node scripts/check-route-health.mjs <base-url> <path> [<path> ...]'
  );
  process.exit(1);
}

const timeoutMs = Number(process.env.ROUTE_CHECK_TIMEOUT_MS || 15000);
const failures = [];

for (const path of paths) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = new URL(path, baseUrl).toString();

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'user-agent': 'moe-route-smoke/1.0',
      },
    });

    const ok = response.status >= 200 && response.status < 400;
    console.log(`${response.status} ${url}`);

    if (!ok) {
      failures.push(`${response.status} ${url}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`ERR ${url} ${message}`);
    failures.push(`ERR ${url} ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failures.length > 0) {
  console.error('\nRoute smoke failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nAll route checks passed.');
