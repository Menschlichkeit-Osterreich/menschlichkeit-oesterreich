<?php
/**
 * MOE CSP Event Listener
 *
 * Setzt Content-Security-Policy und weitere Sicherheits-Header
 * gemäß docs/forum/SECURITY.md Spezifikation.
 */

namespace moe\csp\event;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class listener implements EventSubscriberInterface
{
    /** @var \phpbb\request\request */
    private $request;

    public function __construct(\phpbb\request\request $request)
    {
        $this->request = $request;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'core.page_header' => 'set_security_headers',
        ];
    }

    public function set_security_headers(): void
    {
        if (headers_sent()) {
            return;
        }

        // Content-Security-Policy (strikt – keine inline Scripts/Styles)
        header(
            "Content-Security-Policy: " .
            "default-src 'self'; " .
            "script-src 'self'; " .
            "style-src 'self' 'unsafe-inline'; " .   // phpBB benötigt inline-Styles
            "img-src 'self' data:; " .
            "font-src 'self'; " .
            "connect-src 'self'; " .
            "frame-ancestors 'none'; " .
            "form-action 'self';"
        );

        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    }
}
