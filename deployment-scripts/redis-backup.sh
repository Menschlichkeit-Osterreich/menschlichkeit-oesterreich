#!/bin/sh
set -eu

RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP=$(date -u +"%Y%m%dT%H%M%SZ")

mkdir -p /backups

STATUS="ok"
NEW_FILES=""
if [ -f /data/appendonly.aof ]; then
  if ! gzip -c /data/appendonly.aof > "/backups/aof-${STAMP}.aof.gz"; then
    STATUS="fail"
  else
    NEW_FILES="${NEW_FILES} /backups/aof-${STAMP}.aof.gz"
  fi
fi

if [ -f /data/dump.rdb ]; then
  if ! gzip -c /data/dump.rdb > "/backups/rdb-${STAMP}.rdb.gz"; then
    STATUS="fail"
  else
    NEW_FILES="${NEW_FILES} /backups/rdb-${STAMP}.rdb.gz"
  fi
fi

# prune old backups
find /backups -type f -mtime "+${RETENTION_DAYS}" -name '*.gz' -print -delete || true

echo "[redis-backup] backup completed at ${STAMP} (retention ${RETENTION_DAYS}d) status=${STATUS}"

# Optional S3 upload
if [ -n "${S3_BUCKET:-}" ] && [ -n "${S3_ACCESS_KEY_ID:-}" ] && [ -n "${S3_SECRET_ACCESS_KEY:-}" ]; then
  echo "[redis-backup] uploading to S3 bucket s3://${S3_BUCKET}/${S3_PREFIX:-}"
  export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
  export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
  export AWS_DEFAULT_REGION="${S3_REGION:-eu-central-1}"
  ENDPOINT_ARG=""
  if [ -n "${S3_ENDPOINT:-}" ]; then
    ENDPOINT_ARG="--endpoint-url ${S3_ENDPOINT}"
  fi
  SSL_ARG=""
  if [ "${S3_SSL:-true}" = "false" ]; then
    SSL_ARG="--no-verify-ssl"
  fi
  for f in ${NEW_FILES}; do
    [ -f "$f" ] || continue
    if ! aws ${ENDPOINT_ARG} s3 cp "$f" "s3://${S3_BUCKET}/${S3_PREFIX:-}" ${SSL_ARG} --only-show-errors; then
      echo "[redis-backup] WARN: upload failed for $f"
      STATUS="fail"
    fi
  done
fi

# Notifications (Slack / Email) on failure
notify() {
  MSG="$1"
  SUBJECT="$2"
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -s -X POST -H 'Content-type: application/json' --data "{\"text\": \"${MSG}\"}" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
  fi
  if [ -n "${BACKUP_NOTIFY_EMAIL_TO:-}" ] && [ -n "${SMTP_HOST:-}" ]; then
    # prepare msmtp config
    cat > /etc/msmtprc <<EOF
defaults
port ${SMTP_PORT:-587}
auth on
tls ${SMTP_USE_TLS:-true}
tls_trust_file /etc/ssl/certs/ca-certificates.crt
account default
host ${SMTP_HOST}
from ${SMTP_FROM:-noreply@example.org}
user ${SMTP_USER:-}
password ${SMTP_PASSWORD:-}
EOF
    chmod 600 /etc/msmtprc || true
    {
      echo "To: ${BACKUP_NOTIFY_EMAIL_TO}"
      echo "From: ${SMTP_FROM:-noreply@example.org}"
      echo "Subject: ${SUBJECT}"
      echo
      echo "${MSG}"
    } | msmtp -t >/dev/null 2>&1 || true
  fi
}

if [ "$STATUS" != "ok" ]; then
  notify "Redis Backup FAILED at ${STAMP}. Check container logs on host $(hostname)." "[ALERT] Redis Backup FAILED"
fi
