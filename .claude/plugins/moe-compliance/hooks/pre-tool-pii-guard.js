#!/usr/bin/env node
/**
 * PreToolUse hook: Blocks Bash commands that might leak PII via URL parameters.
 * Detects patterns like curl/wget with email addresses or phone numbers in URLs.
 */
import { readFileSync } from "fs";

const input = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
const command = input.tool_input?.command || "";

// Detect PII in URL parameters
const piiPatterns = [
  /[?&](email|mail|e-mail)=[^\s&]+@[^\s&]+/i,
  /[?&](phone|tel|telefon|nummer)=[\d+\s-]{6,}/i,
  /[?&](name|vorname|nachname)=[A-Za-zÄÖÜäöüß]{2,}/i,
  /[?&](iban|bic|konto)=[A-Z]{2}\d{2}/i,
  /[?&](svnr|sozialversicherung)=\d{4}/i,
];

const isHttpCommand = /\b(curl|wget|http|fetch)\b/i.test(command);

if (isHttpCommand) {
  for (const pattern of piiPatterns) {
    if (pattern.test(command)) {
      console.log(
        JSON.stringify({
          error:
            "BLOCKIERT: PII (personenbezogene Daten) in URL-Parametern erkannt! " +
            "PII duerfen NIEMALS in URLs uebertragen werden (DSGVO Art. 5). " +
            "Verwende POST-Body oder verschluesselte Uebertragung.",
        })
      );
      process.exit(1);
    }
  }
}

process.exit(0);
