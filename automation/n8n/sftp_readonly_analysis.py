#!/usr/bin/env python3
"""
Read-only SFTP analysis for n8n Plesk routing investigation.
AP-01: Staging Access & Secret Baseline
Constraints: NO uploads, NO writes, NO chmod/chown/mv/rm, NO secret values in output.
"""
import json
import re
import sys
import stat
from pathlib import Path

try:
    import paramiko
except ImportError:
    print("ERROR: paramiko not installed. Run: pip install paramiko")
    sys.exit(1)

# ── Load config (no secrets in output) ──────────────────────────────────────
CONFIG_PATH = Path(__file__).parent.parent.parent / "sync_config.jsonc"

def load_config(path: Path) -> dict:
    """Strip JSONC comments and parse."""
    text = path.read_text(encoding="utf-8")
    # Remove // line comments
    text = re.sub(r'//.*', '', text)
    return json.loads(text)["plesk"]

cfg = load_config(CONFIG_PATH)
HOST = cfg["host"]
PORT = int(cfg.get("port", 22))
USER = cfg["username"]
PASS = cfg["password"]  # not printed

# ── SFTP helpers ─────────────────────────────────────────────────────────────
def sftp_connect():
    t = paramiko.Transport((HOST, PORT))
    t.connect(username=USER, password=PASS)
    return paramiko.SFTPClient.from_transport(t), t

def safe_listdir(sftp, path):
    """List directory; return [] on error."""
    try:
        return sftp.listdir_attr(path)
    except Exception as e:
        return [f"<ERROR: {e}>"]

def safe_readfile(sftp, path, max_bytes=4096):
    """Read a file up to max_bytes; return None on error."""
    try:
        with sftp.open(path, "r") as f:
            return f.read(max_bytes).decode("utf-8", errors="replace")
    except Exception as e:
        return f"<READ ERROR: {e}>"

def fmt_mode(attr):
    if isinstance(attr, str):
        return attr
    try:
        m = attr.st_mode
        kind = "d" if stat.S_ISDIR(m) else ("l" if stat.S_ISLNK(m) else "-")
        size = attr.st_size if hasattr(attr, "st_size") and attr.st_size else 0
        return f"{kind}  {size:>10}  {attr.filename}"
    except Exception:
        return str(attr)

# ── Directories to probe ─────────────────────────────────────────────────────
# Start from remote root (SFTP chroot root)
PROBE_PATHS = [
    ".",
    "httpdocs",
    "subdomains",
    "subdomains/n8n",
    "subdomains/n8n/httpdocs",
    "subdomains/n8n/logs",
    "logs",
    "conf",
    "private",
    ".htaccess",
]

KEYWORD_PATTERNS = [
    "domain-default-page", "plesk", "default", "n8n", "proxy",
    "caddy", "nginx", "apache", "websocket", "5678", "X-Forwarded", "Host",
]

