/* ==========================================================================
   DYNAMIC GAMEPLAY BALANCING SYSTEM
   Real-time difficulty adjustment and flow optimization
   ========================================================================== */

class DynamicBalancingSystem {
  constructor() {
    this.balancingEngine = new BalancingEngine();
    this.flowOptimizer = new FlowOptimizer();
    this.adaptiveScenarios = new AdaptiveScenarios();
    this.performancePredictor = new PerformancePredictor();
    this.engagementMonitor = new EngagementMonitor();
    this.learningCurveAnalyzer = new LearningCurveAnalyzer();
  }

  /* ==========================================================================
     REAL-TIME DIFFICULTY BALANCING
     ========================================================================== */

  balanceGameplayInRealTime(sessionData) {
    const currentMetrics = this.analyzeCurrentPerformance(sessionData);
    const flowState = this.assessFlowState(currentMetrics);
    const adjustments = this.calculateBalancingAdjustments(flowState, currentMetrics);

    return {
      difficulty_adjustment: adjustments.difficulty,
      scenario_modifications: adjustments.scenarios,
      pacing_changes: adjustments.pacing,
      support_interventions: adjustments.support,
      engagement_boosters: adjustments.engagement,
      predicted_outcomes: this.predictOutcomes(adjustments, currentMetrics),
    };
  }

  analyzeCurrentPerformance(sessionData) {
    return {
      success_rate: this.calculateSuccessRate(sessionData.attempts),
      time_efficiency: this.analyzeTimeEfficiency(sessionData.timings),
      engagement_indicators: this.extractEngagementSignals(sessionData.interactions),
      frustration_signals: this.detectFrustrationSignals(sessionData.behavioral_data),
      learning_velocity: this.measureLearningVelocity(sessionData.competency_progression),
      social_dynamics: this.analyzeSocialDynamics(sessionData.group_interactions),
      attention_patterns: this.analyzeAttentionPatterns(sessionData.focus_metrics),
    };
  }

  /* ==========================================================================
     FLOW STATE OPTIMIZATION
     ========================================================================== */

  optimizeForFlowState(playerProfile, currentChallenge) {
    const skillLevel = this.assessCurrentSkillLevel(playerProfile);
    const challengeLevel = this.evaluateChallengeLevel(currentChallenge);
    const personalityFactors = this.analyzePersonalityFactors(playerProfile);
    const contextualFactors = this.assessContextualFactors();

    const flowMetrics = {
      skill_challenge_balance: this.calculateSkillChallengeBalance(skillLevel, challengeLevel),
      attention_focus: this.measureAttentionFocus(playerProfile.current_session),
      intrinsic_motivation: this.assessIntrinsicMotivation(playerProfile.motivation_profile),
      immediate_feedback: this.evaluateFeedbackQuality(currentChallenge.feedback_system),
      sense_of_control: this.measureSenseOfControl(playerProfile.agency_metrics),
      time_distortion: this.detectTimeDistortion(playerProfile.time_perception),
      self_consciousness: this.assessSelfConsciousness(playerProfile.social_anxiety_markers),
    };

    return this.generateFlowOptimizations(flowMetrics, personalityFactors, contextualFactors);
  }

  generateFlowOptimizations(flowMetrics, personalityFactors, _contextualFactors) {
    const optimizations = [];

    // Skill-Challenge Balance
    if (flowMetrics.skill_challenge_balance < 0.7) {
      if (flowMetrics.skill_challenge_balance < 0.3) {
        optimizations.push({
          type: 'difficulty_reduction',
          intensity: 0.8,
          reason: 'preventing_anxiety_spiral',
          implementation: 'gradual_hint_system',
        });
      } else {
        optimizations.push({
          type: 'scaffolding_increase',
          intensity: 0.5,
          reason: 'maintaining_challenge_with_support',
          implementation: 'contextual_guidance',
        });
      }
    } else if (flowMetrics.skill_challenge_balance > 0.9) {
      optimizations.push({
        type: 'complexity_increase',
        intensity: 0.6,
        reason: 'preventing_boredom',
        implementation: 'advanced_scenario_elements',
      });
    }

    // Attention Optimization
    if (flowMetrics.attention_focus < 0.6) {
      optimizations.push({
        type: 'attention_enhancement',
        strategies: [
          'reduce_distracting_elements',
          'increase_visual_clarity',
          'add_progressive_disclosure',
          'implement_attention_restoration_breaks',
        ],
      });
    }

    // Motivation Enhancement
    if (flowMetrics.intrinsic_motivation < 0.7) {
      optimizations.push({
        type: 'motivation_boost',
        approaches: this.selectMotivationApproaches(personalityFactors),
        personalized_rewards: this.generatePersonalizedRewards(personalityFactors),
      });
    }

    return optimizations;
  }

