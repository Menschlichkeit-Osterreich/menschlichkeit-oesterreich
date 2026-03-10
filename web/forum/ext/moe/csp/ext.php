<?php
/**
 * MOE Content-Security-Policy Extension
 *
 * Fügt CSP-Header ein, die in docs/forum/SECURITY.md spezifiziert sind.
 * Issue #176 – Phase 4: CI/CD-Aktivierung + Sicherheitshärtung
 */

namespace moe\csp;

class ext extends \phpbb\extension\base
{
    public function is_enableable()
    {
        return phpbb_version_compare(PHPBB_VERSION, '3.3.0', '>=');
    }
}
