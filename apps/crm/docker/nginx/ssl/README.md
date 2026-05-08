# SSL-Zertifikate für lokale Entwicklung
#
# Platziere hier für lokale HTTPS-Unterstützung:
#   cert.pem  - TLS-Zertifikat
#   key.pem   - TLS-Schlüssel
#
# Schnellstart (selbstsigniert, nur für Entwicklung):
#
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout apps/crm/docker/nginx/ssl/key.pem \
#     -out    apps/crm/docker/nginx/ssl/cert.pem \
#     -subj   "/CN=crm.localhost"
#
# NIEMALS echte Zertifikate committen!