  /* ==========================================================================
     ADAPTIVE SCENARIO GENERATION
     ========================================================================== */

  generateAdaptiveScenario(playerProfile, learningObjectives, contextualConstraints) {
    const baseScenario = this.selectBaseScenario(learningObjectives);
    const personalizedElements = this.addPersonalizationLayer(baseScenario, playerProfile);
    const adaptiveFeatures = this.implementAdaptiveFeatures(
      personalizedElements,
      contextualConstraints
    );

    return {
      scenario: adaptiveFeatures,
      adaptation_mechanisms: this.defineAdaptationMechanisms(adaptiveFeatures),
      success_metrics: this.defineSuccessMetrics(learningObjectives),
      failure_recovery: this.designFailureRecovery(playerProfile),
      engagement_hooks: this.createEngagementHooks(playerProfile.interests),
      social_elements: this.incorporateSocialElements(contextualConstraints.group_context),
    };
  }

  addPersonalizationLayer(baseScenario, playerProfile) {
    return {
      ...baseScenario,

      // Kulturelle Anpassungen
      cultural_context: this.adaptCulturalContext(baseScenario, playerProfile.cultural_background),

      // Sprachliche Anpassungen
      language_complexity: this.adjustLanguageComplexity(
        baseScenario,
        playerProfile.language_level
      ),

      // Interessensbasierte Anpassungen
      thematic_elements: this.incorporateInterests(baseScenario, playerProfile.interests),

      // Lernstil-Anpassungen
      presentation_mode: this.adaptPresentationMode(baseScenario, playerProfile.learning_style),

      // Persönlichkeits-Anpassungen
      interaction_style: this.adaptInteractionStyle(baseScenario, playerProfile.personality_traits),

      // Fähigkeits-Anpassungen
      cognitive_load: this.adjustCognitiveLoad(baseScenario, playerProfile.cognitive_capacity),

      // Motivations-Anpassungen
      reward_structure: this.customizeRewardStructure(
        baseScenario,
        playerProfile.motivation_drivers
      ),
    };
  }

  /* ==========================================================================
     PERFORMANCE PREDICTION SYSTEM
     ========================================================================== */

  predictPlayerPerformance(playerProfile, upcomingChallenge, contextualFactors) {
    const historicalPatterns = this.analyzeHistoricalPatterns(playerProfile.performance_history);
    const competencyAlignment = this.assessCompetencyAlignment(
      playerProfile.competencies,
      upcomingChallenge.required_competencies
    );
    const motivationalFit = this.evaluateMotivationalFit(
      playerProfile.motivation_profile,
      upcomingChallenge.motivation_appeals
    );
    this.assessContextualInfluence(contextualFactors);

    const predictions = {
      success_probability: this.calculateSuccessProbability(
        historicalPatterns,
        competencyAlignment,
        motivationalFit
      ),
      engagement_level: this.predictEngagementLevel(
        playerProfile,
        upcomingChallenge,
        contextualFactors
      ),
      completion_time: this.estimateCompletionTime(playerProfile, upcomingChallenge),
      learning_outcome_quality: this.predictLearningOutcomes(
        competencyAlignment,
        upcomingChallenge.learning_objectives
      ),
      collaboration_effectiveness: this.predictCollaborationEffectiveness(
        playerProfile,
        contextualFactors.group_composition
      ),
      potential_difficulties: this.identifyPotentialDifficulties(playerProfile, upcomingChallenge),
      recommended_interventions: this.recommendPreemptiveInterventions(
        playerProfile,
        upcomingChallenge
      ),
    };

    return {
      predictions: predictions,
      confidence_intervals: this.calculateConfidenceIntervals(predictions),
      alternative_scenarios: this.generateAlternativeScenarios(predictions, upcomingChallenge),
      optimization_opportunities: this.identifyOptimizationOpportunities(predictions),
    };
  }

