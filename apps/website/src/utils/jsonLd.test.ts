import { describe, it, expect } from 'vitest';
import { serializeJsonLd } from './jsonLd';

describe('serializeJsonLd', () => {
  it('returns valid JSON for a plain object', () => {
    const schema = { '@type': 'Organization', name: 'Menschlichkeit Österreich' };
    const result = serializeJsonLd(schema);
    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toEqual(schema);
  });

  it('escapes < to prevent </script> injection', () => {
    const schema = { name: '<script>alert(1)</script>' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('<');
    expect(result).toContain('\\u003C');
  });

  it('escapes </script> tag sequence specifically', () => {
    const schema = { name: '</script><script>evil()' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('</script>');
  });

  it('escapes > to prevent injection', () => {
    const schema = { description: 'A > B' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('>');
    expect(result).toContain('\\u003E');
  });

  it('escapes & to prevent entity injection', () => {
    const schema = { url: 'https://example.com?a=1&b=2' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('&');
    expect(result).toContain('\\u0026');
  });

  it('escapes U+2028 LINE SEPARATOR', () => {
    const schema = { text: 'line\u2028break' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('\u2028');
    expect(result).toContain('\\u2028');
  });

  it('escapes U+2029 PARAGRAPH SEPARATOR', () => {
    const schema = { text: 'para\u2029break' };
    const result = serializeJsonLd(schema);
    expect(result).not.toContain('\u2029');
    expect(result).toContain('\\u2029');
  });

  it('produces output parseable as equivalent JSON after escaping', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [{ '@type': 'Question', name: 'Was ist <Demokratie>?' }],
    };
    const result = serializeJsonLd(schema);
    const parsed = JSON.parse(result);
    expect(parsed.mainEntity[0].name).toBe('Was ist <Demokratie>?');
  });

  it('handles null and primitive values', () => {
    expect(serializeJsonLd(null)).toBe('null');
    expect(serializeJsonLd(42)).toBe('42');
    expect(serializeJsonLd('hello')).toBe('"hello"');
  });
});
