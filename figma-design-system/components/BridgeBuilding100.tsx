import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Heart, 
  Users, 
  Scale, 
  Shield, 
  Star,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  CheckCircle,
  Circle,
  Map,
  BookOpen,
  Gamepad2,
  Crown,
  Zap,
  Globe,
  Rocket,
  Lock,
  Unlock,
  Award,
  TrendingUp
} from 'lucide-react';
import GameDataGenerator, { GameLevel, Chapter, type MinigameData, type BossData } from './GameDataGenerator';
import { 
  ImmersiveScenario, 
  ImmersiveProgressDashboard 
} from './ImmersiveGameInterface';
import {
  ParticleSystem,
  Advanced3DCard,
  DynamicBackground,
  AnimatedCounter,
  HolographicBadge
} from './Enhanced3DGameGraphics';
import { WorldMap, ProgressOverview } from './AdvancedLevelVisualization';

// Erweiterte Game State für 100-Level System
interface ExtendedGameState {
  currentLevel: number;
  currentChapter: number;
  completedLevels: number[];
  completedChapters: number[];
  totalPlayTime: number;
  globalScores: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
  skillPoints: {
    empathy: number;
    rights: number;
    participation: number;
    courage: number;
  };
  unlockedSkills: string[];
  achievements: string[];
  playerLevel: number;
  experiencePoints: number;
  gamePhase: 'intro' | 'chapter-select' | 'playing' | 'level-complete' | 'chapter-complete' | 'endgame';
  selectedChoice: number | null;
  showFeedback: boolean;
  multiplayerMode: boolean;
  worldState: {
    regions: RegionState[];
    globalCrisisLevel: number;
    bridgeIntegrity: number;
  };
}

interface RegionState {
  id: number;
  state: 'thriving' | 'stable' | 'fragile' | 'crisis';
  bridgeHealth: number;
  unlocked: boolean;
}

interface SkillTreeItem {
  id: string;
  name: string;
  description: string;
  category: 'empathy' | 'rights' | 'participation' | 'courage';
  cost: number;
  unlocked: boolean;
  prerequisite?: string;
}

