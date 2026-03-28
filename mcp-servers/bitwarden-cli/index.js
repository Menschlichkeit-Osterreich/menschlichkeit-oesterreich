#!/usr/bin/env node

/**
 * Bitwarden CLI MCP Server - Menschlichkeit Oesterreich
 *
 * Provides vault access and project secret management via MCP protocol.
 * Security: execFileSync only, in-memory session, output sanitization.
 */

'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { BwError } = require('./lib/errors');
const BwRunner = require('./lib/runner');
const Session = require('./lib/session');
const Auth = require('./lib/auth');
const Vault = require('./lib/vault');
const SecretsManager = require('./lib/secrets-manager');

// --- Rate Limiter (from file-server pattern) ---

class TokenBucket {
  constructor(capacity, refillRate, refillIntervalMs) {
    this._capacity = capacity;
    this._tokens = capacity;
    this._refillRate = refillRate;
    this._refillIntervalMs = refillIntervalMs;
    this._lastRefill = Date.now();
  }

  consume(count) {
    this._refill();
    if (this._tokens >= count) {
      this._tokens -= count;
      return true;
    }
    return false;
  }

  _refill() {
    const now = Date.now();
    const elapsed = now - this._lastRefill;
    const intervals = Math.floor(elapsed / this._refillIntervalMs);
    if (intervals > 0) {
      this._tokens = Math.min(this._capacity, this._tokens + intervals * this._refillRate);
      this._lastRefill = now;
    }
  }
}

// --- Tool Definitions ---