# ── Main analysis ─────────────────────────────────────────────────────────────
def run_analysis():
    print("=" * 70)
    print("READ-ONLY SFTP PLESK ROUTING ANALYSIS")
    print(f"Target: {HOST}:{PORT}  User: {USER}  (credentials not shown)")
    print("=" * 70)

    # Connect
    try:
        sftp, transport = sftp_connect()
        print(f"\n[OK] SFTP connected to {HOST}:{PORT}")
    except Exception as e:
        print(f"\n[FAIL] Could not connect: {e}")
        sys.exit(2)

    findings = {
        "default_page_evidence": [],
        "n8n_proxy_evidence": [],
        "directory_tree": [],
        "errors": [],
    }

    # Try to find actual webspace root (Plesk chroot may land in domain root)
    try:
        cwd = sftp.getcwd() or "/"
    except Exception:
        cwd = "/"
    print(f"[INFO] SFTP chroot CWD: {cwd!r}")

    # ── Probe top-level dirs from CWD ────────────────────────────────────────
    print("\n--- REMOTE STRUCTURE (from SFTP chroot root) ---")

    def probe_dir(sftp, path, indent=0, max_depth=4):
        prefix = "  " * indent
        entries = safe_listdir(sftp, path)
        if not entries:
            print(f"{prefix}  (empty)")
            return
        for entry in entries:
            if isinstance(entry, str):
                print(f"{prefix}  {entry}")
                continue
            name = entry.filename
            display_path = f"{path}/{name}".lstrip("./").replace("//", "/")
            is_dir = stat.S_ISDIR(entry.st_mode) if hasattr(entry, "st_mode") else False
            size = getattr(entry, "st_size", 0)
            icon = "📁" if is_dir else "📄"
            print(f"{prefix}  {icon} {name}  ({size} B)")
            findings["directory_tree"].append(display_path)

            # Recurse into important subdirs
            recurse_names = {
                "httpdocs", "subdomains", "conf", "logs", "n8n",
                "private", "etc", "caddy", "nginx",
            }
            if is_dir and name.lower() in recurse_names and indent < max_depth:
                probe_dir(sftp, f"{path}/{name}", indent + 1, max_depth)

    probe_dir(sftp, ".")

    # ── Targeted file reads ──────────────────────────────────────────────────
    FILES_TO_READ = [
        "./httpdocs/index.html",
        "./httpdocs/index.php",
        "./httpdocs/.htaccess",
        "./subdomains/n8n/httpdocs/index.html",
        "./subdomains/n8n/httpdocs/index.php",
        "./subdomains/n8n/httpdocs/.htaccess",
        "./subdomains/n8n/conf/vhost.conf",
        "./subdomains/n8n/conf/vhost_nginx.conf",
        "./conf/vhost.conf",
        "./conf/vhost_nginx.conf",
        "./.htaccess",
    ]

    print("\n--- TARGETED FILE READS ---")
    for fpath in FILES_TO_READ:
        content = safe_readfile(sftp, fpath, max_bytes=2048)
        if "<READ ERROR" not in content:
            print(f"\n[FILE] {fpath}  ({len(content)} bytes)")
            # Check for keywords
            hits = [kw for kw in KEYWORD_PATTERNS if kw.lower() in content.lower()]
            if hits:
                print(f"  Keywords found: {hits}")
                # Check for default page markers
                if any(kw in content.lower() for kw in ["plesk", "domain-default", "default web page"]):
                    findings["default_page_evidence"].append({"path": fpath, "keywords": hits})
                if any(kw in content.lower() for kw in ["n8n", "5678", "proxy", "caddy", "websocket"]):
                    findings["n8n_proxy_evidence"].append({"path": fpath, "keywords": hits})
                # Show relevant excerpt (sanitized - no passwords)
                lines = content.splitlines()
                for i, line in enumerate(lines[:30]):
                    print(f"    {i+1:03}: {line[:120]}")
            else:
                print(f"  No routing keywords found. First line: {content.splitlines()[0][:80] if content.strip() else '(empty)'}")
        else:
            pass  # File not accessible or not found - expected for most

    # ── Subdomain listing ────────────────────────────────────────────────────
    print("\n--- SUBDOMAINS LISTING ---")
    subdomains = safe_listdir(sftp, "subdomains")
    if isinstance(subdomains, list):
        for entry in subdomains:
            if isinstance(entry, str):
                print(f"  {entry}")
                continue
            name = entry.filename
            is_dir = stat.S_ISDIR(entry.st_mode) if hasattr(entry, "st_mode") else False
            print(f"  {'📁' if is_dir else '📄'} {name}")
            if is_dir:
                sub_entries = safe_listdir(sftp, f"subdomains/{name}")
                for se in sub_entries:
                    if isinstance(se, str):
                        print(f"      {se}")
                    else:
                        print(f"      {'📁' if stat.S_ISDIR(se.st_mode) else '📄'} {se.filename}  ({getattr(se, 'st_size', 0)} B)")

    # ── n8n subdomain deep dive ──────────────────────────────────────────────
    print("\n--- N8N SUBDOMAIN DEEP DIVE ---")
    n8n_paths = [
        "subdomains/n8n",
        "subdomains/n8n/httpdocs",
        "subdomains/n8n/conf",
        "subdomains/n8n/logs",
    ]
    for p in n8n_paths:
        entries = safe_listdir(sftp, p)
        if entries and not (len(entries) == 1 and isinstance(entries[0], str) and "ERROR" in entries[0]):
            print(f"\n  {p}:")
            for e in entries:
                if isinstance(e, str):
                    print(f"    {e}")
                else:
                    size = getattr(e, "st_size", 0)
                    is_dir = stat.S_ISDIR(e.st_mode) if hasattr(e, "st_mode") else False
                    print(f"    {'📁' if is_dir else '📄'} {e.filename}  ({size} B)")

    # ── Check if we can navigate above chroot ────────────────────────────────
    print("\n--- CHROOT BOUNDARY DETECTION ---")
    parent_attempts = ["/", "/var", "/etc", "/home", "/www", "/usr"]
    for p in parent_attempts:
        entries = safe_listdir(sftp, p)
        if entries and not (len(entries) == 1 and isinstance(entries[0], str) and "ERROR" in entries[0]):
            count = len([e for e in entries if not isinstance(e, str)])
            print(f"  {p}: ACCESSIBLE ({count} entries)")
        else:
            print(f"  {p}: NOT ACCESSIBLE (chroot boundary)")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("ANALYSIS SUMMARY")
    print("=" * 70)
    print(f"Default-page evidence found: {len(findings['default_page_evidence'])} file(s)")
    for e in findings["default_page_evidence"]:
        print(f"  → {e['path']}  keywords: {e['keywords']}")
    print(f"n8n/proxy evidence found: {len(findings['n8n_proxy_evidence'])} file(s)")
    for e in findings["n8n_proxy_evidence"]:
        print(f"  → {e['path']}  keywords: {e['keywords']}")
    print(f"Total paths seen: {len(findings['directory_tree'])}")

    transport.close()
    print("\n[OK] SFTP connection closed.")

if __name__ == "__main__":
    run_analysis()
