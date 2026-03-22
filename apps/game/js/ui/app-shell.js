import { createStateMachine } from '../core/state-machine.js';
import { createGameStorage } from '../core/storage.js';
import {
  PLAYABLE_LEVEL_COUNT,
  SITE_LINKS,
  WORLDS,
  getDefaultState,
  getLevelById,
  getNextPlayableLevelId,
  getPlayerLevelFromXp,
  getRoleById,
  getScenarioDefinition,
  getTeacherSessionSummary,
  getWorldById,
  getWorldProgress,
  getWorldStateViewModel,
  isWorldPlayable,
  resolveScenarioOutcome,
} from '../content/campaign.js';
import { createAnalyticsService } from '../services/analytics.js';
import { createBabylonStage } from '../scenes/babylon-stage.js';
import {
  renderLayeredConsequences,
  renderLevelCards,
  renderListItems,
  renderMenuLead,
  renderProfileStats,
  renderResultStats,
  renderRoleCards,
  renderRoleToolkit,
  renderScenarioChoices,
  renderTeacherExports,
  renderTeacherSessionLog,
  renderWorldCards,
  renderWorldStateCards,
} from './templates.js';

function $(id) {
  return document.getElementById(id);
}

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function bootGameApp() {
  const dom = {
    canvas: $('renderCanvas'),
    loadingValue: $('loading-bar'),
    loadingStatus: $('loading-status'),
    pauseButton: $('pause-game-button'),
    menuRole: $('menu-role'),
    menuProgress: $('menu-progress'),
    menuRoadmap: $('menu-roadmap'),
    menuProfile: $('menu-profile'),
    startButton: $('start-game-button'),
    resumeButton: $('resume-game-button'),
    chooseRoleButton: $('choose-role-button'),
    mainSiteButton: $('open-main-site-button'),
    roleGrid: $('role-grid'),
    roleBack: $('role-back-button'),
    currentRoleBadge: $('current-role-badge'),
    worldGrid: $('world-grid'),
    worldLead: $('world-lead'),
    worldSummary: $('world-summary'),
    worldStateGrid: $('world-state-grid'),
    progressSummary: $('progress-summary'),
    levelList: $('level-list'),
    worldBack: $('world-back-button'),
    scenarioBack: $('scenario-back-button'),
    scenarioTitle: $('scenario-title'),
    scenarioSubtitle: $('scenario-subtitle'),
    scenarioContext: $('scenario-context'),
    scenarioPrompt: $('scenario-prompt'),
    scenarioMeta: $('scenario-meta'),
    scenarioIntel: $('scenario-intel'),
    scenarioStakes: $('scenario-stakes'),
    scenarioLearningFocus: $('scenario-learning-focus'),
    scenarioRoleTools: $('scenario-role-tools'),
    scenarioHiddenVariables: $('scenario-hidden-variables'),
    teacherPrompt: $('teacher-prompt'),
    signatureAction: $('signature-action-button'),
    scenarioChoices: $('scenario-choices'),
    submitChoice: $('submit-choice-button'),
    resultTitle: $('result-title'),
    resultBand: $('result-band'),
    resultSummary: $('result-summary'),
    resultScore: $('result-score'),
    resultXp: $('result-xp'),
    resultStats: $('result-stats'),
    resultWorldState: $('result-world-state'),
    resultConsequences: $('result-consequences'),
    resultSignature: $('result-signature'),
    resultDebrief: $('result-debrief'),
    teacherExports: $('teacher-exports'),
    copyTeacherExport: $('copy-teacher-export-button'),
    teacherReviewButton: $('teacher-review-button'),
    resultNext: $('result-next-button'),
    resultWorlds: $('result-worlds-button'),
    resetProgress: $('reset-progress-button'),
    teacherBack: $('teacher-back-button'),
    teacherSessionSummary: $('teacher-session-summary'),
    teacherLatestSummary: $('teacher-latest-summary'),
    teacherDiscussionList: $('teacher-discussion-list'),
    teacherLogList: $('teacher-log-list'),
    teacherAnalyticsSummary: $('teacher-analytics-summary'),
    pauseResume: $('pause-resume-button'),
    pauseWorlds: $('pause-worlds-button'),
    pauseMenu: $('pause-menu-button'),
    reducedMotion: $('setting-reduced-motion'),
    lowGraphics: $('setting-low-graphics'),
    analyticsConsent: $('setting-analytics-consent'),
    settingsEducation: $('settings-education-link'),
    settingsJoin: $('settings-join-link'),
    settingsContact: $('settings-contact-link'),
    settingsDonate: $('settings-donate-link'),
    toast: $('toast'),
  };

  const defaultState = getDefaultState();
  const storage = createGameStorage(defaultState);
  const analytics = createAnalyticsService();
  let state = storage.loadState();
  let stage = null;
  let selectedChoiceId = null;
  let roleActionArmed = false;
  let pendingOutcome = null;

  state.telemetry.sessionId = createSessionId();
  state.telemetry.sessionStartedAt = new Date().toISOString();
  state.campaign.currentLevelId = Math.max(1, Math.min(state.campaign.currentLevelId, PLAYABLE_LEVEL_COUNT));

  const machine = createStateMachine({
    initialState: 'boot',
    transitions: {
      boot: ['menu'],
      menu: ['role', 'world', 'scenario'],
      role: ['menu', 'world'],
      world: ['menu', 'role', 'scenario'],
      scenario: ['result', 'world', 'menu', 'paused'],
      result: ['world', 'menu', 'scenario', 'teacher'],
      teacher: ['result', 'world', 'menu'],
      paused: ['scenario', 'world', 'menu'],
    },
    onTransition: () => {
      render();
    },
  });

  function saveState() {
    storage.saveState(state);
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.hidden = false;
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      dom.toast.hidden = true;
    }, 2600);
  }

  function safeTransition(target) {
    if (machine.getState() === target) {
      render();
      return;
    }
    if (machine.canTransition(target)) {
      machine.transition(target);
    }
  }

  function currentWorld() {
    return getWorldById(state.campaign.currentWorldId);
  }

  function alignCurrentWorldToLevel() {
    const level = getLevelById(state.campaign.currentLevelId);
    if (level) {
      state.campaign.currentWorldId = level.worldId;
    }
  }

  function currentScenario() {
    return getScenarioDefinition(state.campaign.currentLevelId, state.campaign.selectedRole, state);
  }

  function syncStage() {
    if (!stage) {
      return;
    }

    const role = getRoleById(state.campaign.selectedRole);
    const world = currentWorld();
    const ratio = Object.keys(state.campaign.completedLevels).length / PLAYABLE_LEVEL_COUNT;
    const uiState = machine.getState();
    const trackState =
      pendingOutcome && ['result', 'teacher'].includes(uiState)
        ? pendingOutcome.worldStateAfter
        : state.worldState[String(state.campaign.currentWorldId)];
    const trackDelta =
      pendingOutcome && ['result', 'teacher'].includes(uiState)
        ? pendingOutcome.worldDelta
        : {};

    if (uiState === 'world') {
      stage.setMode('world', {
        worlds: WORLDS,
        color: role.color,
        accent: world.accent,
        background: '#09111d',
        ground: '#101827',
        trackState,
      });
      return;
    }

    if (uiState === 'scenario' || uiState === 'paused') {
      stage.setMode('level', {
        color: world.color,
        accent: world.accent,
        background: '#09111d',
        ground: '#101827',
        progressRatio: Math.max(0.15, ratio),
        trackState,
      });
      return;
    }

    if (uiState === 'result') {
      stage.setMode('result', {
        color: world.color,
        accent: world.accent,
        background: '#0b1220',
        ground: '#111827',
        trackState,
        trackDelta,
      });
      return;
    }

    if (uiState === 'teacher') {
      stage.setMode('teacher', {
        color: world.color,
        accent: world.accent,
        background: '#07131b',
        ground: '#0f172a',
        trackState,
        trackDelta,
      });
      return;
    }

    stage.setMode('menu', {
      color: role.color,
      accent: world.accent,
      background: '#070b16',
      ground: '#10141f',
      trackState,
    });
  }

  function renderMenu() {
    const lead = renderMenuLead(state);
    dom.menuRole.textContent = lead.roleLabel;
    dom.menuProgress.textContent = lead.progressLabel;
    dom.menuRoadmap.textContent = lead.roadmapLabel;
    dom.menuProfile.innerHTML = renderProfileStats(state.profile);
    dom.resumeButton.disabled = Object.keys(state.campaign.completedLevels).length === 0;
    dom.currentRoleBadge.textContent = lead.roleLabel;
  }

  function renderRoleScreen() {
    dom.roleGrid.innerHTML = renderRoleCards(state.campaign.selectedRole);
    dom.roleGrid.querySelectorAll('[data-role-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.campaign.selectedRole = button.getAttribute('data-role-id');
        saveState();
        analytics.track(state, 'role_changed', { roleId: state.campaign.selectedRole });
        render();
      });
    });
  }

  function renderWorldScreen() {
    const role = getRoleById(state.campaign.selectedRole);
    const world = currentWorld();
    const progress = getWorldProgress(state, world.id);
    dom.worldLead.textContent = `${role.intelLead} In ${world.name} zaehlen jetzt nicht nur Scores, sondern sichtbare Spuren in Vertrauen, Teilhabe, Rechtsstaat, sozialer Spannung und Zukunftslast.`;
    dom.progressSummary.textContent = `${progress.completed}/${progress.total} Levels in ${world.name} abgeschlossen`;
    dom.worldGrid.innerHTML = renderWorldCards(state, state.campaign.currentWorldId);
    dom.levelList.innerHTML = renderLevelCards(state, state.campaign.currentWorldId, state.campaign.currentLevelId);
    dom.worldStateGrid.innerHTML = renderWorldStateCards(getWorldStateViewModel(state, world.id));
    dom.worldSummary.innerHTML = `
      <article class="settings-card">
        <strong>${world.icon} ${world.name}</strong>
        <p class="section-copy">${world.summary}</p>
        <p class="fine-copy">Lernfokus: ${world.learningFocus}</p>
      </article>
    `;

    dom.worldGrid.querySelectorAll('[data-world-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const worldId = Number(button.getAttribute('data-world-id'));
        state.campaign.currentWorldId = worldId;
        if (isWorldPlayable(worldId) && getLevelById(state.campaign.currentLevelId)?.worldId !== worldId) {
          state.campaign.currentLevelId = 1;
        }
        saveState();
        render();
      });
    });

    dom.levelList.querySelectorAll('[data-level-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.campaign.currentLevelId = Number(button.getAttribute('data-level-id'));
        selectedChoiceId = null;
        roleActionArmed = false;
        saveState();
        safeTransition('scenario');
      });
    });
  }

  function renderScenarioScreen() {
    const scenario = currentScenario();
    if (!scenario) {
      return;
    }

    dom.scenarioTitle.textContent = scenario.title;
    dom.scenarioSubtitle.textContent = scenario.subtitle;
    dom.scenarioContext.textContent = scenario.context;
    dom.scenarioPrompt.textContent = scenario.prompt;
    dom.scenarioMeta.textContent = `${scenario.district} · Schwierigkeit ${scenario.difficulty}`;
    dom.scenarioIntel.textContent = scenario.intel;
    dom.scenarioLearningFocus.textContent = scenario.learningFocus;
    dom.teacherPrompt.textContent = `Teacher-Impuls: ${scenario.teacherPrompt}`;
    dom.scenarioStakes.innerHTML = renderListItems(scenario.stakes);
    dom.scenarioRoleTools.innerHTML = renderRoleToolkit(scenario.roleToolkit);
    dom.scenarioHiddenVariables.innerHTML = renderListItems(scenario.hiddenVariables);
    dom.signatureAction.textContent = roleActionArmed
      ? `${scenario.role.signatureAction.label} aktiv`
      : scenario.role.signatureAction.label;
    dom.signatureAction.classList.toggle('is-active', roleActionArmed);
    dom.scenarioChoices.innerHTML = renderScenarioChoices(scenario, selectedChoiceId);
    dom.submitChoice.disabled = !selectedChoiceId;

    dom.scenarioChoices.querySelectorAll('[data-choice-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedChoiceId = button.getAttribute('data-choice-id');
        analytics.track(state, 'choice_selected', {
          levelId: scenario.id,
          choiceId: selectedChoiceId,
        });
        renderScenarioScreen();
      });
    });
  }

  function renderResultScreen() {
    if (!pendingOutcome) {
      return;
    }

    dom.resultTitle.textContent = pendingOutcome.resultTitle;
    dom.resultBand.textContent = pendingOutcome.band;
    dom.resultSummary.textContent = pendingOutcome.resultSummary;
    dom.resultScore.textContent = `${pendingOutcome.score}/100`;
    dom.resultXp.textContent = `+${pendingOutcome.xpAwarded} XP · Stufe ${state.profile.playerLevel}`;
    dom.resultStats.innerHTML = renderResultStats(pendingOutcome.stats);
    dom.resultWorldState.innerHTML = renderWorldStateCards(
      getWorldStateViewModel(
        { worldState: { [String(pendingOutcome.worldId)]: pendingOutcome.worldStateAfter } },
        pendingOutcome.worldId,
        pendingOutcome.worldDelta,
      ),
    );
    dom.resultConsequences.innerHTML = renderLayeredConsequences(pendingOutcome.layeredConsequences);
    dom.resultSignature.textContent = pendingOutcome.signatureSummary;
    dom.resultDebrief.innerHTML = renderListItems(pendingOutcome.reflectionPrompts);
    dom.teacherExports.innerHTML = renderTeacherExports(state.teacher.exports);
    dom.resultNext.disabled = pendingOutcome.levelId >= PLAYABLE_LEVEL_COUNT;
  }

  function renderTeacherScreen() {
    const summary = getTeacherSessionSummary(state);
    const analyticsSummary = analytics.getSummary();
    const latest = pendingOutcome?.teacherSummary ?? null;
    const teacherMarkup = renderTeacherSessionLog(summary.recentEntries, analyticsSummary);

    dom.teacherSessionSummary.textContent = latest
      ? `${latest.world} · ${latest.level} · ${latest.role}. Lokale Session-Spuren bleiben auf diesem Geraet und eignen sich fuer Unterricht, Workshop oder Reflexion im Team.`
      : 'Noch keine Auswertung vorhanden. Spiele zuerst ein Level fertig, damit Debrief und Export sichtbar werden.';

    dom.teacherLatestSummary.innerHTML = latest
      ? `
        <article class="teacher-log-card">
          <strong>${latest.choice}</strong>
          <span>Band: ${latest.band} · Dominante Spur: ${latest.dominantShift}</span>
          <span>Lernfokus: ${latest.learningFocus}</span>
        </article>
      `
      : '<article class="teacher-log-card"><strong>Kein Debrief verfuegbar</strong><span>Teacher-Review wird nach der ersten abgeschlossenen Entscheidung freigeschaltet.</span></article>';

    dom.teacherDiscussionList.innerHTML = renderListItems(
      latest ? [...latest.prompts, ...latest.teacherHooks] : ['Noch keine Reflexionsimpulse verfuegbar.'],
    );
    dom.teacherLogList.innerHTML = teacherMarkup.entryMarkup;
    dom.teacherAnalyticsSummary.innerHTML = teacherMarkup.analyticsMarkup;
  }

  function render() {
    const screenMap = {
      boot: 'loading-screen',
      menu: 'menu-screen',
      role: 'role-screen',
      world: 'world-screen',
      scenario: 'scenario-screen',
      result: 'result-screen',
      teacher: 'teacher-screen',
      paused: 'pause-screen',
    };

    Object.entries(screenMap).forEach(([key, screenId]) => {
      const element = $(screenId);
      if (element) {
        element.hidden = machine.getState() !== key;
      }
    });

    renderMenu();
    renderRoleScreen();
    renderWorldScreen();
    renderScenarioScreen();
    renderResultScreen();
    renderTeacherScreen();
    syncStage();
    dom.pauseButton.hidden = !['scenario', 'paused'].includes(machine.getState());
  }

  function applyOutcome(outcome) {
    const levelId = String(outcome.levelId);
    state.campaign.completedLevels[levelId] = {
      levelId: outcome.levelId,
      completedAt: new Date().toISOString(),
      score: outcome.score,
      xpAwarded: outcome.xpAwarded,
      roleId: state.campaign.selectedRole,
      usedRoleAction: outcome.usedRoleAction,
      outcomeId: outcome.choiceId,
      worldDelta: outcome.worldDelta,
    };
    state.worldState[String(outcome.worldId)] = outcome.worldStateAfter;
    state.profile.xp += outcome.xpAwarded;
    state.profile.playerLevel = getPlayerLevelFromXp(state.profile.xp);
    Object.entries(outcome.stats).forEach(([key, value]) => {
      state.profile.stats[key] += value;
    });
    state.teacher.exports.push({
      ...outcome.teacherSummary,
      timestamp: new Date().toISOString(),
    });
    state.teacher.exports = state.teacher.exports.slice(-8);
    state.teacher.sessionLog.push(outcome.sessionRecord);
    state.teacher.sessionLog = state.teacher.sessionLog.slice(-12);
    state.campaign.currentLevelId = Math.min(outcome.levelId + 1, PLAYABLE_LEVEL_COUNT);
    pendingOutcome = outcome;
    saveState();
  }

  function bindEvents() {
    dom.startButton.addEventListener('click', () => safeTransition('world'));
    dom.resumeButton.addEventListener('click', () => {
      alignCurrentWorldToLevel();
      saveState();
      safeTransition('scenario');
    });
    dom.chooseRoleButton.addEventListener('click', () => safeTransition('role'));
    dom.mainSiteButton.addEventListener('click', () => window.open(SITE_LINKS.main, '_blank', 'noopener'));
    dom.roleBack.addEventListener('click', () => safeTransition('menu'));
    dom.worldBack.addEventListener('click', () => safeTransition('menu'));
    dom.scenarioBack.addEventListener('click', () => safeTransition('world'));
    dom.resultWorlds.addEventListener('click', () => safeTransition('world'));
    dom.teacherReviewButton.addEventListener('click', () => {
      analytics.track(state, 'teacher_review_opened', {
        levelId: pendingOutcome?.levelId ?? null,
      });
      safeTransition('teacher');
    });
    dom.teacherBack.addEventListener('click', () => safeTransition('result'));
    dom.pauseButton.addEventListener('click', () => safeTransition('paused'));
    dom.pauseResume.addEventListener('click', () => safeTransition('scenario'));
    dom.pauseWorlds.addEventListener('click', () => safeTransition('world'));
    dom.pauseMenu.addEventListener('click', () => safeTransition('menu'));

    dom.signatureAction.addEventListener('click', () => {
      roleActionArmed = !roleActionArmed;
      analytics.track(state, 'role_action_toggled', {
        enabled: roleActionArmed,
        roleId: state.campaign.selectedRole,
      });
      renderScenarioScreen();
    });

    dom.submitChoice.addEventListener('click', () => {
      if (!selectedChoiceId) {
        return;
      }
      const outcome = resolveScenarioOutcome(
        state,
        state.campaign.currentLevelId,
        state.campaign.selectedRole,
        selectedChoiceId,
        roleActionArmed,
      );
      applyOutcome(outcome);
      analytics.track(state, 'level_completed', {
        levelId: outcome.levelId,
        score: outcome.score,
        band: outcome.band,
        dominantShift: outcome.dominantShift.key,
      });
      selectedChoiceId = null;
      roleActionArmed = false;
      safeTransition('result');
    });

    dom.resultNext.addEventListener('click', () => {
      state.campaign.currentLevelId = getNextPlayableLevelId(state);
      alignCurrentWorldToLevel();
      saveState();
      safeTransition('scenario');
    });

    dom.copyTeacherExport.addEventListener('click', async () => {
      if (!state.teacher.exports.length) {
        showToast('Noch kein Debrief-Export verfuegbar.');
        return;
      }
      try {
        await navigator.clipboard.writeText(JSON.stringify(state.teacher.exports.slice(-4), null, 2));
        showToast('Lokaler Debrief-Export kopiert.');
      } catch {
        showToast('Clipboard ist hier nicht verfuegbar.');
      }
    });

    dom.resetProgress.addEventListener('click', () => {
      const preservedSettings = { ...state.settings };
      analytics.reset();
      state = storage.resetState();
      state.settings = {
        ...state.settings,
        ...preservedSettings,
      };
      state.telemetry.sessionId = createSessionId();
      state.telemetry.sessionStartedAt = new Date().toISOString();
      saveState();
      pendingOutcome = null;
      selectedChoiceId = null;
      roleActionArmed = false;
      analytics.track(state, 'progress_reset');
      showToast('Lokaler Spielfortschritt zurueckgesetzt.');
      safeTransition('menu');
    });

    const settingBindings = [
      ['reducedMotion', dom.reducedMotion],
      ['lowGraphics', dom.lowGraphics],
      ['analyticsConsent', dom.analyticsConsent],
    ];

    settingBindings.forEach(([key, input]) => {
      input.checked = Boolean(state.settings[key]);
      input.addEventListener('change', () => {
        state.settings[key] = input.checked;
        saveState();
        if (key !== 'analyticsConsent') {
          if (stage) {
            stage.dispose();
            stage = createBabylonStage(dom.canvas, state.settings);
            syncStage();
          }
        }
        analytics.track(state, 'settings_changed', { key, enabled: input.checked });
        render();
      });
    });

    dom.settingsEducation.href = SITE_LINKS.education;
    dom.settingsJoin.href = SITE_LINKS.join;
    dom.settingsDonate.href = SITE_LINKS.donate;
    dom.settingsContact.href = SITE_LINKS.contact;

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (machine.getState() === 'scenario') {
          safeTransition('paused');
        } else if (machine.getState() === 'paused') {
          safeTransition('scenario');
        } else if (machine.getState() === 'teacher') {
          safeTransition('result');
        }
      }
    });
  }

  function boot() {
    if (!window.BABYLON) {
      dom.loadingStatus.textContent = 'Babylon.js konnte nicht geladen werden.';
      return;
    }

    stage = createBabylonStage(dom.canvas, state.settings);
    saveState();
    bindEvents();

    const steps = [
      ['18%', 'Babylon-Buehne wird initialisiert ...'],
      ['52%', 'Weltzustand, Rollen und Debrief-System werden geladen ...'],
      ['100%', 'Bruecken Bauen ist startklar.'],
    ];

    steps.forEach(([value, message], index) => {
      window.setTimeout(() => {
        dom.loadingValue.textContent = value;
        dom.loadingStatus.textContent = message;
      }, index * 220);
    });

    window.setTimeout(() => {
      safeTransition('menu');
      analytics.track(state, 'session_started', {
        currentLevelId: state.campaign.currentLevelId,
      });
    }, 760);
  }

  boot();
}
