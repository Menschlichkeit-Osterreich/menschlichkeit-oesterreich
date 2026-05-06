#!/usr/bin/env node

/**
 * Generate Discourse Theme CSS from Figma Design Tokens
 * Converts figma-design-system/00_design-tokens.json → discourse-theme.css
 */

const fs = require('fs');
const path = require('path');

// Pfade
const tokensFile = path.resolve(__dirname, '../figma-design-system/00_design-tokens.json');
const outputFile = path.resolve(__dirname, '../figma-design-system/discourse-theme.css');

console.log('🎨 Generating Discourse Theme from Figma Design Tokens...\n');

// Design Tokens laden
let tokens;
try {
  const content = fs.readFileSync(tokensFile, 'utf8');
  tokens = JSON.parse(content);
  console.log('✅ Design Tokens geladen:', tokensFile);
} catch (error) {
  console.error('❌ Fehler beim Laden der Tokens:', error.message);
  process.exit(1);
}

const dt = tokens.designTokens || tokens;

// Discourse CSS generieren
let css = `/*
 * Discourse Theme - Menschlichkeit Österreich
 * Auto-generated from Figma Design Tokens
 * Generated: ${new Date().toISOString()}
 * 
 * Upload to: Admin → Customize → Themes → Import
 */

/* ===== FARBEN (WCAG AA konform) ===== */

:root {
  /* Primary (Österreichisches Rot) */
  --primary-low: ${dt.colors?.primary?.['50'] || '#fef2f2'};
  --primary-low-mid: ${dt.colors?.primary?.['100'] || '#fee2e2'};
  --primary-medium: ${dt.colors?.primary?.['600'] || '#dc2626'};
  --primary-high: ${dt.colors?.primary?.['700'] || '#b91c1c'};
  --primary-very-high: ${dt.colors?.primary?.['800'] || '#991b1b'};
  
  /* Secondary (Grau-Töne) */
  --secondary-low: ${dt.colors?.secondary?.['50'] || '#f8fafc'};
  --secondary-medium: ${dt.colors?.secondary?.['500'] || '#64748b'};
  --secondary-high: ${dt.colors?.secondary?.['700'] || '#334155'};
  
  /* Accent */
  --tertiary-low: ${dt.colors?.accent?.['50'] || '#fef7ff'};
  --tertiary: ${dt.colors?.accent?.['500'] || '#f472b6'};
  --tertiary-high: ${dt.colors?.accent?.['700'] || '#db2777'};
  
  /* Success, Warning, Error */
  --success: ${dt.colors?.success?.['600'] || '#16a34a'};
  --success-low: ${dt.colors?.success?.['50'] || '#f0fdf4'};
  --warning: ${dt.colors?.warning?.['600'] || '#ea580c'};
  --warning-low: ${dt.colors?.warning?.['50'] || '#fff7ed'};
  --danger: ${dt.colors?.error?.['600'] || '#dc2626'};
  --danger-low: ${dt.colors?.error?.['50'] || '#fef2f2'};
  
  /* Typography */
  --font-family: ${dt.typography?.fontFamily?.body || 'Inter, -apple-system, sans-serif'};
  --heading-font-family: ${dt.typography?.fontFamily?.heading || 'Inter, sans-serif'};
  --base-font-size: ${dt.typography?.fontSize?.base || '16px'};
  --line-height-medium: ${dt.typography?.lineHeight?.normal || '1.6'};
  
  /* Spacing */
  --spacing-xs: ${dt.spacing?.['1'] || '0.25rem'};
  --spacing-sm: ${dt.spacing?.['2'] || '0.5rem'};
  --spacing-md: ${dt.spacing?.['4'] || '1rem'};
  --spacing-lg: ${dt.spacing?.['6'] || '1.5rem'};
  --spacing-xl: ${dt.spacing?.['8'] || '2rem'};
  
  /* Border Radius */
  --border-radius-sm: ${dt.borderRadius?.sm || '0.25rem'};
  --border-radius-md: ${dt.borderRadius?.md || '0.5rem'};
  --border-radius-lg: ${dt.borderRadius?.lg || '0.75rem'};
  
  /* Shadows */
  --shadow-sm: ${dt.shadows?.sm || '0 1px 2px 0 rgba(0,0,0,0.05)'};
  --shadow-md: ${dt.shadows?.md || '0 4px 6px -1px rgba(0,0,0,0.1)'};
  --shadow-lg: ${dt.shadows?.lg || '0 10px 15px -3px rgba(0,0,0,0.1)'};
}

/* ===== DISCOURSE SPEZIFISCHE VARIABLEN ===== */

/* Header */
.d-header {
  background-color: var(--primary-high);
  box-shadow: var(--shadow-md);
}

.d-header .title a {
  color: white;
  font-family: var(--heading-font-family);
}

/* Buttons */
.btn-primary {
  background-color: var(--primary-medium);
  color: white;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  min-width: 44px;  /* WCAG 2.2 Touch Target */
  min-height: 44px;
}

.btn-primary:hover {
  background-color: var(--primary-high);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
}

/* Links */
a {
  color: var(--primary-medium);
  text-decoration: underline;
}

a:hover {
  color: var(--primary-high);
}

/* ===== ACCESSIBILITY (WCAG AA) ===== */

/* Focus States (sichtbar, kontrastreich) */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 3px solid var(--primary-medium);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

/* Skip to main content (Tastatur-Navigation) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-medium);
  color: white;
  padding: var(--spacing-sm);
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Touch Targets (mindestens 44x44px) */
button,
a.btn,
input[type="submit"],
input[type="button"] {
  min-width: 44px;
  min-height: 44px;
}

/* ===== DSGVO COOKIE BANNER ===== */

.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--primary-low);
  border-top: 2px solid var(--primary-medium);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.cookie-consent-banner p {
  color: var(--secondary-high);
  margin: 0 0 var(--spacing-sm) 0;
}

.cookie-consent-banner button {
  margin-right: var(--spacing-sm);
}

/* ===== MODERATION UI ===== */

.flagged-post {
  border-left: 4px solid var(--warning);
  background: var(--warning-low);
  padding: var(--spacing-md);
}

.deleted-post {
  border-left: 4px solid var(--danger);
  background: var(--danger-low);
  padding: var(--spacing-md);
}

/* Trust Level Badges */
.trust-level-0 { color: var(--secondary-medium); }
.trust-level-1 { color: var(--success); }
.trust-level-2 { color: var(--tertiary); }
.trust-level-3 { color: var(--primary-medium); }
.trust-level-4 { color: var(--primary-high); }

/* ===== RESPONSIVE (Mobile First) ===== */

@media (max-width: 768px) {
  .d-header {
    padding: var(--spacing-sm);
  }
  
  .btn-primary {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}

/* ===== DARK MODE (optional) ===== */

@media (prefers-color-scheme: dark) {
  :root {
    --primary-low: var(--primary-very-high);
    --primary-high: var(--primary-low-mid);
    --secondary-low: var(--secondary-high);
    --secondary-high: var(--secondary-low);
  }
}
`;

// CSS schreiben
try {
  fs.writeFileSync(outputFile, css, 'utf8');
  console.log('✅ Discourse Theme generiert:', outputFile);
  console.log('\n📊 Statistiken:');
  console.log(`   - Zeilen: ${css.split('\n').length}`);
  console.log(`   - Größe: ${(css.length / 1024).toFixed(2)} KB`);
  console.log('\n🚀 Upload nach Discourse:');
  console.log('   Admin → Customize → Themes → Import → From File');
  console.log('   Datei:', path.basename(outputFile));
} catch (error) {
  console.error('❌ Fehler beim Schreiben:', error.message);
  process.exit(1);
}

console.log('\n✨ Fertig!');