  /* ==========================================================================
     ENGAGEMENT MONITORING & INTERVENTION
     ========================================================================== */

  monitorEngagementInRealTime(sessionData) {
    const engagementSignals = {
      behavioral: this.analyzeBehavioralEngagement(sessionData.user_actions),
      cognitive: this.analyzeCognitiveEngagement(sessionData.problem_solving_patterns),
      emotional: this.analyzeEmotionalEngagement(sessionData.emotional_indicators),
      social: this.analyzeSocialEngagement(sessionData.group_interactions),
    };

    const engagementScore = this.calculateCompositeEngagement(engagementSignals);
    const trendAnalysis = this.analyzeEngagementTrends(sessionData.engagement_history);
    const riskAssessment = this.assessDisengagementRisk(engagementScore, trendAnalysis);

    if (riskAssessment.risk_level > 0.7) {
      return this.triggerEngagementInterventions(riskAssessment, engagementSignals);
    }

    return {
      current_engagement: engagementScore,
      trend_analysis: trendAnalysis,
      risk_assessment: riskAssessment,
      proactive_suggestions: this.generateProactiveSuggestions(engagementSignals),
    };
  }

  triggerEngagementInterventions(riskAssessment, engagementSignals) {
    const interventions = [];

    // Behavioral Disengagement Interventions
    if (engagementSignals.behavioral.score < 0.5) {
      interventions.push({
        type: 'behavioral_activation',
        strategies: [
          'introduce_micro_interactions',
          'gamify_current_task',
          'add_choice_moments',
          'implement_progress_visualization',
        ],
        urgency: 'immediate',
      });
    }

    // Cognitive Disengagement Interventions
    if (engagementSignals.cognitive.score < 0.5) {
      interventions.push({
        type: 'cognitive_stimulation',
        strategies: [
          'introduce_cognitive_variability',
          'add_mystery_elements',
          'implement_discovery_mechanics',
          'create_cognitive_bridges',
        ],
        urgency: 'high',
      });
    }

    // Emotional Disengagement Interventions
    if (engagementSignals.emotional.score < 0.5) {
      interventions.push({
        type: 'emotional_reconnection',
        strategies: [
          'activate_personal_relevance',
          'introduce_empathy_moments',
          'add_achievement_celebrations',
          'implement_peer_recognition',
        ],
        urgency: 'medium',
      });
    }

    // Social Disengagement Interventions
    if (engagementSignals.social.score < 0.5) {
      interventions.push({
        type: 'social_activation',
        strategies: [
          'facilitate_peer_connections',
          'create_collaborative_moments',
          'implement_peer_support_systems',
          'add_social_learning_opportunities',
        ],
        urgency: 'medium',
      });
    }

    return {
      interventions: interventions,
      implementation_sequence: this.optimizeInterventionSequence(interventions),
      success_monitoring: this.setupSuccessMonitoring(interventions),
    };
  }

  /* ==========================================================================
     LEARNING CURVE ANALYSIS
     ========================================================================== */

  analyzeLearningCurve(playerProfile, competencyDomain) {
    const learningHistory = this.extractLearningHistory(playerProfile, competencyDomain);
    const curveCharacteristics = this.identifyCurveCharacteristics(learningHistory);
    const learningStyle = this.inferLearningStyle(curveCharacteristics);
    const plateauAnalysis = this.analyzePlateaus(learningHistory);
    const accelerationPotential = this.assessAccelerationPotential(curveCharacteristics);

    return {
      curve_type: curveCharacteristics.type, // linear, exponential, logarithmic, s-curve
      learning_rate: curveCharacteristics.rate,
      current_phase: curveCharacteristics.current_phase,
      plateau_status: plateauAnalysis,
      optimization_recommendations: this.generateLearningOptimizations(
        curveCharacteristics,
        learningStyle,
        plateauAnalysis,
        accelerationPotential
      ),
      personalized_interventions: this.designPersonalizedInterventions(
        learningStyle,
        plateauAnalysis
      ),
      timeline_predictions: this.predictLearningTimeline(curveCharacteristics, competencyDomain),
    };
  }

