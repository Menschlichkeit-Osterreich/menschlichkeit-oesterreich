import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
  Trophy,
  Star,
  Crown,
  Heart,
  Users,
  Scale,
  Shield,
  Zap,
  Target,
  Award,
  Medal,
  Gem,
  Sparkles,
  CheckCircle,
  Lock,
  TrendingUp,
  Globe,
  Rocket,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Advanced3DCard, HolographicBadge, ParticleSystem } from './Enhanced3DGameGraphics';

interface Achievement {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: 'story' | 'skills' | 'social' | 'special' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: React.ComponentType<any>;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  hint?: string;
  reward?: string;
}

interface AchievementGalleryProps {
  achievements: Achievement[];
  totalXP: number;
  completionRate: number;
}

export function AchievementGallery({
  achievements,
  totalXP,
  completionRate
}: AchievementGalleryProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'story' | 'skills' | 'social' | 'special' | 'mastery'>('all');

  const allAchievements: Achievement[] = [
    // Story Achievements
    {
      id: 'first-steps',
      title: 'Erste Schritte',
      description: 'Absolviere das erste Level',
      longDescription: 'Du hast deine ersten Schritte in der Welt der demokratischen Bildung gemacht. Dies ist der Beginn einer wichtigen Reise!',
      category: 'story',
      rarity: 'common',
      icon: Target,
      unlocked: false,
      hint: 'Schließe Level 1 ab',
      reward: '+100 XP'
    },
    {
      id: 'chapter-one-complete',
      title: 'Nachbarschafts-Champion',
      description: 'Schließe Kapitel 1 ab',
      longDescription: 'Du hast alle Herausforderungen in deiner unmittelbaren Umgebung gemeistert und verstehst die Bedeutung lokaler Demokratie.',
      category: 'story',
      rarity: 'rare',
      icon: Heart,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      hint: 'Absolviere alle 10 Level des ersten Kapitels',
      reward: '+500 XP, Nachbarschafts-Badge'
    },
    {
      id: 'halfway-hero',
      title: 'Halbzeit-Held*in',
      description: 'Erreiche Level 50',
      longDescription: 'Du bist über die Hälfte deiner Democracy-Journey! Dein Engagement für demokratische Werte ist beeindruckend.',
      category: 'story',
      rarity: 'epic',
      icon: Trophy,
      unlocked: false,
      hint: 'Absolviere 50 Level',
      reward: '+1000 XP, Special Skill freischalten'
    },
    {
      id: 'democracy-master',
      title: 'Democracy-Meister*in',
      description: 'Schließe alle 100 Level ab',
      longDescription: 'Du hast die komplette Democracy-Journey gemeistert! Du bist ein Vorbild für demokratisches Engagement.',
      category: 'story',
      rarity: 'legendary',
      icon: Crown,
      unlocked: false,
      hint: 'Absolviere alle 100 Level',
      reward: '+5000 XP, Legendary Badge, Alle Skills freischalten'
    },

    // Skills Achievements
    {
      id: 'empathy-expert',
      title: 'Empathie-Expert*in',
      description: 'Erreiche 100 Empathie-Punkte',
      longDescription: 'Deine Fähigkeit, die Perspektiven anderer einzunehmen, ist außergewöhnlich entwickelt.',
      category: 'skills',
      rarity: 'rare',
      icon: Heart,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hint: 'Sammle 100 Empathie-Punkte',
      reward: '+300 XP, Empathie-Boost'
    },
    {
      id: 'rights-defender',
      title: 'Rechte-Verteidiger*in',
      description: 'Erreiche 100 Menschenrechts-Punkte',
      longDescription: 'Du bist ein*e standfeste*r Verteidiger*in der Menschenrechte und demokratischer Grundwerte.',
      category: 'skills',
      rarity: 'rare',
      icon: Scale,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hint: 'Sammle 100 Menschenrechts-Punkte',
      reward: '+300 XP, Rechts-Boost'
    },
    {
      id: 'participation-pro',
      title: 'Partizipations-Profi',
      description: 'Erreiche 100 Partizipations-Punkte',
      longDescription: 'Du verstehst, wie wichtig aktive Teilhabe für eine lebendige Demokratie ist.',
      category: 'skills',
      rarity: 'rare',
      icon: Users,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hint: 'Sammle 100 Partizipations-Punkte',
      reward: '+300 XP, Partizipations-Boost'
    },
    {
      id: 'courage-champion',
      title: 'Courage-Champion',
      description: 'Erreiche 100 Zivilcourage-Punkte',
      longDescription: 'Dein Mut, für das Richtige einzustehen, ist inspirierend.',
      category: 'skills',
      rarity: 'rare',
      icon: Shield,
      unlocked: false,
      progress: 0,
      maxProgress: 100,
      hint: 'Sammle 100 Zivilcourage-Punkte',
      reward: '+300 XP, Courage-Boost'
    },
    {
      id: 'balanced-master',
      title: 'Ausgewogene*r Meister*in',
      description: 'Erreiche 80+ in allen vier Kompetenzen',
      longDescription: 'Deine ausgewogene Entwicklung in allen demokratischen Kompetenzen ist bemerkenswert!',
      category: 'skills',
      rarity: 'epic',
      icon: Star,
      unlocked: false,
      hint: 'Erreiche mindestens 80 Punkte in allen vier Kategorien',
      reward: '+1000 XP, Balance-Master-Badge'
    },

    // Social Achievements
    {
      id: 'bridge-builder',
      title: 'Brückenbauer*in',
      description: 'Löse 10 Konflikte friedlich',
      longDescription: 'Du hast bewiesen, dass friedliche Lösungen möglich sind, auch in schwierigen Situationen.',
      category: 'social',
      rarity: 'rare',
      icon: Heart,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      hint: 'Wähle in 10 Szenarien die diplomatische Lösung',
      reward: '+400 XP, Mediations-Skill'
    },
    {
      id: 'coalition-maker',
      title: 'Koalitionsbauer*in',
      description: 'Bilde 5 erfolgreiche Allianzen',
      longDescription: 'Deine Fähigkeit, verschiedene Gruppen zusammenzubringen, ist außergewöhnlich.',
      category: 'social',
      rarity: 'epic',
      icon: Users,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      hint: 'Schmiede in 5 Levels erfolgreiche Allianzen',
      reward: '+600 XP, Alliance-Builder-Skill'
    },
    {
      id: 'multiplayer-master',
      title: 'Multiplayer-Meister*in',
      description: 'Spiele 20 Level im Multiplayer-Modus',
      longDescription: 'Zusammenarbeit macht Demokratie stark - und du bist ein*e Meister*in darin!',
      category: 'social',
      rarity: 'rare',
      icon: Globe,
      unlocked: false,
      progress: 0,
      maxProgress: 20,
      hint: 'Absolviere 20 Level im Multiplayer',
      reward: '+500 XP, Team-Player-Badge'
    },

    // Special Achievements
    {
      id: 'perfect-score',
      title: 'Perfekte Wertung',
      description: 'Erreiche 100% in einem Level',
      longDescription: 'Eine fehlerfreie Leistung! Du hast alle Aspekte eines Levels perfekt gemeistert.',
      category: 'special',
      rarity: 'epic',
      icon: Star,
      unlocked: false,
      hint: 'Erziele die maximale Punktzahl in einem Level',
      reward: '+750 XP, Perfektionist-Badge'
    },
    {
      id: 'speed-runner',
      title: 'Speed-Runner',
      description: 'Schließe ein Level in Rekordzeit ab',
      longDescription: 'Geschwindigkeit UND Qualität - eine beeindruckende Kombination!',
      category: 'special',
      rarity: 'rare',
      icon: Zap,
      unlocked: false,
      hint: 'Absolviere ein Level in unter 5 Minuten',
      reward: '+400 XP, Speed-Bonus'
    },
    {
      id: 'minigame-master',
      title: 'Minigame-Meister*in',
      description: 'Gewinne 10 Minigames',
      longDescription: 'Du bist ein*e Virtuos*in in allen Democracy-Minigames!',
      category: 'special',
      rarity: 'epic',
      icon: Sparkles,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      hint: 'Gewinne 10 verschiedene Minigames',
      reward: '+800 XP, Minigame-Expert-Badge'
    },
    {
      id: 'boss-slayer',
      title: 'Boss-Bezwinger*in',
      description: 'Besiege alle 10 Boss-Kämpfe',
      longDescription: 'Du hast alle großen Herausforderungen gemeistert - von Populismus bis globale Krisen!',
      category: 'special',
      rarity: 'legendary',
      icon: Crown,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      hint: 'Besiege alle Boss-Kämpfe',
      reward: '+2000 XP, Ultimate-Champion-Badge'
    },

    // Mastery Achievements
    {
      id: 'skill-tree-complete',
      title: 'Komplett-Kompetenz',
      description: 'Schalte alle Skills frei',
      longDescription: 'Du hast jede demokratische Kompetenz im Skill-Tree gemeistert!',
      category: 'mastery',
      rarity: 'legendary',
      icon: Gem,
      unlocked: false,
      hint: 'Schalte alle Skills im Skill-Tree frei',
      reward: '+3000 XP, Master-of-Skills-Badge'
    },
    {
      id: 'scholar',
      title: 'Demokratie-Gelehrte*r',
      description: 'Lese alle Lernmaterialien',
      longDescription: 'Dein Wissensdurst und deine Bereitschaft zu lernen sind bemerkenswert.',
      category: 'mastery',
      rarity: 'epic',
      icon: BookOpen,
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      hint: 'Lese alle 50 Reflexions-Texte',
      reward: '+1000 XP, Scholar-Badge'
    },
    {
      id: 'visionary',
      title: 'Demokratie-Visionär*in',
      description: 'Erreiche Level 100 mit höchsten Scores',
      longDescription: 'Du hast nicht nur alle Levels abgeschlossen, sondern mit Exzellenz! Du bist ein Vorbild für alle.',
      category: 'mastery',
      rarity: 'legendary',
      icon: Rocket,
      unlocked: false,
      hint: 'Erreiche 90+ in allen Kategorien und schließe alle Levels ab',
      reward: '+5000 XP, Legendary-Visionary-Badge'
    }
  ];

  // Merge with provided achievements
  const mergedAchievements = allAchievements.map(template => {
    const userAchievement = achievements.find(a => a.id === template.id);
    return userAchievement || template;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600', glow: '#9ca3af' };
      case 'rare': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600', glow: '#3b82f6' };
      case 'epic': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', glow: '#8b5cf6' };
      case 'legendary': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600', glow: '#f59e0b' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', glow: '#9ca3af' };
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Häufig';
      case 'rare': return 'Selten';
      case 'epic': return 'Episch';
      case 'legendary': return 'Legendär';
      default: return rarity;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'story': return BookOpen;
      case 'skills': return TrendingUp;
      case 'social': return Users;
      case 'special': return Sparkles;
      case 'mastery': return Crown;
      default: return Trophy;
    }
  };

  const filteredAchievements = activeCategory === 'all'
    ? mergedAchievements
    : mergedAchievements.filter(a => a.category === activeCategory);

  const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
  const totalCount = mergedAchievements.length;
  const unlockedPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <HolographicBadge
          icon={<Trophy />}
          title="Achievement Gallery"
          description="Deine Erfolge im Überblick"
          rarity="legendary"
          size="large"
        />
      </motion.div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Advanced3DCard glowColor="#3b82f6">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
            <div className="text-3xl font-bold mb-1">{unlockedCount}/{totalCount}</div>
            <div className="text-sm text-muted-foreground">Achievements freigeschaltet</div>
            <Progress value={unlockedPercentage} className="mt-3 h-2" />
          </CardContent>
        </Advanced3DCard>

        <Advanced3DCard glowColor="#22c55e">
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <div className="text-3xl font-bold mb-1">{totalXP.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Gesamt-XP</div>
          </CardContent>
        </Advanced3DCard>

        <Advanced3DCard glowColor="#f59e0b">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-3 text-orange-500" />
            <div className="text-3xl font-bold mb-1">{completionRate}%</div>
            <div className="text-sm text-muted-foreground">Vervollständigung</div>
            <Progress value={completionRate} className="mt-3 h-2" />
          </CardContent>
        </Advanced3DCard>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={(value: any) => setActiveCategory(value)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement, index) => {
              const colors = getRarityColor(achievement.rarity);
              const IconComponent = achievement.icon;
              const CategoryIcon = getCategoryIcon(achievement.category);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Card
                    className={`h-full cursor-pointer transition-all ${
                      achievement.unlocked
                        ? `${colors.bg} border-2 ${colors.text.replace('text-', 'border-')}`
                        : 'opacity-70 hover:opacity-100'
                    } hover:shadow-lg`}
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${colors.bg}`}>
                          {achievement.unlocked ? (
                            <IconComponent className={`w-8 h-8 ${colors.text}`} />
                          ) : (
                            <Lock className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={achievement.unlocked ? "default" : "outline"}>
                            {getRarityLabel(achievement.rarity)}
                          </Badge>
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="flex items-center space-x-2 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Freigeschaltet am {achievement.unlockedAt}</span>
                        </div>
                      )}
                      {!achievement.unlocked && achievement.maxProgress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Fortschritt</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative"
            >
              {selectedAchievement.unlocked && (
                <ParticleSystem
                  count={30}
                  color={getRarityColor(selectedAchievement.rarity).glow}
                  size={4}
                  shape="star"
                  direction="radial"
                  trigger={true}
                />
              )}
              <Advanced3DCard
                glowColor={getRarityColor(selectedAchievement.rarity).glow}
                tiltIntensity={12}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getRarityColor(selectedAchievement.rarity).bg}>
                      {getRarityLabel(selectedAchievement.rarity)}
                    </Badge>
                    <button
                      onClick={() => setSelectedAchievement(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className={`p-4 rounded-lg ${getRarityColor(selectedAchievement.rarity).bg}`}>
                      {selectedAchievement.unlocked ? (
                        <selectedAchievement.icon 
                          className={`w-12 h-12 ${getRarityColor(selectedAchievement.rarity).text}`} 
                        />
                      ) : (
                        <Lock className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{selectedAchievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedAchievement.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed">{selectedAchievement.longDescription}</p>

                  {!selectedAchievement.unlocked && selectedAchievement.hint && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium mb-1">Hinweis</div>
                          <p className="text-sm text-muted-foreground">{selectedAchievement.hint}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedAchievement.reward && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Award className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="font-medium mb-1">Belohnung</div>
                          <p className="text-sm">{selectedAchievement.reward}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedAchievement.maxProgress && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-medium">
                          {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={((selectedAchievement.progress || 0) / selectedAchievement.maxProgress) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Freigeschaltet am {selectedAchievement.unlockedAt}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Advanced3DCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AchievementGallery;