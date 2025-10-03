import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
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
  Circle
} from 'lucide-react';

// Game state interface
interface GameState {
  currentScenario: number;
  scores: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
  completedScenarios: number[];
  totalChoices: number;
  gamePhase: 'intro' | 'playing' | 'reflection' | 'completed';
  selectedChoice: number | null;
  showFeedback: boolean;
}

// Scenario data structure
interface Scenario {
  id: number;
  title: string;
  description: string;
  situation: string;
  choices: {
    id: number;
    text: string;
    consequence: string;
    scores: {
      empathy: number;
      humanRights: number;
      participation: number;
      civilCourage: number;
    };
    perspective: string;
  }[];
  reflection: {
    question: string;
    learningPoint: string;
  };
}

// Game scenarios data
const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Nachbarschaftskonflikt",
    description: "Lärmbeschwerden vs. kulturelle Vielfalt",
    situation: "Ihre Nachbarn aus Syrien feiern ein wichtiges religiöses Fest mit traditioneller Musik. Ein anderer Nachbar beschwert sich lautstark über den 'Lärm' und droht mit der Polizei. Wie reagieren Sie?",
    choices: [
      {
        id: 1,
        text: "Ich spreche mit beiden Parteien und schlage eine Kompromisslösung vor.",
        consequence: "Sie helfen dabei, eine Lösung zu finden: frühere Endzeit und Einladung der Nachbarn zum Fest.",
        scores: { empathy: 8, humanRights: 6, participation: 9, civilCourage: 7 },
        perspective: "Mediation schafft Verständnis und stärkt die Gemeinschaft."
      },
      {
        id: 2,
        text: "Ich unterstütze die Beschwerdeführer - Regeln sind Regeln.",
        consequence: "Der Konflikt eskaliert und die syrische Familie fühlt sich ausgegrenzt.",
        scores: { empathy: 2, humanRights: 3, participation: 4, civilCourage: 2 },
        perspective: "Starres Regelverständnis kann Integration behindern."
      },
      {
        id: 3,
        text: "Ich informiere mich über die kulturelle Bedeutung des Festes.",
        consequence: "Sie gewinnen Verständnis und können anderen die Tradition erklären.",
        scores: { empathy: 9, humanRights: 8, participation: 6, civilCourage: 5 },
        perspective: "Wissen schafft Empathie und baut Brücken zwischen Kulturen."
      }
    ],
    reflection: {
      question: "Wie können wir kulturelle Vielfalt und Nachbarschaftsfrieden miteinander verbinden?",
      learningPoint: "Echte Integration entsteht durch gegenseitiges Verständnis und Kompromissbereitschaft, nicht durch Assimilation oder Ausgrenzung."
    }
  },
  {
    id: 2,
    title: "Arbeitsplatz-Diskriminierung",
    description: "Ungleichbehandlung erkennen und handeln",
    situation: "Sie bemerken, dass Ihre Kollegin Fatima trotz gleicher Qualifikation weniger Gehalt bekommt und bei Beförderungen übergangen wird. Der Chef macht gelegentlich abfällige Bemerkungen über 'Ausländer'. Was tun Sie?",
    choices: [
      {
        id: 1,
        text: "Ich spreche Fatima direkt an und ermutige sie, sich zu wehren.",
        consequence: "Fatima fühlt sich unterstützt und geht gemeinsam mit Ihnen zum Betriebsrat.",
        scores: { empathy: 7, humanRights: 8, participation: 6, civilCourage: 8 },
        perspective: "Direkte Unterstützung stärkt Betroffene."
      },
      {
        id: 2,
        text: "Ich dokumentiere die Vorfälle und wende mich an die Gleichstellungsbeauftragte.",
        consequence: "Eine offizielle Untersuchung wird eingeleitet und strukturelle Probleme werden aufgedeckt.",
        scores: { empathy: 6, humanRights: 9, participation: 8, civilCourage: 7 },
        perspective: "Systematisches Vorgehen kann nachhaltige Veränderungen bewirken."
      },
      {
        id: 3,
        text: "Das ist nicht mein Problem - ich halte mich raus.",
        consequence: "Die Diskriminierung setzt sich fort und weitere Kolleg*innen werden betroffen.",
        scores: { empathy: 1, humanRights: 1, participation: 1, civilCourage: 1 },
        perspective: "Schweigen macht uns zu Mittäter*innen der Ungerechtigkeit."
      }
    ],
    reflection: {
      question: "Welche Verantwortung haben wir als Zeug*innen von Diskriminierung?",
      learningPoint: "Diskriminierung gedeiht in der Stille. Zivilcourage bedeutet, auch dann zu handeln, wenn wir nicht direkt betroffen sind."
    }
  },
  {
    id: 3,
    title: "Flüchtlingshilfe",
    description: "Solidarität in der Gemeinde",
    situation: "Ihre Gemeinde soll ein Flüchtlingsheim bekommen. Während einer Bürgerversammlung äußern einige Bürger*innen Ängste und Vorurteile. Andere fordern mehr Hilfe. Wie positionieren Sie sich?",
    choices: [
      {
        id: 1,
        text: "Ich teile sachliche Informationen über Integration und deren Vorteile.",
        consequence: "Einige Bürger*innen werden nachdenklicher und die Diskussion wird konstruktiver.",
        scores: { empathy: 7, humanRights: 8, participation: 9, civilCourage: 6 },
        perspective: "Sachliche Information ist das beste Mittel gegen Vorurteile."
      },
      {
        id: 2,
        text: "Ich organisiere ein Begegnungsfest zwischen Einheimischen und Geflüchteten.",
        consequence: "Persönliche Begegnungen bauen Vorurteile ab und schaffen neue Freundschaften.",
        scores: { empathy: 9, humanRights: 7, participation: 8, civilCourage: 8 },
        perspective: "Begegnung überwindet Fremdheit besser als jede Theorie."
      },
      {
        id: 3,
        text: "Ich verstehe beide Seiten und halte mich neutral.",
        consequence: "Die Diskussion bleibt polarisiert und konstruktive Lösungen bleiben aus.",
        scores: { empathy: 4, humanRights: 3, participation: 2, civilCourage: 2 },
        perspective: "Neutralität bei Menschenrechtsfragen kann problematisch sein."
      }
    ],
    reflection: {
      question: "Wie können wir Ängste ernst nehmen, ohne Menschenrechte zu verhandeln?",
      learningPoint: "Echte Integration gelingt durch Begegnung auf Augenhöhe und die Bereitschaft, voneinander zu lernen."
    }
  },
  {
    id: 4,
    title: "Digitale Demokratie",
    description: "Fake News und Meinungsbildung",
    situation: "In sozialen Medien kursiert ein Video, das angeblich zeigt, wie Immigrant*innen bevorzugt behandelt werden. Das Video ist manipuliert, wird aber tausendfach geteilt. Ein Freund teilt es auch. Wie reagieren Sie?",
    choices: [
      {
        id: 1,
        text: "Ich recherchiere die Fakten und teile eine sachliche Richtigstellung.",
        consequence: "Einige Personen danken Ihnen für die Aufklärung und werden vorsichtiger bei der Weiterleitung.",
        scores: { empathy: 6, humanRights: 8, participation: 9, civilCourage: 7 },
        perspective: "Faktenchecking ist demokratische Bürgerpflicht."
      },
      {
        id: 2,
        text: "Ich spreche meinen Freund persönlich an und erkläre die Problematik.",
        consequence: "Ihr Freund ist zunächst verärgert, denkt dann aber nach und löscht den Post.",
        scores: { empathy: 8, humanRights: 7, participation: 6, civilCourage: 8 },
        perspective: "Persönliche Gespräche sind oft wirkungsvoller als öffentliche Korrekturen."
      },
      {
        id: 3,
        text: "Ich ignoriere es - das Internet ist sowieso nicht zu kontrollieren.",
        consequence: "Die Falschinformation verbreitet sich weiter und verstärkt Vorurteile.",
        scores: { empathy: 2, humanRights: 2, participation: 1, civilCourage: 1 },
        perspective: "Digitale Passivität untergräbt die demokratische Meinungsbildung."
      }
    ],
    reflection: {
      question: "Welche Verantwortung haben wir für die Qualität des digitalen Diskurses?",
      learningPoint: "In der digitalen Demokratie ist jede*r von uns Journalist*in und Faktenchecker*in zugleich."
    }
  },
  {
    id: 5,
    title: "Generationenkonflikt",
    description: "Klimaschutz vs. Wirtschaftsinteressen",
    situation: "Bei einer Diskussion über ein neues Windkraftprojekt prallen Welten aufeinander: Junge Menschen fordern radikalen Klimaschutz, ältere Bewohner*innen sorgen sich um ihre Arbeitsplätze und Immobilienwerte. Wie moderieren Sie?",
    choices: [
      {
        id: 1,
        text: "Ich schlage einen Bürgerdialog vor, in dem alle Bedenken gehört werden.",
        consequence: "Ein strukturierter Dialog führt zu einem ausgewogenen Kompromiss mit Übergangslösungen.",
        scores: { empathy: 8, humanRights: 6, participation: 9, civilCourage: 6 },
        perspective: "Demokratische Teilhabe braucht Räume für echten Dialog."
      },
      {
        id: 2,
        text: "Ich unterstütze die junge Generation - die Klimakrise duldet keinen Aufschub.",
        consequence: "Sie gewinnen junge Verbündete, aber ältere Bürger*innen fühlen sich übergangen.",
        scores: { empathy: 5, humanRights: 7, participation: 5, civilCourage: 8 },
        perspective: "Eindeutige Haltungen können polarisieren."
      },
      {
        id: 3,
        text: "Ich organisiere Generationen-Workshops zum Thema Zukunftsverantwortung.",
        consequence: "Jung und Alt lernen voneinander und entwickeln gemeinsame Lösungsansätze.",
        scores: { empathy: 9, humanRights: 8, participation: 8, civilCourage: 7 },
        perspective: "Generationendialog kann innovative Lösungen hervorbringen."
      }
    ],
    reflection: {
      question: "Wie können wir intergenerationale Gerechtigkeit leben?",
      learningPoint: "Nachhaltigkeit entsteht durch den Dialog zwischen den Generationen, nicht durch ihre Konfrontation."
    }
  },
  {
    id: 6,
    title: "Inklusion im Sport",
    description: "Behinderung und gesellschaftliche Teilhabe",
    situation: "Der örtliche Sportverein soll barrierefrei umgebaut werden. Einige Mitglieder beschweren sich über die Kosten und fragen, ob sich der Aufwand für 'so wenige Betroffene' lohnt. Sie sind im Vorstand. Wie entscheiden Sie?",
    choices: [
      {
        id: 1,
        text: "Ich setze mich vehement für den barrierefreien Umbau ein.",
        consequence: "Der Umbau wird beschlossen und der Verein wird zu einem Vorzeigemodell für Inklusion.",
        scores: { empathy: 8, humanRights: 9, participation: 7, civilCourage: 8 },
        perspective: "Menschenrechte sind nicht verhandelbar, auch nicht bei Kostenfragen."
      },
      {
        id: 2,
        text: "Ich lade Menschen mit Behinderungen ein, ihre Sicht zu schildern.",
        consequence: "Die persönlichen Geschichten überzeugen auch skeptische Mitglieder.",
        scores: { empathy: 9, humanRights: 8, participation: 8, civilCourage: 6 },
        perspective: "Betroffene sind die besten Botschafter*innen für ihre Anliegen."
      },
      {
        id: 3,
        text: "Ich schlage vor, nur die nötigsten Mindeststandards umzusetzen.",
        consequence: "Die Halbherzigkeit führt zu praktischen Problemen und schließt weiterhin Menschen aus.",
        scores: { empathy: 3, humanRights: 4, participation: 3, civilCourage: 2 },
        perspective: "Halbherzige Inklusion ist oft keine echte Inklusion."
      }
    ],
    reflection: {
      question: "Was bedeutet echte Teilhabe für alle Menschen?",
      learningPoint: "Inklusion ist kein Kostenfaktor, sondern eine Investition in eine gerechtere Gesellschaft für alle."
    }
  },
  {
    id: 7,
    title: "LGBTQ+ Akzeptanz",
    description: "Vielfalt in der Schule",
    situation: "Als Elternvertreter*in erfahren Sie, dass einige Eltern gegen eine geplante Aufklärungsveranstaltung zu sexueller Vielfalt protestieren. Andere unterstützen sie vehement. Die Schulleitung ist unsicher. Wie positionieren Sie sich?",
    choices: [
      {
        id: 1,
        text: "Ich organisiere einen Informationsabend mit Expert*innen und Betroffenen.",
        consequence: "Sachliche Information und persönliche Geschichten schaffen Verständnis bei den meisten Eltern.",
        scores: { empathy: 8, humanRights: 9, participation: 8, civilCourage: 7 },
        perspective: "Aufklärung ist der Schlüssel zu Akzeptanz."
      },
      {
        id: 2,
        text: "Ich unterstütze die Veranstaltung öffentlich und werbe für Toleranz.",
        consequence: "Sie polarisieren, gewinnen aber wichtige Verbündete für LGBTQ+-Rechte.",
        scores: { empathy: 6, humanRights: 8, participation: 6, civilCourage: 9 },
        perspective: "Manchmal braucht es mutige Positionierung."
      },
      {
        id: 3,
        text: "Ich schlage einen Kompromiss vor: nur freiwillige Teilnahme.",
        consequence: "Der Kompromiss schwächt die Botschaft der Gleichberechtigung ab.",
        scores: { empathy: 4, humanRights: 5, participation: 5, civilCourage: 3 },
        perspective: "Bei Grundrechten sind Kompromisse problematisch."
      }
    ],
    reflection: {
      question: "Wie können wir alle Kinder auf eine vielfältige Welt vorbereiten?",
      learningPoint: "Respekt für sexuelle und geschlechtliche Vielfalt ist Teil einer umfassenden Menschenrechtsbildung."
    }
  },
  {
    id: 8,
    title: "Bürgerbeteiligung",
    description: "Stadtplanung und Partizipation",
    situation: "Die Stadt plant ein neues Einkaufszentrum. Bürger*innen fordern stattdessen mehr Grünflächen und sozialen Wohnbau. Die Stadtverwaltung argumentiert mit Steuereinnahmen und Arbeitsplätzen. Sie können als Gemeinderat*in mitentscheiden.",
    choices: [
      {
        id: 1,
        text: "Ich initiiere eine Bürgerbefragung zu verschiedenen Nutzungsalternativen.",
        consequence: "Die Bürgerbeteiligung führt zu einem innovativen Mischkonzept, das viele zufriedenstellt.",
        scores: { empathy: 7, humanRights: 6, participation: 9, civilCourage: 6 },
        perspective: "Echte Demokratie lebt von der Beteiligung der Bürger*innen."
      },
      {
        id: 2,
        text: "Ich setze mich für bezahlbaren Wohnraum und Umweltschutz ein.",
        consequence: "Sie stehen für Ihre Überzeugungen ein, müssen aber um Mehrheiten kämpfen.",
        scores: { empathy: 8, humanRights: 8, participation: 6, civilCourage: 8 },
        perspective: "Manchmal müssen Politiker*innen gegen den Mainstream entscheiden."
      },
      {
        id: 3,
        text: "Ich folge der Verwaltungsempfehlung - die kennen sich am besten aus.",
        consequence: "Das Zentrum wird gebaut, aber viele Bürger*innen fühlen sich übergangen.",
        scores: { empathy: 3, humanRights: 4, participation: 2, civilCourage: 2 },
        perspective: "Delegation von Verantwortung kann demokratische Teilhabe untergraben."
      }
    ],
    reflection: {
      question: "Wie können wir das Gemeinwohl über Partikularinteressen stellen?",
      learningPoint: "Lebendige Demokratie braucht engagierte Bürger*innen, die sich für das Gemeinwohl einsetzen."
    }
  }
];