const TOOLS = [
  // Auth & Status
  {
    name: 'bw_status',
    description: 'Vault-Status abfragen (unauthenticated/locked/unlocked)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'bw_login',
    description: 'Bei Bitwarden anmelden (API-Key oder SSO)',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['apikey', 'sso'], default: 'apikey', description: 'Login-Methode' },
      },
    },
  },
  {
    name: 'bw_unlock',
    description: 'Vault entsperren (liest BW_PASSWORD aus Umgebungsvariable)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'bw_lock',
    description: 'Vault sperren',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'bw_logout',
    description: 'Von Bitwarden abmelden',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'bw_sync',
    description: 'Vault mit Server synchronisieren',
    inputSchema: { type: 'object', properties: {} },
  },

  // Read operations
  {
    name: 'bw_list_items',
    description: 'Vault-Eintraege auflisten (Passwoerter werden ausgeblendet)',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Suchbegriff' },
        folderId: { type: 'string', description: 'Ordner-ID Filter' },
        collectionId: { type: 'string', description: 'Sammlung-ID Filter' },
        organizationId: { type: 'string', description: 'Organisation-ID Filter' },
        trash: { type: 'boolean', description: 'Papierkorb anzeigen' },
        archived: { type: 'boolean', description: 'Archivierte anzeigen' },
      },
    },
  },
  {
    name: 'bw_get_item',
    description: 'Einzelnen Vault-Eintrag abrufen (Passwort ausgeblendet)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID oder Suchbegriff' },
      },
      required: ['id'],
    },
  },
  {
    name: 'bw_get_password',
    description: 'Passwort eines Vault-Eintrags abrufen',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID oder Suchbegriff' },
      },
      required: ['id'],
    },
  },
  {
    name: 'bw_get_totp',
    description: 'TOTP-Code eines Vault-Eintrags abrufen',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID oder Suchbegriff' },
      },
      required: ['id'],
    },
  },
  {
    name: 'bw_get_notes',
    description: 'Notizen eines Vault-Eintrags abrufen',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID oder Suchbegriff' },
      },
      required: ['id'],
    },
  },

  // Write operations
  {
    name: 'bw_create_item',
    description: 'Neuen Vault-Eintrag erstellen (1=Login, 2=Notiz, 3=Karte, 4=Identitaet)',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'integer', enum: [1, 2, 3, 4], description: '1=Login, 2=Sichere Notiz, 3=Karte, 4=Identitaet' },
        name: { type: 'string', description: 'Name des Eintrags' },
        notes: { type: 'string', description: 'Notizen' },
        folderId: { type: 'string', description: 'Ordner-ID' },
        organizationId: { type: 'string', description: 'Organisation-ID' },
        collectionIds: { type: 'array', items: { type: 'string' }, description: 'Sammlungs-IDs' },
        login: {
          type: 'object',
          description: 'Login-Daten (nur bei type=1)',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
            uris: { type: 'array', items: { type: 'object', properties: { uri: { type: 'string' } } } },
            totp: { type: 'string' },
          },
        },
        card: {
          type: 'object',
          description: 'Kartendaten (nur bei type=3)',
          properties: {
            cardholderName: { type: 'string' },
            brand: { type: 'string' },
            number: { type: 'string' },
            expMonth: { type: 'string' },
            expYear: { type: 'string' },
            code: { type: 'string' },
          },
        },
        identity: { type: 'object', description: 'Identitaetsdaten (nur bei type=4)' },
      },
      required: ['type', 'name'],
    },
  },
  {
    name: 'bw_edit_item',
    description: 'Vault-Eintrag bearbeiten',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID' },
        name: { type: 'string' },
        notes: { type: 'string' },
        folderId: { type: 'string' },
        login: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' }, totp: { type: 'string' } } },
      },
      required: ['id'],
    },
  },
  {
    name: 'bw_delete_item',
    description: 'Vault-Eintrag loeschen (Standard: Papierkorb)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID' },
        permanent: { type: 'boolean', default: false, description: 'Dauerhaft loeschen (unwiderruflich!)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'bw_restore_item',
    description: 'Vault-Eintrag aus Papierkorb wiederherstellen',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item-ID' },
      },
      required: ['id'],
    },
  },

  // Utility
  {
    name: 'bw_generate',
    description: 'Passwort oder Passphrase generieren',
    inputSchema: {
      type: 'object',
      properties: {
        length: { type: 'integer', minimum: 5, default: 18, description: 'Passwortlaenge' },
        uppercase: { type: 'boolean', default: true },
        lowercase: { type: 'boolean', default: true },
        number: { type: 'boolean', default: true },
        special: { type: 'boolean', default: true },
        passphrase: { type: 'boolean', description: 'Passphrase statt Passwort' },
        words: { type: 'integer', minimum: 3, description: 'Anzahl Woerter (Passphrase)' },
        separator: { type: 'string', description: 'Trennzeichen (Passphrase)' },
        capitalize: { type: 'boolean', description: 'Grossbuchstaben (Passphrase)' },
        includeNumber: { type: 'boolean', description: 'Zahl einschliessen (Passphrase)' },
      },
    },
  },
  {
    name: 'bw_list_folders',
    description: 'Ordner auflisten',
    inputSchema: {
      type: 'object',
      properties: { search: { type: 'string' } },
    },
  },
  {
    name: 'bw_list_collections',
    description: 'Sammlungen auflisten',
    inputSchema: {
      type: 'object',
      properties: { organizationId: { type: 'string' } },
    },
  },
  {
    name: 'bw_list_organizations',
    description: 'Organisationen auflisten',
    inputSchema: { type: 'object', properties: {} },
  },

  // Project Secret Management
  {
    name: 'bw_populate_env',
    description: 'Secrets aus Bitwarden in .env-Datei eintragen (ersetzt CHANGE_ME-Platzhalter)',
    inputSchema: {
      type: 'object',
      properties: {
        envFile: { type: 'string', description: 'Pfad zur .env-Datei (relativ zu PROJECT_ROOT)' },
        mapping: {
          type: 'array',
          description: 'Zuordnung: envVar -> Bitwarden-Eintrag',
          items: {
            type: 'object',
            properties: {
              envVar: { type: 'string', description: 'Name der Umgebungsvariable' },
              bwItemSearch: { type: 'string', description: 'Bitwarden-Suchbegriff oder Item-ID' },
              bwField: { type: 'string', enum: ['password', 'username', 'notes', 'totp'], description: 'Welches Feld aus dem BW-Eintrag' },
            },
            required: ['envVar', 'bwItemSearch', 'bwField'],
          },
        },
      },
      required: ['envFile', 'mapping'],
    },
  },
  {
    name: 'bw_audit_secrets',
    description: 'Secrets gegen SECRETS-AUDIT.md pruefen (fehlende, abgelaufene)',
    inputSchema: {
      type: 'object',
      properties: {
        auditFilePath: { type: 'string', description: 'Pfad zur Audit-Datei (Standard: secrets/SECRETS-AUDIT.md)' },
      },
    },
  },
  {
    name: 'bw_rotate_secret',
    description: 'Secret rotieren: neu generieren, Vault aktualisieren, optional .env updaten',
    inputSchema: {
      type: 'object',
      properties: {
        bwItemId: { type: 'string', description: 'Bitwarden Item-ID' },
        envVar: { type: 'string', description: 'Umgebungsvariable' },
        envFile: { type: 'string', description: 'Pfad zur .env-Datei (optional)' },
        generatorOptions: {
          type: 'object',
          description: 'Passwort-Generator-Optionen',
          properties: {
            length: { type: 'integer' },
            special: { type: 'boolean' },
            passphrase: { type: 'boolean' },
          },
        },
      },
      required: ['bwItemId', 'envVar'],
    },
  },
  {
    name: 'bw_import_credentials',
    description: 'Klartext-Zugangsdaten aus Datei in Bitwarden importieren',
    inputSchema: {
      type: 'object',
      properties: {
        sourceFile: { type: 'string', description: 'Pfad zur Quelldatei' },
        folderId: { type: 'string', description: 'Ziel-Ordner-ID in Bitwarden' },
      },
      required: ['sourceFile'],
    },
  },
];

