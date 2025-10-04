import { describe, it, expect } from '@jest/globals';
import { PiiSanitizerNode } from '../PiiSanitizer.node';
// Typen für Test-Runner (Jest)
import { IExecuteFunctions } from 'n8n-workflow';

describe('PII-Sanitizer Node', () => {
    const node = new PiiSanitizerNode();
    const mockExecuteFunctions = {
        getInputData: () => [{ json: {} }],
        getNodeParameter: (name: string) => {
            if (name === 'text') return 'Max Mustermann, max@beispiel.at, 4111111111111111';
            if (name === 'piiTypes') return ['email', 'card'];
            if (name === 'metrics') return true;
            return undefined;
        },
    } as unknown as IExecuteFunctions;

    it('maskiert E-Mail und Kreditkarte korrekt', async () => {
        const result = await node.execute.call(mockExecuteFunctions);
        expect(result[0][0].json.sanitized).not.toContain('max@beispiel.at');
        expect(result[0][0].json.sanitized).not.toContain('4111111111111111');
        expect(result[0][0].json.metrics).toBeDefined();
    });

    it('gibt korrekten Output bei leerem Input', async () => {
        const badMock = {
            getInputData: () => [{ json: {} }],
            getNodeParameter: (name: string) => {
                if (name === 'text') return '';
                if (name === 'piiTypes') return [];
                if (name === 'metrics') return false;
                return undefined;
            },
        } as unknown as IExecuteFunctions;
        const result = await node.execute.call(badMock);
        expect(result[0][0].json.sanitized).toBe('');
    });
});