export function BridgeBuilding() {
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: 0,
    scores: {
      empathy: 0,
      humanRights: 0,
      participation: 0,
      civilCourage: 0
    },
    completedScenarios: [],
    totalChoices: 0,
    gamePhase: 'intro',
    selectedChoice: null,
    showFeedback: false
  });

  const currentScenario = SCENARIOS[gameState.currentScenario];
  const progress = (gameState.completedScenarios.length / SCENARIOS.length) * 100;

  const startGame = () => {
    setGameState(prev => ({ ...prev, gamePhase: 'playing' }));
  };

  const selectChoice = (choiceId: number) => {
    setGameState(prev => ({ ...prev, selectedChoice: choiceId }));
  };

  const submitChoice = () => {
    if (gameState.selectedChoice === null) return;

    const choice = currentScenario.choices.find(c => c.id === gameState.selectedChoice);
    if (!choice) return;

    setGameState(prev => ({
      ...prev,
      scores: {
        empathy: prev.scores.empathy + choice.scores.empathy,
        humanRights: prev.scores.humanRights + choice.scores.humanRights,
        participation: prev.scores.participation + choice.scores.participation,
        civilCourage: prev.scores.civilCourage + choice.scores.civilCourage
      },
      totalChoices: prev.totalChoices + 1,
      showFeedback: true
    }));
  };

  const nextScenario = () => {
    const newCompletedScenarios = [...gameState.completedScenarios, gameState.currentScenario];
    
    if (gameState.currentScenario < SCENARIOS.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentScenario: prev.currentScenario + 1,
        completedScenarios: newCompletedScenarios,
        selectedChoice: null,
        showFeedback: false,
        gamePhase: 'reflection'
      }));
      
      // Automatically move to next scenario after reflection
      setTimeout(() => {
        setGameState(prev => ({ ...prev, gamePhase: 'playing' }));
      }, 5000);
    } else {
      setGameState(prev => ({
        ...prev,
        completedScenarios: newCompletedScenarios,
        gamePhase: 'completed'
      }));
    }
  };

  const restartGame = () => {
    setGameState({
      currentScenario: 0,
      scores: {
        empathy: 0,
        humanRights: 0,
        participation: 0,
        civilCourage: 0
      },
      completedScenarios: [],
      totalChoices: 0,
      gamePhase: 'intro',
      selectedChoice: null,
      showFeedback: false
    });
  };

  const getDemocracyLevel = () => {
    const totalScore = Object.values(gameState.scores).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = SCENARIOS.length * 4 * 9; // 4 categories, max 9 points each
    const percentage = (totalScore / maxPossibleScore) * 100;
    
    if (percentage >= 80) return { level: "Demokratie-Champion", color: "text-green-600", icon: Trophy };
    if (percentage >= 60) return { level: "Brückenbauer*in", color: "text-blue-600", icon: Target };
    if (percentage >= 40) return { level: "Demokratie-Lernende*r", color: "text-yellow-600", icon: Star };
    return { level: "Demokratie-Entdecker*in", color: "text-purple-600", icon: Heart };
  };

  if (gameState.gamePhase === 'intro') {
    return (
      <section id="democracy-game" className="section-padding bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-brand-gradient text-white">
              Interactive Democracy Game
            </Badge>
            <h2 className="mb-6 text-gradient">
              Brücken Bauen 🌉
            </h2>
            <p className="lead max-w-3xl mx-auto mb-8">
              Ein interaktives Political Education Game über <strong>Empathie</strong>, <strong>Menschenrechte</strong> und <strong>demokratischen Zusammenhalt</strong>. 
              Erlebe realistische gesellschaftliche Szenarien und entdecke, wie Du zu einer gerechteren Gesellschaft beitragen kannst.
            </p>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1632870781574-fd9758881cb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBidWlsZGluZyUyMGNvbW11bml0eSUyMGNvbm5lY3Rpb258ZW58MXx8fHwxNzU5MDcxNDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Menschen bauen Brücken des Verständnisses"
                className="w-full h-64 md:h-80 object-cover"
              />
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="card-modern text-center h-full">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <h3 className="mb-2">Empathie entwickeln</h3>
                  <p className="small">
                    Verschiedene Perspektiven verstehen und nachvollziehen
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="card-modern text-center h-full">
                <CardContent className="p-6">
                  <Scale className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="mb-2">Menschenrechte</h3>
                  <p className="small">
                    Grundrechte als Basis des Zusammenlebens erkennen
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="card-modern text-center h-full">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="mb-2">Demokratie verstehen</h3>
                  <p className="small">
                    Demokratische Prozesse wertschätzen und mitgestalten
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="card-modern text-center h-full">
                <CardContent className="p-6">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="mb-2">Zivilcourage</h3>
                  <p className="small">
                    Mut entwickeln für das Richtige einzustehen
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <Card className="card-modern max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="mb-4">Spielkonzept</h3>
                <div className="space-y-4 text-left mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      <strong>8 realistische Szenarien</strong> aus dem gesellschaftlichen Leben
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      <strong>Multiple-Choice Entscheidungen</strong> mit realen Konsequenzen
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      <strong>Perspektivenwechsel</strong> und Empathie-Training
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      <strong>Demokratie-Score</strong> und persönliches Feedback
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-y-2 mb-6">
                  <p className="small text-muted-foreground">
                    <strong>Spieldauer:</strong> 20-30 Minuten
                  </p>
                  <p className="small text-muted-foreground">
                    <strong>Zielgruppe:</strong> Jugendliche ab 14 Jahren, Erwachsenenbildung
                  </p>
                </div>

                <Button 
                  onClick={startGame}
                  className="btn-primary-gradient"
                  size="lg"
                >
                  Spiel starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  if (gameState.gamePhase === 'reflection') {
    return (
      <section className="section-padding bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="card-modern">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                
                <h3 className="mb-4">Reflexion</h3>
                <p className="lead mb-6">
                  {currentScenario.reflection.question}
                </p>
                
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-none">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium mb-2 text-primary">
                      Lernpunkt:
                    </p>
                    <p>
                      {currentScenario.reflection.learningPoint}
                    </p>
                  </CardContent>
                </Card>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  className="mt-6"
                >
                  <p className="small text-muted-foreground mb-4">
                    Nächstes Szenario startet automatisch...
                  </p>
                  <Progress value={(3 / 5) * 100} className="w-full" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  if (gameState.gamePhase === 'completed') {
    const democracyLevel = getDemocracyLevel();
    const IconComponent = democracyLevel.icon;
    
    return (
      <section className="section-padding bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              className="mb-8"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="mb-4 text-gradient">
              Gratulation! 🎉
            </h2>
            <p className="lead mb-2">
              Du bist ein*e {democracyLevel.level}!
            </p>
            <p className="mb-8 text-muted-foreground">
              Du hast alle 8 Szenarien erfolgreich gemeistert und wichtige Erkenntnisse über Demokratie und Zusammenhalt gewonnen.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-red-500" />
                  <h4 className="mb-2">Empathie</h4>
                  <div className="text-2xl font-bold mb-2 text-primary">
                    {gameState.scores.empathy}
                  </div>
                  <Progress 
                    value={(gameState.scores.empathy / (SCENARIOS.length * 9)) * 100} 
                    className="w-full h-2"
                  />
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Scale className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h4 className="mb-2">Menschenrechte</h4>
                  <div className="text-2xl font-bold mb-2 text-primary">
                    {gameState.scores.humanRights}
                  </div>
                  <Progress 
                    value={(gameState.scores.humanRights / (SCENARIOS.length * 9)) * 100} 
                    className="w-full h-2"
                  />
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h4 className="mb-2">Partizipation</h4>
                  <div className="text-2xl font-bold mb-2 text-primary">
                    {gameState.scores.participation}
                  </div>
                  <Progress 
                    value={(gameState.scores.participation / (SCENARIOS.length * 9)) * 100} 
                    className="w-full h-2"
                  />
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                  <h4 className="mb-2">Zivilcourage</h4>
                  <div className="text-2xl font-bold mb-2 text-primary">
                    {gameState.scores.civilCourage}
                  </div>
                  <Progress 
                    value={(gameState.scores.civilCourage / (SCENARIOS.length * 9)) * 100} 
                    className="w-full h-2"
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="card-modern max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <h3 className="mb-4">Deine nächsten Schritte</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      Teile deine Erkenntnisse mit Freunden und Familie
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      Engagiere dich in lokalen Initiativen für Menschenrechte
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      Werde Mitglied bei Menschlichkeit Österreich
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="small">
                      Organisiere Diskussionsrunden in deinem Umfeld
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={restartGame}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nochmal spielen
              </Button>
              <Button 
                onClick={() => {
                  const element = document.getElementById('join');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary-gradient"
                size="lg"
              >
                Jetzt Mitglied werden
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Playing phase
  return (
    <section className="section-padding bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                Szenario {gameState.currentScenario + 1} von {SCENARIOS.length}
              </Badge>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{gameState.scores.empathy}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{gameState.scores.humanRights}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{gameState.scores.participation}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">{gameState.scores.civilCourage}</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </motion.div>

          {/* Scenario content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={gameState.currentScenario}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="card-modern mb-8">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="mb-2">{currentScenario.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentScenario.description}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 mb-6">
                    <p className="leading-relaxed">
                      {currentScenario.situation}
                    </p>
                  </div>

                  {!gameState.showFeedback ? (
                    <div className="space-y-4">
                      <h4 className="mb-4">Wie reagieren Sie?</h4>
                      {currentScenario.choices.map((choice) => (
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
                                <p className="flex-1">{choice.text}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      
                      <div className="text-center pt-4">
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {(() => {
                        const selectedChoice = currentScenario.choices.find(c => c.id === gameState.selectedChoice);
                        return selectedChoice ? (
                          <div className="space-y-6">
                            <h4>Konsequenz Ihrer Entscheidung:</h4>
                            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-none">
                              <CardContent className="p-6">
                                <p className="mb-4">{selectedChoice.consequence}</p>
                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium mb-2 text-primary">
                                    Perspektive:
                                  </p>
                                  <p className="text-sm">{selectedChoice.perspective}</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <div className="text-center">
                              <Button 
                                onClick={nextScenario}
                                className="btn-primary-gradient"
                                size="lg"
                              >
                                {gameState.currentScenario < SCENARIOS.length - 1 ? (
                                  <>
                                    Weiter zum nächsten Szenario
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                  </>
                                ) : (
                                  <>
                                    Spiel abschließen
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
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default BridgeBuilding;