## Zusammenfassung

Kurzbeschreibung der Änderung und Motivation.

## Status

- `Done:` Was in diesem PR abgeschlossen ist
- `Blocked:` Was fuer die Vollverifikation oder den Merge noch extern blockiert ist
- `Pending:` Operative Nacharbeiten oder bewusst ausgegliederte Follow-ups

## Checkliste

- [ ] Tests hinzugefügt/aktualisiert (Unit/Integration)
- [ ] Security: Keine Secrets/Keys im Diff, Gitleaks grün
- [ ] SBOM/CodeQL Checks grün
- [ ] i18n: Keys & ICU gültig (falls UI betroffen)

## Hinweise für Reviewer

Besondere Stellen, Risiken oder Migrationshinweise.

## Prompt/Chatmode Änderungen (falls zutreffend)
- [ ] YAML schema-konform (CI grün: ajv/yq)
- [ ] Beispiele gepflegt (`_examples.md` vorhanden & aktuell)
- [ ] `tests:` Assertions im YAML vorhanden
- [ ] SemVer richtig erhöht (MAJOR/MINOR/PATCH)
- [ ] CHANGELOG-Eintrag ergänzt (docs/prompts)
