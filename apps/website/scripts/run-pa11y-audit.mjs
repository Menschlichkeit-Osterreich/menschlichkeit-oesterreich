import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pa11y from 'pa11y';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const configPath = path.join(projectRoot, '.pa11yci.json');

const rawConfig = await fs.readFile(configPath, 'utf8');
const config = JSON.parse(rawConfig);

async function resolveBrowserExecutable() {
  const candidates = [
    process.env.PA11Y_CHROME_PATH,
    process.env.CHROME_BIN,
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Candidate does not exist in current environment.
    }
  }

  return undefined;
}

const defaults = config.defaults ?? {};
const urls = Array.isArray(config.urls) ? config.urls : [];
const browserExecutable = await resolveBrowserExecutable();

if (browserExecutable) {
  console.log(`Using browser executable: ${browserExecutable}`);
} else {
  console.log('No system browser detected. Falling back to Pa11y/Puppeteer default.');
}

let hasErrors = false;

console.log(`Running Pa11y (axe) on ${urls.length} URLs:`);

for (const entry of urls) {
  const target = typeof entry === 'string' ? entry : entry.url;
  const actions = typeof entry === 'string' ? [] : (entry.actions ?? []);

  try {
    const result = await pa11y(target, {
      ...defaults,
      actions,
      includeNotices: false,
      includeWarnings: false,
      runners: ['axe'],
      standard: undefined,
      chromeLaunchConfig: browserExecutable
        ? {
            executablePath: browserExecutable,
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
          }
        : undefined,
    });

    console.log(` > ${target} - ${result.issues.length} errors`);

    if (result.issues.length > 0) {
      hasErrors = true;
      console.log('');
      console.log(`Errors in ${target}:`);
      console.log('');
      for (const issue of result.issues) {
        console.log(` • ${issue.message}`);
        console.log(`   (${issue.selector})`);
        console.log('');
      }
    }
  } catch (error) {
    hasErrors = true;
    console.log(` > ${target} - Failed to run`);
    console.log('');
    console.log(`Errors in ${target}:`);
    console.log('');
    console.log(` • ${error instanceof Error ? error.message : String(error)}`);
    console.log('');
  }
}

if (hasErrors) {
  process.exitCode = 2;
} else {
  console.log(`\n✔ ${urls.length}/${urls.length} URLs passed`);
}
