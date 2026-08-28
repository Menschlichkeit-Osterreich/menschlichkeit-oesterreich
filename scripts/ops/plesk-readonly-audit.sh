#!/usr/bin/env bash
# Collects a bounded Plesk runtime inventory without changing the remote host.

set -euo pipefail

readonly SCRIPT_NAME="$(basename "$0")"
readonly AUDIT_DOMAIN_SUFFIX="menschlichkeit-oesterreich.at"
EXPECTED_FILE=""
EVIDENCE_CLASS="VERIFIED_TEST"
VHOST_ROOT="${PLESK_VHOST_ROOT:-.}"
NETWORK_CHECKS=true
HOSTS_B64="${MOE_AUDIT_PUBLIC_HOSTS_B64:-}"
PATHS_B64="${MOE_AUDIT_SERVICE_PATHS_B64:-}"

usage() {
  printf 'Usage: %s [--expected FILE] [--vhost-root PATH] [--evidence-class CLASS] [--no-network]\n' "$SCRIPT_NAME"
}

fail() {
  printf 'Audit input error: %s\n' "$1" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --expected)
      [[ $# -ge 2 ]] || fail "--expected requires a file"
      EXPECTED_FILE="$2"
      shift 2
      ;;
    --vhost-root)
      [[ $# -ge 2 ]] || fail "--vhost-root requires a path"
      VHOST_ROOT="$2"
      shift 2
      ;;
    --evidence-class)
      [[ $# -ge 2 ]] || fail "--evidence-class requires a value"
      EVIDENCE_CLASS="$2"
      shift 2
      ;;
    --no-network)
      NETWORK_CHECKS=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "unknown option: $1"
      ;;
  esac
done

[[ "$EVIDENCE_CLASS" == "VERIFIED_LIVE" || "$EVIDENCE_CLASS" == "VERIFIED_TEST" ]] || fail "evidence class must be VERIFIED_LIVE or VERIFIED_TEST"

if [[ -n "$EXPECTED_FILE" ]]; then
  [[ -r "$EXPECTED_FILE" ]] || fail "expected state is not readable"
  command -v jq >/dev/null 2>&1 || fail "jq is required with --expected"
  HOSTS_B64="$(jq -r '.public_hosts[] | [.host, .health_path, (.required | tostring)] | @tsv' "$EXPECTED_FILE" | base64 | tr -d '\n')"
  path_contract=""
  while IFS=$'\t' read -r key path_env required; do
    [[ "$path_env" =~ ^[A-Z][A-Z0-9_]*$ ]] || fail "invalid service path environment reference"
    relative_path="${!path_env:-__UNKNOWN__}"
    printf -v path_contract_line '%s\t%s\t%s\n' "$key" "$relative_path" "$required"
    path_contract+="$path_contract_line"
  done < <(jq -r '.service_paths[] | [.key, .path_env, (.required | tostring)] | @tsv' "$EXPECTED_FILE")
  PATHS_B64="$(printf '%s' "$path_contract" | base64 | tr -d '\n')"
fi

json_escape() {
  local value=${1-}
  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  value=${value//$'\r'/\\r}
  value=${value//$'\t'/\\t}
  printf '%s' "$value"
}

json_string() {
  printf '"%s"' "$(json_escape "${1-}")"
}

json_number_or_null() {
  local value=${1-}
  if [[ "$value" =~ ^-?[0-9]+([.][0-9]+)?$ ]]; then
    printf '%s' "$value"
  else
    printf 'null'
  fi
}

first_line() {
  local value=${1-}
  value=${value%%$'\n'*}
  printf '%s' "$value"
}

command_version() {
  local output=""
  if output="$("$@" 2>/dev/null)"; then
    first_line "$output"
  fi
}

service_state() {
  local unit=$1
  if ! command -v systemctl >/dev/null 2>&1; then
    printf 'UNKNOWN'
  elif systemctl is-active --quiet "$unit" 2>/dev/null; then
    printf 'PASS'
  elif systemctl list-unit-files "$unit.service" --no-legend 2>/dev/null | grep -q .; then
    printf 'FAIL'
  else
    printf 'UNKNOWN'
  fi
}

service_state_any() {
  local unit=""
  local state=""
  local inactive_seen=false
  for unit in "$@"; do
    state="$(service_state "$unit")"
    if [[ "$state" == "PASS" ]]; then
      printf 'PASS'
      return
    fi
    [[ "$state" == "FAIL" ]] && inactive_seen=true
  done
  if [[ "$inactive_seen" == true ]]; then
    printf 'FAIL'
  else
    printf 'UNKNOWN'
  fi
}

runtime_status() {
  if command -v "$1" >/dev/null 2>&1; then
    printf 'PASS'
  else
    printf 'UNKNOWN'
  fi
}

declare -a HOST_NAMES=()
declare -a HOST_HEALTH_PATHS=()
declare -a HOST_REQUIRED=()
declare -a SERVICE_KEYS=()
declare -a SERVICE_PATHS=()
declare -a SERVICE_REQUIRED=()

if [[ -n "$HOSTS_B64" ]]; then
  while IFS=$'\t' read -r host health_path required; do
    [[ -n "$host" ]] || continue
    [[ "$host" =~ ^[A-Za-z0-9.-]+$ ]] || fail "invalid host in expected state"
    host_lower="${host,,}"
    if [[ "$host_lower" != "$AUDIT_DOMAIN_SUFFIX" && "$host_lower" != *."$AUDIT_DOMAIN_SUFFIX" ]]; then
      fail "host outside allowed audit domain"
    fi
    [[ "$health_path" =~ ^/[A-Za-z0-9._~/%+-]*$ ]] || fail "invalid public health path"
    [[ "$required" == "true" || "$required" == "false" ]] || fail "invalid host required flag"
    HOST_NAMES+=("$host_lower")
    HOST_HEALTH_PATHS+=("$health_path")
    HOST_REQUIRED+=("$required")
  done < <(printf '%s' "$HOSTS_B64" | base64 --decode)
fi

if [[ -n "$PATHS_B64" ]]; then
  while IFS=$'\t' read -r key relative_path required; do
    [[ -n "$key" ]] || continue
    [[ "$key" =~ ^[A-Za-z0-9_-]+$ ]] || fail "invalid service key"
    if [[ "$relative_path" != "__UNKNOWN__" ]]; then
      [[ "$relative_path" =~ ^[A-Za-z0-9._/-]+$ && "$relative_path" != /* && "$relative_path" != *".."* ]] || fail "service path must be relative and bounded"
    fi
    [[ "$required" == "true" || "$required" == "false" ]] || fail "invalid service required flag"
    SERVICE_KEYS+=("$key")
    SERVICE_PATHS+=("$relative_path")
    SERVICE_REQUIRED+=("$required")
  done < <(printf '%s' "$PATHS_B64" | base64 --decode)
fi

generated_at="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
hostname_value="$(hostname -f 2>/dev/null || hostname 2>/dev/null || true)"
kernel_value="$(uname -r 2>/dev/null || true)"
os_id=""
os_version=""
if [[ -r /etc/os-release ]]; then
  os_id="$(awk -F= '$1 == "ID" {gsub(/^"|"$/, "", $2); print $2; exit}' /etc/os-release)"
  os_version="$(awk -F= '$1 == "VERSION_ID" {gsub(/^"|"$/, "", $2); print $2; exit}' /etc/os-release)"
fi

plesk_version=""
plesk_status="UNKNOWN"
if command -v plesk >/dev/null 2>&1; then
  plesk_version="$(command_version plesk version)"
  [[ -n "$plesk_version" ]] && plesk_status="PASS"
elif [[ -r /usr/local/psa/version ]]; then
  plesk_version="$(first_line "$(sed -n '1p' /usr/local/psa/version 2>/dev/null || true)")"
  [[ -n "$plesk_version" ]] && plesk_status="PASS"
fi

cpu_count="$(getconf _NPROCESSORS_ONLN 2>/dev/null || true)"
load_1m=""
[[ -r /proc/loadavg ]] && load_1m="$(awk '{print $1}' /proc/loadavg)"
memory_total_kb=""
memory_available_kb=""
memory_available_pct=""
if [[ -r /proc/meminfo ]]; then
  memory_total_kb="$(awk '$1 == "MemTotal:" {print $2}' /proc/meminfo)"
  memory_available_kb="$(awk '$1 == "MemAvailable:" {print $2}' /proc/meminfo)"
  if [[ "$memory_total_kb" =~ ^[0-9]+$ && "$memory_available_kb" =~ ^[0-9]+$ && "$memory_total_kb" -gt 0 ]]; then
    memory_available_pct="$(awk -v available="$memory_available_kb" -v total="$memory_total_kb" 'BEGIN {printf "%.2f", (available / total) * 100}')"
  fi
fi
swap_total_kb=""
swap_free_kb=""
if [[ -r /proc/meminfo ]]; then
  swap_total_kb="$(awk '$1 == "SwapTotal:" {print $2}' /proc/meminfo)"
  swap_free_kb="$(awk '$1 == "SwapFree:" {print $2}' /proc/meminfo)"
fi

disk_free_pct=""
inode_free_pct=""
if [[ -e "$VHOST_ROOT" ]]; then
  disk_free_pct="$(df -Pk "$VHOST_ROOT" 2>/dev/null | awk 'NR == 2 {gsub(/%/, "", $5); printf "%d", 100 - $5}')"
  inode_free_pct="$(df -Pi "$VHOST_ROOT" 2>/dev/null | awk 'NR == 2 {gsub(/%/, "", $5); printf "%d", 100 - $5}')"
fi

io_read_ops=""
io_write_ops=""
if [[ -r /proc/diskstats ]]; then
  io_read_ops="$(awk '$3 !~ /^(loop|ram|fd)/ {sum += $4} END {print sum + 0}' /proc/diskstats)"
  io_write_ops="$(awk '$3 !~ /^(loop|ram|fd)/ {sum += $8} END {print sum + 0}' /proc/diskstats)"
fi

oom_status="UNKNOWN"
oom_events=""
if command -v journalctl >/dev/null 2>&1; then
  if oom_events="$(journalctl -k -b --no-pager 2>/dev/null | grep -Eic 'out of memory|oom-killer|killed process')"; then
    if [[ "$oom_events" -gt 0 ]]; then
      oom_status="FAIL"
    else
      oom_status="PASS"
    fi
  fi
fi

php_fpm_command=""
for candidate in php-fpm php-fpm8.4 php-fpm8.3 php-fpm8.2 php-fpm8.1; do
  if command -v "$candidate" >/dev/null 2>&1; then
    php_fpm_command="$candidate"
    break
  fi
done
php_fpm_status="$(service_state_any php-fpm php8.4-fpm php8.3-fpm php8.2-fpm php8.1-fpm plesk-php84-fpm plesk-php83-fpm plesk-php82-fpm plesk-php81-fpm)"
php_fpm_version=""
if [[ -n "$php_fpm_command" ]]; then
  php_fpm_version="$(command_version "$php_fpm_command" -v)"
fi
php_fpm_pool_count=""
if [[ -d /etc/php ]]; then
  php_fpm_pool_count="$(find /etc/php -path '*/fpm/pool.d/*.conf' -type f -print 2>/dev/null | awk 'END {print NR + 0}')"
fi

nginx_status="$(service_state_any nginx)"
apache_status="$(service_state_any apache2 httpd)"
cron_status="$(service_state_any cron crond)"
mysql_status="$(service_state_any mariadb mysql mysqld)"
postgresql_status="$(service_state_any postgresql)"
redis_status="$(service_state_any redis redis-server)"
docker_status="$(service_state_any docker)"
podman_status="$(service_state_any podman)"

printf '{\n'
printf '  "schema_version": 1,\n'
printf '  "generated_at": %s,\n' "$(json_string "$generated_at")"
printf '  "evidence_class": %s,\n' "$(json_string "$EVIDENCE_CLASS")"
printf '  "source": "scripts/ops/plesk-readonly-audit.sh",\n'
printf '  "scope": "Menschlichkeit Oesterreich Plesk runtime",\n'
printf '  "collector": {"read_only": true, "environment_dumped": false, "process_command_lines_collected": false, "secret_values_collected": false, "pii_collected": false, "file_content_scope": "release-marker-hash-only"},\n'
printf '  "system": {\n'
printf '    "plesk": {"status": %s, "version": %s},\n' "$(json_string "$plesk_status")" "$(json_string "$plesk_version")"
printf '    "os": {"status": %s, "id": %s, "version": %s},\n' "$(json_string "$([[ -n "$os_id" ]] && printf PASS || printf UNKNOWN)")" "$(json_string "$os_id")" "$(json_string "$os_version")"
printf '    "kernel": {"status": %s, "release": %s},\n' "$(json_string "$([[ -n "$kernel_value" ]] && printf PASS || printf UNKNOWN)")" "$(json_string "$kernel_value")"
printf '    "hostname": {"status": %s, "value": %s},\n' "$(json_string "$([[ -n "$hostname_value" ]] && printf PASS || printf UNKNOWN)")" "$(json_string "$hostname_value")"
printf '    "cpu": {"status": %s, "logical_count": %s, "load_1m": %s},\n' "$(json_string "$([[ -n "$cpu_count" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$cpu_count")" "$(json_number_or_null "$load_1m")"
printf '    "memory": {"status": %s, "total_kb": %s, "available_kb": %s, "available_pct": %s},\n' "$(json_string "$([[ -n "$memory_available_pct" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$memory_total_kb")" "$(json_number_or_null "$memory_available_kb")" "$(json_number_or_null "$memory_available_pct")"
printf '    "swap": {"status": %s, "total_kb": %s, "free_kb": %s},\n' "$(json_string "$([[ -n "$swap_total_kb" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$swap_total_kb")" "$(json_number_or_null "$swap_free_kb")"
printf '    "oom": {"status": %s, "events_since_boot": %s},\n' "$(json_string "$oom_status")" "$(json_number_or_null "$oom_events")"
printf '    "filesystem": {"status": %s, "free_pct": %s},\n' "$(json_string "$([[ -n "$disk_free_pct" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$disk_free_pct")"
printf '    "inodes": {"status": %s, "free_pct": %s},\n' "$(json_string "$([[ -n "$inode_free_pct" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$inode_free_pct")"
printf '    "io": {"status": %s, "read_ops_since_boot": %s, "write_ops_since_boot": %s}\n' "$(json_string "$([[ -n "$io_read_ops" ]] && printf PASS || printf UNKNOWN)")" "$(json_number_or_null "$io_read_ops")" "$(json_number_or_null "$io_write_ops")"
printf '  },\n'
printf '  "runtimes": {\n'
printf '    "python3": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status python3)")" "$(json_string "$(command_version python3 --version)")"
printf '    "php": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status php)")" "$(json_string "$(command_version php -v)")"
printf '    "node": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status node)")" "$(json_string "$(command_version node --version)")"
printf '    "npm": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status npm)")" "$(json_string "$(command_version npm --version)")"
printf '    "composer": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status composer)")" "$(json_string "$(command_version composer --version)")"
printf '    "docker": {"status": %s, "version": %s},\n' "$(json_string "$(runtime_status docker)")" "$(json_string "$(command_version docker --version)")"
printf '    "podman": {"status": %s, "version": %s}\n' "$(json_string "$(runtime_status podman)")" "$(json_string "$(command_version podman --version)")"
printf '  },\n'
printf '  "services": {\n'
printf '    "nginx": {"status": %s, "version": %s},\n' "$(json_string "$nginx_status")" "$(json_string "$(command_version nginx -v)")"
printf '    "apache": {"status": %s, "version": %s},\n' "$(json_string "$apache_status")" "$(json_string "$(command_version apache2 -v)")"
printf '    "php_fpm": {"status": %s, "version": %s, "pool_count": %s},\n' "$(json_string "$php_fpm_status")" "$(json_string "$php_fpm_version")" "$(json_number_or_null "$php_fpm_pool_count")"
printf '    "cron": {"status": %s},\n' "$(json_string "$cron_status")"
printf '    "mysql": {"status": %s, "version": %s},\n' "$(json_string "$mysql_status")" "$(json_string "$(command_version mysql --version)")"
printf '    "postgresql": {"status": %s, "version": %s},\n' "$(json_string "$postgresql_status")" "$(json_string "$(command_version psql --version)")"
printf '    "redis": {"status": %s, "version": %s},\n' "$(json_string "$redis_status")" "$(json_string "$(command_version redis-cli --version)")"
printf '    "docker": {"status": %s},\n' "$(json_string "$docker_status")"
printf '    "podman": {"status": %s}\n' "$(json_string "$podman_status")"
printf '  },\n'
printf '  "public_hosts": ['
for index in "${!HOST_NAMES[@]}"; do
  host=${HOST_NAMES[$index]}
  health_path=${HOST_HEALTH_PATHS[$index]}
  required=${HOST_REQUIRED[$index]}
  dns_status="UNKNOWN"
  tls_status="UNKNOWN"
  tls_days_remaining=""
  http_status="UNKNOWN"
  http_code=""
  vhost_status="UNKNOWN"
  if [[ "$plesk_status" == "PASS" ]]; then
    if [[ "$host" == "$AUDIT_DOMAIN_SUFFIX" ]]; then
      if plesk bin domain --info "$host" >/dev/null 2>&1; then
        vhost_status="PASS"
      fi
    elif plesk bin subdomain --info "$host" >/dev/null 2>&1; then
      vhost_status="PASS"
    fi
  fi
  if [[ "$NETWORK_CHECKS" == true ]]; then
    if command -v getent >/dev/null 2>&1 && getent ahosts "$host" >/dev/null 2>&1; then
      dns_status="PASS"
    else
      dns_status="FAIL"
    fi
    if command -v timeout >/dev/null 2>&1 && command -v openssl >/dev/null 2>&1; then
      certificate_end="$(timeout 8 openssl s_client -connect "${host}:443" -servername "$host" </dev/null 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)"
      certificate_end=${certificate_end#notAfter=}
      if [[ -n "$certificate_end" ]]; then
        certificate_epoch="$(date -d "$certificate_end" +%s 2>/dev/null || true)"
        now_epoch="$(date +%s)"
        if [[ "$certificate_epoch" =~ ^[0-9]+$ ]]; then
          tls_days_remaining="$(( (certificate_epoch - now_epoch) / 86400 ))"
          [[ "$tls_days_remaining" -ge 0 ]] && tls_status="PASS" || tls_status="FAIL"
        fi
      fi
    fi
    if command -v curl >/dev/null 2>&1; then
      http_code="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 8 "https://${host}${health_path}" 2>/dev/null || true)"
      if [[ "$http_code" =~ ^[23][0-9][0-9]$ ]]; then
        http_status="PASS"
      elif [[ "$http_code" =~ ^[0-9][0-9][0-9]$ ]]; then
        http_status="FAIL"
      fi
    fi
  fi
  [[ "$index" -eq 0 ]] || printf ','
  printf '\n    {"host": %s, "health_path": %s, "required": %s, "plesk_vhost_status": %s, "dns_status": %s, "tls_status": %s, "tls_days_remaining": %s, "http_status": %s, "http_code": %s}' \
    "$(json_string "$host")" "$(json_string "$health_path")" "$required" "$(json_string "$vhost_status")" "$(json_string "$dns_status")" \
    "$(json_string "$tls_status")" "$(json_number_or_null "$tls_days_remaining")" "$(json_string "$http_status")" "$(json_number_or_null "$http_code")"
done
[[ "${#HOST_NAMES[@]}" -eq 0 ]] || printf '\n  '
printf '],\n'
printf '  "service_paths": ['
for index in "${!SERVICE_KEYS[@]}"; do
  key=${SERVICE_KEYS[$index]}
  relative_path=${SERVICE_PATHS[$index]}
  required=${SERVICE_REQUIRED[$index]}
  full_path=""
  path_status="UNKNOWN"
  marker_status="UNKNOWN"
  marker_hash=""
  if [[ "$relative_path" != "__UNKNOWN__" ]]; then
    full_path="${VHOST_ROOT%/}/${relative_path}"
    path_status="FAIL"
    [[ -d "$full_path" ]] && path_status="PASS"
    if [[ -r "$full_path/.deploy_release" ]]; then
      marker_status="PASS"
      if command -v sha256sum >/dev/null 2>&1; then
        marker_hash="$(sha256sum "$full_path/.deploy_release" 2>/dev/null | awk '{print $1}')"
      fi
    fi
  fi
  public_relative_path="$relative_path"
  [[ "$public_relative_path" == "__UNKNOWN__" ]] && public_relative_path=""
  [[ "$index" -eq 0 ]] || printf ','
  printf '\n    {"key": %s, "path": %s, "required": %s, "status": %s, "release_marker_status": %s, "release_marker_sha256": %s}' \
    "$(json_string "$key")" "$(json_string "$public_relative_path")" "$required" "$(json_string "$path_status")" \
    "$(json_string "$marker_status")" "$(json_string "$marker_hash")"
done
[[ "${#SERVICE_KEYS[@]}" -eq 0 ]] || printf '\n  '
printf '],\n'
printf '  "backup": {"status": "UNKNOWN", "age_hours": null, "evidence": "No canonical live backup evidence source configured"},\n'
printf '  "restore": {"status": "UNKNOWN", "measured_rpo_hours": null, "measured_rto_minutes": null, "evidence": "No isolated restore evidence read by this collector"}\n'
printf '}\n'
