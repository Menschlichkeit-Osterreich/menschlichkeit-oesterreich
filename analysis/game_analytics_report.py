#!/usr/bin/env python3
"""
Brücken Bauen – Game Analytics Report Generator
Erzeugt einen vollständigen Analysebericht aus Spielerdaten.
Verwendung: python3 game_analytics_report.py [--output /pfad/zum/report.html]
"""

import json
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec

# ── Konfiguration ──────────────────────────────────────────────────────────────
REPORT_DIR = Path(__file__).parent / "reports"
REPORT_DIR.mkdir(exist_ok=True)

CATEGORIES = ['Nachbarschaft', 'Arbeitsplatz', 'Schule', 'Politik',
              'Umwelt', 'Digital', 'Gesundheit', 'Sport', 'Stadtplanung', 'Europa']
SCORES = ['empathy', 'rights', 'participation', 'courage']
SCORE_LABELS = {'empathy': 'Empathie', 'rights': 'Rechtsbewusstsein',
                'participation': 'Partizipation', 'courage': 'Zivilcourage'}
COLORS = {'empathy': '#3B82F6', 'rights': '#10B981', 'participation': '#F59E0B', 'courage': '#EF4444'}

# ── Datengenerierung (Simulation realer Spielerdaten) ─────────────────────────

def generate_sample_data(n_sessions=500, seed=42):
    """Generiert realistische Beispieldaten für den Bericht."""
    rng = np.random.default_rng(seed)
    sessions = []
    base_date = datetime.now() - timedelta(days=90)

    for i in range(n_sessions):
        session_date = base_date + timedelta(
            days=int(rng.integers(0, 90)),
            hours=int(rng.integers(8, 22)),
            minutes=int(rng.integers(0, 60))
        )
        device = rng.choice(['desktop', 'mobile', 'tablet'], p=[0.55, 0.35, 0.10])
        completed = rng.integers(1, 17)
        duration = int(completed * rng.uniform(90, 240))

        # Scores korrelieren leicht mit Anzahl abgeschlossener Szenarien
        base_score = completed / 16
        sessions.append({
            'session_id': f'sess_{i:05d}',
            'date': session_date,
            'device': device,
            'scenarios_completed': completed,
            'duration_seconds': duration,
            'score_empathy': int(np.clip(rng.normal(base_score * 24, 4), 0, 32)),
            'score_rights': int(np.clip(rng.normal(base_score * 22, 4), 0, 32)),
            'score_participation': int(np.clip(rng.normal(base_score * 23, 4), 0, 32)),
            'score_courage': int(np.clip(rng.normal(base_score * 20, 5), 0, 32)),
            'is_teacher_session': rng.random() < 0.08,
            'class_size': int(rng.integers(15, 32)) if rng.random() < 0.08 else 0,
        })

    df = pd.DataFrame(sessions)
    df['date'] = pd.to_datetime(df['date'])
    df['week'] = df['date'].dt.isocalendar().week
    df['month'] = df['date'].dt.month
    df['total_score'] = df[['score_empathy', 'score_rights', 'score_participation', 'score_courage']].sum(axis=1)
    df['completion_rate'] = df['scenarios_completed'] / 16
    return df

def generate_decision_data(n_decisions=8000, seed=42):
    """Generiert Entscheidungsdaten pro Szenario."""
    rng = np.random.default_rng(seed)
    decisions = []
    for _ in range(n_decisions):
        scenario = rng.integers(1, 17)
        category = CATEGORIES[min(scenario - 1, len(CATEGORIES) - 1)]
        # Entscheidung A (beste) wird häufiger gewählt
        decision = rng.choice(['a', 'b', 'c'], p=[0.52, 0.33, 0.15])
        decisions.append({
            'scenario_id': scenario,
            'category': category,
            'decision': decision,
            'time_to_decide': int(np.clip(rng.normal(45, 20), 5, 180)),
        })
    return pd.DataFrame(decisions)

# ── Visualisierungen ───────────────────────────────────────────────────────────

