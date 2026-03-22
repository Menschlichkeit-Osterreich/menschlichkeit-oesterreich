import {
  PLAYABLE_LEVEL_COUNT,
  PROFILE_KEYS,
  PROFILE_LABELS,
  ROADMAP_LEVEL_COUNT,
  ROLES,
  WORLDS,
  getCampaignStats,
  getLevelsForWorld,
  getRoleById,
  getWorldProgress,
  isLevelUnlocked,
  isWorldPlayable,
} from '../content/campaign.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderDelta(delta) {
  if (!delta) {
    return '0';
  }
  return `${delta > 0 ? '+' : ''}${delta}`;
}

export function renderProfileStats(profile) {
  return PROFILE_KEYS.map((key) => {
    const value = profile.stats[key] ?? 0;
    return `<div class="stat-pill"><span>${PROFILE_LABELS[key]}</span><strong>${value}</strong></div>`;
  }).join('');
}

export function renderRoleCards(activeRoleId) {
  return ROLES.map((role) => {
    const active = role.id === activeRoleId ? ' is-active' : '';
    return `
      <button type="button" class="role-card${active}" data-role-id="${role.id}">
        <span class="role-card__icon" aria-hidden="true">${role.icon}</span>
        <span class="role-card__name">${escapeHtml(role.name)}</span>
        <span class="role-card__summary">${escapeHtml(role.summary)}</span>
        <span class="role-card__focus">Ziel: ${escapeHtml(role.roleObjective)}</span>
        <span class="role-card__focus">Druckspur: ${escapeHtml(role.pressureTrack)}</span>
      </button>
    `;
  }).join('');
}

export function renderWorldCards(state, selectedWorldId) {
  return WORLDS.map((world) => {
    const progress = getWorldProgress(state, world.id);
    const selected = world.id === selectedWorldId ? ' is-selected' : '';
    const locked = !isWorldPlayable(world.id) ? ' is-locked' : '';
    const meta = progress.isPlayable
      ? `${progress.completed}/${progress.total} spielbar abgeschlossen`
      : `${world.release} · ${Math.round((ROADMAP_LEVEL_COUNT - PLAYABLE_LEVEL_COUNT) / 9)}+ Levels geplant`;

    return `
      <button type="button" class="world-card${selected}${locked}" data-world-id="${world.id}" ${progress.isPlayable ? '' : 'data-roadmap="true"'}>
        <span class="world-card__icon" aria-hidden="true">${world.icon}</span>
        <span class="world-card__title">${escapeHtml(world.name)}</span>
        <span class="world-card__summary">${escapeHtml(world.summary)}</span>
        <span class="world-card__meta">${escapeHtml(meta)}</span>
      </button>
    `;
  }).join('');
}

export function renderLevelCards(state, worldId, currentLevelId) {
  const levels = getLevelsForWorld(worldId);
  if (!levels.length) {
    const world = WORLDS.find((entry) => entry.id === worldId);
    return `
      <article class="settings-card">
        <strong>${escapeHtml(world?.name ?? 'Diese Welt')}</strong>
        <p class="section-copy">Diese Welt ist als Roadmap markiert und wird erst in einer spaeteren Ausbaustufe als eigener Levelpfad freigeschaltet.</p>
      </article>
    `;
  }

  return levels.map((level) => {
    const unlocked = isLevelUnlocked(state, level.id);
    const current = level.id === currentLevelId ? ' is-current' : '';
    const locked = !unlocked ? ' is-locked' : '';
    const completed = state.campaign.completedLevels[String(level.id)] ? 'Erledigt' : 'Offen';
    return `
      <button type="button" class="level-chip${current}${locked}" data-level-id="${level.id}" ${unlocked ? '' : 'disabled'}>
        <strong>Level ${level.id}: ${escapeHtml(level.title)}</strong>
        <small>${escapeHtml(level.district)} · Schwierigkeit ${level.difficulty} · ${completed}</small>
      </button>
    `;
  }).join('');
}