export function BridgeBuilding100() {
  const [gameState, setGameState] = useState<ExtendedGameState>({
    currentLevel: 1,
    currentChapter: 1,
    completedLevels: [],
    completedChapters: [],
    totalPlayTime: 0,
    globalScores: {
      empathy: 0,
      humanRights: 0,
      participation: 0,
      civilCourage: 0
    },
    skillPoints: {
      empathy: 0,
      rights: 0,
      participation: 0,
      courage: 0
    },
    unlockedSkills: [],
    achievements: [],
    playerLevel: 1,
    experiencePoints: 0,
    gamePhase: 'intro',
    selectedChoice: null,
    showFeedback: false,
    multiplayerMode: false,
    worldState: {
      regions: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        state: i === 0 ? 'thriving' : 'stable',
        bridgeHealth: 100,
        unlocked: i === 0
      })),
      globalCrisisLevel: 1,
      bridgeIntegrity: 100
    }
  });

  // Lade Kapiteldaten
  const chapters = GameDataGenerator.generateChapters();
  const currentChapter = chapters.find(c => c.id === gameState.currentChapter);
  const sampleLevels = GameDataGenerator.generateChapter1Levels();
  const currentLevel = sampleLevels.find(l => l.id === gameState.currentLevel);

  // Berechne Gesamtfortschritt
  const totalProgress = (gameState.completedLevels.length / 100) * 100;
  const chapterProgress = currentChapter ? 
    ((gameState.completedLevels.filter(l => l >= currentChapter.levelRange[0] && l <= currentChapter.levelRange[1]).length) / 
     (currentChapter.levelRange[1] - currentChapter.levelRange[0] + 1)) * 100 : 0;

  // Skill Tree Daten
  const skillTree: SkillTreeItem[] = [
    {
      id: 'active-listening',
      name: 'Aktives Zuhören',
      description: 'Verstehe die wahren Bedürfnisse hinter Aussagen',
      category: 'empathy',
      cost: 2,
      unlocked: false
    },
    {
      id: 'perspective-cards',
      name: 'Perspektiven-Karten',
      description: 'Sammle und verwende verschiedene Sichtweisen',
      category: 'empathy',
      cost: 3,
      unlocked: false,
      prerequisite: 'active-listening'
    },
    {
      id: 'fact-checker',
      name: 'Schnell-Fact-Check',
      description: 'Überprüfe Behauptungen in Echtzeit',
      category: 'rights',
      cost: 2,
      unlocked: false
    },
    {
      id: 'legal-aid',
      name: 'Rechtshilfe-Kit',
      description: 'Kenne die wichtigsten Rechte und Gesetze',
      category: 'rights',
      cost: 4,
      unlocked: false,
      prerequisite: 'fact-checker'
    },
    {
      id: 'forum-starter',
      name: 'Bürgerforum starten',
      description: 'Organisiere demokratische Diskussionen',
      category: 'participation',
      cost: 3,
      unlocked: false
    },
    {
      id: 'coalition-builder',
      name: 'Koalitionsbau',
      description: 'Bringe verschiedene Gruppen zusammen',
      category: 'participation',
      cost: 5,
      unlocked: false,
      prerequisite: 'forum-starter'
    },
    {
      id: 'whistle-protection',
      name: 'Whistleblower-Schutz',
      description: 'Schütze dich beim Aufdecken von Missständen',
      category: 'courage',
      cost: 4,
      unlocked: false
    },
    {
      id: 'counter-speech',
      name: 'Gegenrede-Boost',
      description: 'Effektive Antworten auf Hassrede',
      category: 'courage',
      cost: 3,
      unlocked: false,
      prerequisite: 'whistle-protection'
    }
  ];

  const startGame = () => {
    setGameState(prev => ({ ...prev, gamePhase: 'chapter-select' }));
  };

  const selectChapter = (chapterId: number) => {
    setGameState(prev => ({
      ...prev,
      currentChapter: chapterId,
      currentLevel: chapters.find(c => c.id === chapterId)?.levelRange[0] || 1,
      gamePhase: 'playing'
    }));
  };

  const selectChoice = (choiceId: number) => {
    setGameState(prev => ({ ...prev, selectedChoice: choiceId }));
  };

  const submitChoice = () => {
    if (!currentLevel || gameState.selectedChoice === null) return;

    const choice = currentLevel.scenario?.choices.find(c => c.id === gameState.selectedChoice);
    if (!choice) return;

    // Update Scores
    const newScores = {
      empathy: gameState.globalScores.empathy + choice.scores.empathy,
      humanRights: gameState.globalScores.humanRights + choice.scores.humanRights,
      participation: gameState.globalScores.participation + choice.scores.participation,
      civilCourage: gameState.globalScores.civilCourage + choice.scores.civilCourage
    };

    // Calculate XP gain
    const xpGain = Object.values(choice.scores).reduce((sum, score) => sum + score, 0) * 10;

    setGameState(prev => ({
      ...prev,
      globalScores: newScores,
      experiencePoints: prev.experiencePoints + xpGain,
      showFeedback: true
    }));
  };

  const completeLevel = () => {
    const newCompletedLevels = [...gameState.completedLevels, gameState.currentLevel];
    const nextLevel = gameState.currentLevel + 1;
    
    // Check if chapter is completed
    const chapterComplete = currentChapter && 
      newCompletedLevels.filter(l => l >= currentChapter.levelRange[0] && l <= currentChapter.levelRange[1]).length 
      === (currentChapter.levelRange[1] - currentChapter.levelRange[0] + 1);

    setGameState(prev => ({
      ...prev,
      completedLevels: newCompletedLevels,
      currentLevel: nextLevel,
      selectedChoice: null,
      showFeedback: false,
      gamePhase: chapterComplete ? 'chapter-complete' : (nextLevel > 100 ? 'endgame' : 'playing')
    }));
  };

  const unlockSkill = (skillId: string) => {
    const skill = skillTree.find(s => s.id === skillId);
    if (!skill) return;

    const skillPoints = gameState.skillPoints[skill.category];
    if (skillPoints >= skill.cost) {
      setGameState(prev => ({
        ...prev,
        unlockedSkills: [...prev.unlockedSkills, skillId],
        skillPoints: {
          ...prev.skillPoints,
          [skill.category]: prev.skillPoints[skill.category] - skill.cost
        }
      }));
    }
  };

  const getDemocracyProfile = () => {
    const totalScore = Object.values(gameState.globalScores).reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / 4;
    
    if (avgScore >= 80) return { 
      title: "Demokratie-Visionär", 
      description: "Du gestaltest die Zukunft der Demokratie",
      color: "text-purple-600",
      icon: Rocket
    };
    if (avgScore >= 65) return { 
      title: "Demokratie-Champion", 
      description: "Du bist ein Vorbild für demokratische Werte",
      color: "text-green-600", 
      icon: Trophy 
    };
    if (avgScore >= 50) return { 
      title: "Brückenbauer*in", 
      description: "Du verbindest Menschen und Ideen",
      color: "text-blue-600", 
      icon: Target 
    };
    if (avgScore >= 35) return { 
      title: "Demokratie-Lernende*r", 
      description: "Du entwickelst dein demokratisches Verständnis",
      color: "text-yellow-600", 
      icon: Star 
    };
    return { 
      title: "Demokratie-Entdecker*in", 
      description: "Du beginnst deine demokratische Reise",
      color: "text-purple-600", 
      icon: Heart 
    };
  };

  const getChapterIcon = (chapterId: number) => {
    const icons = [Heart, Users, Globe, Scale, Trophy, Zap, Globe, Rocket, Shield, Star];
    const IconComponent = icons[chapterId - 1] || Heart;
    return IconComponent;
  };

  // Intro Phase
  if (gameState.gamePhase === 'intro') {
    return (
      <section id="democracy-metaverse" className="relative min-h-screen overflow-hidden">
        {/* Enhanced Dynamic Background */}
        <DynamicBackground 
          variant="democracy" 
          intensity="high" 
          color="#3b82f6" 
          animated={true} 
        />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-block mb-6"
            >
              <HolographicBadge
                icon={<Rocket />}
                title="Democracy Metaverse"
                description="Next-Gen Political Education"
                rarity="legendary"
                size="large"
              />
            </motion.div>
            
            <h2 className="mb-6 text-gradient text-5xl font-bold">
              Brücken Bauen 🌉
            </h2>
            <h3 className="mb-6 text-2xl">Das komplette Democracy Game - 100+ Level</h3>
            <p className="lead max-w-4xl mx-auto mb-8">
              Erlebe die **vollständige Democracy-Journey** von Nachbarschaftskonflikten bis zu globalen Krisen. 
              10 Kapitel, 100+ Level, Multiplayer-Modus und ein komplettes Skill-System für die Demokratie-Bildung der Zukunft.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Advanced3DCard 
                glowColor="#3b82f6" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Map className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  </motion.div>
                  <h4 className="mb-2">10 Kapitel</h4>
                  <p className="small">
                    Von Alltag bis Zukunftsvisionen - eine komplette Democracy-Journey
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Advanced3DCard 
                glowColor="#22c55e" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  </motion.div>
                  <h4 className="mb-2">100+ Level</h4>
                  <p className="small">
                    Szenarien, Minigames, Boss-Kämpfe und Special-Challenges
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Advanced3DCard 
                glowColor="#8b5cf6" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Users className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  </motion.div>
                  <h4 className="mb-2">Multiplayer</h4>
                  <p className="small">
                    Kollaborative Entscheidungsfindung für Schulklassen und Gruppen
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Advanced3DCard 
                glowColor="#f97316" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  </motion.div>
                  <h4 className="mb-2">Skill-System</h4>
                  <p className="small">
                    Entwickle demokratische Kompetenzen und schalte neue Fähigkeiten frei
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Advanced3DCard 
                glowColor="#ef4444" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    <Award className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  </motion.div>
                  <h4 className="mb-2">Achievements</h4>
                  <p className="small">
                    Sammle Badges und baue dein Democracy-Profil auf
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Advanced3DCard 
                glowColor="#06b6d4" 
                tiltIntensity={8}
                className="text-center h-full"
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <Globe className="w-12 h-12 mx-auto mb-4 text-cyan-500" />
                  </motion.div>
                  <h4 className="mb-2">Weltveränderung</h4>
                  <p className="small">
                    Deine Entscheidungen formen die Welt der Democracy-Zukunft
                  </p>
                </CardContent>
              </Advanced3DCard>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <Advanced3DCard 
              glowColor="#3b82f6" 
              tiltIntensity={10}
              className="max-w-3xl mx-auto"
            >
              <CardContent className="p-8 relative overflow-hidden">
                {/* Particle Effect for Call-to-Action */}
                <ParticleSystem
                  count={30}
                  color="#3b82f6"
                  size={3}
                  shape="star"
                  direction="radial"
                  trigger={true}
                />
                
                <div className="relative z-10">
                  <h3 className="mb-4">Deine Democracy-Journey beginnt</h3>
                  <div className="space-y-4 text-left mb-6">
                    <motion.div 
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <p className="small">
                        <strong>Spiralcurriculum:</strong> Themen wiederholen sich in komplexerer Form
                      </p>
                    </motion.div>
                    <motion.div 
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <p className="small">
                        <strong>4-Achsen Entwicklung:</strong> Empathie, Menschenrechte, Partizipation, Zivilcourage
                      </p>
                    </motion.div>
                    <motion.div 
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <p className="small">
                        <strong>Real-World Transfer:</strong> Direkter Bezug zu aktuellen gesellschaftlichen Herausforderungen
                      </p>
                    </motion.div>
                    <motion.div 
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <p className="small">
                        <strong>Progressive Komplexität:</strong> Von persönlichen bis zu globalen Dilemmata
                      </p>
                    </motion.div>
                  </div>
                  
                  <div className="text-center space-y-2 mb-6">
                    <p className="small text-muted-foreground">
                      <strong>Geschätzte Gesamtspielzeit:</strong> 15-20 Stunden
                    </p>
                    <p className="small text-muted-foreground">
                      <strong>Zielgruppe:</strong> Ab 14 Jahren, Erwachsenenbildung, Schulklassen
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={startGame}
                      className="btn-primary-gradient relative overflow-hidden"
                      size="lg"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                        animate={{ 
                          x: [-200, 200],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      Democracy Journey beginnen
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Advanced3DCard>
          </motion.div>
        </div>
      </section>
    );
  }

  // Chapter Selection Phase
  if (gameState.gamePhase === 'chapter-select') {
    return (
      <section className="relative min-h-screen overflow-hidden">
        {/* Enhanced Background */}
        <DynamicBackground 
          variant="geometric" 
          intensity="medium" 
          color="#8b5cf6" 
          animated={true} 
        />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <HolographicBadge
                icon={<Map />}
                title="Democracy World Map"
                description="Choose Your Path"
                rarity="epic"
                size="large"
              />
            </motion.div>
            
            <h2 className="mb-4 text-gradient text-4xl font-bold">Democracy World Map</h2>
            <p className="lead mb-6 max-w-2xl mx-auto">
              Wähle dein nächstes Kapitel in der Welt der Demokratie
            </p>
            
            {/* Enhanced Progress Overview */}
            <Advanced3DCard 
              glowColor="#8b5cf6" 
              className="max-w-2xl mx-auto mb-8"
            >
              <CardContent className="p-6">
                <h4 className="mb-4">Dein Fortschritt</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <AnimatedCounter 
                      value={gameState.completedLevels.length} 
                      className="text-2xl font-bold text-primary"
                    />
                    <div className="text-sm text-muted-foreground">Level abgeschlossen</div>
                  </div>
                  <div className="text-center">
                    <AnimatedCounter 
                      value={gameState.completedChapters.length} 
                      className="text-2xl font-bold text-secondary"
                    />
                    <div className="text-sm text-muted-foreground">Kapitel gemeistert</div>
                  </div>
                  <div className="text-center">
                    <AnimatedCounter 
                      value={gameState.experiencePoints} 
                      className="text-2xl font-bold text-green-500"
                    />
                    <div className="text-sm text-muted-foreground">XP gesammelt</div>
                  </div>
                  <div className="text-center">
                    <AnimatedCounter 
                      value={gameState.achievements.length} 
                      className="text-2xl font-bold text-purple-500"
                    />
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                </div>
                <Progress value={totalProgress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Gesamtfortschritt: {Math.round(totalProgress)}%
                </p>
              </CardContent>
            </Advanced3DCard>
          </motion.div>

          {/* Chapter Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter, index) => {
              const IconComponent = getChapterIcon(chapter.id);
              const isUnlocked = gameState.worldState.regions[index].unlocked;
              const isCompleted = gameState.completedChapters.includes(chapter.id);
              
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={`card-modern h-full transition-all ${
                      isUnlocked 
                        ? 'hover:shadow-lg cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                    onClick={() => isUnlocked && selectChapter(chapter.id)}
                  >
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div 
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-100 dark:bg-green-900/50' 
                              : isUnlocked 
                                ? 'bg-primary/10' 
                                : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : isUnlocked ? (
                            <IconComponent className="w-8 h-8 text-primary" />
                          ) : (
                            <Lock className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {chapter.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {chapter.subtitle}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <Badge 
                          variant={isCompleted ? "default" : "outline"}
                          className={isCompleted ? "bg-green-500" : ""}
                        >
                          {chapter.iconSymbol} {chapter.theme}
                        </Badge>
                        
                        <p className="text-sm">
                          {chapter.description}
                        </p>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Level {chapter.levelRange[0]}-{chapter.levelRange[1]}</span>
                          <span>{chapter.estimatedDuration}</span>
                        </div>
                        
                        {isUnlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Fortschritt</span>
                              <span>{Math.round((gameState.completedLevels.filter(l => 
                                l >= chapter.levelRange[0] && l <= chapter.levelRange[1]
                              ).length / (chapter.levelRange[1] - chapter.levelRange[0] + 1)) * 100)}%</span>
                            </div>
                            <Progress 
                              value={(gameState.completedLevels.filter(l => 
                                l >= chapter.levelRange[0] && l <= chapter.levelRange[1]
                              ).length / (chapter.levelRange[1] - chapter.levelRange[0] + 1)) * 100}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'intro' }))}
                variant="outline"
                size="lg"
              >
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                Zurück zur Übersicht
              </Button>
              
              <Button 
                className="btn-primary-gradient"
                size="lg"
                onClick={() => selectChapter(1)}
              >
                Erstes Kapitel starten
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Playing Phase (Enhanced Immersive Interface)
  if (gameState.gamePhase === 'playing') {
    // Use the enhanced immersive interface for playing
    if (currentLevel && currentLevel.scenario) {
      return (
        <ImmersiveScenario
          scenario={{
            id: currentLevel.id,
            title: currentLevel.title,
            description: currentLevel.description,
            situation: currentLevel.scenario.situation,
            choices: currentLevel.scenario.choices.map(choice => ({
              id: choice.id,
              text: choice.text,
              consequences: choice.shortTermConsequence,
              scores: choice.scores
            }))
          }}
          onChoiceSelect={(choiceId) => {
            setGameState(prev => ({ ...prev, selectedChoice: choiceId }));
            submitChoice();
          }}
          playerStats={gameState.globalScores}
        />
      );
    }

    return (
      <section className="relative min-h-screen overflow-hidden">
        <DynamicBackground 
          variant="democracy" 
          intensity="medium" 
          color="#3b82f6" 
          animated={true} 
        />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Enhanced Header with Skills & Progress */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Chapter Progress */}
                <Advanced3DCard glowColor="#3b82f6" tiltIntensity={6}>
                  <CardContent className="p-4">
                    <h4 className="mb-2">Kapitel {gameState.currentChapter}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {currentChapter?.title}
                    </p>
                    <Progress value={chapterProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Level {gameState.currentLevel} / {Math.round(chapterProgress)}% abgeschlossen
                    </p>
                  </CardContent>
                </Advanced3DCard>

                {/* Score Overview */}
                <Advanced3DCard glowColor="#22c55e" tiltIntensity={6}>
                  <CardContent className="p-4">
                    <h4 className="mb-2">Democracy Scores</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <AnimatedCounter value={gameState.globalScores.empathy} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Scale className="w-3 h-3 text-blue-500" />
                        <AnimatedCounter value={gameState.globalScores.humanRights} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-green-500" />
                        <AnimatedCounter value={gameState.globalScores.participation} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-purple-500" />
                        <AnimatedCounter value={gameState.globalScores.civilCourage} />
                      </div>
                    </div>
                  </CardContent>
                </Advanced3DCard>

                {/* Player Status */}
                <Advanced3DCard glowColor="#f59e0b" tiltIntensity={6}>
                  <CardContent className="p-4">
                    <h4 className="mb-2">Level {gameState.playerLevel}</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        <AnimatedCounter value={gameState.experiencePoints} suffix=" XP" />
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getDemocracyProfile().title}
                    </div>
                  </CardContent>
                </Advanced3DCard>
              </div>
            </motion.div>

            {/* Current Level Content */}
            {currentLevel && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={gameState.currentLevel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Advanced3DCard 
                    glowColor="#8b5cf6" 
                    tiltIntensity={8}
                    className="relative overflow-hidden"
                  >
                    {/* Particle effect for level start */}
                    <ParticleSystem
                      count={25}
                      color="#8b5cf6"
                      size={3}
                      shape="star"
                      direction="radial"
                      trigger={true}
                    />
                    
                    <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          >
                            <Badge variant="outline" className="mb-2">
                              Level {currentLevel.id}
                            </Badge>
                          </motion.div>
                          <CardTitle>{currentLevel.title}</CardTitle>
                          <p className="text-muted-foreground">
                            {currentLevel.description}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="secondary">
                            {currentLevel.estimatedTime} min
                          </Badge>
                          <Badge variant="outline">
                            {'★'.repeat(currentLevel.difficulty)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Learning Objectives */}
                      <div className="mb-6">
                        <h4 className="mb-2">Lernziele</h4>
                        <div className="grid md:grid-cols-3 gap-2">
                          {currentLevel.learningObjectives.map((objective, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="text-sm">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Scenario Content */}
                      {currentLevel.scenario && (
                        <div className="space-y-6">
                          {/* Situation */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
                            <h4 className="mb-3">Situation</h4>
                            <p className="leading-relaxed mb-4">
                              {currentLevel.scenario.situation}
                            </p>
                            <div className="text-sm text-muted-foreground">
                              <strong>Kontext:</strong> {currentLevel.scenario.context}
                            </div>
                          </div>

                          {/* Stakeholders */}
                          <div>
                            <h4 className="mb-3">Beteiligte Personen</h4>
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                              {currentLevel.scenario.stakeholders.map((stakeholder) => (
                                <Card key={stakeholder.id} className="p-4">
                                  <h5 className="mb-2">{stakeholder.name}</h5>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {stakeholder.role}
                                  </p>
                                  <p className="text-sm mb-2">
                                    <strong>Motivation:</strong> {stakeholder.motivation}
                                  </p>
                                  <div className="flex justify-between text-xs">
                                    <span>Macht: {stakeholder.power}/10</span>
                                    <span>Einfluss: {stakeholder.influence}/10</span>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>

                          {/* Choices */}
                          {!gameState.showFeedback ? (
                            <div>
                              <h4 className="mb-4">Wie entscheidest du dich?</h4>
                              <div className="space-y-4">
                                {currentLevel.scenario.choices.map((choice) => (
                                  <motion.div
                                    key={choice.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Card 
                                      className={`cursor-pointer transition-all ${
                                        gameState.selectedChoice === choice.id
                                          ? 'border-primary bg-primary/5'
                                          : 'hover:border-primary/50'
                                      }`}
                                      onClick={() => selectChoice(choice.id)}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                          <div className="mt-1">
                                            {gameState.selectedChoice === choice.id ? (
                                              <CheckCircle className="w-5 h-5 text-primary" />
                                            ) : (
                                              <Circle className="w-5 h-5 text-muted-foreground" />
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <p className="mb-2">{choice.text}</p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                              <span>Schwierigkeit: {'★'.repeat(choice.difficulty)}</span>
                                              {choice.ethicalDilemma && (
                                                <Badge variant="outline" className="text-xs">
                                                  Ethisches Dilemma
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                              
                              <div className="text-center pt-6">
                                <Button 
                                  onClick={submitChoice}
                                  disabled={gameState.selectedChoice === null}
                                  className="btn-primary-gradient"
                                  size="lg"
                                >
                                  Entscheidung treffen
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* Feedback Phase */
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              {(() => {
                                const selectedChoice = currentLevel.scenario?.choices.find(c => c.id === gameState.selectedChoice);
                                return selectedChoice ? (
                                  <div className="space-y-6">
                                    <h4>Konsequenzen deiner Entscheidung</h4>
                                    
                                    {/* Immediate & Long-term consequences */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <Card className="p-4">
                                        <h5 className="mb-2">Sofortige Auswirkung</h5>
                                        <p className="text-sm">{selectedChoice.shortTermConsequence}</p>
                                      </Card>
                                      <Card className="p-4">
                                        <h5 className="mb-2">Langfristige Folgen</h5>
                                        <p className="text-sm">{selectedChoice.longTermConsequence}</p>
                                      </Card>
                                    </div>

                                    {/* Stakeholder Reactions */}
                                    <div>
                                      <h5 className="mb-3">Reaktionen der Beteiligten</h5>
                                      <div className="space-y-3">
                                        {selectedChoice.stakeholderReactions.map((reaction) => {
                                          const stakeholder = currentLevel.scenario?.stakeholders.find(s => s.id === reaction.stakeholderId);
                                          return (
                                            <div 
                                              key={reaction.stakeholderId}
                                              className={`p-3 rounded-lg ${
                                                reaction.reaction === 'positive' 
                                                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
                                                  : reaction.reaction === 'negative'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                                                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200'
                                              }`}
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <strong>{stakeholder?.name}</strong>
                                                  <p className="text-sm mt-1">{reaction.reasoning}</p>
                                                </div>
                                                <Badge 
                                                  variant={
                                                    reaction.reaction === 'positive' ? 'default' :
                                                    reaction.reaction === 'negative' ? 'destructive' : 'secondary'
                                                  }
                                                >
                                                  {reaction.reaction === 'positive' ? '😊' : 
                                                   reaction.reaction === 'negative' ? '😞' : '😐'} 
                                                  {reaction.trustChange > 0 ? '+' : ''}{reaction.trustChange}
                                                </Badge>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Score Gains */}
                                    <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 p-4">
                                      <h5 className="mb-3">Kompetenz-Entwicklung</h5>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                          <Heart className="w-6 h-6 mx-auto mb-1 text-red-500" />
                                          <div className="font-bold">+{selectedChoice.scores.empathy}</div>
                                          <div className="text-xs">Empathie</div>
                                        </div>
                                        <div className="text-center">
                                          <Scale className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                                          <div className="font-bold">+{selectedChoice.scores.humanRights}</div>
                                          <div className="text-xs">Menschenrechte</div>
                                        </div>
                                        <div className="text-center">
                                          <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
                                          <div className="font-bold">+{selectedChoice.scores.participation}</div>
                                          <div className="text-xs">Partizipation</div>
                                        </div>
                                        <div className="text-center">
                                          <Shield className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                                          <div className="font-bold">+{selectedChoice.scores.civilCourage}</div>
                                          <div className="text-xs">Zivilcourage</div>
                                        </div>
                                      </div>
                                    </Card>
                                    
                                    <div className="text-center">
                                      <Button 
                                        onClick={completeLevel}
                                        className="btn-primary-gradient"
                                        size="lg"
                                      >
                                        {gameState.currentLevel < 100 ? (
                                          <>
                                            Nächstes Level
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                          </>
                                        ) : (
                                          <>
                                            Game abschließen
                                            <Trophy className="w-5 h-5 ml-2" />
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Advanced3DCard>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default fallback
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 text-center">
        <p>Loading Democracy Metaverse...</p>
      </div>
    </div>
  );
}

export default BridgeBuilding100;