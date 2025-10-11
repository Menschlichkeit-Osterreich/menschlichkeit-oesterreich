## Zusammenfassung

Kurzbeschreibung der Änderung und Motivation.

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
