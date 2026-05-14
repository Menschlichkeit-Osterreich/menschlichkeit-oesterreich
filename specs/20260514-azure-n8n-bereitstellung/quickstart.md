# Quickstart: Azure n8n Bereitstellungspfad

## Zweck

Dieser Quickstart beschreibt den Vorbereitungs- und Abnahmeweg fuer den Azure-Block vor DNS/HTTPS.

## Voraussetzungen

- Dokumentierter Grant- und Billing-Status
- Benannte Kostenverantwortung
- Zugriff auf Azure-Subscription und Azure-Portal
- SSH-Schluessel fuer die spaetere VM-Haertung
- Klarer Beschluss, dass der aktuelle Modus Single-Main ist

## Ablauf fuer die Vorbereitungsphase

1. Grant- und Billing-Status gegen Microsoft-Systeme pruefen.
2. Wenn kein belastbarer Nachweis vorliegt, den Block als gesperrt markieren.
3. Single-Main als Betriebsmodus dokumentieren.
4. Azure Resource Group, statische IP, VM und NSG fuer den Vorbereitungsblock definieren.
5. NSG strikt auf 22, 80 und 443 begrenzen.
6. Ubuntu 24.04 VM aktualisieren und auf Europe/Vienna setzen.
7. Deploy-User anlegen, Root- und Passwort-Login deaktivieren, UFW aktivieren.
8. Docker Engine und Compose Plugin installieren.
9. Deploy-User der Docker-Gruppe zuordnen.
10. EvidenceLog mit Ressourcen, Restrisiken und Folge-Gate schreiben.

## Was bewusst nicht gemacht wird

- Keine DNS-Umschaltung.
- Keine HTTPS-Abnahme.
- Kein Reverse Proxy.
- Kein produktiver n8n-Container.
- Kein Queue-Mode.
- Kein weiter ausgebauter Backup-Flow.

## Erfolgskontrolle

- Grant/Billing ist belegt oder als echter Blocker markiert.
- VM, Public IP und NSG sind nachweisbar oder der Primärblocker ist dokumentiert.
- SSH funktioniert nur mit Key.
- Docker und Compose sind fuer den Deploy-User nutzbar.
- Das naechste Gate heisst explizit DNS/HTTPS-Abnahme.

## Naechster Schritt nach diesem Block

Wenn alle Vorbereitungen verifiziert sind, wird der naechste Block separat behandelt: DNS/HTTPS-Abnahme.
