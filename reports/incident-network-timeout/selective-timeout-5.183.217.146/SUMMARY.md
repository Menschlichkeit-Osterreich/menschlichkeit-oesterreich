# Selective Timeout Case Summary

- Case: `selective-timeout-5.183.217.146`
- Target host: `plesk7.digimagical.com`
- Target IP: `5.183.217.146`
- Generated (UTC): `2026-03-29T19:54:51Z`

## Run Matrix

| Run                            | Egress        | UTC                  | Public IP    | A             | PTR                    | AAAA      | 443 direct | 443 SNI | 8443 direct | SSH 22  |
| ------------------------------ | ------------- | -------------------- | ------------ | ------------- | ---------------------- | --------- | ---------- | ------- | ----------- | ------- |
| 20260329T194913Z-current-shell | current-shell | 2026-03-29T19:49:35Z | 81.217.7.174 | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout | timeout     | timeout |
| 20260329T195425Z-current-shell | current-shell | 2026-03-29T19:54:51Z | 81.217.7.174 | 5.183.217.146 | plesk7.digimagical.com | no_record | timeout    | timeout | timeout     | timeout |

## Current Assessment

- Fuer mindestens einen Run scheitern direkte IP und `--resolve` identisch; DNS ist fuer diesen Pfad nicht die Primaerursache.
- Ein funktionierender Kontrollpfad (LTE oder VPN) fehlt noch; selektives Filtering ist plausibel, aber noch nicht provider-tauglich bewiesen.
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
