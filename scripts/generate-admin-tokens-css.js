#!/usr/bin/env node
/**
 * generate-admin-tokens-css.js
 * 
 * Generiert CSS Custom Properties aus admin-portal-tokens.json
 * für Runtime Multi-Org Branding im Next.js Admin Portal
 * 
 * Usage: node scripts/generate-admin-tokens-css.js
 * Output: figma-design-system/styles/admin-portal.css
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pfade
const TOKENS_PATH = path.join(__dirname, '../figma-design-system/admin-portal-tokens.json');
const OUTPUT_PATH = path.join(__dirname, '../figma-design-system/styles/admin-portal.css');
const BASE_TOKENS_PATH = path.join(__dirname, '../figma-design-system/00_design-tokens.json');

// Tokens laden
const adminTokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
const baseTokens = JSON.parse(fs.readFileSync(BASE_TOKENS_PATH, 'utf-8'));

// Helper: Sicherer Zugriff auf verschachtelte Properties
const get = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
};

console.log('🎨 Generating Admin Portal CSS from Design Tokens...\n');

// CSS Header
let css = `/**
 * Admin Portal Design System
 * Auto-generated from admin-portal-tokens.json
 * DO NOT EDIT MANUALLY - run 'npm run admin:tokens' instead
 * 
 * Last Generated: ${new Date().toISOString()}
 */

/* ============================================
   BASE DESIGN TOKENS (from 00_design-tokens.json)
   ============================================ */

:root {
  /* Colors - Primary */
  --color-primary-50: ${baseTokens.designTokens.colors.primary['50']};
  --color-primary-100: ${baseTokens.designTokens.colors.primary['100']};
  --color-primary-500: ${baseTokens.designTokens.colors.primary['500']};
  --color-primary-600: ${baseTokens.designTokens.colors.primary['600']};
  --color-primary-700: ${baseTokens.designTokens.colors.primary['700']};
  
  /* Semantic Colors */
  --semantic-background: ${baseTokens.designTokens.colors.semantic.background};
  --semantic-surface: ${baseTokens.designTokens.colors.semantic.surface};
  --semantic-text-primary: ${baseTokens.designTokens.colors.semantic['text-primary']};
  --semantic-text-secondary: ${baseTokens.designTokens.colors.semantic['text-secondary']};
  --semantic-border: ${baseTokens.designTokens.colors.semantic.border};
  --semantic-border-focus: ${baseTokens.designTokens.colors.semantic['border-focus']};
  
  /* Spacing */
  --spacing-1: ${baseTokens.designTokens.spacing['1']};
  --spacing-2: ${baseTokens.designTokens.spacing['2']};
  --spacing-3: ${baseTokens.designTokens.spacing['3']};
  --spacing-4: ${baseTokens.designTokens.spacing['4']};
  --spacing-6: ${baseTokens.designTokens.spacing['6']};
  --spacing-8: ${baseTokens.designTokens.spacing['8']};
  
  /* Border Radius */
  --border-radius-md: ${baseTokens.designTokens.borderRadius.md};
  --border-radius-lg: ${baseTokens.designTokens.borderRadius.lg};
  --border-radius-xl: ${baseTokens.designTokens.borderRadius.xl};
  --border-radius-full: ${baseTokens.designTokens.borderRadius.full};
  
  /* Shadows */
  --shadow-sm: ${baseTokens.designTokens.shadows.sm};
  --shadow-md: ${baseTokens.designTokens.shadows.md};
  --shadow-lg: ${baseTokens.designTokens.shadows.lg};
  --shadow-2xl: ${baseTokens.designTokens.shadows['2xl']};
  
  /* Typography */
  --font-family-primary: ${baseTokens.designTokens.typography.fontFamily.primary.join(', ')};
  --font-size-xs: ${baseTokens.designTokens.typography.fontSize.xs};
  --font-size-sm: ${baseTokens.designTokens.typography.fontSize.sm};
  --font-size-base: ${baseTokens.designTokens.typography.fontSize.base};
  --font-size-xl: ${baseTokens.designTokens.typography.fontSize.xl};
  --font-size-3xl: ${baseTokens.designTokens.typography.fontSize['3xl']};
  --font-weight-medium: ${baseTokens.designTokens.typography.fontWeight.medium};
  --font-weight-semibold: ${baseTokens.designTokens.typography.fontWeight.semibold};
  --font-weight-bold: ${baseTokens.designTokens.typography.fontWeight.bold};
  
  /* Z-Index */
  --z-index-sticky: ${baseTokens.designTokens.zIndex.sticky};
  --z-index-modal: ${baseTokens.designTokens.zIndex.modal};
  --z-index-toast: ${baseTokens.designTokens.zIndex.toast};
}

/* ============================================
   ADMIN-SPECIFIC TOKENS
   ============================================ */

:root {
  /* Multi-Org Branding (Runtime Override) */
  --brand-primary: ${adminTokens.adminTokens.orgBranding.fallbacks.primary};
  --brand-secondary: ${adminTokens.adminTokens.orgBranding.fallbacks.secondary};
  --brand-accent: ${adminTokens.adminTokens.orgBranding.fallbacks.accent};
  --brand-logo-url: url('${adminTokens.adminTokens.orgBranding.fallbacks.logoUrl}');
}