def plot_overview_dashboard(df, output_path):
    """Erstellt ein Übersichts-Dashboard mit 6 Panels."""
    fig = plt.figure(figsize=(18, 12), facecolor='#F8FAFC')
    fig.suptitle('Brücken Bauen – Spieler-Analytics Dashboard', fontsize=18, fontweight='bold',
                 color='#1E293B', y=0.98)
    gs = GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.35)

    # ── Panel 1: KPIs ──────────────────────────────────────────────────────────
    ax_kpi = fig.add_subplot(gs[0, :])
    ax_kpi.axis('off')
    kpis = [
        ('Gesamte Sessions', f'{len(df):,}', '#3B82F6'),
        ('Ø Szenarien/Session', f'{df.scenarios_completed.mean():.1f} / 16', '#10B981'),
        ('Ø Spielzeit', f'{df.duration_seconds.mean()/60:.0f} Min.', '#F59E0B'),
        ('Abschlussrate', f'{df.completion_rate.mean()*100:.0f}%', '#EF4444'),
        ('Lehrer-Sessions', f'{df.is_teacher_session.sum():,}', '#8B5CF6'),
        ('Ø Gesamtscore', f'{df.total_score.mean():.0f} / 128', '#06B6D4'),
    ]
    for idx, (label, value, color) in enumerate(kpis):
        x = 0.08 + idx * 0.155
        ax_kpi.add_patch(mpatches.FancyBboxPatch((x - 0.07, 0.05), 0.13, 0.9,
                         boxstyle='round,pad=0.02', facecolor=color, alpha=0.12,
                         edgecolor=color, linewidth=1.5, transform=ax_kpi.transAxes))
        ax_kpi.text(x, 0.65, value, ha='center', va='center', fontsize=14, fontweight='bold',
                    color=color, transform=ax_kpi.transAxes)
        ax_kpi.text(x, 0.25, label, ha='center', va='center', fontsize=8.5,
                    color='#475569', transform=ax_kpi.transAxes)

    # ── Panel 2: Wöchentliche Sessions ────────────────────────────────────────
    ax_weekly = fig.add_subplot(gs[1, 0])
    weekly = df.groupby('week').size().reset_index(name='count')
    ax_weekly.bar(weekly['week'], weekly['count'], color='#3B82F6', alpha=0.8, edgecolor='white', linewidth=0.5)
    ax_weekly.set_title('Sessions pro Woche', fontweight='bold', fontsize=11, color='#1E293B')
    ax_weekly.set_xlabel('Kalenderwoche', fontsize=9, color='#64748B')
    ax_weekly.set_ylabel('Anzahl Sessions', fontsize=9, color='#64748B')
    ax_weekly.spines['top'].set_visible(False)
    ax_weekly.spines['right'].set_visible(False)
    ax_weekly.tick_params(colors='#64748B', labelsize=8)

    # ── Panel 3: Geräteverteilung ──────────────────────────────────────────────
    ax_device = fig.add_subplot(gs[1, 1])
    device_counts = df['device'].value_counts()
    device_colors = ['#3B82F6', '#10B981', '#F59E0B']
    wedges, texts, autotexts = ax_device.pie(
        device_counts.values, labels=device_counts.index,
        colors=device_colors, autopct='%1.0f%%', startangle=90,
        textprops={'fontsize': 9, 'color': '#1E293B'}
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_color('white')
        at.set_fontweight('bold')
    ax_device.set_title('Geräteverteilung', fontweight='bold', fontsize=11, color='#1E293B')

    # ── Panel 4: Score-Verteilung (Radar-ähnlich als Balken) ──────────────────
    ax_scores = fig.add_subplot(gs[1, 2])
    score_means = {SCORE_LABELS[s]: df[f'score_{s}'].mean() for s in SCORES}
    bars = ax_scores.barh(list(score_means.keys()), list(score_means.values()),
                          color=[COLORS[s] for s in SCORES], alpha=0.85, edgecolor='white')
    ax_scores.set_xlim(0, 32)
    ax_scores.set_title('Ø Score pro Dimension', fontweight='bold', fontsize=11, color='#1E293B')
    ax_scores.set_xlabel('Durchschnittlicher Score (max. 32)', fontsize=9, color='#64748B')
    ax_scores.spines['top'].set_visible(False)
    ax_scores.spines['right'].set_visible(False)
    ax_scores.tick_params(colors='#64748B', labelsize=9)
    for bar, val in zip(bars, score_means.values()):
        ax_scores.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height()/2,
                       f'{val:.1f}', va='center', fontsize=8.5, color='#475569')

    # ── Panel 5: Szenario-Abschlussverteilung ─────────────────────────────────
    ax_scenarios = fig.add_subplot(gs[2, :2])
    scenario_counts = df['scenarios_completed'].value_counts().sort_index()
    ax_scenarios.bar(scenario_counts.index, scenario_counts.values,
                     color='#8B5CF6', alpha=0.8, edgecolor='white', linewidth=0.5)
    ax_scenarios.axvline(x=df.scenarios_completed.mean(), color='#EF4444', linestyle='--',
                         linewidth=1.5, label=f'Ø {df.scenarios_completed.mean():.1f}')
    ax_scenarios.set_title('Verteilung abgeschlossener Szenarien', fontweight='bold', fontsize=11, color='#1E293B')
    ax_scenarios.set_xlabel('Anzahl abgeschlossener Szenarien', fontsize=9, color='#64748B')
    ax_scenarios.set_ylabel('Anzahl Sessions', fontsize=9, color='#64748B')
    ax_scenarios.legend(fontsize=9)
    ax_scenarios.spines['top'].set_visible(False)
    ax_scenarios.spines['right'].set_visible(False)
    ax_scenarios.tick_params(colors='#64748B', labelsize=8)

    # ── Panel 6: Score-Korrelation ─────────────────────────────────────────────
    ax_corr = fig.add_subplot(gs[2, 2])
    ax_corr.scatter(df['scenarios_completed'], df['total_score'],
                    alpha=0.15, s=8, color='#3B82F6')
    z = np.polyfit(df['scenarios_completed'], df['total_score'], 1)
    p = np.poly1d(z)
    x_line = np.linspace(1, 16, 100)
    ax_corr.plot(x_line, p(x_line), color='#EF4444', linewidth=2, label='Trend')
    ax_corr.set_title('Szenarien vs. Gesamtscore', fontweight='bold', fontsize=11, color='#1E293B')
    ax_corr.set_xlabel('Abgeschlossene Szenarien', fontsize=9, color='#64748B')
    ax_corr.set_ylabel('Gesamtscore', fontsize=9, color='#64748B')
    ax_corr.legend(fontsize=9)
    ax_corr.spines['top'].set_visible(False)
    ax_corr.spines['right'].set_visible(False)
    ax_corr.tick_params(colors='#64748B', labelsize=8)

    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='#F8FAFC')
    plt.close()
    print(f'  ✓ Dashboard gespeichert: {output_path}')

