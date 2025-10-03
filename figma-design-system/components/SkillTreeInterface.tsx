import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Heart,
  Scale,
  Users,
  Shield,
  Lock,
  Unlock,
  Zap,
  Star,
  TrendingUp,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { Advanced3DCard, AnimatedCounter, HolographicBadge } from './Enhanced3DGameGraphics';

interface Skill {
  id: string;
  name: string;
  description: string;
  detailedInfo: string;
  category: 'empathy' | 'rights' | 'participation' | 'courage';
  cost: number;
  unlocked: boolean;
  prerequisite?: string;
  level: number;
  maxLevel: number;
  benefits: string[];
  icon: React.ComponentType<any>;
}

interface SkillTreeInterfaceProps {
  availablePoints: {
    empathy: number;
    rights: number;
    participation: number;
    courage: number;
  };
  unlockedSkills: string[];
  onUnlockSkill: (skillId: string) => void;
  onUpgradeSkill: (skillId: string) => void;
}

export function SkillTreeInterface({
  availablePoints,
  unlockedSkills,
  onUnlockSkill,
  onUpgradeSkill
}: SkillTreeInterfaceProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'empathy' | 'rights' | 'participation' | 'courage'>('all');

  const skills: Skill[] = [
    // Empathy Skills
    {
      id: 'active-listening',
      name: 'Aktives Zuhören',
      description: 'Verstehe die wahren Bedürfnisse hinter Aussagen',
      detailedInfo: 'Entwickle die Fähigkeit, zwischen den Zeilen zu lesen und emotionale Untertöne zu erkennen. Diese Kompetenz ermöglicht es dir, tiefere Einblicke in die Motivationen anderer zu gewinnen.',
      category: 'empathy',
      cost: 2,
      unlocked: false,
      level: 1,
      maxLevel: 5,
      benefits: [
        '+15% Empathie-Bonuspunkte',
        'Zusätzliche Dialog-Optionen',
        'Bessere Stakeholder-Insights'
      ],
      icon: Heart
    },
    {
      id: 'perspective-cards',
      name: 'Perspektiven-Karten',
      description: 'Sammle und verwende verschiedene Sichtweisen',
      detailedInfo: 'Erstelle ein mentales Portfolio verschiedener Perspektiven. Du kannst diese Karten in Diskussionen einsetzen, um Brücken zwischen gegensätzlichen Meinungen zu bauen.',
      category: 'empathy',
      cost: 3,
      unlocked: false,
      prerequisite: 'active-listening',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Bis zu 8 Perspektiven speichern',
        'Perspektiven-Wechsel-Bonus',
        'Erhöhte Stakeholder-Zufriedenheit'
      ],
      icon: Users
    },
    {
      id: 'cultural-bridge',
      name: 'Kulturelle Brücke',
      description: 'Meistere interkulturelle Kommunikation',
      detailedInfo: 'Erkenne kulturelle Nuancen und vermeide Missverständnisse in interkulturellen Situationen.',
      category: 'empathy',
      cost: 4,
      unlocked: false,
      prerequisite: 'perspective-cards',
      level: 1,
      maxLevel: 5,
      benefits: [
        '+25% Erfolg in kulturellen Szenarien',
        'Kulturelle Insights freischalten',
        'Mediations-Bonus'
      ],
      icon: Sparkles
    },

    // Rights Skills
    {
      id: 'fact-checker',
      name: 'Schnell-Fact-Check',
      description: 'Überprüfe Behauptungen in Echtzeit',
      detailedInfo: 'Entwickle die Fähigkeit, Fakten schnell zu verifizieren und Desinformation zu erkennen. Essential für informierte demokratische Teilhabe.',
      category: 'rights',
      cost: 2,
      unlocked: false,
      level: 1,
      maxLevel: 5,
      benefits: [
        'Fact-Check in 3 Sekunden',
        '+20% Punkte in Minigames',
        'Quellen-Bewertung'
      ],
      icon: Zap
    },
    {
      id: 'legal-aid',
      name: 'Rechtshilfe-Kit',
      description: 'Kenne die wichtigsten Rechte und Gesetze',
      detailedInfo: 'Ein kompaktes Wissen über Grundrechte, Arbeitsrecht, und demokratische Verfahren. Schütze dich und andere durch Rechtskenntnisse.',
      category: 'rights',
      cost: 4,
      unlocked: false,
      prerequisite: 'fact-checker',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Rechtliche Beratung in Szenarien',
        '+30% Menschenrechts-Punkte',
        'Zugang zu Rechts-Ressourcen'
      ],
      icon: Scale
    },
    {
      id: 'constitutional-expert',
      name: 'Verfassungsexperte',
      description: 'Tiefes Verständnis demokratischer Grundlagen',
      detailedInfo: 'Werde zum Experten für demokratische Prinzipien, Gewaltenteilung und Rechtsstaatlichkeit.',
      category: 'rights',
      cost: 5,
      unlocked: false,
      prerequisite: 'legal-aid',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Verfassungsargumente nutzen',
        'Boss-Kämpfe erleichtern',
        '+40% Überzeugungskraft'
      ],
      icon: Star
    },

    // Participation Skills
    {
      id: 'forum-starter',
      name: 'Bürgerforum starten',
      description: 'Organisiere demokratische Diskussionen',
      detailedInfo: 'Lerne, wie man inklusive Diskussionsräume schafft und moderiert. Ein Schlüsselwerkzeug für Bottom-up-Demokratie.',
      category: 'participation',
      cost: 3,
      unlocked: false,
      level: 1,
      maxLevel: 5,
      benefits: [
        'Foren in Szenarien nutzen',
        '+25% Partizipations-Punkte',
        'Moderations-Tools'
      ],
      icon: Users
    },
    {
      id: 'coalition-builder',
      name: 'Koalitionsbau',
      description: 'Bringe verschiedene Gruppen zusammen',
      detailedInfo: 'Entwickle Strategien, um unterschiedliche Interessen zu einen und tragfähige Kompromisse zu finden.',
      category: 'participation',
      cost: 5,
      unlocked: false,
      prerequisite: 'forum-starter',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Allianzen schmieden',
        'Multiplayer-Koordination',
        '+35% Gruppenentscheidungs-Bonus'
      ],
      icon: TrendingUp
    },
    {
      id: 'campaign-master',
      name: 'Kampagnen-Meister',
      description: 'Organisiere effektive Kampagnen für Veränderung',
      detailedInfo: 'Von Petition bis Protest - lerne die Tools moderner demokratischer Mobilisierung.',
      category: 'participation',
      cost: 6,
      unlocked: false,
      prerequisite: 'coalition-builder',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Kampagnen-Events freischalten',
        'Massenmobilisierung',
        '+50% Impact in Politik-Levels'
      ],
      icon: Sparkles
    },

    // Courage Skills
    {
      id: 'whistle-protection',
      name: 'Whistleblower-Schutz',
      description: 'Schütze dich beim Aufdecken von Missständen',
      detailedInfo: 'Kenne deine Rechte als Whistleblower und lerne, wie man sicher Missstände meldet.',
      category: 'courage',
      cost: 4,
      unlocked: false,
      level: 1,
      maxLevel: 5,
      benefits: [
        'Sichere Meldekanäle',
        '+30% Zivilcourage-Punkte',
        'Risiko-Reduktion'
      ],
      icon: Shield
    },
    {
      id: 'counter-speech',
      name: 'Gegenrede-Boost',
      description: 'Effektive Antworten auf Hassrede',
      detailedInfo: 'Entwickle Strategien für konstruktive Gegenrede ohne zu eskalieren. Wichtig für Online und Offline.',
      category: 'courage',
      cost: 3,
      unlocked: false,
      prerequisite: 'whistle-protection',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Counter-Speech Templates',
        'Deeskalations-Techniken',
        '+40% Effektivität gegen Populismus'
      ],
      icon: Zap
    },
    {
      id: 'civil-disobedience',
      name: 'Ziviler Ungehorsam',
      description: 'Strategien für gewaltfreien Widerstand',
      detailedInfo: 'Lerne von historischen Bewegungen und entwickle Strategien für ethisch fundierte Regelverstöße.',
      category: 'courage',
      cost: 7,
      unlocked: false,
      prerequisite: 'counter-speech',
      level: 1,
      maxLevel: 5,
      benefits: [
        'Protest-Strategien',
        'Historische Vorbilder',
        'Maximale Courage-Punkte'
      ],
      icon: Star
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'empathy': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600', border: 'border-red-300' };
      case 'rights': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600', border: 'border-blue-300' };
      case 'participation': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', border: 'border-green-300' };
      case 'courage': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', border: 'border-purple-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'empathy': return 'Empathie';
      case 'rights': return 'Menschenrechte';
      case 'participation': return 'Partizipation';
      case 'courage': return 'Zivilcourage';
      default: return category;
    }
  };

  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === activeCategory);

  const canUnlockSkill = (skill: Skill) => {
    if (unlockedSkills.includes(skill.id)) return false;
    if (skill.prerequisite && !unlockedSkills.includes(skill.prerequisite)) return false;
    return availablePoints[skill.category] >= skill.cost;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <HolographicBadge
          icon={<Sparkles />}
          title="Skill Tree"
          description="Entwickle deine demokratischen Kompetenzen"
          rarity="epic"
          size="large"
        />
        <h3 className="mt-6 mb-4">Democracy Skill Tree</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Investiere deine Skill-Punkte weise, um neue Fähigkeiten freizuschalten
          und deine demokratischen Kompetenzen zu stärken.
        </p>
      </motion.div>

      {/* Available Points */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(availablePoints).map(([category, points]) => {
          const colors = getCategoryColor(category);
          return (
            <Advanced3DCard key={category} glowColor={colors.text.replace('text-', '#')}>
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${colors.text} mb-1`}>
                  <AnimatedCounter value={points} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {getCategoryName(category)}
                </div>
              </CardContent>
            </Advanced3DCard>
          );
        })}
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={(value: any) => setActiveCategory(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="empathy">
            <Heart className="w-4 h-4 mr-1" />
            Empathie
          </TabsTrigger>
          <TabsTrigger value="rights">
            <Scale className="w-4 h-4 mr-1" />
            Rechte
          </TabsTrigger>
          <TabsTrigger value="participation">
            <Users className="w-4 h-4 mr-1" />
            Teilhabe
          </TabsTrigger>
          <TabsTrigger value="courage">
            <Shield className="w-4 h-4 mr-1" />
            Courage
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, index) => {
              const isUnlocked = unlockedSkills.includes(skill.id);
              const canUnlock = canUnlockSkill(skill);
              const colors = getCategoryColor(skill.category);
              const IconComponent = skill.icon;

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`h-full cursor-pointer transition-all ${
                      isUnlocked
                        ? `${colors.bg} ${colors.border} border-2`
                        : canUnlock
                        ? 'hover:shadow-lg border-primary/50'
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          {isUnlocked ? (
                            <IconComponent className={`w-6 h-6 ${colors.text}`} />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={isUnlocked ? "default" : "outline"}>
                            {skill.cost} SP
                          </Badge>
                          {skill.maxLevel > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Lv {skill.level}/{skill.maxLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{skill.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {skill.description}
                      </p>
                      {skill.prerequisite && !unlockedSkills.includes(skill.prerequisite) && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                          <Lock className="w-3 h-3" />
                          <span>Benötigt: {skills.find(s => s.id === skill.prerequisite)?.name}</span>
                        </div>
                      )}
                      {isUnlocked && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Freigeschaltet</span>
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

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Advanced3DCard 
                glowColor={getCategoryColor(selectedSkill.category).text.replace('text-', '#')}
                tiltIntensity={10}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">
                        {getCategoryName(selectedSkill.category)}
                      </Badge>
                      <CardTitle className="text-2xl">{selectedSkill.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSkill(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed">{selectedSkill.detailedInfo}</p>

                  <div>
                    <h5 className="mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Vorteile
                    </h5>
                    <ul className="space-y-2">
                      {selectedSkill.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Kosten</div>
                      <div className="text-2xl font-bold">
                        {selectedSkill.cost} Skill-Punkte
                      </div>
                    </div>
                    <div>
                      {unlockedSkills.includes(selectedSkill.id) ? (
                        <Button disabled className="btn-primary-gradient">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Bereits freigeschaltet
                        </Button>
                      ) : canUnlockSkill(selectedSkill) ? (
                        <Button
                          onClick={() => {
                            onUnlockSkill(selectedSkill.id);
                            setSelectedSkill(null);
                          }}
                          className="btn-primary-gradient"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Freischalten
                        </Button>
                      ) : (
                        <Button disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Nicht verfügbar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Advanced3DCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SkillTreeInterface;