/* ============================================
   DASHBOARD COMPONENTS
   ============================================ */

/* Widget Cards */
.widget-card {
  background: ${adminTokens.adminTokens.dashboard.widgets.card.background};
  border: 1px solid ${adminTokens.adminTokens.dashboard.widgets.card.border};
  border-radius: ${adminTokens.adminTokens.dashboard.widgets.card.borderRadius};
  padding: ${adminTokens.adminTokens.dashboard.widgets.card.padding};
  box-shadow: ${adminTokens.adminTokens.dashboard.widgets.card.shadow};
  transition: all 0.2s ease;
}

.widget-card:hover {
  box-shadow: ${adminTokens.adminTokens.dashboard.widgets.card.hover.shadow};
  border-color: ${adminTokens.adminTokens.dashboard.widgets.card.hover.borderColor};
}

.widget-kpi-value {
  font-size: ${adminTokens.adminTokens.dashboard.widgets.kpi.fontSize.value};
  font-weight: ${adminTokens.adminTokens.dashboard.widgets.kpi.fontWeight.value};
}

.widget-kpi-label {
  font-size: ${adminTokens.adminTokens.dashboard.widgets.kpi.fontSize.label};
  font-weight: ${adminTokens.adminTokens.dashboard.widgets.kpi.fontWeight.label};
}

/* Sidebar */
.admin-sidebar {
  width: ${adminTokens.adminTokens.dashboard.sidebar.width.expanded};
  background: ${adminTokens.adminTokens.dashboard.sidebar.background};
  border-right: ${adminTokens.adminTokens.dashboard.sidebar.border};
  transition: width 0.3s ease;
}

.admin-sidebar.collapsed {
  width: ${adminTokens.adminTokens.dashboard.sidebar.width.collapsed};
}

.admin-sidebar-item {
  padding: ${adminTokens.adminTokens.dashboard.sidebar.item.padding};
  border-radius: ${adminTokens.adminTokens.dashboard.sidebar.item.borderRadius};
  transition: background 0.15s ease;
}

.admin-sidebar-item:hover {
  background: ${adminTokens.adminTokens.dashboard.sidebar.item.hover.background};
}

.admin-sidebar-item.active {
  background: ${adminTokens.adminTokens.dashboard.sidebar.item.active.background};
  color: ${adminTokens.adminTokens.dashboard.sidebar.item.active.color};
  font-weight: ${adminTokens.adminTokens.dashboard.sidebar.item.active.fontWeight};
}

/* Topbar */
.admin-topbar {
  height: ${adminTokens.adminTokens.dashboard.topbar.height};
  background: ${adminTokens.adminTokens.dashboard.topbar.background};
  border-bottom: ${adminTokens.adminTokens.dashboard.topbar.border};
  box-shadow: ${adminTokens.adminTokens.dashboard.topbar.shadow};
  z-index: ${adminTokens.adminTokens.dashboard.topbar.zIndex};
  position: sticky;
  top: 0;
}

/* ============================================
   DATA TABLES
   ============================================ */

.data-table-row {
  height: ${adminTokens.adminTokens.dataTable.row.height};
  padding: ${adminTokens.adminTokens.dataTable.row.padding};
  border-bottom: ${adminTokens.adminTokens.dataTable.row.borderBottom};
  transition: background 0.1s ease;
}

.data-table-row:hover {
  background: ${adminTokens.adminTokens.dataTable.row.hover.background};
}

.data-table-header {
  background: ${adminTokens.adminTokens.dataTable.header.background};
  font-weight: ${adminTokens.adminTokens.dataTable.header.fontWeight};
  font-size: ${adminTokens.adminTokens.dataTable.header.fontSize};
  text-transform: ${adminTokens.adminTokens.dataTable.header.textTransform};
  letter-spacing: ${adminTokens.adminTokens.dataTable.header.letterSpacing};
}

.data-table-cell {
  padding: ${adminTokens.adminTokens.dataTable.cell.padding};
  font-size: ${adminTokens.adminTokens.dataTable.cell.fontSize};
}

/* ============================================
   FORMS
   ============================================ */

.form-input {
  height: ${adminTokens.adminTokens.forms.input.height};
  padding: ${adminTokens.adminTokens.forms.input.padding};
  border-radius: ${adminTokens.adminTokens.forms.input.borderRadius};
  border: ${adminTokens.adminTokens.forms.input.border};
  font-size: ${adminTokens.adminTokens.forms.input.fontSize};
  transition: border-color 0.15s ease, outline 0.15s ease;
}

.form-input:focus {
  border-color: ${adminTokens.adminTokens.forms.input.focus.borderColor};
  outline: ${adminTokens.adminTokens.forms.input.focus.outline};
  outline-offset: ${adminTokens.adminTokens.forms.input.focus.outlineOffset};
}

