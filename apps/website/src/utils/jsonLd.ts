/**
 * Safe JSON-LD serializer for embedding structured data in HTML <script> tags.
 *
 * JSON.stringify alone is NOT safe for HTML embedding:
 * - Values containing "</script>" would close the script tag prematurely
 * - U+2028 / U+2029 are valid in JSON but not inside HTML script blocks
 *
 * This function escapes the 5 characters that are dangerous inside a
 * <script> block. The Unicode escape sequences (\u003C etc.) are valid JSON
 * and semantically identical for all JSON-LD parsers.
 */
export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
