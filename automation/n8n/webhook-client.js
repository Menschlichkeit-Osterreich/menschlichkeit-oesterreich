#!/usr/bin/env node

/**
 * n8n Webhook Integration Helper
 * Für Menschlichkeit Österreich Multi-Service Calls
 */

const axios = require('axios');
const crypto = require('crypto');

class MOEWebhookClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5678';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'MOE-Automation/1.0',
    };

    // Security: Optional webhook signature validation
    this.secret = options.secret || process.env.N8N_WEBHOOK_SECRET;
  }

  /**
   * Build Pipeline Webhook
   */
  async triggerBuild(payload) {
    return this.callWebhook('/webhook/build-pipeline', {
      timestamp: new Date().toISOString(),
      project: 'menschlichkeit-oesterreich',
      ...payload,
    });
  }

  /**
   * Deployment Success/Failure Webhook
   */
  async triggerDeployment(service, status, details = {}) {
    return this.callWebhook('/webhook/deployment', {
      service,
      status, // 'started', 'success', 'failed'
      timestamp: new Date().toISOString(),
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      commit: process.env.GITHUB_SHA || 'local',
      ...details,
    });
  }

  /**
   * Quality Check Webhook (Codacy Integration)
   */
  async triggerQualityCheck(payload) {
    return this.callWebhook('/webhook/quality-check', {
      timestamp: new Date().toISOString(),
      project: 'menschlichkeit-oesterreich',
      ...payload,
    });
  }

  /**
   * CRM Event Webhook (CiviCRM Integration)
   */
  async triggerCRMEvent(eventType, data) {
    return this.callWebhook('/webhook/crm-event', {
      eventType, // 'member_added', 'payment_received', 'event_created'
      timestamp: new Date().toISOString(),
      source: 'civicrm',
      data,
    });
  }

  /**
   * API Health Check Webhook
   */
  async triggerHealthCheck(services) {
    return this.callWebhook('/webhook/health-check', {
      timestamp: new Date().toISOString(),
      services,
      environment: process.env.NODE_ENV || 'development',
    });
  }

  /**
   * Gaming Platform Webhook (Achievement, User Registration)
   */
  async triggerGamingEvent(eventType, userId, data = {}) {
    return this.callWebhook('/webhook/gaming-event', {
      eventType, // 'achievement_unlocked', 'user_registered', 'level_completed'
      userId,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * Generic Webhook Call mit Error Handling
   */
  async callWebhook(path, payload) {
    try {
      const url = `${this.baseUrl}${path}`;
      const headers = { ...this.defaultHeaders };

      // Add signature if secret is configured
      if (this.secret) {
        const signature = this.generateSignature(payload);
        headers['X-Webhook-Signature'] = signature;
      }

      console.log(`[n8n] Calling webhook: ${url}`);

      const response = await axios.post(url, payload, {
        headers,
        timeout: 30000, // 30 second timeout
        validateStatus: status => status < 500, // Don't throw on 4xx
      });

      if (response.status >= 400) {
        console.warn(`[n8n] Webhook warning: ${response.status} - ${response.statusText}`);
        return { success: false, status: response.status, data: response.data };
      }

      console.log(`[n8n] Webhook success: ${response.status}`);
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('[n8n] n8n service not available - webhook skipped');
        return { success: false, error: 'n8n_unavailable' };
      }

      console.error('[n8n] Webhook error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HMAC signature for webhook security
   */
  generateSignature(payload) {
    if (!this.secret) return null;

    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', this.secret).update(payloadString).digest('hex');
  }
}

// CLI Usage Support
if (require.main === module) {
  const client = new MOEWebhookClient();
  const [, , action, ...args] = process.argv;

  switch (action) {
    case 'build':
      const buildStatus = args[0] || 'started';
      client
        .triggerBuild({ status: buildStatus, args: args.slice(1) })
        .then(result => console.log('Build webhook result:', result));
      break;

    case 'deploy':
      const [service, status] = args;
      client
        .triggerDeployment(service, status)
        .then(result => console.log('Deploy webhook result:', result));
      break;

    case 'health':
      const services = args.length ? args : ['api', 'crm', 'frontend', 'games'];
      client
        .triggerHealthCheck(services)
        .then(result => console.log('Health webhook result:', result));
      break;

    default:
      console.log('Usage: node webhook-client.js [build|deploy|health] [args...]');
      console.log('Examples:');
      console.log('  node webhook-client.js build started');
      console.log('  node webhook-client.js deploy api success');
      console.log('  node webhook-client.js health api crm');
  }
}

module.exports = MOEWebhookClient;
