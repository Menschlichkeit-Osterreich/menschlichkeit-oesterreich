# Research: Azure n8n Bereitstellungspfad

## Entscheidung 1: Single-Main als verbindlicher Startmodus

- **Decision**: Der Betriebsmodus bleibt in diesem Block explizit Single-Main.
- **Rationale**: Das reduziert Komplexitaet, verhindert einen verfruehten Queue-Mode und macht den Betrieb ohne Redis-/Worker-Abhaengigkeiten planbar.
- **Alternatives considered**: Queue-Mode, Hybridbetrieb, direkte Mehrknoten-Architektur. Alle wurden fuer diesen Block verworfen, weil sie andere Folgeentscheidungen voraussetzen.

## Entscheidung 2: Azure-Basis nur mit minimaler Portflaeche

- **Decision**: Die Azure-VM wird mit statischer Public IP und NSG nur fuer 22/80/443 vorbereitet.
- **Rationale**: Die Angriffsoberflaeche bleibt klein und die spaetere Abnahme kann klar gegen die Sicherheitsgrenzen geprueft werden.
- **Alternatives considered**: Offener 5678-Zugriff, direkte DB- oder Redis-Ports, breitere Inbound-Regeln. Diese Varianten sind fuer den Vorbereitungsblock ausgeschlossen.

## Entscheidung 3: Härtung vor Laufzeit

- **Decision**: Updates, Europe/Vienna-Zeitzone, Deploy-User, SSH-Key-only, deaktivierter Root-/Passwort-Login und UFW werden vor jeder produktionsnahen Laufzeit vorbereitet.
- **Rationale**: Die VM ist damit reproduzierbar und auditierbar, bevor irgendetwas Produktives dazugeschaltet wird.
- **Alternatives considered**: Erst runtime, spaeter hardening; Passwort-SSH als Uebergang; Firewall nur in Azure. Diese Optionen erzeugen zu viel Betriebsrisiko.

## Entscheidung 4: Docker-Compose-Basis ja, n8n-Deployment nein

- **Decision**: Docker Engine und Compose werden als Basis vorbereitet, aber der n8n-Container wird in diesem Block nicht produktiv ausgerollt.
- **Rationale**: Runtime-Bereitschaft laesst sich damit pruefen, ohne den Schritt in DNS/HTTPS/Reverse-Proxy vorwegzunehmen.
- **Alternatives considered**: Direktes Production-Deployment des Stacks oder Queue-Mode-Vorgriff. Beide sind explizit Nicht-Ziele.

## Entscheidung 5: Grant- und Billing-Status bleibt externer Nachweisblocker

- **Decision**: Grant- und Billing-Status werden als externer Nachweis behandelt; ohne belastbaren Microsoft-Nachweis bleibt Provisioning blockiert.
- **Rationale**: Kosten- und Zustandsfreigabe muessen vor jeder Ressourcenerstellung klar sein.
- **Alternatives considered**: Implizite Annahme, dass Funding schon passt; Stillhalteposition ohne Dokumentation. Beides ist nicht zulässig.

## Entscheidung 6: IaC ist die bevorzugte Umsetzungsrichtung fuer spaetere Ausfuehrung

- **Decision**: Wenn der Block spater umgesetzt wird, soll Azure ueber reproduzierbare Infrastruktur-Definitionen oder gleichwertig kontrollierte Automatisierung entstehen.
- **Rationale**: Das passt zu den Azure-Best-Practices im Repo und ermoeglicht kontrollierte, nachvollziehbare Aenderungen.
- **Alternatives considered**: Nur manuelle Klickpfade im Portal oder lose Shell-Skripte ohne Gate. Diese Varianten sind fuer eine robuste Uebergabe schlechter geeignet.

## Offene Blocker / externe Verifikation

- Azure Grant aktiviert oder nicht?
- Billing-Profil korrekt zugeordnet oder unklar?
- Azure-Subscription und Kostenverantwortung eindeutig benannt?
- Statische IP und VM-Provisioning live verifizierbar oder noch nicht?

## Ergebnis fuer die Planung

Der Block ist als vorbereitender, phasengetrennter Betriebspfad zu planen. Alles was DNS, HTTPS, Reverse Proxy, produktives n8n oder Queue-Mode voraussetzt, bleibt ausserhalb des Scopes und wird als Folge-Gate dokumentiert.
