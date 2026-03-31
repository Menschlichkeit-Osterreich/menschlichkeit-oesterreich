# Selective Timeout Case Summary

- Case: `selective-timeout-5.183.217.146`
- Target host: `plesk7.digimagical.com`
- Target IP: `5.183.217.146`
- Generated (UTC): `2026-03-29T20:10:56Z`

## Run Matrix

| Run                                    | Egress                | UTC                  | Public IP      | A             | PTR                    | AAAA      | 443 direct | 443 SNI   | 8443 direct | SSH 22                |
| -------------------------------------- | --------------------- | -------------------- | -------------- | ------------- | ---------------------- | --------- | ---------- | --------- | ----------- | --------------------- |
| 20260329T194913Z-current-shell         | current-shell         | 2026-03-29T19:49:35Z | 81.217.7.174   | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout   | timeout     | timeout               |
| 20260329T195425Z-current-shell         | current-shell         | 2026-03-29T19:54:51Z | 81.217.7.174   | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout   | timeout     | timeout               |
| 20260329T200333Z-iphone-hotspot        | iphone-hotspot        | 2026-03-29T20:03:55Z | 81.217.7.174   | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout   | timeout     | timeout               |
| 20260329T200458Z-iphone-hotspot        | iphone-hotspot        | 2026-03-29T20:05:25Z | 81.217.7.174   | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout   | timeout     | timeout               |
| 20260329T200917Z-iphone-hotspot-active | iphone-hotspot-active | 2026-03-29T20:09:25Z | 46.125.130.131 | 5.183.217.146 | plesk7.digimagical.com | no_record | connected  | connected | timeout     | connected_auth_failed |
| 20260329T201048Z-iphone-hotspot-active | iphone-hotspot-active | 2026-03-29T20:10:56Z | 46.125.130.131 | 5.183.217.146 | plesk7.digimagical.com | no_record | connected  | connected | timeout     | connected_auth_failed |

## Current Assessment

- Mindestens ein Egress timed out auf direkter IP und mit `--resolve`; DNS ist fuer diese Runs nicht ursaechlich.
- Mindestens ein anderer Egress erreicht den Zielhost oder zumindest den TCP/TLS/SSH-Handshake; source-/path-selektives Filtering ist derzeit die staerkste Hypothese.
- Port 8443 timed out bislang auch auf dem Kontrollpfad und sollte separat von 22/443 bewertet werden.
- Ein Mitschnitt aus WSL2/NAT ist nicht beweiskraeftig fuer Paketankunft auf dem Zielhost; provider- oder hostseitiger Mitschnitt bleibt Pflicht.

## Next Provider-Side Step

```bash
tcpdump -ni any -vv 'src host <aktuelle_quell_ip> and (tcp port 22 or 443 or 8443)'
```

- SYN sichtbar: eher host-lokaler oder hostnaher Security-Block.
- Kein SYN sichtbar: eher upstream/providerseitiges Filtering.

## References

- https://learn.microsoft.com/windows/wsl/networking
- https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/ip_ban-ip-address-banning-fail2ban.73594/
- https://support.plesk.com/hc/en-us/articles/12377562770967-Site-is-not-accesible-Unable-to-connect-connection-timed-out-This-site-can-t-be-reached