// Sensitive tools that get stricter rate limiting
const SENSITIVE_TOOLS = new Set([
  'bw_get_password', 'bw_get_totp',
  'bw_create_item', 'bw_edit_item', 'bw_delete_item',
  'bw_populate_env', 'bw_rotate_secret', 'bw_import_credentials',
]);

// --- Main MCP Server ---

class BitwardenCliMCP {
  constructor() {
    this.server = new Server(
      { name: 'menschlichkeit-bitwarden-cli', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this._session = new Session();
    this._runner = new BwRunner(this._session.ref);
    this._auth = new Auth(this._runner, this._session);
    this._vault = new Vault(this._runner, this._session);
    this._secrets = new SecretsManager(this._runner, this._session, this._vault);

    // Rate limiters
    this._readLimiter = new TokenBucket(30, 30, 10000);   // 30 ops / 10s
    this._writeLimiter = new TokenBucket(10, 10, 10000);   // 10 ops / 10s

    this._setupHandlers();
    this._setupShutdown();
  }

  _setupShutdown() {
    const cleanup = () => {
      try {
        if (this._session.status === Session.STATUS.UNLOCKED) {
          this._auth.lock();
        }
      } catch {
        // Best-effort cleanup
      }
    };
    process.on('exit', cleanup);
    process.on('SIGINT', () => { cleanup(); process.exit(0); });
    process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  }

  _setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Rate limiting
      const isSensitive = SENSITIVE_TOOLS.has(name);
      const limiter = isSensitive ? this._writeLimiter : this._readLimiter;
      if (!limiter.consume(1)) {
        return {
          content: [{ type: 'text', text: 'Rate-Limit erreicht. Bitte kurz warten.' }],
          isError: true,
        };
      }

      try {
        const result = this._dispatch(name, args || {});
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        if (err instanceof BwError) {
          return err.toMcpResponse();
        }
        return {
          content: [{ type: 'text', text: '[FEHLER] ' + (err.message || 'Unbekannter Fehler') }],
          isError: true,
        };
      }
    });
  }

  _dispatch(name, args) {
    switch (name) {
      // Auth & Status
      case 'bw_status': return this._auth.getStatus();
      case 'bw_login':
        return args.method === 'sso' ? this._auth.loginSSO() : this._auth.loginApiKey();
      case 'bw_unlock': return this._auth.unlock();
      case 'bw_lock': return this._auth.lock();
      case 'bw_logout': return this._auth.logout();
      case 'bw_sync': return this._vault.sync();

      // Read
      case 'bw_list_items': return this._vault.listItems(args);
      case 'bw_get_item': return this._vault.getItem(args.id);
      case 'bw_get_password': return this._vault.getPassword(args.id);
      case 'bw_get_totp': return this._vault.getTotp(args.id);
      case 'bw_get_notes': return this._vault.getNotes(args.id);

      // Write
      case 'bw_create_item': return this._vault.createItem(args);
      case 'bw_edit_item': return this._vault.editItem(args.id, args);
      case 'bw_delete_item': return this._vault.deleteItem(args.id, args.permanent);
      case 'bw_restore_item': return this._vault.restoreItem(args.id);

      // Utility
      case 'bw_generate': return this._vault.generate(args);
      case 'bw_list_folders': return this._vault.listFolders(args);
      case 'bw_list_collections': return this._vault.listCollections(args);
      case 'bw_list_organizations': return this._vault.listOrganizations();

      // Project Secret Management
      case 'bw_populate_env': return this._secrets.populateEnv(args.envFile, args.mapping);
      case 'bw_audit_secrets': return this._secrets.auditSecrets(args.auditFilePath);
      case 'bw_rotate_secret':
        return this._secrets.rotateSecret(args.bwItemId, args.envVar, args.envFile, args.generatorOptions);
      case 'bw_import_credentials':
        return this._secrets.importCredentials(args.sourceFile, args.folderId);

      default:
        return { error: 'Unbekanntes Tool: ' + name };
    }
  }

  async start() {
    // Auto-login if credentials available (non-fatal)
    try {
      const status = this._auth.autoLoginAndUnlock();
      if (status.status !== Session.STATUS.UNAUTHENTICATED) {
        process.stderr.write('[bitwarden-cli] Status: ' + status.status + '\n');
      }
    } catch (err) {
      process.stderr.write('[bitwarden-cli] Auto-Login fehlgeschlagen: ' + err.message + '\n');
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// --- Entry Point ---

if (require.main === module) {
  const server = new BitwardenCliMCP();
  server.start().catch((err) => {
    process.stderr.write('[bitwarden-cli] Startfehler: ' + err.message + '\n');
    process.exit(1);
  });
}

module.exports = BitwardenCliMCP;
