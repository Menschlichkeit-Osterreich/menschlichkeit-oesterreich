#!/bin/sh
set -eu

MODE="${1:-latest}"
SRC="${2:-}" # optional local file path if MODE=local

echo "[redis-restore] mode=${MODE}"

mkdir -p /restore

if [ "${MODE}" = "local" ] && [ -n "${SRC}" ]; then
  cp "${SRC}" /restore/
else
  # fetch latest from S3 if configured
  if [ -z "${S3_BUCKET:-}" ] || [ -z "${S3_ACCESS_KEY_ID:-}" ] || [ -z "${S3_SECRET_ACCESS_KEY:-}" ]; then
    echo "[redis-restore] ERROR: S3 not configured"
    exit 1
  fi
  export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
  export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
  export AWS_DEFAULT_REGION="${S3_REGION:-eu-central-1}"
  ENDPOINT_ARG=""
  if [ -n "${S3_ENDPOINT:-}" ]; then
    ENDPOINT_ARG="--endpoint-url ${S3_ENDPOINT}"
  fi
  PREFIX="${S3_PREFIX:-}"
  # list and pick latest by name
  LATEST=$(aws ${ENDPOINT_ARG} s3 ls "s3://${S3_BUCKET}/${PREFIX}" | awk '{print $4}' | sort | tail -n 1)
  if [ -z "$LATEST" ]; then
    echo "[redis-restore] ERROR: no objects in s3://${S3_BUCKET}/${PREFIX}"
    exit 1
  fi
  echo "[redis-restore] downloading $LATEST"
  aws ${ENDPOINT_ARG} s3 cp "s3://${S3_BUCKET}/${PREFIX}${LATEST}" "/restore/${LATEST}"
fi

FILE=$(ls -1 /restore | tail -n 1)
if [ -z "$FILE" ]; then
  echo "[redis-restore] ERROR: no file to restore"
  exit 1
fi

echo "[redis-restore] restoring $FILE into /data (ensure redis is stopped)"
case "$FILE" in
  *.aof.gz)
    gunzip -c "/restore/$FILE" > /data/appendonly.aof
    ;;
  *.rdb.gz)
    gunzip -c "/restore/$FILE" > /data/dump.rdb
    ;;
  *)
    echo "[redis-restore] ERROR: unknown archive type: $FILE"
    exit 1
    ;;
esac

echo "[redis-restore] done. You may need to restart the redis service."