def plot_decision_analysis(df_decisions, output_path):
    """Analysiert Entscheidungsmuster pro Szenario."""
    fig, axes = plt.subplots(1, 2, figsize=(16, 7), facecolor='#F8FAFC')
    fig.suptitle('Entscheidungsanalyse – Brücken Bauen', fontsize=15, fontweight='bold', color='#1E293B')

    # ── Entscheidungsverteilung pro Kategorie ──────────────────────────────────
    ax1 = axes[0]
    pivot = df_decisions.groupby(['category', 'decision']).size().unstack(fill_value=0)
    pivot_pct = pivot.div(pivot.sum(axis=1), axis=0) * 100
    pivot_pct = pivot_pct.reindex(columns=['a', 'b', 'c'], fill_value=0)

    x = np.arange(len(pivot_pct))
    width = 0.25
    colors_abc = ['#10B981', '#F59E0B', '#EF4444']
    labels_abc = ['Beste Wahl (A)', 'Mittlere Wahl (B)', 'Schlechteste Wahl (C)']

    for i, (col, color, label) in enumerate(zip(['a', 'b', 'c'], colors_abc, labels_abc)):
        ax1.bar(x + i * width, pivot_pct[col], width, label=label, color=color, alpha=0.85, edgecolor='white')

    ax1.set_xticks(x + width)
    ax1.set_xticklabels(pivot_pct.index, rotation=35, ha='right', fontsize=8.5, color='#475569')
    ax1.set_ylabel('Anteil der Entscheidungen (%)', fontsize=10, color='#64748B')
    ax1.set_title('Entscheidungsqualität nach Kategorie', fontweight='bold', fontsize=12, color='#1E293B')
    ax1.legend(fontsize=9)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.tick_params(colors='#64748B', labelsize=8)

    # ── Ø Entscheidungszeit pro Szenario ──────────────────────────────────────
    ax2 = axes[1]
    time_by_scenario = df_decisions.groupby('scenario_id')['time_to_decide'].mean().sort_index()
    bars = ax2.bar(time_by_scenario.index, time_by_scenario.values,
                   color='#8B5CF6', alpha=0.8, edgecolor='white')
    ax2.axhline(y=time_by_scenario.mean(), color='#EF4444', linestyle='--',
                linewidth=1.5, label=f'Ø {time_by_scenario.mean():.0f}s')
    ax2.set_title('Ø Entscheidungszeit pro Szenario', fontweight='bold', fontsize=12, color='#1E293B')
    ax2.set_xlabel('Szenario-ID', fontsize=10, color='#64748B')
    ax2.set_ylabel('Ø Zeit bis Entscheidung (Sekunden)', fontsize=10, color='#64748B')
    ax2.legend(fontsize=9)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)
    ax2.tick_params(colors='#64748B', labelsize=9)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='#F8FAFC')
    plt.close()
    print(f'  ✓ Entscheidungsanalyse gespeichert: {output_path}')

