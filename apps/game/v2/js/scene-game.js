/**
 * BRÜCKEN BAUEN 3D – Spielszene
 * Szenario-Rendering, Entscheidungslogik, Feedback
 */
'use strict';

const SceneGame = (() => {
  let currentLevel = null;
  let currentScenario = null;
  let decisions = [];
  let score = 0;
  let usedHint = false;
  let paused = false;

  // Szenarien-Datenbank (Kurzform – vollständige Szenarien in data-scenarios.js)
  const SCENARIOS = {
    gemeinde_parkplatz: {
      title: 'Der Parkplatz-Streit',
      context: 'Die Gemeinde plant, den letzten Grünstreifen im Zentrum in einen Parkplatz umzuwandeln. Anwohner protestieren, Händler befürworten es.',
      image: '🏘️',
      choices: [
        { text: 'Bürgerversammlung einberufen', type: 'consensus', score: 85, consequence: 'Alle Parteien kommen zu Wort. Eine Kompromisslösung wird gefunden: Tiefgarage statt Parkplatz.', xpBonus: 20 },
        { text: 'Abstimmung im Gemeinderat', type: 'majority', score: 70, consequence: 'Der Gemeinderat stimmt für den Parkplatz. Anwohner sind enttäuscht, aber der Prozess war demokratisch.', xpBonus: 10 },
        { text: 'Grünstreifen unter Naturschutz stellen', type: 'environment', score: 75, consequence: 'Der Grünstreifen ist geschützt. Händler suchen alternative Parklösungen.', xpBonus: 15 },
        { text: 'Entscheidung vertagen', type: 'delay', score: 40, consequence: 'Der Konflikt schwelt weiter. Keine Lösung in Sicht.', xpBonus: 0 },
      ],
    },
    gemeinde_jugendzentrum: {
      title: 'Neues Jugendzentrum',
      context: 'Jugendliche fordern ein neues Jugendzentrum. Das Budget ist knapp, aber ein altes Gebäude steht leer.',
      image: '🏗️',
      choices: [
        { text: 'Leerstehendes Gebäude umwidmen', type: 'community', score: 90, consequence: 'Das alte Gebäude wird zum Jugendzentrum. Jugendliche renovieren es selbst – ein Gemeinschaftsprojekt entsteht.', xpBonus: 25 },
        { text: 'Förderantrag beim Land stellen', type: 'official', score: 75, consequence: 'Nach 6 Monaten kommt die Förderung. Das Jugendzentrum wird professionell gebaut.', xpBonus: 15 },
        { text: 'Private Sponsoren suchen', type: 'network', score: 65, consequence: 'Lokale Unternehmen spenden. Das Zentrum wird gebaut, aber mit Werbung versehen.', xpBonus: 10 },
        { text: 'Projekt ablehnen', type: 'reject', score: 20, consequence: 'Jugendliche sind enttäuscht. Vandalismus nimmt zu.', xpBonus: 0 },
      ],
    },
    schule_mobbing: {
      title: 'Mobbing in der Klasse',
      context: 'Ein Schüler wird systematisch von Mitschülern gemobbt. Die Lehrerin hat es bemerkt, aber die Eltern der Täter streiten alles ab.',
      image: '🏫',
      choices: [
        { text: 'Mediation mit allen Beteiligten', type: 'consensus', score: 88, consequence: 'Ein Mediator wird eingesetzt. Die Situation verbessert sich langsam, aber nachhaltig.', xpBonus: 22 },
        { text: 'Schulleitung einschalten', type: 'official', score: 72, consequence: 'Die Schulleitung verhängt Konsequenzen. Das Mobbing hört auf, aber die Atmosphäre bleibt angespannt.', xpBonus: 12 },
        { text: 'Elterngespräch erzwingen', type: 'direct', score: 60, consequence: 'Die Eltern der Täter kommen widerwillig. Wenig Einsicht, aber ein erster Schritt.', xpBonus: 8 },
        { text: 'Nichts unternehmen', type: 'ignore', score: 10, consequence: 'Das Mobbing eskaliert. Das Opfer wechselt die Schule.', xpBonus: 0 },
      ],
    },
    medien_fakenews: {
      title: 'Fake News erkennen',
      context: 'Ein viraler Beitrag behauptet, dass Impfungen Autismus verursachen. Tausende teilen ihn. Deine Redaktion soll reagieren.',
      image: '📰',
      choices: [
        { text: 'Faktenchecker-Artikel veröffentlichen', type: 'expose', score: 92, consequence: 'Der Faktencheck wird 50.000 Mal geteilt. Die Falschmeldung verliert an Reichweite.', xpBonus: 28 },
        { text: 'Experten zu Wort kommen lassen', type: 'research', score: 85, consequence: 'Wissenschaftler erklären die Datenlage. Viele Zweifler werden überzeugt.', xpBonus: 20 },
        { text: 'Plattform zur Löschung auffordern', type: 'official', score: 65, consequence: 'Die Plattform löscht den Beitrag nach 3 Tagen. Aber Kopien kursieren weiter.', xpBonus: 10 },
        { text: 'Ignorieren', type: 'ignore', score: 15, consequence: 'Die Falschmeldung verbreitet sich weiter. Impfquoten sinken.', xpBonus: 0 },
      ],
    },
    umwelt_co2steuer: {
      title: 'CO2-Steuer',
      context: 'Die Regierung plant eine CO2-Steuer. Industrie und Pendler protestieren, Klimaschützer jubeln. Du musst Position beziehen.',
      image: '🌍',
      choices: [
        { text: 'Steuer mit sozialem Ausgleich unterstützen', type: 'environment', score: 90, consequence: 'Die CO2-Steuer wird eingeführt, ärmere Haushalte werden entlastet. Ein fairer Kompromiss.', xpBonus: 25 },
        { text: 'Schrittweise Einführung vorschlagen', type: 'consensus', score: 80, consequence: 'Alle Seiten können sich arrangieren. Die Steuer kommt, aber langsam.', xpBonus: 18 },
        { text: 'Steuer ablehnen, freiwillige Maßnahmen', type: 'voluntary', score: 50, consequence: 'Freiwillige Maßnahmen bleiben wirkungslos. CO2-Emissionen steigen weiter.', xpBonus: 5 },
        { text: 'Volksabstimmung fordern', type: 'mobilize', score: 70, consequence: 'Die Volksabstimmung bringt eine knappe Mehrheit für die Steuer.', xpBonus: 15 },
      ],
    },
    digital_datenschutz: {
      title: 'Datenschutz vs. Sicherheit',
      context: 'Die Polizei will Zugang zu privaten Messenger-Nachrichten zur Verbrechensbekämpfung. Bürgerrechtsgruppen protestieren.',
      image: '💻',
      choices: [
        { text: 'Richterliche Genehmigung als Pflicht', type: 'rights', score: 88, consequence: 'Nur mit Richterspruch darf auf Daten zugegriffen werden. Rechtsstaat gestärkt.', xpBonus: 22 },
        { text: 'Strenge Datenschutzgesetze durchsetzen', type: 'compliant', score: 82, consequence: 'Neue Gesetze schützen die Privatsphäre. Ermittlungen werden schwieriger, aber fairer.', xpBonus: 18 },
        { text: 'Vollzugang für Behörden', type: 'security', score: 35, consequence: 'Massive Proteste. Österreich wird international für Überwachung kritisiert.', xpBonus: 0 },
        { text: 'Unabhängige Kommission einsetzen', type: 'independent', score: 75, consequence: 'Eine Kommission entwickelt Leitlinien. Langsam, aber ausgewogen.', xpBonus: 15 },
      ],
    },
    gesundheit_impfung: {
      title: 'Impfpflicht',
      context: 'Eine neue Pandemie droht. Experten empfehlen eine Impfpflicht, aber ein Teil der Bevölkerung lehnt sie ab.',
      image: '🏥',
      choices: [
        { text: 'Impfpflicht mit Ausnahmen einführen', type: 'official', score: 80, consequence: 'Hohe Impfquote wird erreicht. Ausnahmen für medizinische Gründe werden respektiert.', xpBonus: 20 },
        { text: 'Intensive Aufklärungskampagne', type: 'community', score: 85, consequence: 'Durch Vertrauen und Information steigt die Impfbereitschaft freiwillig auf 85%.', xpBonus: 22 },
        { text: 'Anreize statt Pflicht', type: 'voluntary', score: 70, consequence: 'Gutscheine und Vergünstigungen erhöhen die Impfquote auf 75%.', xpBonus: 15 },
        { text: 'Keine Maßnahmen', type: 'ignore', score: 10, consequence: 'Die Pandemie breitet sich aus. Das Gesundheitssystem kollabiert.', xpBonus: 0 },
      ],
    },
    europa_fluechtlinge: {
      title: 'Flüchtlingsverteilung',
      context: 'Die EU diskutiert einen verpflichtenden Verteilungsschlüssel für Flüchtlinge. Einige Länder verweigern die Teilnahme.',
      image: '🇪🇺',
      choices: [
        { text: 'Solidaritätsmechanismus unterstützen', type: 'consensus', score: 85, consequence: 'Österreich nimmt seinen Anteil auf. Internationale Anerkennung steigt.', xpBonus: 22 },
        { text: 'Finanzielle Kompensation statt Aufnahme', type: 'compromise', score: 65, consequence: 'Ein Kompromiss wird gefunden. Nicht ideal, aber praktikabel.', xpBonus: 12 },
        { text: 'Nationale Grenzen stärken', type: 'national', score: 30, consequence: 'Österreich wird in der EU isoliert. Diplomatische Spannungen entstehen.', xpBonus: 0 },
        { text: 'Freiwillige Aufnahme über Quote', type: 'community', score: 90, consequence: 'Österreich nimmt mehr auf als gefordert. Wird zum Vorbild in Europa.', xpBonus: 28 },
      ],
    },
    recht_grundrechte: {
      title: 'Grundrechte in der Krise',
      context: 'In einer Krisensituation will die Regierung Grundrechte temporär einschränken. Du musst als Richterin entscheiden.',
      image: '⚖️',
      choices: [
        { text: 'Klage stattgeben – Grundrechte schützen', type: 'rights', score: 92, consequence: 'Das Verfassungsgericht stärkt die Grundrechte. Die Regierung muss alternative Maßnahmen finden.', xpBonus: 30 },
        { text: 'Einschränkung unter strengen Bedingungen erlauben', type: 'compromise', score: 72, consequence: 'Zeitlich begrenzte Einschränkungen mit Kontrolle werden erlaubt.', xpBonus: 15 },
        { text: 'Klage abweisen', type: 'reject', score: 25, consequence: 'Grundrechte werden ausgehöhlt. Internationale Kritik folgt.', xpBonus: 0 },
        { text: 'Unabhängige Prüfung anordnen', type: 'independent', score: 80, consequence: 'Eine unabhängige Kommission prüft die Maßnahmen. Transparenz wird gewahrt.', xpBonus: 20 },
      ],
    },
    zukunft_final: {
      title: 'Das letzte Kapitel',
      context: 'Du stehst vor der wichtigsten Entscheidung deiner Karriere: Wie soll die Demokratie der Zukunft aussehen? Deine Antwort wird Geschichte schreiben.',
      image: '🚀',
      choices: [
        { text: 'Direkte digitale Demokratie', type: 'digital', score: 88, consequence: 'Bürgerinnen stimmen direkt über alle wichtigen Fragen ab. Eine neue Ära der Partizipation beginnt.', xpBonus: 50 },
        { text: 'Stärkung der Zivilgesellschaft', type: 'community', score: 92, consequence: 'Lokale Gemeinschaften erhalten mehr Macht. Bottom-up-Demokratie triumphiert.', xpBonus: 55 },
        { text: 'KI-gestützte Entscheidungsfindung', type: 'ai', score: 70, consequence: 'KI hilft bei komplexen Entscheidungen, aber Menschen behalten das letzte Wort.', xpBonus: 35 },
        { text: 'Globale demokratische Verfassung', type: 'global', score: 95, consequence: 'Die Welt einigt sich auf gemeinsame demokratische Grundwerte. Ein historischer Moment.', xpBonus: 60 },
      ],
    },
  };

  // ── Level starten ──────────────────────────────────────────
  function startLevel(level) {
    currentLevel = level;
    decisions = [];
    score = 0;
    usedHint = false;
    paused = false;

    // Szenario laden (Fallback auf generisches)
    currentScenario = SCENARIOS[level.scenario] || _generateGenericScenario(level);

    // UI aufbauen
    _renderScenario();

    // Timer starten
    UIHud.startTimer(
      level.timeLimit,
      (t) => { /* Tick */ },
      () => _onTimeExpired()
    );
  }

  function _renderScenario() {
    const container = document.getElementById('scenario-container');
    if (!container) return;

    container.innerHTML = `
      <div class="scenario-card animate-fadeInUp">
        <div class="scenario-image">${currentScenario.image}</div>
        <h2 class="scenario-title">${currentScenario.title}</h2>
        <p class="scenario-context">${currentScenario.context}</p>
        <div class="scenario-role-hint">
          ${GAME_STATE.selectedRole ? `<span>Du spielst als: ${ROLES_DATA.find(r=>r.id===GAME_STATE.selectedRole)?.icon} ${ROLES_DATA.find(r=>r.id===GAME_STATE.selectedRole)?.name}</span>` : ''}
        </div>
      </div>
      <div class="choices-grid" id="choices-grid">
        ${currentScenario.choices.map((c, i) => `
          <button class="choice-btn animate-fadeInUp"
                  style="animation-delay:${i*0.1}s"
                  onclick="SceneGame.makeChoice(${i})">
            <span class="choice-text">${c.text}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn-hint" id="btn-hint" onclick="SceneGame.showHint()">💡 Hinweis</button>
    `;
  }

  function makeChoice(index) {
    const choice = currentScenario.choices[index];
    if (!choice) return;

    // Rollenbonus berechnen
    let choiceScore = choice.score;
    if (GAME_STATE.selectedRole) {
      const role = ROLES_DATA.find(r => r.id === GAME_STATE.selectedRole);
      if (role) {
        const bonus = role.bonuses.find(b => b.trigger === choice.type);
        if (bonus && bonus.type === 'score') choiceScore = Math.min(100, choiceScore * (1 + bonus.value));
      }
    }

    score = Math.round(choiceScore);
    GAME_STATE.score = score;

    // Entscheidung speichern
    decisions.push({
      levelId: currentLevel.id,
      choiceIndex: index,
      choiceText: choice.text,
      type: choice.type,
      score: choiceScore,
      timeLeft: UIHud.getTimeLeft(),
      usedHint,
      role: GAME_STATE.selectedRole,
    });

    // Feedback anzeigen
    _showFeedback(choice, choiceScore);
  }

  function _showFeedback(choice, score) {
    UIHud.stopTimer();

    const container = document.getElementById('scenario-container');
    if (!container) return;

    const isGood = score >= 70;
    container.innerHTML = `
      <div class="feedback-card animate-fadeInUp" style="border-color:${isGood ? 'var(--clr-success)' : 'var(--clr-warning)'}">
        <div style="font-size:3rem">${score >= 90 ? '🏆' : score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌'}</div>
        <h3 style="color:${isGood ? 'var(--clr-success)' : 'var(--clr-warning)'};margin:0.5rem 0">${score >= 90 ? 'Ausgezeichnet!' : score >= 70 ? 'Gut gemacht!' : score >= 50 ? 'Akzeptabel' : 'Nicht optimal'}</h3>
        <p style="color:var(--clr-muted);line-height:1.6">${choice.consequence}</p>
        <div style="margin-top:1rem;padding:0.75rem;background:var(--clr-surface);border-radius:var(--radius);display:flex;gap:1.5rem;justify-content:center">
          <div><span style="color:var(--clr-muted);font-size:0.8rem">Score</span><br><strong style="font-size:1.2rem">${score}%</strong></div>
          <div><span style="color:var(--clr-muted);font-size:0.8rem">XP</span><br><strong style="font-size:1.2rem;color:var(--clr-accent)">+${choice.xpBonus}</strong></div>
        </div>
        <button class="btn-primary" style="margin-top:1.5rem;width:100%" onclick="SceneGame.finishLevel()">
          Weiter →
        </button>
      </div>
    `;

    // Partikeleffekte
    if (typeof ParticleEngine !== 'undefined' && typeof Engine3D !== 'undefined') {
      if (score >= 90) {
        ParticleEngine.createConfetti(Engine3D.getCamera().position.x, 0, 0);
      }
    }
  }

  function finishLevel() {
    if (!currentLevel) return;
    const result = ProgressionSystem.completeLevel(currentLevel.id, score, decisions);
    // EventBus.emit('levelCompleted') wird von ProgressionSystem ausgelöst
  }

  function _onTimeExpired() {
    score = 0;
    decisions.push({ levelId: currentLevel.id, type: 'timeout', score: 0, timeLeft: 0, usedHint, role: GAME_STATE.selectedRole });
    ProgressionSystem.completeLevel(currentLevel.id, 0, decisions);
  }

  function showHint() {
    usedHint = true;
    const hint = document.getElementById('btn-hint');
    if (hint) hint.style.display = 'none';

    const best = [...currentScenario.choices].sort((a, b) => b.score - a.score)[0];
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);
      background:rgba(245,158,11,0.95);color:#000;
      padding:0.75rem 1.5rem;border-radius:var(--radius);
      font-size:0.85rem;max-width:320px;text-align:center;
      z-index:100;box-shadow:0 4px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = `💡 Tipp: "${best.text}" könnte eine gute Wahl sein.`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function resume() { paused = false; }
  function restart() { if (currentLevel) startLevel(currentLevel); }

  return { startLevel, makeChoice, finishLevel, showHint, resume, restart };
})();
