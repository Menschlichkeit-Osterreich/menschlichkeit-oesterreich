#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT / "website"
REPORT_JSON = ROOT / "reports" / "audit" / "seo-audit-report.json"
REPORT_MD = ROOT / "reports" / "audit" / "SEO-AUDIT-REPORT.md"


@dataclass
class Finding:
    severity: str
    code: str
    message: str
    file: str | None = None


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def extract_links(html: str) -> list[str]:
    return re.findall(r'href="([^"]+)"', html)


def extract_canonical(html: str) -> str | None:
    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html)
    return m.group(1).strip() if m else None


def extract_title(html: str) -> str | None:
    m = re.search(r"<title>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else None


def extract_meta_description(html: str) -> str | None:
    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html, re.IGNORECASE)
    return m.group(1).strip() if m else None


def has_h1(html: str) -> bool:
    return bool(re.search(r"<h1[\s>]", html, re.IGNORECASE))


def audit() -> dict:
    findings: list[Finding] = []

    html_files = sorted(WEBSITE.glob("*.html"))
    html_names = {p.name for p in html_files}

    # robots.txt checks
    robots_path = WEBSITE / "robots.txt"
    if not robots_path.exists():
        findings.append(Finding("critical", "ROBOTS_MISSING", "robots.txt fehlt", "website/robots.txt"))
    else:
        robots = read_text(robots_path)
        if "Sitemap:" not in robots:
            findings.append(Finding("high", "ROBOTS_SITEMAP_MISSING", "Sitemap-Direktive fehlt", "website/robots.txt"))
        if "Disallow: /assets/js/" in robots or "Disallow: /assets/css/" in robots:
            findings.append(
                Finding(
                    "high",
                    "ROBOTS_BLOCKS_CRITICAL_ASSETS",
                    "robots.txt blockiert kritische CSS/JS-Assets für Rendering.",
                    "website/robots.txt",
                )
            )

    # sitemap checks
    sitemap_path = WEBSITE / "sitemap.xml"
    sitemap_urls: list[str] = []
    if not sitemap_path.exists():
        findings.append(Finding("critical", "SITEMAP_MISSING", "sitemap.xml fehlt", "website/sitemap.xml"))
    else:
        try:
            root = ET.parse(sitemap_path).getroot()
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            for node in root.findall("s:url", ns):
                loc = node.find("s:loc", ns)
                if loc is not None and (loc.text or "").strip():
                    sitemap_urls.append((loc.text or "").strip())
        except ET.ParseError as exc:
            findings.append(Finding("critical", "SITEMAP_INVALID_XML", f"Ungültiges XML: {exc}", "website/sitemap.xml"))

    # per-page checks
    for path in html_files:
        rel = f"website/{path.name}"
        html = read_text(path)

        title = extract_title(html)
        desc = extract_meta_description(html)
        canonical = extract_canonical(html)

        if not title:
            findings.append(Finding("high", "TITLE_MISSING", "Title-Tag fehlt", rel))
        if not desc:
            findings.append(Finding("high", "META_DESCRIPTION_MISSING", "Meta-Description fehlt", rel))
        if not has_h1(html):
            findings.append(Finding("medium", "H1_MISSING", "H1 fehlt", rel))
        if not canonical:
            findings.append(Finding("high", "CANONICAL_MISSING", "Canonical fehlt", rel))
        elif "https://www.menschlichkeit-oesterreich.at/" not in canonical:
            findings.append(Finding("medium", "CANONICAL_HOST_MISMATCH", f"Canonical ohne www-Host: {canonical}", rel))

        # internal link existence
        for link in extract_links(html):
            if link.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "javascript:")):
                continue
            if link.startswith("/"):
                candidate = WEBSITE / link.lstrip("/")
            else:
                candidate = (path.parent / link).resolve()
            if not candidate.exists():
                findings.append(Finding("medium", "BROKEN_INTERNAL_LINK", f"Interner Link zeigt auf fehlende Datei: {link}", rel))

    # sitemap coverage (indexable pages heuristic)
    index_candidates = [
        p.name
        for p in html_files
        if p.name not in {"offline.html", "login.html", "member-area.html", "index-optimized.html", "beitritt.html", "verein.html"}
    ]
    sitemap_names = {u.rsplit("/", 1)[-1] for u in sitemap_urls}

    for page in index_candidates:
        if page not in sitemap_names:
            findings.append(Finding("low", "SITEMAP_MISSING_PAGE", "Indexierbare Seite fehlt in Sitemap", f"website/{page}"))

    for page in sorted(sitemap_names):
        if page and page not in html_names:
            findings.append(Finding("high", "SITEMAP_DEAD_URL", "Sitemap enthält nicht vorhandene Datei", f"website/{page}"))

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    findings.sort(key=lambda f: (severity_order.get(f.severity, 99), f.code, f.file or ""))

    penalty = sum({"critical": 12, "high": 4, "medium": 2, "low": 1}[f.severity] for f in findings)
    score = max(0, min(100, 100 - penalty))

    result = {
        "website": "menschlichkeit-oesterreich.at",
        "auditType": "technical-seo-static-site",
        "score": score,
        "summary": {
            "totalFindings": len(findings),
            "critical": sum(1 for f in findings if f.severity == "critical"),
            "high": sum(1 for f in findings if f.severity == "high"),
            "medium": sum(1 for f in findings if f.severity == "medium"),
            "low": sum(1 for f in findings if f.severity == "low"),
        },
        "findings": [asdict(f) for f in findings],
    }
    return result


def write_reports(result: dict) -> None:
    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines: list[str] = []
    lines.append("# SEO Audit Report")
    lines.append("")
    lines.append(f"- Website: `{result['website']}`")
    lines.append(f"- Audit-Typ: `{result['auditType']}`")
    lines.append(f"- Score: **{result['score']}**")
    lines.append("")
    summary = result["summary"]
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Total Findings: {summary['totalFindings']}")
    lines.append(f"- Critical: {summary['critical']}")
    lines.append(f"- High: {summary['high']}")
    lines.append(f"- Medium: {summary['medium']}")
    lines.append(f"- Low: {summary['low']}")
    lines.append("")
    lines.append("## Findings")
    lines.append("")
    lines.append("| Severity | Code | File | Message |")
    lines.append("|---|---|---|---|")
    for item in result["findings"]:
        lines.append(
            f"| {item['severity']} | {item['code']} | {item.get('file') or '-'} | {item['message'].replace('|', '/')} |"
        )

    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    result = audit()
    write_reports(result)
    print(json.dumps(result["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