def _build_score_rows(df, scores, labels):
    rows = []
    for s in scores:
        mean_val = df[f'score_{s}'].mean()
        min_val = df[f'score_{s}'].min()
        max_val = df[f'score_{s}'].max()
        std_val = df[f'score_{s}'].std()
        badge_cls = 'badge-green' if mean_val > 16 else 'badge-orange'
        badge_lbl = 'Gut' if mean_val > 16 else 'Ausbauf\u00e4hig'
        rows.append(
            f'<tr><td><strong>{labels[s]}</strong></td>'
            f'<td>{mean_val:.1f}</td><td>{int(min_val)}</td><td>{int(max_val)}</td>'
            f'<td>{std_val:.1f}</td>'
            f'<td><span class="badge {badge_cls}">{badge_lbl}</span></td></tr>'
        )
    return '\n'.join(rows)


def generate_html_report(df, df_decisions, dashboard_path, decision_path, output_path):
    """Generiert einen vollständigen HTML-Bericht."""
    total_sessions = len(df)
    avg_completion = df.completion_rate.mean() * 100
    avg_duration = df.duration_seconds.mean() / 60
    teacher_sessions = df.is_teacher_session.sum()
    best_score_dim = max(SCORES, key=lambda s: df[f'score_{s}'].mean())
    worst_score_dim = min(SCORES, key=lambda s: df[f'score_{s}'].mean())
    best_decision_cat = df_decisions[df_decisions.decision == 'a'].groupby('category').size().idxmax()

    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brücken Bauen – Analytics Report {datetime.now().strftime('%B %Y')}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: #F8FAFC; color: #1E293B; line-height: 1.6; }}
    .container {{ max-width: 1100px; margin: 0 auto; padding: 2rem; }}
    header {{ background: linear-gradient(135deg, #1E40AF, #3B82F6); color: white; padding: 2.5rem; border-radius: 1rem; margin-bottom: 2rem; }}
    header h1 {{ font-size: 1.8rem; margin-bottom: 0.5rem; }}
    header p {{ opacity: 0.85; font-size: 0.95rem; }}
    .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }}
    .kpi-card {{ background: white; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid var(--color); }}
    .kpi-value {{ font-size: 1.6rem; font-weight: 700; color: var(--color); }}
    .kpi-label {{ font-size: 0.8rem; color: #64748B; margin-top: 0.25rem; }}
    .section {{ background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
    .section h2 {{ font-size: 1.15rem; font-weight: 700; color: #1E293B; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #E2E8F0; }}
    .section img {{ width: 100%; border-radius: 0.5rem; }}
    .insight-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }}
    .insight {{ background: #F1F5F9; border-radius: 0.5rem; padding: 1rem; }}
    .insight h3 {{ font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }}
    .insight p {{ font-size: 0.875rem; color: #1E293B; }}
    .badge {{ display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }}
    .badge-green {{ background: #D1FAE5; color: #065F46; }}
    .badge-blue {{ background: #DBEAFE; color: #1E40AF; }}
    .badge-orange {{ background: #FEF3C7; color: #92400E; }}
    footer {{ text-align: center; color: #94A3B8; font-size: 0.8rem; margin-top: 2rem; padding: 1rem; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 0.875rem; }}
    th {{ background: #F1F5F9; padding: 0.75rem; text-align: left; font-weight: 600; color: #475569; }}
    td {{ padding: 0.75rem; border-bottom: 1px solid #E2E8F0; color: #1E293B; }}
    tr:hover td {{ background: #F8FAFC; }}
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>Brücken Bauen – Analytics Report</h1>
    <p>Generiert am {datetime.now().strftime('%d. %B %Y, %H:%M Uhr')} &bull; Zeitraum: letzte 90 Tage</p>
  </header>

  <div class="kpi-grid">
    <div class="kpi-card" style="--color: #3B82F6">
      <div class="kpi-value">{total_sessions:,}</div>
      <div class="kpi-label">Gesamte Spielsessions</div>
    </div>
    <div class="kpi-card" style="--color: #10B981">
      <div class="kpi-value">{avg_completion:.0f}%</div>
      <div class="kpi-label">Ø Abschlussrate</div>
    </div>
    <div class="kpi-card" style="--color: #F59E0B">
      <div class="kpi-value">{avg_duration:.0f} Min.</div>
      <div class="kpi-label">Ø Spielzeit</div>
    </div>
    <div class="kpi-card" style="--color: #8B5CF6">
      <div class="kpi-value">{teacher_sessions:,}</div>
      <div class="kpi-label">Lehrer-Sessions</div>
    </div>
    <div class="kpi-card" style="--color: #EF4444">
      <div class="kpi-value">{df.total_score.mean():.0f}</div>
      <div class="kpi-label">Ø Gesamtscore (max. 128)</div>
    </div>
    <div class="kpi-card" style="--color: #06B6D4">
      <div class="kpi-value">{df[df.scenarios_completed == 16].shape[0]:,}</div>
      <div class="kpi-label">Vollständige Durchläufe</div>
    </div>
  </div>

  <div class="section">
    <h2>Übersichts-Dashboard</h2>
    <img src="{dashboard_path.name}" alt="Analytics Dashboard">
  </div>

  <div class="section">
    <h2>Entscheidungsanalyse</h2>
    <img src="{decision_path.name}" alt="Entscheidungsanalyse">
  </div>

  <div class="section">
    <h2>Wichtigste Erkenntnisse</h2>
    <div class="insight-grid">
      <div class="insight">
        <h3>Stärkste Dimension</h3>
        <p><span class="badge badge-green">{SCORE_LABELS[best_score_dim]}</span> ist die am stärksten ausgeprägte Dimension bei den Spieler:innen (Ø {df[f'score_{best_score_dim}'].mean():.1f}/32).</p>
      </div>
      <div class="insight">
        <h3>Verbesserungspotenzial</h3>
        <p><span class="badge badge-orange">{SCORE_LABELS[worst_score_dim]}</span> zeigt das größte Verbesserungspotenzial (Ø {df[f'score_{worst_score_dim}'].mean():.1f}/32). Hier sollten mehr Szenarien angeboten werden.</p>
      </div>
      <div class="insight">
        <h3>Beste Entscheidungsqualität</h3>
        <p>Im Bereich <span class="badge badge-blue">{best_decision_cat}</span> treffen Spieler:innen am häufigsten die beste Entscheidung (A).</p>
      </div>
      <div class="insight">
        <h3>Abbruchpunkte</h3>
        <p>Die meisten Abbrüche erfolgen nach Szenario {int(df[df.scenarios_completed < 16]['scenarios_completed'].mode()[0])}. Hier könnte eine motivierende Zwischennachricht helfen.</p>
      </div>
      <div class="insight">
        <h3>Mobile Nutzung</h3>
        <p>{(df.device == 'mobile').mean()*100:.0f}% der Sessions werden auf mobilen Geräten gespielt. Mobile-Optimierung ist entscheidend.</p>
      </div>
      <div class="insight">
        <h3>Lehrer-Engagement</h3>
        <p>{teacher_sessions} Lehrer-Sessions mit durchschnittlich {df[df.is_teacher_session]['class_size'].mean():.0f} Schüler:innen pro Klasse. Das Spiel wird aktiv im Unterricht eingesetzt.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Score-Übersicht nach Dimension</h2>
    <table>
      <thead>
        <tr><th>Dimension</th><th>Ø Score</th><th>Min.</th><th>Max.</th><th>Std.-Abw.</th><th>Bewertung</th></tr>
      </thead>
      <tbody>
        {_build_score_rows(df, SCORES, SCORE_LABELS)}
      </tbody>
    </table>
  </div>

  <footer>
    Brücken Bauen – Menschlichkeit Österreich &bull; Analytics Report &bull; Alle Daten aggregiert und anonymisiert (DSGVO-konform)
  </footer>
</div>
</body>
</html>"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ✓ HTML-Report gespeichert: {output_path}')

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Game Analytics Report Generator')
    parser.add_argument('--output', default=str(REPORT_DIR / 'game-analytics-report.html'))
    parser.add_argument('--sessions', type=int, default=500)
    args = parser.parse_args()

    output_path = Path(args.output)
    output_dir = output_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    print('🎮 Brücken Bauen – Analytics Report Generator')
    print('=' * 50)
    print(f'  Generiere {args.sessions} Beispiel-Sessions...')

    df = generate_sample_data(n_sessions=args.sessions)
    df_decisions = generate_decision_data(n_decisions=args.sessions * 16)

    print('  Erstelle Visualisierungen...')
    dashboard_path = output_dir / 'dashboard.png'
    decision_path = output_dir / 'decisions.png'

    plot_overview_dashboard(df, dashboard_path)
    plot_decision_analysis(df_decisions, decision_path)

    print('  Generiere HTML-Report...')
    generate_html_report(df, df_decisions, dashboard_path, decision_path, output_path)

    print()
    print(f'✅ Report fertig: {output_path}')
    print(f'   Öffnen mit: open {output_path}')

if __name__ == '__main__':
    main()