.form-input.error {
  border-color: ${adminTokens.adminTokens.forms.input.error.borderColor};
  outline: ${adminTokens.adminTokens.forms.input.error.outline};
}

.form-label {
  font-size: ${adminTokens.adminTokens.forms.label.fontSize};
  font-weight: ${adminTokens.adminTokens.forms.label.fontWeight};
  margin-bottom: ${adminTokens.adminTokens.forms.label.marginBottom};
  color: ${adminTokens.adminTokens.forms.label.color};
  display: block;
}

.form-help-text {
  font-size: ${adminTokens.adminTokens.forms.helpText.fontSize};
  color: ${adminTokens.adminTokens.forms.helpText.color};
  margin-top: ${adminTokens.adminTokens.forms.helpText.marginTop};
}

.form-error-text {
  font-size: ${adminTokens.adminTokens.forms.errorText.fontSize};
  color: ${adminTokens.adminTokens.forms.errorText.color};
  margin-top: ${adminTokens.adminTokens.forms.errorText.marginTop};
}

/* ============================================
   BADGES
   ============================================ */

.badge {
  padding: ${adminTokens.adminTokens.badges.status.padding};
  border-radius: ${adminTokens.adminTokens.badges.status.borderRadius};
  font-size: ${adminTokens.adminTokens.badges.status.fontSize};
  font-weight: ${adminTokens.adminTokens.badges.status.fontWeight};
  display: inline-flex;
  align-items: center;
}

.badge-success {
  background: ${adminTokens.adminTokens.badges.status.variants.success.background};
  color: ${adminTokens.adminTokens.badges.status.variants.success.color};
  border: ${adminTokens.adminTokens.badges.status.variants.success.border};
}

.badge-warning {
  background: ${adminTokens.adminTokens.badges.status.variants.warning.background};
  color: ${adminTokens.adminTokens.badges.status.variants.warning.color};
  border: ${adminTokens.adminTokens.badges.status.variants.warning.border};
}

.badge-error {
  background: ${adminTokens.adminTokens.badges.status.variants.error.background};
  color: ${adminTokens.adminTokens.badges.status.variants.error.color};
  border: ${adminTokens.adminTokens.badges.status.variants.error.border};
}

/* ============================================
   MODALS
   ============================================ */

.modal-overlay {
  background: ${adminTokens.adminTokens.modals.overlay.background};
  backdrop-filter: ${adminTokens.adminTokens.modals.overlay.backdropFilter};
  z-index: ${adminTokens.adminTokens.modals.overlay.zIndex};
  position: fixed;
  inset: 0;
}

.modal-container {
  background: ${adminTokens.adminTokens.modals.container.background};
  border-radius: ${adminTokens.adminTokens.modals.container.borderRadius};
  box-shadow: ${adminTokens.adminTokens.modals.container.shadow};
  max-width: ${adminTokens.adminTokens.modals.container.maxWidth};
  padding: ${adminTokens.adminTokens.modals.container.padding};
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

*:focus-visible {
  outline: ${adminTokens.accessibility.focusRing.width} ${adminTokens.accessibility.focusRing.style} ${adminTokens.accessibility.focusRing.color};
  outline-offset: ${adminTokens.accessibility.focusRing.offset};
  border-radius: ${adminTokens.accessibility.focusRing.borderRadius};
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: ${adminTokens.accessibility.animation.reducedMotion.duration} !important;
    animation-timing-function: ${adminTokens.accessibility.animation.reducedMotion.easing} !important;
    transition-duration: ${adminTokens.accessibility.animation.reducedMotion.duration} !important;
  }
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: ${adminTokens.responsive.mobile.breakpoint}) {
  .admin-sidebar {
    width: ${adminTokens.responsive.mobile.sidebar.width};
    position: ${adminTokens.responsive.mobile.sidebar.position};
  }
  
  .admin-topbar {
    height: ${adminTokens.responsive.mobile.topbar.height};
  }
}

@media (min-width: ${adminTokens.responsive.tablet.breakpoint}) and (max-width: ${adminTokens.responsive.desktop.breakpoint}) {
  .admin-sidebar {
    width: ${adminTokens.responsive.tablet.sidebar.width};
  }
}

/* ============================================
   DARK MODE
   ============================================ */

.dark {
  --semantic-background: ${adminTokens.darkMode.overrides.background};
  --semantic-surface: ${adminTokens.darkMode.overrides.surface};
  --semantic-text-primary: ${adminTokens.darkMode.overrides['text-primary']};
  --semantic-text-secondary: ${adminTokens.darkMode.overrides['text-secondary']};
  --semantic-border: ${adminTokens.darkMode.overrides.border};
  --admin-sidebar-background: ${adminTokens.darkMode.overrides['sidebar-background']};
}
`;

// CSS schreiben
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, css, 'utf-8');

console.log(`✅ Generated: ${OUTPUT_PATH}`);
console.log(`📦 File Size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);
console.log(`\n🎨 Usage in Next.js:`);
console.log(`   import '@/figma-design-system/styles/admin-portal.css';\n`);
console.log(`✨ Done! Admin Portal tokens ready for use.`);
