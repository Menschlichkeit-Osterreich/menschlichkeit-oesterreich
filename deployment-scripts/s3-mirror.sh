#!/bin/sh
set -eu

if [ -z "${S3_BUCKET:-}" ]; then
  echo "[s3-mirror] S3_BUCKET not set"
  exit 0
fi

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:-}"
export AWS_DEFAULT_REGION="${S3_REGION:-eu-central-1}"
ENDPOINT_ARG=""
if [ -n "${S3_ENDPOINT:-}" ]; then
  ENDPOINT_ARG="--endpoint-url ${S3_ENDPOINT}"
fi

PREFIX="${S3_PREFIX:-}"
echo "[s3-mirror] syncing s3://${S3_BUCKET}/${PREFIX} -> /backups"
aws ${ENDPOINT_ARG} s3 sync "s3://${S3_BUCKET}/${PREFIX}" /backups --delete --only-show-errors || echo "[s3-mirror] WARN: sync failed"

