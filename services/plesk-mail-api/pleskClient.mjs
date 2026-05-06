/**
 * Plesk Obsidian XML API Client — Node.js (ESM)
 *
 * Production-ready with retry/backoff, structured logging, TLS enforcement.
 * Authentication: HTTP_AUTH_LOGIN / HTTP_AUTH_PASSWD headers.
 *
 * Dependency: fast-xml-parser ^5
 */

import https from "node:https";
import fs from "node:fs";
import { XMLParser } from "fast-xml-parser";

const PACKET_VERSION = "1.6.9.1";
const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

// ── Helpers ────────────────────────────────────────────────────

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function redactPassword(xml) {
  return xml.replace(
    /(<password>\s*<value>)([\s\S]*?)(<\/value>)/g,
    "$1***REDACTED***$3"
  );
}

function log(level, msg, ...args) {
  const ts = new Date().toISOString();
  console[level](`${ts} [plesk] ${msg}`, ...args);
}

// ── Error ──────────────────────────────────────────────────────

export class PleskAPIError extends Error {
  constructor(errcode, errtext) {
    super(`Plesk API error ${errcode}: ${errtext}`);
    this.name = "PleskAPIError";
    this.errcode = errcode;
    this.errtext = errtext;
  }
}

// ── Client ─────────────────────────────────────────────────────

export class PleskClient {
  #url;
  #headers;
  #timeout;
  #maxRetries;
  #backoffMs;
  #agentOptions;

