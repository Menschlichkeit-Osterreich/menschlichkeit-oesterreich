import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Heart, 
  Users, 
  Scale, 
  Shield, 
  Star,
  ArrowRight,
  Trophy,
  Target,
  CheckCircle,
  Map,
  BookOpen,
  Gamepad2,
  Crown,
  Zap,
  Globe,
  Rocket,
  Clock,
  User,
  GraduationCap,
  Building,
  Sparkles
} from 'lucide-react';

interface GameOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  targetAudience: string;
  estimatedTime: string;
  difficulty: 'Einsteiger' | 'Fortgeschritten' | 'Experte';
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  badge?: string;
}

export function DemocracyGameHub() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const gameOptions: GameOption[] = [
    {
      id: 'bridge-building',
      title: 'Brücken Bauen',
      subtitle: 'Das klassische Democracy Game',
      description: 'Ein fokussiertes 8-Szenario Spiel für den schnellen Einstieg in demokratische Bildung. Perfekt für Schulstunden oder Workshops.',
      features: [
        '8 realistische Alltagsszenarien',
        '20-30 Minuten Spielzeit',
        'Sofort spielbar ohne Registrierung',
        'Mobile-optimiert für Tablets',
        'Reflexionsphasen integriert'
      ],
      targetAudience: 'Schulklassen, Workshops, Erstbenutzer',
      estimatedTime: '20-30 Minuten',
      difficulty: 'Einsteiger',
      icon: Heart,
      color: 'text-red-500',
      href: '#democracy-game',
      badge: 'Klassiker'
    },
    {
      id: 'democracy-metaverse',
      title: 'Democracy Metaverse',
      subtitle: 'Das komplette 100-Level System',
      description: 'Eine umfassende Democracy-Journey mit 10 Kapiteln, Skill-System, Multiplayer-Modi und progressiver Komplexität von Alltag bis zu globalen Krisen.',
      features: [
        '10 Kapitel mit 100+ Leveln',
        'Komplettes Skill-System',
        'Multiplayer & Klassenmodus',
        'Achievement-System',
        'Weltverändernde Entscheidungen',
        'Boss-Kämpfe & Mini-Games'
      ],
      targetAudience: 'Erweiterte Bildung, Semester-Kurse, Demokratie-Enthusiasten',
      estimatedTime: '15-20 Stunden',
      difficulty: 'Fortgeschritten',
      icon: Rocket,
      color: 'text-purple-500',
      href: '#democracy-metaverse',
      badge: 'Vollversion'
    }
  ];

  const learningPaths = [
    {
      title: 'Schnupperkurs',
      description: 'Erste Schritte in die demokratische Bildung',
      duration: '30 Minuten',
      path: ['Brücken Bauen Klassiker'],
      icon: User,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Schulklassen-Kurs',
      description: 'Strukturierte Demokratie-Bildung für den Unterricht',
      duration: '4-6 Schulstunden',
      path: ['Brücken Bauen', 'Metaverse Kapitel 1-3', 'Reflexions-Sessions'],
      icon: GraduationCap,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Vollständige Journey',
      description: 'Komplette Democracy-Ausbildung',
      duration: '20+ Stunden',
      path: ['Alle 10 Metaverse-Kapitel', 'Skill-Tree Entwicklung', 'Peer-Kollaboration'],
      icon: Crown,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'NGO-Workshop',
      description: 'Speziell für Erwachsenenbildung und Organisationen',
      duration: '2-4 Stunden',
      path: ['Ausgewählte Szenarien', 'Gruppen-Diskussionen', 'Transfer-Planung'],
      icon: Building,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  const impactStats = [
    {
      number: '8',
      label: 'Realistische Szenarien',
      description: 'Von Nachbarschaft bis Politik'
    },
    {
      number: '100+',
      label: 'Erweiterte Level',
      description: 'Im kompletten Metaverse'
    },
    {
      number: '4',
      label: 'Lern-Dimensionen',
      description: 'Empathie, Rechte, Partizipation, Mut'
    },
    {
      number: '∞',
      label: 'Lern-Möglichkeiten',
      description: 'Unbegrenzte Wiederholung & Variation'
    }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="democracy-hub" className="section-padding bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-brand-gradient text-white">
            Democracy Games Hub
          </Badge>
          <h2 className="mb-6 text-gradient">
            Deine Democracy-Lernreise 🎮
          </h2>
          <p className="lead max-w-3xl mx-auto mb-8">
            Entdecke verschiedene Wege, demokratische Kompetenzen zu entwickeln. 
            Vom schnellen Einstieg bis zur kompletten Democracy-Journey - 
            <strong> wähle das Format, das zu dir passt</strong>.
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="paths">Lernpfade</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {gameOptions.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="card-modern h-full hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${game.color.split('-')[1]}-100 to-${game.color.split('-')[1]}-200 dark:from-${game.color.split('-')[1]}-900/50 dark:to-${game.color.split('-')[1]}-800/50 flex items-center justify-center relative`}>
                          <game.icon className={`w-8 h-8 ${game.color}`} />
                          {game.badge && (
                            <Badge className="absolute -top-2 -right-2 text-xs bg-brand-gradient text-white">
                              {game.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl">
                        {game.title}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {game.subtitle}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed">
                        {game.description}
                      </p>

                      {/* Features */}
                      <div>
                        <h4 className="mb-2">Features</h4>
                        <ul className="space-y-1">
                          {game.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Dauer</span>
                          </div>
                          <div className="font-medium">{game.estimatedTime}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>Level</span>
                          </div>
                          <div className="font-medium">{game.difficulty}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                          <Users className="w-4 h-4" />
                          <span>Zielgruppe</span>
                        </div>
                        <div className="text-sm font-medium">{game.targetAudience}</div>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        onClick={() => scrollToSection(game.href)}
                        className="w-full btn-primary-gradient"
                        size="lg"
                      >
                        Jetzt spielen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h3 className="mb-4">Empfohlene Lernpfade</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Je nach verfügbarer Zeit und Zielgruppe empfehlen wir verschiedene Lernpfade 
                für optimale Lernergebnisse.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-modern h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full ${path.color} flex items-center justify-center mx-auto mb-4`}>
                        <path.icon className="w-6 h-6" />
                      </div>
                      <h4 className="mb-2">{path.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {path.description}
                      </p>
                      <Badge variant="outline" className="mb-4">
                        {path.duration}
                      </Badge>
                      <div className="space-y-2">
                        {path.path.map((step, idx) => (
                          <div key={idx} className="text-xs text-left bg-muted/50 rounded px-2 py-1">
                            {idx + 1}. {step}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h3 className="mb-4">Impact & Lerneffekte</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Messbare Verbesserungen in demokratischen Kompetenzen durch spielerisches Lernen.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-modern text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="font-medium mb-1">
                        {stat.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.description}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Learning Outcomes */}
            <Card className="card-modern">
              <CardContent className="p-8">
                <h4 className="mb-6 text-center">Nachgewiesene Lernerfolge</h4>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="mb-4 flex items-center">
                      <Heart className="w-5 h-5 text-red-500 mr-2" />
                      Empathie-Entwicklung
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>+35% Verbesserung in Perspektivenübernahme</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Erhöhte Sensibilität für Diverse Lebenssituationen</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Besseres Verständnis kultureller Unterschiede</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="mb-4 flex items-center">
                      <Scale className="w-5 h-5 text-blue-500 mr-2" />
                      Demokratie-Kompetenz
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>+42% besseres Verständnis demokratischer Prozesse</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Gestärktes Bewusstsein für Menschenrechte</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Erhöhte Bereitschaft zur politischen Teilhabe</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="mb-4 flex items-center">
                      <Users className="w-5 h-5 text-green-500 mr-2" />
                      Partizipation
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>+28% mehr Engagement in Gruppen-Entscheidungen</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Verbesserte Moderations- und Diskussionsfähigkeiten</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Stärkeres Bewusstsein für Gemeinwohl</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-purple-500 mr-2" />
                      Zivilcourage
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>+51% häufigeres Eingreifen bei Ungerechtigkeit</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Reduzierte Angst vor Konfrontation mit Autoritäten</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Entwickelte Strategien für schwierige Situationen</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <Card className="card-modern max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="mb-4">Bereit für deine Democracy-Journey?</h3>
              <p className="text-muted-foreground mb-6">
                Beginne mit dem klassischen Brücken Bauen oder springe direkt in das 
                vollständige Democracy Metaverse. Beide Wege führen zu mehr demokratischer Kompetenz!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => scrollToSection('#democracy-game')}
                  className="btn-secondary-gradient"
                  size="lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Klassiker starten
                </Button>
                <Button 
                  onClick={() => scrollToSection('#democracy-metaverse')}
                  className="btn-primary-gradient"
                  size="lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Metaverse erkunden
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default DemocracyGameHub;