# Runbook: Selektive Connect-Timeouts zu einem Plesk-Host

**Letztes Update**: 2026-03-29 | **Verwandte SOPs**: [Incident Response](../docs/operations/incident-response.md)

> Dieses Runbook erzeugt provider-taugliche Artefakte fuer source-/path-selektive Netzwerkprobleme.

---

## Zielbild

- DNS als Primaerursache ausschliessen.
- Mehrere Egress-Pfade mit identischen Tests vergleichen.
- Einen Ticket-Entwurf und eine Repro-Matrix direkt im Repo erzeugen.

---

## Voraussetzungen

- PowerShell 7 (`pwsh`)
- `curl` und `ssh` im `PATH`
- Netzwerkzugang vom jeweiligen Egress
- Fuer den beweisenden Paketmitschnitt: Provider- oder Root-Zugriff auf den Zielhost

---

## Schritt 1: Collector je Egress ausfuehren

```bash
npm run security:incident:network-timeout -- --CaseName selective-timeout-5.183.217.146 --EgressLabel kabelplus
npm run security:incident:network-timeout -- --CaseName selective-timeout-5.183.217.146 --EgressLabel lte
npm run security:incident:network-timeout -- --CaseName selective-timeout-5.183.217.146 --EgressLabel vpn
```

Der Collector speichert je Lauf:

- oeffentliche Quell-IP
- DNS A/PTR/AAAA
- `curl -vk` auf `443` und `8443`
- `curl --resolve` fuer Hostname plus SNI ohne DNS
- SSH-Connect-Test auf `22`

Artefakte landen unter:

```text
quality-reports/incident-network-timeout/<case>/runs/<timestamp>-<egress>/
```

Fuer direkte IDE-Navigation werden die aktuellsten, gut lesbaren Dateien zusaetzlich hier gespiegelt:

```text
reports/incident-network-timeout/<case>/
```

---

## Schritt 2: Matrix lesen

Nach jedem Lauf aktualisiert der Collector automatisch:

- `SUMMARY.md`
- `provider-ticket.md`
- `latest-run-metadata.json` im publizierten `reports/`-Pfad

Interpretation:

- `direct 443 = timeout` und `SNI 443 = timeout`: DNS ist fuer diesen Pfad nicht die Primaerursache.
- `LTE/VPN erreicht Host`, `Kabelplus timed out`: source-/path-selektives Filtering ist sehr wahrscheinlich.
- `alle Runs timed out`: genereller Host-/Provider-Ausfall bleibt moeglich.

---

## Schritt 3: Provider-Mitschnitt anfordern

Provider oder Hoster sollen waehrend eines angekuendigten Repro-Fensters ausfuehren:

```bash
tcpdump -ni any -vv 'src host <aktuelle_quell_ip> and (tcp port 22 or 443 or 8443)'
```

Entscheidungsregel:

- SYN sichtbar: eher host-lokaler oder hostnaher Security-Block
- kein SYN sichtbar: eher upstream/providerseitiges Filtering

---

## Schritt 4: Ticket versenden

Der jeweils aktuelle Entwurf liegt hier:

```text
quality-reports/incident-network-timeout/<case>/provider-ticket.md
```

Vor dem Versand:

- pruefen, dass die failing source IP aktuell ist
- Zeitfenster mit UTC angeben
- wenn moeglich einen funktionierenden Kontrollpfad (LTE oder VPN) beilegen
- darauf hinweisen, dass fruehere WSL2-/NAT-Mitschnitte nicht beweiskraeftig sind

---

## Hinweis zu Chroot/Plesk

Ein normaler Plesk-Subscription-SSH-Zugang im Chroot ist **kein** Beweisort fuer:

- `tcpdump`
- `iptables` / `nftables`
- hostweite Fail2Ban- oder Edge-Firewall-Entscheidungen

Nutze ihn nur fuer Kontext, nicht fuer Aussagen ueber Paketankunft am Host.
