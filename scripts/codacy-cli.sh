#!/bin/bash

# Codacy CLI Wrapper für WSL
# Stellt Codacy CLI Funktionalität über JAR-Datei zur Verfügung

CODACY_JAR_PATH="$HOME/.codacy/codacy-analysis-cli-assembly.jar"
JAVA_CMD="java"

# Überprüfe ob Codacy JAR existiert
if [ ! -f "$CODACY_JAR_PATH" ]; then
    echo "❌ Codacy JAR nicht gefunden in: $CODACY_JAR_PATH"
    echo "Bitte führen Sie zuerst die Installation aus:"
    echo "  mkdir -p ~/.codacy"
    echo "  wget -O ~/.codacy/codacy-analysis-cli-assembly.jar 'https://github.com/codacy/codacy-analysis-cli/releases/latest/download/codacy-analysis-cli-assembly.jar'"
    exit 1
fi

# Überprüfe Java Installation
if ! command -v java &> /dev/null; then
    echo "❌ Java ist nicht installiert oder nicht im PATH"
    echo "Bitte installieren Sie Java:"
    echo "  sudo apt update && sudo apt install -y default-jre"
    exit 1
fi

# Führe Codacy CLI mit allen übergebenen Argumenten aus
echo "🔍 Führe Codacy Analyse aus..."
echo "JAR: $CODACY_JAR_PATH"
echo "Args: $@"
echo ""

exec java -jar "$CODACY_JAR_PATH" "$@"