  generateLearningOptimizations(
    curveCharacteristics,
    learningStyle,
    plateauAnalysis,
    accelerationPotential
  ) {
    const optimizations = [];

    // Plateau Breaking Strategies
    if (plateauAnalysis.in_plateau) {
      optimizations.push({
        strategy: 'plateau_breaking',
        techniques: [
          'introduce_cross_domain_connections',
          'implement_desirable_difficulties',
          'add_metacognitive_reflection',
          'create_application_opportunities',
        ],
        expected_impact: plateauAnalysis.breaking_potential,
      });
    }

    // Learning Rate Optimization
    if (curveCharacteristics.rate < learningStyle.optimal_rate) {
      optimizations.push({
        strategy: 'rate_acceleration',
        techniques: this.selectAccelerationTechniques(learningStyle, accelerationPotential),
        target_improvement: accelerationPotential.max_improvement,
      });
    }

    // Retention Enhancement
    if (curveCharacteristics.retention_decay > 0.3) {
      optimizations.push({
        strategy: 'retention_enhancement',
        techniques: [
          'implement_spaced_repetition',
          'add_retrieval_practice',
          'create_elaborative_connections',
          'design_transfer_activities',
        ],
        retention_target: 0.85,
      });
    }

    return optimizations;
  }
}

/* ==========================================================================
   SUPPORTING CLASSES
   ========================================================================== */

class BalancingEngine {
  calculateOptimalDifficulty(playerMetrics, gameContext) {
    const baselineSkill = this.assessBaselineSkill(playerMetrics);
    const adaptationHistory = this.analyzeAdaptationHistory(playerMetrics);
    const contextualFactors = this.evaluateContextualFactors(gameContext);

    return {
      recommended_difficulty: this.computeRecommendedDifficulty(
        baselineSkill,
        adaptationHistory,
        contextualFactors
      ),
      confidence_level: this.calculateConfidenceLevel(playerMetrics),
      adjustment_reasoning: this.generateAdjustmentReasoning(baselineSkill, contextualFactors),
    };
  }

  assessBaselineSkill(playerMetrics) {
    const recentPerformance = playerMetrics.recent_sessions.slice(-5);
    const skillIndicators = recentPerformance.map(session => ({
      accuracy: session.success_rate,
      efficiency: session.time_efficiency,
      consistency: session.performance_variance,
      growth: session.skill_improvement,
    }));

    return {
      current_level: this.calculateWeightedAverage(skillIndicators),
      stability: this.calculateStability(skillIndicators),
      trajectory: this.calculateTrajectory(skillIndicators),
    };
  }

  computeRecommendedDifficulty(baselineSkill, adaptationHistory, contextualFactors) {
    let difficulty = baselineSkill.current_level;

    // Apply trajectory adjustment
    difficulty += baselineSkill.trajectory * 0.2;

    // Apply adaptation history learning
    difficulty += adaptationHistory.successful_adaptations * 0.1;

    // Apply contextual adjustments
    difficulty *= contextualFactors.attention_multiplier;
    difficulty *= contextualFactors.motivation_multiplier;
    difficulty *= contextualFactors.social_support_multiplier;

    // Ensure reasonable bounds
    return Math.max(0.1, Math.min(1.0, difficulty));
  }

