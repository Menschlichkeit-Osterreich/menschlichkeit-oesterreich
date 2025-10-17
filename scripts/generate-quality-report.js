#!/usr/bin/env node
/**
 * Quality Report Generator for Menschlichkeit Österreich
 * Aggregates quality metrics from various tools into unified report
 */

import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = 'quality-reports';
const OUTPUT_FILE = path.join(REPORTS_DIR, 'complete-analysis.json');
const FIGMA_DOCS_DIR = path.join('figma-design-system', 'figmadocs');

console.log('📊 Generating comprehensive quality report...');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const report = {
  metadata: {
    generated_at: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    repository: 'menschlichkeit-oesterreich-development',
    branch: process.env.GITHUB_REF_NAME || 'development',
    commit: process.env.GITHUB_SHA?.substring(0, 7) || 'unknown',
  },
  summary: {
    overall_status: 'unknown',
    quality_score: 0,
    security_score: 0,
    compliance_score: 0,
    performance_score: 0,
    total_issues: 0,
    critical_issues: 0,
    recommendations: [],
  },
  reports: {
    codacy: null,
    security: null,
    dsgvo: null,
    lighthouse: null,
    eslint: null,
    design_docs: null,
  },
  quality_gates: {
    security_gate: { passed: false, details: 'CVE count unknown' },
    maintainability_gate: { passed: false, details: 'Score unknown' },
    performance_gate: { passed: false, details: 'Lighthouse score unknown' },
    accessibility_gate: { passed: false, details: 'A11y score unknown' },
    compliance_gate: { passed: false, details: 'DSGVO status unknown' },
  },
};

