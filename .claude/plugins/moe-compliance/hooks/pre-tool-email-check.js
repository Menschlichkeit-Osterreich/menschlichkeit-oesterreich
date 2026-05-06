#!/usr/bin/env node
/**
 * PreToolUse hook: Warns when writing email template files
 * without required DSGVO elements (opt-out link, Impressum, ZVR).
 */
import { readFileSync } from "fs";

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
const filePath = input.tool_input?.file_path || "";
const content = input.tool_input?.content || input.tool_input?.new_string || "";

const isEmailTemplate =
  /templates[/\\]email/i.test(filePath) ||
  /email.*template/i.test(filePath) ||
  /newsletter/i.test(filePath);

if (!isEmailTemplate) {
  process.exit(0);
}

const warnings = [];

if (!/abmeld|abbestell|opt.?out|unsubscribe/i.test(content)) {
  warnings.push("Fehlender Abmeldelink (DSGVO Art. 7 Abs. 3)");
}

if (!/impressum|menschlichkeit-oesterreich\.at\/impressum/i.test(content)) {
  warnings.push("Fehlendes Impressum (ECG § 5)");
}

if (!/ZVR|1182213083/i.test(content)) {
  warnings.push("Fehlende ZVR-Nummer (Vereinsgesetz 2002)");
}

if (!/datenschutz|privacy/i.test(content)) {
  warnings.push("Fehlender Datenschutzhinweis (DSGVO Art. 13)");
}

if (warnings.length > 0) {
  const msg = `⚠️ MOe-Compliance: Email-Template DSGVO-Pruefung:\n${warnings.map((w) => `  - ${w}`).join("\n")}\nBitte vor Versand korrigieren!`;
  console.log(JSON.stringify({ additionalContext: msg }));
}

process.exit(0);
