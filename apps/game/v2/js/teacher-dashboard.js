/**
 * BRÜCKEN BAUEN 3D – Teacher Dashboard
 * Klassenübersicht, Heatmap und Lehrplan-Alignment
 */
'use strict';

const TeacherDashboard = (() => {

  function init() {
    _renderStats();
    _renderHeatmap();
    _renderCurriculum();
  }

  function _renderStats() {
    // Demo-Daten (in Produktion: von API)
    const stats = {
      students: 24,
      avgLevel: 7,
      completed: 168,
      avgEmpathy: 78,
    };
    const el = id => document.getElementById(id);
    if (el('t-students'))  el('t-students').textContent  = stats.students;
    if (el('t-avg-level')) el('t-avg-level').textContent = stats.avgLevel;
    if (el('t-completed')) el('t-completed').textContent = stats.completed;
    if (el('t-empathy'))   el('t-empathy').textContent   = stats.avgEmpathy + '%';
  }

  function _renderHeatmap() {
    const canvas = document.getElementById('teacher-heatmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const worlds = LEVELS_DATA.worlds;
    const cellW = canvas.width / 10;
    const cellH = canvas.height / 10;

    // Demo-Completion-Daten
    const completionData = Array.from({length: 10}, (_, w) =>
      Array.from({length: 10}, (_, l) => Math.random())
    );

    worlds.forEach((world, wi) => {
      for (let li = 0; li < 10; li++) {
        const val = completionData[wi][li];
        const alpha = 0.2 + val * 0.8;
        ctx.fillStyle = world.color + Math.round(alpha * 255).toString(16).padStart(2,'0');
        ctx.fillRect(wi * cellW + 1, li * cellH + 1, cellW - 2, cellH - 2);

        // Prozentzahl
        ctx.fillStyle = val > 0.5 ? '#fff' : '#aaa';
        ctx.font = `${Math.min(cellW, cellH) * 0.35}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(val * 100) + '%', wi * cellW + cellW/2, li * cellH + cellH/2);
      }
    });

    // Achsenbeschriftungen
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    worlds.forEach((w, i) => {
      ctx.fillText(w.icon, i * cellW + cellW/2, canvas.height - 2);
    });
  }

  function _renderCurriculum() {
    const list = document.getElementById('curriculum-list');
    if (!list) return;

    const items = [
      { subject: 'Politische Bildung', levels: '1–30', alignment: 95 },
      { subject: 'Ethik & Philosophie', levels: '31–60', alignment: 88 },
      { subject: 'Geschichte & Sozialkunde', levels: '61–80', alignment: 92 },
      { subject: 'Digitale Grundbildung', levels: '51–70', alignment: 85 },
      { subject: 'Umweltkunde', levels: '41–50', alignment: 90 },
    ];

    list.innerHTML = items.map(item => `
      <div style="display:flex;align-items:center;gap:1rem;padding:0.5rem 0;border-bottom:1px solid var(--clr-border)">
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.85rem">${item.subject}</div>
          <div style="font-size:0.75rem;color:var(--clr-muted)">Level ${item.levels}</div>
        </div>
        <div style="width:100px">
          <div class="progress-bar-wrap" style="height:6px">
            <div class="progress-bar blue" style="width:${item.alignment}%"></div>
          </div>
        </div>
        <div style="font-size:0.85rem;font-weight:700;color:var(--clr-success);width:40px;text-align:right">${item.alignment}%</div>
      </div>
    `).join('');
  }

  return { init };
})();
