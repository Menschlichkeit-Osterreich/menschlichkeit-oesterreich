/**
 * Democracy Metaverse - A/B Testing Framework
 * Wissenschaftliche Evaluation verschiedener Level-Varianten
 *
 * Features:
 * - Controlled Experiments für pädagogische Optimierung
 * - Statistical Significance Testing
 * - Multi-variant Testing für bis zu 5 Varianten
 * - Adaptive Allocation basierend auf Performance
 * - DSGVO-konforme Experiment-Datenerfassung
 */

class ABTestingFramework {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/ab-testing',
      defaultAllocation: config.defaultAllocation || 'random',
      significanceLevel: config.significanceLevel || 0.05,
      minimumSampleSize: config.minimumSampleSize || 30,
      maxVariants: config.maxVariants || 5,
      adaptiveThreshold: config.adaptiveThreshold || 100,
      ...config,
    };

    this.experiments = new Map();
    this.userAssignments = new Map();
    this.results = new Map();

    this.initializeFramework();
  }

  /**
   * Framework-Initialisierung
   */
  async initializeFramework() {
    await this.loadActiveExperiments();
    this.setupUserAssignment();
  }

  /**
   * Aktive Experimente laden
   */
  async loadActiveExperiments() {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/active-experiments`);
      const experiments = await response.json();

      experiments.forEach(experiment => {
        this.experiments.set(experiment.id, {
          id: experiment.id,
          name: experiment.name,
          description: experiment.description,
          status: experiment.status,
          variants: experiment.variants,
          allocation: experiment.allocation || {},
          metrics: experiment.metrics || [],
          startDate: new Date(experiment.startDate),
          endDate: experiment.endDate ? new Date(experiment.endDate) : null,
          targetLevels: experiment.targetLevels || [],
          hypothesis: experiment.hypothesis,
          successCriteria: experiment.successCriteria,
        });
      });
    } catch (error) {
      console.error('Failed to load experiments:', error);
    }
  }

  /**
   * Benutzer-Zuordnung Setup
   */
  setupUserAssignment() {
    const sessionId = this.getSessionId();

    // Für jeden aktiven Experiment Variante zuweisen
    this.experiments.forEach(experiment => {
      if (experiment.status === 'active') {
        const assignment = this.assignUserToVariant(sessionId, experiment);
        this.userAssignments.set(experiment.id, assignment);
      }
    });
  }

  /**
   * Benutzer zu Experiment-Variante zuweisen
   */
  assignUserToVariant(sessionId, experiment) {
    // Check für bereits bestehende Zuweisung
    const existingAssignment = localStorage.getItem(`experiment_${experiment.id}`);
    if (existingAssignment) {
      return JSON.parse(existingAssignment);
    }

    let variantId;

    switch (this.config.defaultAllocation) {
      case 'random':
        variantId = this.randomAssignment(experiment.variants);
        break;
      case 'balanced':
        variantId = this.balancedAssignment(experiment);
        break;
      case 'adaptive':
        variantId = this.adaptiveAssignment(experiment);
        break;
      default:
        variantId = experiment.variants[0]?.id || 'control';
    }

    const assignment = {
      experimentId: experiment.id,
      variantId: variantId,
      assignmentTime: Date.now(),
      sessionId: sessionId,
    };

    // Speichere Zuweisung lokal (für Konsistenz während Session)
    localStorage.setItem(`experiment_${experiment.id}`, JSON.stringify(assignment));

    // Sende Assignment an Server für Tracking
    this.trackAssignment(assignment);

    return assignment;
  }

  /**
   * Zufällige Zuweisung
   */
  randomAssignment(variants) {
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight || 1;
      if (random <= currentWeight) {
        return variant.id;
      }
    }

    return variants[0]?.id || 'control';
  }

  /**
   * Ausgewogene Zuweisung (gleiche Verteilung)
   */
  async balancedAssignment(experiment) {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/experiment/${experiment.id}/assignments`
      );
      const assignmentCounts = await response.json();

      // Finde Variante mit niedrigster Anzahl
      const minCount = Math.min(...Object.values(assignmentCounts));
      const underrepresentedVariants = experiment.variants.filter(
        v => (assignmentCounts[v.id] || 0) === minCount
      );

      return this.randomAssignment(underrepresentedVariants);
    } catch (error) {
      console.warn('Balanced assignment failed, using random:', error);
      return this.randomAssignment(experiment.variants);
    }
  }

  /**
   * Adaptive Zuweisung (bessere Varianten bekommen mehr Traffic)
   */
  async adaptiveAssignment(experiment) {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/experiment/${experiment.id}/performance`
      );
      const performance = await response.json();

      // Wenn nicht genug Daten, verwende balanced assignment
      const totalAssignments = Object.values(performance.assignments || {}).reduce(
        (a, b) => a + b,
        0
      );
      if (totalAssignments < this.config.adaptiveThreshold) {
        return this.balancedAssignment(experiment);
      }

      // Berechne Erfolgsraten für adaptive Gewichtung
      const successRates = {};
      experiment.variants.forEach(variant => {
        const assignments = performance.assignments[variant.id] || 0;
        const successes = performance.successes[variant.id] || 0;
        successRates[variant.id] = assignments > 0 ? successes / assignments : 0;
      });

      // Adaptive Gewichtung: bessere Varianten bekommen höhere Gewichte
      const adaptiveVariants = experiment.variants.map(variant => ({
        ...variant,
        weight: Math.max(0.1, successRates[variant.id] || 0.1), // Minimum 10% Chance
      }));

      return this.randomAssignment(adaptiveVariants);
    } catch (error) {
      console.warn('Adaptive assignment failed, using balanced:', error);
      return this.balancedAssignment(experiment);
    }
  }

  /**
   * Experiment-spezifische Level-Variante abrufen
   */
  getLevelVariant(levelId, defaultLevel) {
    // Finde Experimente, die dieses Level betreffen
    const relevantExperiments = Array.from(this.experiments.values()).filter(
      exp => exp.status === 'active' && exp.targetLevels.includes(levelId)
    );

    if (relevantExperiments.length === 0) {
      return defaultLevel;
    }

    // Verwende das erste relevante Experiment (priorisiert nach Wichtigkeit)
    const experiment = relevantExperiments[0];
    const assignment = this.userAssignments.get(experiment.id);

    if (!assignment) {
      return defaultLevel;
    }

    const variant = experiment.variants.find(v => v.id === assignment.variantId);
    if (!variant || !variant.levelModifications) {
      return defaultLevel;
    }

    // Wende Level-Modifikationen an
    return this.applyLevelModifications(defaultLevel, variant.levelModifications);
  }

  /**
   * Level-Modifikationen anwenden
   */
  applyLevelModifications(level, modifications) {
    const modifiedLevel = { ...level };

    modifications.forEach(mod => {
      switch (mod.type) {
        case 'change_text':
          if (mod.target === 'description') {
            modifiedLevel.description = mod.newValue;
          } else if (mod.target === 'scenario') {
            modifiedLevel.scenario = mod.newValue;
          }
          break;

        case 'modify_choices':
          if (mod.choiceIndex !== undefined && modifiedLevel.choices[mod.choiceIndex]) {
            if (mod.property === 'text') {
              modifiedLevel.choices[mod.choiceIndex].text = mod.newValue;
            } else if (mod.property === 'values') {
              modifiedLevel.choices[mod.choiceIndex].values = {
                ...modifiedLevel.choices[mod.choiceIndex].values,
                ...mod.newValue,
              };
            }
          }
          break;

        case 'add_choice':
          modifiedLevel.choices.push(mod.newChoice);
          break;

        case 'remove_choice':
          if (mod.choiceIndex !== undefined) {
            modifiedLevel.choices.splice(mod.choiceIndex, 1);
          }
          break;

        case 'change_difficulty':
          modifiedLevel.difficulty = mod.newValue;
          break;

        case 'modify_minigame':
          modifiedLevel.minigame = mod.newValue;
          break;

        case 'add_hint':
          modifiedLevel.hints = [...(modifiedLevel.hints || []), mod.hint];
          break;
      }
    });

    return modifiedLevel;
  }

  /**
   * Experiment-Event tracken
   */
  trackExperimentEvent(eventType, eventData) {
    const activeExperiments = Array.from(this.experiments.values()).filter(
      exp => exp.status === 'active'
    );

    activeExperiments.forEach(experiment => {
      const assignment = this.userAssignments.get(experiment.id);
      if (!assignment) return;

      const event = {
        type: eventType,
        timestamp: Date.now(),
        experimentId: experiment.id,
        variantId: assignment.variantId,
        sessionId: assignment.sessionId,
        data: eventData,
      };

      this.sendEventToServer(event);
      this.updateLocalResults(experiment.id, event);
    });
  }

  /**
   * Level-Performance für Experimente tracken
   */
  trackLevelPerformance(levelId, performance) {
    // Finde Experimente für dieses Level
    const relevantExperiments = Array.from(this.experiments.values()).filter(
      exp => exp.status === 'active' && exp.targetLevels.includes(levelId)
    );

    relevantExperiments.forEach(experiment => {
      const assignment = this.userAssignments.get(experiment.id);
      if (!assignment) return;

      this.trackExperimentEvent('level_performance', {
        levelId: levelId,
        variantId: assignment.variantId,
        completionTime: performance.completionTime,
        success: performance.success,
        score: performance.score,
        helpUsed: performance.helpUsed,
        retries: performance.retries,
        choicesMade: performance.choices,
      });
    });
  }

  /**
   * A/B-Test-Erfolg tracken
   */
  trackConversion(conversionType, value = 1) {
    this.trackExperimentEvent('conversion', {
      conversionType: conversionType,
      value: value,
    });
  }

  /**
   * Experiment-Ergebnisse abrufen
   */
  async getExperimentResults(experimentId) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/experiment/${experimentId}/results`);
      const results = await response.json();

      // Statistische Analyse hinzufügen
      results.statisticalAnalysis = this.performStatisticalAnalysis(results);

      return results;
    } catch (error) {
      console.error('Failed to get experiment results:', error);
      return null;
    }
  }

  /**
   * Statistische Analyse durchführen
   */
  performStatisticalAnalysis(results) {
    const variants = Object.keys(results.variantPerformance || {});
    if (variants.length < 2) {
      return { error: 'Mindestens 2 Varianten erforderlich' };
    }

    const analysis = {
      sampleSizes: {},
      conversionRates: {},
      confidenceIntervals: {},
      pValues: {},
      significantDifferences: [],
      recommendations: [],
    };

    // Für jede Variante Basis-Statistiken berechnen
    variants.forEach(variantId => {
      const performance = results.variantPerformance[variantId];
      const sampleSize = performance.totalSessions || 0;
      const conversions = performance.conversions || 0;
      const conversionRate = sampleSize > 0 ? conversions / sampleSize : 0;

      analysis.sampleSizes[variantId] = sampleSize;
      analysis.conversionRates[variantId] = conversionRate;

      // Konfidenzintervall für Konversionsrate
      if (sampleSize > 0) {
        const margin = 1.96 * Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
        analysis.confidenceIntervals[variantId] = {
          lower: Math.max(0, conversionRate - margin),
          upper: Math.min(1, conversionRate + margin),
        };
      }
    });

    // Paarweise Vergleiche (z.B. Control vs. Variants)
    const controlVariant = variants[0]; // Annahme: erste Variante ist Control

    for (let i = 1; i < variants.length; i++) {
      const testVariant = variants[i];
      const pValue = this.calculatePValue(
        analysis.conversionRates[controlVariant],
        analysis.sampleSizes[controlVariant],
        analysis.conversionRates[testVariant],
        analysis.sampleSizes[testVariant]
      );

      analysis.pValues[`${controlVariant}_vs_${testVariant}`] = pValue;

      if (pValue < this.config.significanceLevel) {
        analysis.significantDifferences.push({
          variant1: controlVariant,
          variant2: testVariant,
          pValue: pValue,
          significant: true,
          winner:
            analysis.conversionRates[testVariant] > analysis.conversionRates[controlVariant]
              ? testVariant
              : controlVariant,
        });
      }
    }

    // Empfehlungen generieren
    analysis.recommendations = this.generateRecommendations(analysis, results);

    return analysis;
  }

  /**
   * P-Value berechnen (vereinfachte Z-Test Implementation)
   */
  calculatePValue(rate1, n1, rate2, n2) {
    if (n1 < 30 || n2 < 30) {
      return null; // Nicht genug Daten für validen Test
    }

    const p1 = rate1;
    const p2 = rate2;
    const pooledP = (rate1 * n1 + rate2 * n2) / (n1 + n2);

    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
    const zScore = Math.abs(p1 - p2) / standardError;

    // Approximation für p-value (zwei-seitig)
    return 2 * (1 - this.normalCDF(zScore));
  }

  /**
   * Normale Cumulative Distribution Function (Approximation)
   */
  normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Empfehlungen basierend auf Analyse generieren
   */
  generateRecommendations(analysis, _results) {
    const recommendations = [];

    // Check Sample Sizes
    const minSampleSize = Math.min(...Object.values(analysis.sampleSizes));
    if (minSampleSize < this.config.minimumSampleSize) {
      recommendations.push({
        type: 'sample_size',
        priority: 'high',
        message: `Mehr Daten erforderlich. Mindestens ${this.config.minimumSampleSize} Teilnehmer pro Variante.`,
      });
    }

    // Check for Winners
    if (analysis.significantDifferences.length > 0) {
      const bestPerformer = analysis.significantDifferences[0];
      recommendations.push({
        type: 'winner',
        priority: 'high',
        message: `Variante ${bestPerformer.winner} zeigt signifikant bessere Performance.`,
        action: `Implementierung von ${bestPerformer.winner} empfohlen.`,
      });
    }

    // Check for No Significant Difference
    if (
      analysis.significantDifferences.length === 0 &&
      minSampleSize >= this.config.minimumSampleSize
    ) {
      recommendations.push({
        type: 'no_difference',
        priority: 'medium',
        message: 'Keine signifikanten Unterschiede gefunden.',
        action: 'Experiment beenden oder neue Hypothesen testen.',
      });
    }

    return recommendations;
  }

  /**
   * Hilfsmethoden
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('ab_test_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now();
      sessionStorage.setItem('ab_test_session_id', sessionId);
    }
    return sessionId;
  }

  async trackAssignment(assignment) {
    try {
      await fetch(`${this.config.apiEndpoint}/assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
    } catch (error) {
      console.warn('Failed to track assignment:', error);
    }
  }

  async sendEventToServer(event) {
    try {
      await fetch(`${this.config.apiEndpoint}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send experiment event:', error);
    }
  }

  updateLocalResults(experimentId, event) {
    if (!this.results.has(experimentId)) {
      this.results.set(experimentId, {
        events: [],
        summary: {},
      });
    }

    this.results.get(experimentId).events.push(event);
  }

  /**
   * Neues Experiment erstellen
   */
  async createExperiment(experimentConfig) {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/experiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experimentConfig),
      });

      const experiment = await response.json();
      this.experiments.set(experiment.id, experiment);

      return experiment;
    } catch (error) {
      console.error('Failed to create experiment:', error);
      return null;
    }
  }

  /**
   * Experiment beenden
   */
  async endExperiment(experimentId, reason = 'completed') {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/experiment/${experimentId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (this.experiments.has(experimentId)) {
        this.experiments.get(experimentId).status = 'completed';
      }

      return result;
    } catch (error) {
      console.error('Failed to end experiment:', error);
      return null;
    }
  }
}

export { ABTestingFramework };
