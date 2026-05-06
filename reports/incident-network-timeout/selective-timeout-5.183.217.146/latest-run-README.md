# Selective Timeout Run

- Case: `selective-timeout-5.183.217.146`
- Run: `20260329T201048Z-iphone-hotspot-active`
- Egress label: `iphone-hotspot-active`
- Collected at (UTC): `2026-03-29T20:10:56Z`
- Local host: `virus666`
- Public source IP: `46.125.130.131`

## Key Findings

- DNS A result: `5.183.217.146`
- DNS PTR result: `plesk7.digimagical.com`
- DNS AAAA result: `no_record`
- Direct 443 outcome: `connected`
- SNI/`--resolve` 443 outcome: `connected`
- Direct 8443 outcome: `timeout`
- SSH 22 outcome: `connected_auth_failed`

## Files

- `public-ip.txt`
- `dns-a.txt`
- `dns-ptr.txt`
- `dns-aaaa.txt`
- `curl-direct-443.txt`
- `curl-sni-443.txt`
- `curl-direct-8443.txt`
- `ssh-direct-22.txt`
