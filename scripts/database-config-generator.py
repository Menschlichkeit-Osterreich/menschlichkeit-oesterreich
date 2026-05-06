# Database Configuration Guide für Plesk
# Sichere Konfiguration der drei Hauptdatenbanken

## 🗂️ Database Overview
DATABASE_CONFIG = {
    'wordpress': {
        'name': 'mo_wordpress_main',
        'purpose': 'Haupt-WordPress-Installation',
        'website': 'menschlichkeit-oesterreich.at',
        'tables': ['wp_posts', 'wp_users', 'wp_options', 'wp_postmeta'],
        'critical': True
    },
    'api': {
        'name': 'mo_laravel_api', 
        'purpose': 'Laravel-basierte API',
        'website': 'api.menschlichkeit-oesterreich.at',
        'tables': ['migrations', 'users', 'api_tokens', 'cache'],
        'critical': True
    },
    'civicrm': {
        'name': 'mo_civicrm_data',
        'purpose': 'CiviCRM Datenmanagement',
        'website': '(noch keiner Website zugewiesen)',
        'tables': ['civicrm_contact', 'civicrm_contribution', 'civicrm_activity'],
        'critical': False
    }
}

## 🔐 Sichere Passwort-Generierung
def generate_secure_password(length=32):
    """Generiert sichere Passwörter für Produktions-Datenbanken"""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

## 🏗️ Database Setup Scripts
def create_database_users():
    """MySQL-Befehle für Plesk Database Management"""
    
    commands = [
        # WordPress Database User
        f"CREATE USER 'wp_user_prod'@'localhost' IDENTIFIED BY '{generate_secure_password()}';",
        f"GRANT ALL PRIVILEGES ON mo_wordpress_main.* TO 'wp_user_prod'@'localhost';",
        
        # Laravel API Database User  
        f"CREATE USER 'api_user_prod'@'localhost' IDENTIFIED BY '{generate_secure_password()}';",
        f"GRANT ALL PRIVILEGES ON mo_laravel_api.* TO 'api_user_prod'@'localhost';",
        
        # CiviCRM Database User
        f"CREATE USER 'civicrm_user_prod'@'localhost' IDENTIFIED BY '{generate_secure_password()}';",
        f"GRANT ALL PRIVILEGES ON mo_civicrm_data.* TO 'civicrm_user_prod'@'localhost';",
        
        "FLUSH PRIVILEGES;"
    ]
    
    return commands

print("🗂️ Database Configuration für menschlichkeit-oesterreich.at")
print("=" * 60)

for db_key, config in DATABASE_CONFIG.items():
    print(f"\n📊 {config['name']}")
    print(f"   Website: {config['website']}")
    print(f"   Zweck: {config['purpose']}")
    print(f"   Kritisch: {'Ja' if config['critical'] else 'Nein'}")
    print(f"   Tabellen: {', '.join(config['tables'][:3])}...")

print(f"\n🔐 Sichere Passwörter generiert:")
for db_key in DATABASE_CONFIG.keys():
    password = generate_secure_password()
    print(f"   {db_key.upper()}_DB_PASS={password}")

print(f"\n📝 Nächste Schritte:")
print("1. Plesk-Panel → Databases öffnen")
print("2. Neue Benutzer mit generierten Passwörtern erstellen") 
print("3. Produktions-.env Datei aktualisieren")
print("4. Database-Backups einrichten")
print("5. Monitoring für alle drei DBs aktivieren")