  /**
   * @param {object} opts
   * @param {string} opts.host - Plesk hostname or IP
   * @param {string} opts.login - HTTP_AUTH_LOGIN value
   * @param {string} opts.password - HTTP_AUTH_PASSWD value
   * @param {number} [opts.port=8443]
   * @param {number} [opts.timeout=30000] - ms
   * @param {number} [opts.maxRetries=3]
   * @param {number} [opts.backoffMs=1000]
   * @param {boolean} [opts.rejectUnauthorized=true]
   * @param {string} [opts.caCertPath] - Path to CA cert for self-signed
   */
  constructor({
    host,
    login,
    password,
    port = 8443,
    timeout = 30000,
    maxRetries = 3,
    backoffMs = 1000,
    rejectUnauthorized = true,
    caCertPath,
  }) {
    this.#url = new URL(
      `https://${host}:${port}/enterprise/control/agent.php`
    );
    this.#headers = {
      HTTP_AUTH_LOGIN: login,
      HTTP_AUTH_PASSWD: password,
      "Content-Type": "text/xml",
    };
    this.#timeout = timeout;
    this.#maxRetries = maxRetries;
    this.#backoffMs = backoffMs;
    this.#agentOptions = { rejectUnauthorized };

    if (caCertPath) {
      this.#agentOptions.ca = fs.readFileSync(caCertPath);
    }

    log("info", `Initialized for ${host}:${port}`);
  }

  // ── Internal ───────────────────────────────────────────────

  #buildPacket(innerXml) {
    return `<?xml version="1.0" encoding="UTF-8"?><packet version="${PACKET_VERSION}">${innerXml}</packet>`;
  }

  async #send(innerXml) {
    const body = this.#buildPacket(innerXml);
    log("debug", "Request: %s", redactPassword(body).slice(0, 500));

    let lastErr;
    for (let attempt = 0; attempt <= this.#maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = this.#backoffMs * 2 ** (attempt - 1);
        log("warn", `Retry ${attempt}/${this.#maxRetries} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }

      try {
        const t0 = performance.now();
        const text = await this.#request(body);
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
        log("debug", `Response in ${elapsed}s (${text.length} bytes)`);

        const parsed = parser.parse(text);
        if (!parsed.packet) {
          throw new Error("Missing <packet> root in response");
        }
        return parsed.packet;
      } catch (err) {
        lastErr = err;
        // Don't retry Plesk API errors or client errors
        if (err instanceof PleskAPIError) throw err;
        if (err.statusCode && err.statusCode < 500) throw err;
        log("error", `Attempt ${attempt} failed: ${err.message}`);
      }
    }
    throw lastErr;
  }

  #request(body) {
    return new Promise((resolve, reject) => {
      const options = {
        method: "POST",
        hostname: this.#url.hostname,
        port: this.#url.port,
        path: this.#url.pathname,
        headers: {
          ...this.#headers,
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: this.#timeout,
        ...this.#agentOptions,
      };

      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const data = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode >= 400) {
            const err = new Error(`HTTP ${res.statusCode}`);
            err.statusCode = res.statusCode;
            return reject(err);
          }
          resolve(data);
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });
      req.write(body);
      req.end();
    });
  }

  #checkResult(packet, path) {
    const result = this.#dig(packet, path) ?? this.#dig(packet, "result");
    if (!result) {
      throw new PleskAPIError("0", "No result in response");
    }
    if (result.status !== "ok") {
      throw new PleskAPIError(
        String(result.errcode ?? "unknown"),
        result.errtext ?? "Unknown error"
      );
    }
    return result;
  }

  #dig(obj, dotPath) {
    return dotPath.split(".").reduce((o, k) => o?.[k], obj);
  }

  // ── Site ID ────────────────────────────────────────────────

  async getSiteId(domain) {
    const xml = `<site><get><filter><name>${escapeXml(domain)}</name></filter><dataset><gen_info/></dataset></get></site>`;
    const packet = await this.#send(xml);
    const result = this.#checkResult(packet, "site.get.result");
    const id = result.id ?? result.data?.gen_info?.id;
    if (!id) throw new PleskAPIError("0", `No site-id for domain ${domain}`);
    log("info", `Resolved ${domain} → site-id ${id}`);
    return Number(id);
  }

  // ── Mail CRUD ──────────────────────────────────────────────

  async createMailbox(siteId, name, password) {
    const xml =
      `<mail><create><filter>` +
      `<site-id>${siteId}</site-id>` +
      `<mailname><name>${escapeXml(name)}</name>` +
      `<mailbox><enabled>true</enabled></mailbox>` +
      `<password><value>${escapeXml(password)}</value><type>plain</type></password>` +
      `</mailname></filter></create></mail>`;
    const packet = await this.#send(xml);
    const result = this.#checkResult(packet, "mail.create.result");
    log("info", `Created mailbox '${name}' (id=${result.id}) on site ${siteId}`);
    return Number(result.id);
  }

  async updateMailboxPassword(siteId, name, newPassword) {
    const xml =
      `<mail><update><set><filter>` +
      `<site-id>${siteId}</site-id>` +
      `<mailname><name>${escapeXml(name)}</name>` +
      `<password><value>${escapeXml(newPassword)}</value><type>plain</type></password>` +
      `</mailname></filter></set></update></mail>`;
    const packet = await this.#send(xml);
    this.#checkResult(packet, "mail.update.result");
    log("info", `Updated password for '${name}' on site ${siteId}`);
    return true;
  }

  async enableMailbox(siteId, name, enabled = true) {
    const flag = enabled ? "true" : "false";
    const xml =
      `<mail><update><set><filter>` +
      `<site-id>${siteId}</site-id>` +
      `<mailname><name>${escapeXml(name)}</name>` +
      `<mailbox><enabled>${flag}</enabled></mailbox>` +
      `</mailname></filter></set></update></mail>`;
    const packet = await this.#send(xml);
    this.#checkResult(packet, "mail.update.result");
    log("info", `Set '${name}' enabled=${flag} on site ${siteId}`);
    return true;
  }

  async deleteMailbox(siteId, name, { idempotent = false } = {}) {
    const xml =
      `<mail><remove><filter>` +
      `<site-id>${siteId}</site-id>` +
      `<mailname><name>${escapeXml(name)}</name></mailname>` +
      `</filter></remove></mail>`;
    try {
      const packet = await this.#send(xml);
      this.#checkResult(packet, "mail.remove.result");
    } catch (err) {
      if (idempotent && err instanceof PleskAPIError && err.errcode === "1013") {
        log("info", `Mailbox '${name}' already deleted (idempotent)`);
        return true;
      }
      throw err;
    }
    log("info", `Deleted mailbox '${name}' on site ${siteId}`);
    return true;
  }

  async listMailboxes(siteId) {
    const xml =
      `<mail><get_info><filter>` +
      `<site-id>${siteId}</site-id>` +
      `</filter><mailbox/></get_info></mail>`;
    const packet = await this.#send(xml);
    const results = packet?.mail?.get_info?.result;
    if (!results) return [];
    const arr = Array.isArray(results) ? results : [results];
    const mailboxes = arr
      .filter((r) => r.status === "ok" && r.mailname?.name)
      .map((r) => ({
        name: r.mailname.name,
        enabled: String(r.mailname?.mailbox?.enabled) === "true",
        siteId,
      }));
    log("info", `Listed ${mailboxes.length} mailboxes on site ${siteId}`);
    return mailboxes;
  }
}
