#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const sarifPath = resolve(process.cwd(), process.argv[2] || 'quality-reports/codacy-analysis.sarif');

function readSarif(filePath) {
    if (!existsSync(filePath)) {
        throw new Error(`SARIF file not found: ${filePath}`);
    }
    return JSON.parse(readFileSync(filePath, 'utf8'));
}

function getRuleIndex(run) {
    const rules = run.tool?.driver?.rules || [];
    return new Map(rules.map(rule => [rule.id, rule]));
}

function getSeverity(result, rule) {
    return (
        result.level ||
        result.properties?.severity ||
        rule?.defaultConfiguration?.level ||
        rule?.properties?.severity ||
        'warning'
    );
}

function getLocation(result) {
    const location = result.locations?.[0]?.physicalLocation;
    const artifactUri = location?.artifactLocation?.uri || 'unknown';
    const region = location?.region;
    if (!region?.startLine) {
        return artifactUri;
    }
    return `${artifactUri}:${region.startLine}`;
}

function summarize(sarif) {
    const summary = {
        total: 0,
        byTool: new Map(),
        bySeverity: new Map(),
        byRule: new Map(),
        examples: [],
    };

    for (const run of sarif.runs || []) {
        const toolName = run.tool?.driver?.name || 'unknown';
        const ruleIndex = getRuleIndex(run);
        const results = run.results || [];
        summary.byTool.set(toolName, (summary.byTool.get(toolName) || 0) + results.length);

        for (const result of results) {
            const rule = ruleIndex.get(result.ruleId);
            const severity = getSeverity(result, rule);
            const ruleId = result.ruleId || 'unknown-rule';
            summary.total += 1;
            summary.bySeverity.set(severity, (summary.bySeverity.get(severity) || 0) + 1);
            summary.byRule.set(ruleId, (summary.byRule.get(ruleId) || 0) + 1);
            if (summary.examples.length < 10) {
                summary.examples.push({
                    ruleId,
                    severity,
                    location: getLocation(result),
                    message: result.message?.text || result.message?.markdown || 'No message',
                });
            }
        }
    }

    return summary;
}

function printMap(title, values) {
    writeLine(`\n## ${title}`);
    if (values.size === 0) {
        writeLine('- none');
        return;
    }
    for (const [key, value] of [...values.entries()].sort((left, right) => right[1] - left[1])) {
        writeLine(`- ${key}: ${value}`);
    }
}

function writeLine(message) {
    process.stdout.write(`${message}\n`);
}

function printSummary(summary) {
    writeLine('# Codacy SARIF Summary');
    writeLine(`\nTotal findings: ${summary.total}`);
    printMap('By Tool', summary.byTool);
    printMap('By Severity', summary.bySeverity);
    printMap('By Rule', summary.byRule);
    writeLine('\n## Examples');
    if (summary.examples.length === 0) {
        writeLine('- none');
        return;
    }
    for (const example of summary.examples) {
        writeLine(`- [${example.severity}] ${example.ruleId} at ${example.location}: ${example.message}`);
    }
}

try {
    printSummary(summarize(readSarif(sarifPath)));
} catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
}