  calculateWeightedAverage(skillIndicators) {
    if (skillIndicators.length === 0) return 0.5;

    const weights = [0.4, 0.3, 0.2, 0.1]; // Recent sessions weighted more heavily
    const weightedSum = skillIndicators.reduce((sum, indicator, index) => {
      const weight = weights[index] || 0.05;
      const compositeScore =
        indicator.accuracy * 0.4 +
        indicator.efficiency * 0.3 +
        indicator.consistency * 0.2 +
        indicator.growth * 0.1;
      return sum + compositeScore * weight;
    }, 0);

    return weightedSum;
  }
}

class FlowOptimizer {
  optimizeFlowConditions(currentState, targetFlow) {
    const flowFactors = this.analyzeFlowFactors(currentState);
    const adjustments = this.calculateFlowAdjustments(flowFactors, targetFlow);

    return {
      immediate_adjustments: adjustments.immediate,
      progressive_optimizations: adjustments.progressive,
      personalization_tweaks: adjustments.personalization,
    };
  }

  analyzeFlowFactors(currentState) {
    return {
      challenge_skill_balance: this.assessChallengeSkillBalance(currentState),
      attention_focus: this.measureAttentionFocus(currentState),
      intrinsic_motivation: this.evaluateIntrinsicMotivation(currentState),
      sense_of_control: this.assessSenseOfControl(currentState),
      time_perception: this.analyzeTimePerception(currentState),
    };
  }

  assessChallengeSkillBalance(currentState) {
    const challengeLevel = currentState.task_difficulty;
    const skillLevel = currentState.player_skill;

    const balance = challengeLevel / Math.max(skillLevel, 0.1);

    if (balance < 0.7) return { status: 'too_easy', severity: 0.7 - balance };
    if (balance > 1.3) return { status: 'too_hard', severity: balance - 1.3 };
    return { status: 'optimal', quality: 1 - Math.abs(balance - 1) };
  }
}

class AdaptiveScenarios {
  generateScenario(requirements, constraints, playerProfile) {
    const baseTemplate = this.selectBaseTemplate(requirements);
    const adaptedScenario = this.applyAdaptations(baseTemplate, playerProfile);
    const contextualizedScenario = this.addContextualElements(adaptedScenario, constraints);

    return this.finalizeScenario(contextualizedScenario);
  }

  selectBaseTemplate(requirements) {
    const templates = {
      civic_engagement: this.getCivicEngagementTemplates(),
      critical_thinking: this.getCriticalThinkingTemplates(),
      collaboration: this.getCollaborationTemplates(),
      leadership: this.getLeadershipTemplates(),
    };

    return templates[requirements.primary_objective] || templates.civic_engagement;
  }
}

class PerformancePredictor {
  predict(playerProfile, upcomingChallenge) {
    const historicalAnalysis = this.analyzeHistoricalPerformance(playerProfile);
    const competencyMatching = this.matchCompetencies(playerProfile, upcomingChallenge);
    this.assessContextualFactors();

    return {
      success_probability: this.calculateSuccessProbability(historicalAnalysis, competencyMatching),
      expected_performance_range: this.calculatePerformanceRange(historicalAnalysis),
      confidence_interval: this.calculateConfidenceInterval(historicalAnalysis.data_quality),
    };
  }
}

class EngagementMonitor {
  trackEngagement(sessionData) {
    const metrics = {
      behavioral: this.trackBehavioralEngagement(sessionData),
      cognitive: this.trackCognitiveEngagement(sessionData),
      emotional: this.trackEmotionalEngagement(sessionData),
    };

    return {
      composite_score: this.calculateCompositeEngagement(metrics),
      individual_scores: metrics,
      trend_analysis: this.analyzeTrends(sessionData.historical_engagement),
    };
  }
}

class LearningCurveAnalyzer {
  analyzeCurve(learningData) {
    const progression = this.extractProgression(learningData);
    const curveType = this.identifyCurveType(progression);
    const parameters = this.estimateParameters(progression, curveType);

    return {
      curve_type: curveType,
      parameters: parameters,
      current_phase: this.identifyCurrentPhase(progression, parameters),
      predictions: this.generatePredictions(parameters, curveType),
    };
  }
}

// Export the main class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicBalancingSystem;
} else if (typeof window !== 'undefined') {
  window.DynamicBalancingSystem = DynamicBalancingSystem;
}
