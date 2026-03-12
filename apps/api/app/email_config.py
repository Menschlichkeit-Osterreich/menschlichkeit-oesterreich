import os

DOMAIN = "menschlichkeit-oesterreich.at"

EMAIL_KONTAKT = os.getenv("EMAIL_KONTAKT", f"kontakt@{DOMAIN}")
EMAIL_INFO = os.getenv("EMAIL_INFO", f"info@{DOMAIN}")
EMAIL_ADMIN = os.getenv("EMAIL_ADMIN", f"admin@{DOMAIN}")
EMAIL_NOREPLY = os.getenv("EMAIL_NOREPLY", f"noreply@{DOMAIN}")
EMAIL_LOGGING = os.getenv("EMAIL_LOGGING", f"logging@{DOMAIN}")
EMAIL_CIVIMAIL = os.getenv("EMAIL_CIVIMAIL", f"civimail@{DOMAIN}")
EMAIL_BOUNCE = os.getenv("EMAIL_BOUNCE", f"bounce@{DOMAIN}")
EMAIL_SUPPORT = os.getenv("EMAIL_SUPPORT", f"support@{DOMAIN}")
EMAIL_FINANZEN = os.getenv("EMAIL_FINANZEN", f"finanzen@{DOMAIN}")
EMAIL_VORSTAND = os.getenv("EMAIL_VORSTAND", f"vorstand@{DOMAIN}")
EMAIL_DATENSCHUTZ = os.getenv("EMAIL_DATENSCHUTZ", f"datenschutz@{DOMAIN}")

SMTP_HOST = os.getenv("MAIL_HOST", f"mail.{DOMAIN}")
SMTP_PORT = int(os.getenv("MAIL_PORT", "587"))
SMTP_ENCRYPTION = os.getenv("MAIL_ENCRYPTION", "tls")
MAIL_FROM_ADDRESS = os.getenv("MAIL_FROM_ADDRESS", EMAIL_INFO)
MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Verein Menschlichkeit Österreich")

ORGANIZATION = {
    "name": "Verein Menschlichkeit Österreich",
    "zvr": "1182213083",
    "gruendung": "28.05.2025",
    "adresse": "Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn",
    "vereinsbehoerde": "LPD Niederösterreich",
    "website": f"https://{DOMAIN}",
}
