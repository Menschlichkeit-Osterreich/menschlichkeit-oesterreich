import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ParticleSystem, 
  Advanced3DCard, 
  DynamicBackground, 
  AnimatedCounter,
  HolographicBadge,
  DemocracyWheel
} from './Enhanced3DGameGraphics';
import {
  Heart,
  Users,
  Scale,
  Shield,
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Sparkles,
  Rocket,
  Globe
} from 'lucide-react';

interface ImmersiveScenarioProps {
  scenario: {
    id: number;
    title: string;
    description: string;
    situation: string;
    choices: Array<{
      id: number;
      text: string;
      consequences: string;
      scores: {
        empathy: number;
        humanRights: number;
        participation: number;
        civilCourage: number;
      };
    }>;
  };
  onChoiceSelect: (choiceId: number) => void;
  playerStats: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
}

interface ImmersiveProgressDashboardProps {
  playerLevel: number;
  experience: number;
  maxExperience: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlocked: boolean;
  }>;
  stats: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
}

interface FloatingUIElementProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  intensity?: number;
}

// Immersive Scenario Display
export function ImmersiveScenario({ scenario, onChoiceSelect, playerStats }: ImmersiveScenarioProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);

  const handleChoiceClick = (choiceId: number) => {
    setSelectedChoice(choiceId);
    setShowParticles(true);
    setTimeout(() => {
      onChoiceSelect(choiceId);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background */}
      <DynamicBackground 
        variant="democracy" 
        intensity="medium" 
        color="#3b82f6" 
        animated={true} 
      />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Scenario Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <Advanced3DCard 
            glowColor="#3b82f6" 
            tiltIntensity={8}
            className="max-w-4xl mx-auto"
          >
            <CardHeader className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="inline-block mb-4"
              >
                <HolographicBadge
                  icon={<Target />}
                  title={`Szenario ${scenario.id}`}
                  description="Democracy Challenge"
                  rarity="epic"
                  size="large"
                />
              </motion.div>
              
              <CardTitle className="text-3xl mb-4 text-gradient">
                {scenario.title}
              </CardTitle>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {scenario.description}
              </p>
            </CardHeader>
          </Advanced3DCard>
        </motion.div>

        {/* Situation Description */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <Advanced3DCard 
            glowColor="#22c55e" 
            className="max-w-5xl mx-auto"
          >
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl p-8 relative overflow-hidden">
                
                {/* Floating UI Elements */}
                <FloatingUIElement delay={1} direction="up">
                  <div className="absolute top-4 right-4 opacity-30">
                    <Globe className="w-8 h-8 text-blue-500" />
                  </div>
                </FloatingUIElement>
                
                <FloatingUIElement delay={1.5} direction="down">
                  <div className="absolute bottom-4 left-4 opacity-30">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </FloatingUIElement>

                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-yellow-500" />
                  Die Situation
                </h3>
                
                <p className="text-lg leading-relaxed">
                  {scenario.situation}
                </p>
              </div>
            </CardContent>
          </Advanced3DCard>
        </motion.div>

        {/* Player Stats Display */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12"
        >
          <Advanced3DCard 
            glowColor="#8b5cf6" 
            className="max-w-6xl mx-auto"
          >
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-6 text-center">Deine aktuellen Demokratie-Kompetenzen</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { key: 'empathy', label: 'Empathie', icon: Heart, color: '#ef4444' },
                  { key: 'humanRights', label: 'Menschenrechte', icon: Scale, color: '#3b82f6' },
                  { key: 'participation', label: 'Partizipation', icon: Users, color: '#22c55e' },
                  { key: 'civilCourage', label: 'Zivilcourage', icon: Shield, color: '#8b5cf6' }
                ].map(({ key, label, icon: Icon, color }, index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    className="text-center"
                  >
                    <div 
                      className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
                    >
                      <Icon className="w-8 h-8" style={{ color }} />
                    </div>
                    
                    <h5 className="font-medium mb-2">{label}</h5>
                    
                    <AnimatedCounter 
                      value={playerStats[key as keyof typeof playerStats]} 
                      className="text-2xl font-bold"
                      style={{ color }}
                    />
                    
                    <Progress 
                      value={playerStats[key as keyof typeof playerStats]} 
                      className="h-2 mt-2"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Advanced3DCard>
        </motion.div>

        {/* Choice Selection */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Wie entscheidest du dich?
          </h3>
          
          <div className="grid gap-6 max-w-4xl mx-auto">
            {scenario.choices.map((choice, index) => (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                onMouseEnter={() => setHoveredChoice(choice.id)}
                onMouseLeave={() => setHoveredChoice(null)}
              >
                <Advanced3DCard 
                  glowColor={selectedChoice === choice.id ? "#22c55e" : "#3b82f6"}
                  tiltIntensity={12}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedChoice === choice.id ? 'ring-4 ring-green-400' : ''
                  }`}
                >
                  <CardContent 
                    className="p-6 relative overflow-hidden"
                    onClick={() => handleChoiceClick(choice.id)}
                  >
                    {/* Particle Effect on Hover */}
                    <ParticleSystem 
                      count={20}
                      color="#3b82f6"
                      size={3}
                      shape="star"
                      direction="radial"
                      trigger={hoveredChoice === choice.id}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="text-sm">
                          Option {choice.id}
                        </Badge>
                        
                        {selectedChoice === choice.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500"
                          >
                            <Trophy className="w-6 h-6" />
                          </motion.div>
                        )}
                      </div>
                      
                      <p className="text-lg mb-4 leading-relaxed">
                        {choice.text}
                      </p>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                        <strong>Mögliche Folgen:</strong> {choice.consequences}
                      </div>
                      
                      {/* Score Preview */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {Object.entries(choice.scores).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className={`w-full h-2 rounded-full bg-gray-200 overflow-hidden`}>
                              <motion.div 
                                className="h-full bg-gradient-to-r from-blue-400 to-green-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${(value / 10) * 100}%` }}
                                transition={{ duration: 0.8, delay: 2 + index * 0.1 }}
                              />
                            </div>
                            <div className="mt-1 font-medium">+{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Advanced3DCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Particle Effect on Selection */}
        <ParticleSystem 
          count={100}
          color="#22c55e"
          size={4}
          shape="star"
          direction="radial"
          trigger={showParticles}
        />
      </div>
    </div>
  );
}

// Immersive Progress Dashboard
export function ImmersiveProgressDashboard({ 
  playerLevel, 
  experience, 
  maxExperience, 
  achievements, 
  stats 
}: ImmersiveProgressDashboardProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const democracyWheelSegments = [
    { id: 'empathy', label: 'Empathie', value: stats.empathy, color: '#ef4444' },
    { id: 'rights', label: 'Rechte', value: stats.humanRights, color: '#3b82f6' },
    { id: 'participation', label: 'Teilhabe', value: stats.participation, color: '#22c55e' },
    { id: 'courage', label: 'Mut', value: stats.civilCourage, color: '#8b5cf6' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <DynamicBackground 
        variant="geometric" 
        intensity="low" 
        color="#8b5cf6" 
        animated={true} 
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Democracy Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Deine Reise zur demokratischen Kompetenz
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Player Level & Experience */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Advanced3DCard glowColor="#f59e0b" className="h-full">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mb-6"
                >
                  <HolographicBadge
                    icon={<Crown />}
                    title={`Level ${playerLevel}`}
                    description="Democracy Citizen"
                    rarity="legendary"
                    size="large"
                  />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-4">
                  Level <AnimatedCounter value={playerLevel} />
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Erfahrung</span>
                    <span>{experience} / {maxExperience} XP</span>
                  </div>
                  <Progress value={(experience / maxExperience) * 100} className="h-3" />
                </div>
                
                <p className="text-muted-foreground">
                  Noch <strong>{maxExperience - experience} XP</strong> bis zum nächsten Level
                </p>
              </CardContent>
            </Advanced3DCard>
          </motion.div>

          {/* Democracy Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Advanced3DCard glowColor="#3b82f6" className="h-full">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-6">Kompetenz-Rad</h3>
                
                <DemocracyWheel
                  segments={democracyWheelSegments}
                  selectedSegment={selectedAchievement}
                  onSegmentSelect={setSelectedAchievement}
                  size={250}
                />
                
                <p className="text-sm text-muted-foreground mt-4">
                  Klicke zum Drehen und entdecke deine Stärken
                </p>
              </CardContent>
            </Advanced3DCard>
          </motion.div>

          {/* Achievements Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Advanced3DCard glowColor="#22c55e" className="h-full">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-center">
                  Achievements
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {achievements.slice(0, 9).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="relative"
                    >
                      <HolographicBadge
                        icon={achievement.icon}
                        title={achievement.title}
                        description={achievement.description}
                        rarity={achievement.rarity}
                        size="small"
                        animated={achievement.unlocked}
                      />
                      
                      {!achievement.unlocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <Badge variant="outline">
                    {achievements.filter(a => a.unlocked).length} / {achievements.length} freigeschaltet
                  </Badge>
                </div>
              </CardContent>
            </Advanced3DCard>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <Advanced3DCard glowColor="#8b5cf6">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">
                Detaillierte Kompetenz-Analyse
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { 
                    key: 'empathy', 
                    label: 'Empathie', 
                    icon: Heart, 
                    color: '#ef4444',
                    description: 'Fähigkeit, verschiedene Perspektiven zu verstehen'
                  },
                  { 
                    key: 'humanRights', 
                    label: 'Menschenrechte', 
                    icon: Scale, 
                    color: '#3b82f6',
                    description: 'Verständnis für universelle Rechte und Gerechtigkeit'
                  },
                  { 
                    key: 'participation', 
                    label: 'Partizipation', 
                    icon: Users, 
                    color: '#22c55e',
                    description: 'Aktive Teilnahme an demokratischen Prozessen'
                  },
                  { 
                    key: 'civilCourage', 
                    label: 'Zivilcourage', 
                    icon: Shield, 
                    color: '#8b5cf6',
                    description: 'Mut, für die eigenen Überzeugungen einzustehen'
                  }
                ].map(({ key, label, icon: Icon, color, description }, index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                    className="text-center group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-xl"
                      style={{ 
                        backgroundColor: `${color}20`, 
                        border: `3px solid ${color}`,
                        boxShadow: `0 0 20px ${color}40`
                      }}
                    >
                      <Icon className="w-10 h-10" style={{ color }} />
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2">{label}</h4>
                    
                    <div className="mb-3">
                      <AnimatedCounter 
                        value={stats[key as keyof typeof stats]} 
                        className="text-3xl font-bold"
                        suffix="/100"
                        style={{ color }}
                      />
                    </div>
                    
                    <Progress 
                      value={stats[key as keyof typeof stats]} 
                      className="h-3 mb-3"
                    />
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Advanced3DCard>
        </motion.div>
      </div>
    </div>
  );
}

// Floating UI Element Helper
function FloatingUIElement({ children, delay = 0, direction = 'up', intensity = 20 }: FloatingUIElementProps) {
  const getAnimation = () => {
    switch (direction) {
      case 'up':
        return { y: [-intensity, intensity, -intensity] };
      case 'down':
        return { y: [intensity, -intensity, intensity] };
      case 'left':
        return { x: [-intensity, intensity, -intensity] };
      case 'right':
        return { x: [intensity, -intensity, intensity] };
      default:
        return { y: [-intensity, intensity, -intensity] };
    }
  };

  return (
    <motion.div
      animate={getAnimation()}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

export default {
  ImmersiveScenario,
  ImmersiveProgressDashboard
};