// Helper function to safely read JSON files
function readJsonReport(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read ${filePath}: ${error.message}`);
  }
  return null;
}

// Helper: Recursively scan figmadocs
function scanFigmadocs(baseDir) {
  const absBase = path.resolve(baseDir);
  if (!fs.existsSync(absBase)) {
    return null;
  }

  const categories = [];
  let totalFiles = 0;

  const topEntries = fs.readdirSync(absBase, { withFileTypes: true });
  for (const entry of topEntries) {
    if (entry.isDirectory()) {
      const catDir = path.join(absBase, entry.name);
      const files = [];

      const walk = dir => {
        const ents = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of ents) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walk(full);
          else if (e.isFile()) files.push(path.relative(absBase, full).replace(/\\/g, '/'));
        }
      };

      walk(catDir);
      totalFiles += files.length;
      categories.push({ name: entry.name, file_count: files.length, files });
    }
  }

  return {
    baseDir: baseDir.replace(/\\/g, '/'),
    total_files: totalFiles,
    categories,
    last_updated: new Date().toISOString(),
  };
}

// Load individual reports
console.log('📋 Loading individual reports...');

// Codacy Report
const codacyReport = readJsonReport(path.join(REPORTS_DIR, 'codacy-analysis.sarif'));
if (codacyReport && codacyReport.runs) {
  const results = codacyReport.runs[0]?.results || [];
  report.reports.codacy = {
    total_issues: results.length,
    critical_issues: results.filter(r => r.level === 'error').length,
    categories: {},
  };

  // Calculate quality score from Codacy
  const criticalCount = report.reports.codacy.critical_issues;
  report.summary.quality_score = Math.max(0, 100 - criticalCount * 10);

  if (criticalCount === 0) {
    report.quality_gates.maintainability_gate = {
      passed: true,
      details: `No critical issues found. Total issues: ${results.length}`,
    };
  }
}

// Security Report (Trivy)
const securityReport = readJsonReport(path.join(REPORTS_DIR, 'trivy-security.sarif'));
if (securityReport && securityReport.runs) {
  const results = securityReport.runs[0]?.results || [];
  const cveCount = results.length;

  report.reports.security = {
    total_vulnerabilities: cveCount,
    critical_vulnerabilities: results.filter(r => r.properties?.security_severity === 'CRITICAL')
      .length,
    high_vulnerabilities: results.filter(r => r.properties?.security_severity === 'HIGH').length,
  };

  report.summary.security_score = Math.max(0, 100 - cveCount * 5);

  if (cveCount === 0) {
    report.quality_gates.security_gate = {
      passed: true,
      details: 'No CVE vulnerabilities detected',
    };
  } else {
    report.quality_gates.security_gate = {
      passed: false,
      details: `${cveCount} vulnerabilities found (${report.reports.security.critical_vulnerabilities} critical)`,
    };
  }
}

// DSGVO Compliance Report
const dsgvoReport = readJsonReport(path.join(REPORTS_DIR, 'dsgvo-check.json'));
if (dsgvoReport) {
  report.reports.dsgvo = {
    overall_status: dsgvoReport.overall_status,
    compliance_score: dsgvoReport.summary?.compliance_score || 0,
    passed_checks: dsgvoReport.summary?.passed || 0,
    failed_checks: dsgvoReport.summary?.failed || 0,
    warnings: dsgvoReport.summary?.warnings || 0,
  };

  report.summary.compliance_score = dsgvoReport.summary?.compliance_score || 0;

  if (dsgvoReport.overall_status === 'compliant') {
    report.quality_gates.compliance_gate = {
      passed: true,
      details: `DSGVO compliant (${report.reports.dsgvo.compliance_score}% score)`,
    };
  } else {
    report.quality_gates.compliance_gate = {
      passed: false,
      details: `DSGVO ${dsgvoReport.overall_status} (${report.reports.dsgvo.failed_checks} failed checks)`,
    };
  }
}

// ESLint Report
const eslintReport = readJsonReport('eslint.sarif');
if (eslintReport && eslintReport.runs) {
  const results = eslintReport.runs[0]?.results || [];
  const totalResults = results.reduce((sum, file) => sum + (file.results?.length || 0), 0);

  report.reports.eslint = {
    total_issues: totalResults,
    files_with_issues: results.length,
  };
}

// Lighthouse Report (from frontend workspace)
// Try multiple locations: frontend/.lighthouse and quality-reports fallback copy
const lighthouseCandidates = [
  path.join('frontend', '.lighthouse', 'report.report.json'),
  path.join('quality-reports', 'lighthouse-report.json'),
];
let lighthouseJson = null;
let lighthouseUsedPath = null;
for (const p of lighthouseCandidates) {
  const j = readJsonReport(p);
  if (j) { lighthouseJson = j; lighthouseUsedPath = p; break; }
}
if (lighthouseJson) {
  const perf = lighthouseJson.categories?.performance?.score ?? 0;
  const a11y = lighthouseJson.categories?.accessibility?.score ?? 0;
  const bestPractices = lighthouseJson.categories?.['best-practices']?.score ?? 0;
  const seo = lighthouseJson.categories?.seo?.score ?? 0;

  report.reports.lighthouse = {
    performance: perf,
    accessibility: a11y,
    best_practices: bestPractices,
    seo,
    audits_count: Array.isArray(lighthouseJson.audits)
      ? lighthouseJson.audits.length
      : Object.keys(lighthouseJson.audits || {}).length,
    fetchedAt: lighthouseJson.fetchTime || new Date().toISOString(),
  };

  // Convert perf to percent score for summary
  report.summary.performance_score = Math.round((perf || 0) * 100);

  // Update gates based on thresholds defined in run-lighthouse script
  const perfOk = perf >= 0.9;
  const a11yOk = a11y >= 0.95;
  const bpOk = bestPractices >= 0.95;
  const seoOk = seo >= 0.9;

  report.quality_gates.performance_gate = {
    passed: perfOk && bpOk && seoOk,
    details: `Scores: performance=${(perf * 100).toFixed(0)} a11y=${(a11y * 100).toFixed(0)} best-practices=${(bestPractices * 100).toFixed(0)} seo=${(seo * 100).toFixed(0)} (source: ${lighthouseUsedPath})`,
  };
  report.quality_gates.accessibility_gate = {
    passed: a11yOk,
    details: `Accessibility score ${(a11y * 100).toFixed(0)} (source: ${lighthouseUsedPath})`,
  };
}

// Figma Design Docs (figmadocs)
const designDocs = scanFigmadocs(FIGMA_DOCS_DIR);
if (designDocs) {
  report.reports.design_docs = designDocs;
  // Optionally: consider docs presence in maintainability gate (informative)
  if (designDocs.total_files > 0) {
    report.summary.recommendations.push('📚 Design-Dokumentation gefunden (figmadocs) – in Reports aufgenommen');
  } else {
    report.summary.recommendations.push('📝 figmadocs ist leer – bitte Design-Dokumentation ergänzen');
  }
}

// Calculate overall metrics
report.summary.total_issues =
  (report.reports.codacy?.total_issues || 0) +
  (report.reports.security?.total_vulnerabilities || 0) +
  (report.reports.eslint?.total_issues || 0);

report.summary.critical_issues =
  (report.reports.codacy?.critical_issues || 0) +
  (report.reports.security?.critical_vulnerabilities || 0);

// Determine overall status
const gatesPassed = Object.values(report.quality_gates).filter(gate => gate.passed).length;
const totalGates = Object.keys(report.quality_gates).length;

if (gatesPassed === totalGates) {
  report.summary.overall_status = 'excellent';
} else if (gatesPassed >= totalGates * 0.8) {
  report.summary.overall_status = 'good';
} else if (gatesPassed >= totalGates * 0.6) {
  report.summary.overall_status = 'acceptable';
} else {
  report.summary.overall_status = 'needs_improvement';
}

// Generate recommendations
if (report.summary.critical_issues > 0) {
  report.summary.recommendations.push('🚨 Address critical security vulnerabilities immediately');
}

if (!report.quality_gates.maintainability_gate.passed) {
  report.summary.recommendations.push('🔧 Improve code quality and reduce technical debt');
}

if (!report.quality_gates.compliance_gate.passed) {
  report.summary.recommendations.push('⚖️ Review and fix DSGVO compliance issues');
}

if (report.summary.recommendations.length === 0) {
  report.summary.recommendations.push(
    '✅ All quality gates passed! Consider continuous monitoring'
  );
}

// Add RACI matrix for Enterprise requirements
report.raci_matrix = {
  security_issues: {
    responsible: 'DevOps Team',
    accountable: 'Security Officer',
    consulted: 'Development Team',
    informed: 'Management',
  },
  compliance_issues: {
    responsible: 'Compliance Officer',
    accountable: 'Legal Team',
    consulted: 'Development Team',
    informed: 'Management',
  },
  performance_issues: {
    responsible: 'Frontend Team',
    accountable: 'Technical Lead',
    consulted: 'UX Team',
    informed: 'Product Owner',
  },
};

// Save comprehensive report
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

// Console output
console.log('\n📊 Quality Report Summary:');
console.log(`🎯 Overall Status: ${report.summary.overall_status.toUpperCase()}`);
console.log(`🔒 Security Score: ${report.summary.security_score}%`);
console.log(`📈 Quality Score: ${report.summary.quality_score}%`);
console.log(`⚖️ Compliance Score: ${report.summary.compliance_score}%`);
console.log(`🚨 Critical Issues: ${report.summary.critical_issues}`);
console.log(`📝 Total Issues: ${report.summary.total_issues}`);
if (report.reports.design_docs) {
  console.log(`📚 Design Docs: ${report.reports.design_docs.total_files} Dateien in ${report.reports.design_docs.categories.length} Kategorien`);
}

console.log('\n🚪 Quality Gates:');
Object.entries(report.quality_gates).forEach(([gate, status]) => {
  const icon = status.passed ? '✅' : '❌';
  console.log(`${icon} ${gate}: ${status.details}`);
});

console.log('\n💡 Recommendations:');
report.summary.recommendations.forEach(rec => console.log(`  ${rec}`));

console.log(`\n📋 Complete report saved to: ${OUTPUT_FILE}`);

// Exit with appropriate code
const exitCode = report.summary.critical_issues > 0 ? 1 : 0;
process.exit(exitCode);
