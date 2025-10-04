import {
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  IExecuteFunctions,
} from 'n8n-workflow';
import { execFile } from 'child_process';

export class PiiSanitizerNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'PII-Sanitizer',
    name: 'piiSanitizer',
    group: ['transform'],
    version: 1,
    description: 'Reduziert DSGVO-relevante PII in Texten',
    defaults: {
      name: 'PII-Sanitizer',
      color: '#e63946',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        description: 'Zu maskierender Text',
        required: true,
      },
      {
        displayName: 'PII-Typen',
        name: 'piiTypes',
        type: 'multiOptions',
        options: [
          { name: 'E-Mail', value: 'email' },
          { name: 'Telefon', value: 'phone' },
          { name: 'Kreditkarte', value: 'card' },
          { name: 'IBAN', value: 'iban' },
          { name: 'JWT', value: 'jwt' },
          { name: 'IP-Adresse', value: 'ip' },
          { name: 'API-Secret', value: 'secret' },
        ],
        default: [],
        description: 'Zu maskierende PII-Typen',
      },
      {
        displayName: 'Metrics ausgeben',
        name: 'metrics',
        type: 'boolean',
        default: false,
        description: 'Gibt Metriken zur Maskierung aus',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const text = this.getNodeParameter('text', i) as string;
      const piiTypes = this.getNodeParameter('piiTypes', i) as string[];
      const metrics = this.getNodeParameter('metrics', i) as boolean;

      // Child process: PHP PiiSanitizer.php
      const result = await new Promise<{ sanitized: string; metrics?: Record<string, unknown> }>(
        (resolve, reject) => {
          execFile(
            'php',
            [
              '/workspaces/menschlichkeit-oesterreich-development/crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/bin/cli-wrapper.php',
              '--text',
              text,
              '--types',
              piiTypes.join(','),
              '--metrics',
              metrics ? '1' : '0',
            ],
            { timeout: 5000 },
            (error, stdout, _stderr) => {
              if (error) {
                reject(new Error(`PII-Sanitizer PHP-Fehler: ${error.message}`));
              } else {
                if (!stdout || stdout.trim() === '') {
                  reject(new Error('PII-Sanitizer: Keine Ausgabe vom PHP-Skript erhalten.'));
                  return;
                }
                try {
                  const output = JSON.parse(stdout);
                  resolve(output);
                } catch (_e) {
                  reject(new Error('PII-Sanitizer: Ungültige JSON-Ausgabe vom PHP-Skript.'));
                }
              }
            }
          );
        }
      );

      returnData.push({
        json: {
          sanitized: result.sanitized,
          metrics: metrics ? result.metrics : undefined,
        },
      });
    }
    return [returnData];
  }
}
