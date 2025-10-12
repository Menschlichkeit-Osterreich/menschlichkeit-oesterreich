#!/usr/bin/env node
/**
 * Quality Report Generator for Menschlichkeit Österreich
 * Aggregates quality metrics from various tools into unified report
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = 'quality-reports';
const OUTPUT_FILE = path.join(REPORTS_DIR, 'complete-analysis.json');

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
  },
  quality_gates: {
    security_gate: { passed: false, details: 'CVE count unknown' },
    maintainability_gate: { passed: false, details: 'Score unknown' },
    performance_gate: { passed: false, details: 'Lighthouse score unknown' },
    accessibility_gate: { passed: false, details: 'A11y score unknown' },
    compliance_gate: { passed: false, details: 'DSGVO status unknown' },
  },
};

// Helper function to safely read JSON files (SARIF is JSON)
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

// Load individual reports
console.log('📋 Loading individual reports...');

// Codacy Report (SARIF)
const codacySarifPath = path.join(REPORTS_DIR, 'codacy-analysis.sarif');
const codacyReport = readJsonReport(codacySarifPath);
if (codacyReport && Array.isArray(codacyReport.runs)) {
  const results = codacyReport.runs[0]?.results || [];
  report.reports.codacy = {
    total_issues: results.length,
    critical_issues: results.filter(r => r.level === 'error').length,
    categories: {},
  };

  const criticalCount = report.reports.codacy.critical_issues;
  report.summary.quality_score = Math.max(0, 100 - criticalCount * 10);

  report.quality_gates.maintainability_gate =
    criticalCount === 0
      ? { passed: true, details: `No critical issues found. Total issues: ${results.length}` }
      : { passed: false, details: `${criticalCount} critical issues` };
}

// Security Report (Trivy SARIF)
const trivySarifPath = path.join(REPORTS_DIR, 'trivy-security.sarif');
const securityReport = readJsonReport(trivySarifPath);
if (securityReport && Array.isArray(securityReport.runs)) {
  const results = securityReport.runs[0]?.results || [];
  const cveCount = results.length;

  // Map security severity from SARIF property name variance
  const getSeverity = r =>
    (r && r.properties && (r.properties.security_severity || r.properties['security-severity'])) ||
    r?.level ||
    'UNKNOWN';

  report.reports.security = {
    total_vulnerabilities: cveCount,
    critical_vulnerabilities: results.filter(
      r => String(getSeverity(r)).toUpperCase() === 'CRITICAL'
    ).length,
    high_vulnerabilities: results.filter(r => String(getSeverity(r)).toUpperCase() === 'HIGH')
      .length,
  };

  report.summary.security_score = Math.max(0, 100 - cveCount * 5);

  report.quality_gates.security_gate =
    cveCount === 0
      ? { passed: true, details: 'No CVE vulnerabilities detected' }
      : {
          passed: false,
          details: `${cveCount} vulnerabilities found (${report.reports.security.critical_vulnerabilities} critical)`,
        };
}

// DSGVO Compliance Report (custom JSON)
const dsgvoPath = path.join(REPORTS_DIR, 'dsgvo-check.json');
const dsgvoReport = readJsonReport(dsgvoPath);
if (dsgvoReport) {
  report.reports.dsgvo = {
    overall_status: dsgvoReport.overall_status,
    compliance_score: dsgvoReport.summary?.compliance_score || 0,
    passed_checks: dsgvoReport.summary?.passed || 0,
    failed_checks: dsgvoReport.summary?.failed || 0,
    warnings: dsgvoReport.summary?.warnings || 0,
  };

  report.summary.compliance_score = report.reports.dsgvo.compliance_score;

  report.quality_gates.compliance_gate =
    dsgvoReport.overall_status === 'compliant'
      ? {
          passed: true,
          details: `DSGVO compliant (${report.reports.dsgvo.compliance_score}% score)`,
        }
      : {
          passed: false,
          details: `DSGVO ${dsgvoReport.overall_status} (${report.reports.dsgvo.failed_checks} failed checks)`,
        };
}

// ESLint Report (JSON formatter)
const eslintJsonPath = path.join(REPORTS_DIR, 'eslint.json');
const eslintReport = readJsonReport(eslintJsonPath);
if (Array.isArray(eslintReport)) {
  let totalIssues = 0;
  let filesWithIssues = 0;
  for (const file of eslintReport) {
    const count = (file.messages || []).length;
    totalIssues += count;
    if (count > 0) {
      filesWithIssues += 1;
    }
  }
  report.reports.eslint = {
    total_issues: totalIssues,
    files_with_issues: filesWithIssues,
  };
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

// Recommendations
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

// RACI matrix
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