export function renderScenarioChoices(scenario, selectedChoiceId) {
  return scenario.choices.map((choice) => {
    const selected = choice.id === selectedChoiceId ? ' is-selected' : '';
    return `
      <button type="button" class="choice-card${selected}" data-choice-id="${choice.id}">
        <strong>${escapeHtml(choice.label)}</strong>
        <span>${escapeHtml(choice.summary)}</span>
        <span class="world-card__meta">Kurzfristig: ${escapeHtml(choice.immediate)}</span>
        <span class="world-card__meta">Systemisch: ${escapeHtml(choice.impactPreview)}</span>
      </button>
    `;
  }).join('');
}

export function renderResultStats(stats) {
  return PROFILE_KEYS.map((key) => {
    const value = stats[key] ?? 0;
    const prefix = value > 0 ? '+' : '';
    return `
      <article class="result-card">
        <strong>${prefix}${value}</strong>
        <span>${escapeHtml(PROFILE_LABELS[key])}</span>
      </article>
    `;
  }).join('');
}

export function renderWorldStateCards(cards) {
  return cards
    .map(
      (card) => `
        <article class="track-card track-card--${card.tone}">
          <span class="kicker">${escapeHtml(card.label)}</span>
          <strong>${card.value}/100</strong>
          <span>${escapeHtml(card.description)}</span>
          <small>Delta ${renderDelta(card.delta)}</small>
        </article>
      `,
    )
    .join('');
}

export function renderRoleToolkit(items) {
  return items.map((item) => `<article class="insight-card">${escapeHtml(item)}</article>`).join('');
}

export function renderListItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function renderLayeredConsequences(items) {
  return items
    .map(
      (item) => `
        <article class="consequence-card consequence-card--${item.tone}">
          <strong>${escapeHtml(item.title)}</strong>
          <p class="section-copy">${escapeHtml(item.body)}</p>
        </article>
      `,
    )
    .join('');
}

export function renderTeacherExports(exportsList) {
  if (!exportsList.length) {
    return '<li>Noch keine lokalen Debrief-Exporte gespeichert.</li>';
  }

  return exportsList
    .slice(-4)
    .reverse()
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(entry.level)}</strong> · ${escapeHtml(entry.role)} · ${escapeHtml(entry.band)} · ${escapeHtml(entry.dominantShift ?? 'ohne Spur')}</li>`,
    )
    .join('');
}

export function renderTeacherSessionLog(logEntries, analyticsSummary) {
  const entryMarkup =
    logEntries.length === 0
      ? '<article class="settings-card"><strong>Noch keine Session-Eintraege</strong><span>Spiele zuerst ein Level fertig, damit Reflexion und Export sichtbar werden.</span></article>'
      : logEntries
          .map(
            (entry) => `
              <article class="teacher-log-card">
                <strong>${escapeHtml(entry.level)}</strong>
                <span>${escapeHtml(entry.role)} · ${escapeHtml(entry.band)} · Score ${entry.score}</span>
                <span>Dominante Spur: ${escapeHtml(entry.dominantShift.label)} (${renderDelta(entry.dominantShift.delta)})</span>
              </article>
            `,
          )
          .join('');

  const analyticsMarkup = analyticsSummary.total
    ? Object.entries(analyticsSummary.counts)
        .map(
          ([eventType, count]) =>
            `<article class="teacher-log-card"><strong>${escapeHtml(eventType)}</strong><span>${count} lokale Ereignisse</span></article>`,
        )
        .join('')
    : '<article class="teacher-log-card"><strong>Keine Analytics gespeichert</strong><span>Consent ist aus oder es gab noch keine lokalen Ereignisse.</span></article>';

  return {
    entryMarkup,
    analyticsMarkup,
  };
}

export function renderMenuLead(state) {
  const role = getRoleById(state.campaign.selectedRole);
  const stats = getCampaignStats(state);
  return {
    roleLabel: `${role.icon} ${role.name}`,
    progressLabel: `${stats.completedPlayableLevels} von ${stats.totalPlayableLevels} spielbaren Levels abgeschlossen`,
    roadmapLabel: `${stats.totalRoadmapLevels} weitere Levels sind als Roadmap vorbereitet`,
  };
}
