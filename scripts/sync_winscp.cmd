@echo off
setlocal enabledelayedexpansion

REM ====== Server-Zugang ======
set HOST=5.183.217.146
set USER=dmpl20230054
set SSH_KEY=C:\Users\schul\.ssh\id_ed25519

REM ====== Lokales Monorepo-Ziel ======
set BASE=%~dp0..
set REPO=%BASE%\menschlichkeit-oesterreich-monorepo
set MAIN_DIR=%REPO%\httpdocs
set API_DIR=%REPO%\api.menschlichkeit-oesterreich.at
set CRM_DIR=%REPO%\crm.menschlichkeit-oesterreich.at

REM ====== WinSCP-Pfad ======
set WINSCP_EXE="C:\Program Files (x86)\WinSCP\WinSCP.com"
if not exist %WINSCP_EXE% (
  echo [31m✖ WinSCP.com nicht gefunden. Bitte Pfad in scripts\sync_winscp.cmd anpassen.[0m
  echo [33mDownload: https://winscp.net/eng/download.php[0m
  exit /b 1
)

mkdir "%MAIN_DIR%" "%API_DIR%" "%CRM_DIR%" 2>nul

mkdir "%MAIN_DIR%" "%API_DIR%" "%CRM_DIR%" 2>nul

echo [36m🚀 Starte SFTP-Sync mit WinSCP...[0m

REM --- MAIN (WordPress mit Excludes via -filemask) ---
echo [36m→ Pull: Hauptdomain (WordPress) nach %MAIN_DIR%[0m
set SCRIPT=%TEMP%\winscp_pull_main.txt
> "%SCRIPT%" echo option batch on
>>"%SCRIPT%" echo option confirm off
>>"%SCRIPT%" echo open sftp://%USER%@%HOST%/ -privatekey="%SSH_KEY%" -hostkey="*"
>>"%SCRIPT%" echo lcd "%MAIN_DIR%"
>>"%SCRIPT%" echo cd /httpdocs
>>"%SCRIPT%" echo synchronize local -delete -criteria=size -transfer=binary -nopermissions -nopreservetime -filemask="|wp-content/uploads/;node_modules/;vendor/;*.log;*.zip;wp-content/cache/;wp-content/upgrade/"
>>"%SCRIPT%" echo exit
%WINSCP_EXE% /ini=nul /script="%SCRIPT%" /log="%TEMP%\winscp_main.log"
set MAIN_ERR=%ERRORLEVEL%
del "%SCRIPT%" 2>nul

REM --- API ---
echo [36m→ Pull: API nach %API_DIR%[0m
set SCRIPT=%TEMP%\winscp_pull_api.txt
> "%SCRIPT%" echo option batch on
>>"%SCRIPT%" echo option confirm off
>>"%SCRIPT%" echo open sftp://%USER%@%HOST%/ -privatekey="%SSH_KEY%" -hostkey="*"
>>"%SCRIPT%" echo lcd "%API_DIR%"
>>"%SCRIPT%" echo cd /api.menschlichkeit-oesterreich.at
>>"%SCRIPT%" echo synchronize local -delete -criteria=size -transfer=binary -nopermissions -nopreservetime -filemask="|node_modules/;vendor/;*.log;*.zip"
>>"%SCRIPT%" echo exit
%WINSCP_EXE% /ini=nul /script="%SCRIPT%" /log="%TEMP%\winscp_api.log"
set API_ERR=%ERRORLEVEL%
del "%SCRIPT%" 2>nul

REM --- CRM ---
echo [36m→ Pull: CRM nach %CRM_DIR%[0m
set SCRIPT=%TEMP%\winscp_pull_crm.txt
> "%SCRIPT%" echo option batch on
>>"%SCRIPT%" echo option confirm off
>>"%SCRIPT%" echo open sftp://%USER%@%HOST%/ -privatekey="%SSH_KEY%" -hostkey="*"
>>"%SCRIPT%" echo lcd "%CRM_DIR%"
>>"%SCRIPT%" echo cd /crm.menschlichkeit-oesterreich.at
>>"%SCRIPT%" echo synchronize local -delete -criteria=size -transfer=binary -nopermissions -nopreservetime -filemask="|vendor/;*.log;*.zip"
>>"%SCRIPT%" echo exit
%WINSCP_EXE% /ini=nul /script="%SCRIPT%" /log="%TEMP%\winscp_crm.log"
set CRM_ERR=%ERRORLEVEL%
del "%SCRIPT%" 2>nul

REM --- Ergebnis prüfen ---
if %MAIN_ERR% NEQ 0 (
    echo [31m❌ WordPress-Sync fehlgeschlagen mit Code: %MAIN_ERR% - Siehe %TEMP%\winscp_main.log[0m
    set ERROR=1
) 
if %API_ERR% NEQ 0 (
    echo [31m❌ API-Sync fehlgeschlagen mit Code: %API_ERR% - Siehe %TEMP%\winscp_api.log[0m
    set ERROR=1
)
if %CRM_ERR% NEQ 0 (
    echo [31m❌ CRM-Sync fehlgeschlagen mit Code: %CRM_ERR% - Siehe %TEMP%\winscp_crm.log[0m
    set ERROR=1
)

if not defined ERROR (
    echo [32m✓ WinSCP-Sync erfolgreich abgeschlossen![0m
    echo [32m✓ Dateien wurden nach %REPO% synchronisiert.[0m
    echo.
    echo [33mNächste Schritte:[0m
    echo [33m1. Ggf. .gitignore anpassen in %REPO%[0m
    echo [33m2. Änderungen mit Git commit + push sichern[0m
) else (
    echo.
    echo [33mHäufige Fehlercodes:[0m
    echo [33m  1 - Allgemeiner Fehler[0m
    echo [33m  4 - Verbindungsfehler[0m
    echo [33m  5 - Keine Verbindung zum Server[0m
    echo [33m  7 - Fehler beim Dateitransfer[0m
    echo [33m  8 - Lokaler Fehler[0m
)

endlocal
