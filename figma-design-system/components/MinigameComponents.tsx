import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Eye,
  AlertTriangle,
  Users,
  MessageCircle,
  Search,
  Shield,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { MinigameIcon } from './GameGraphics';

interface MinigameResult {
  score: number;
  maxScore: number;
  timeUsed: number;
  timeLimit: number;
  feedback: string;
  details?: any;
}

interface MinigameProps {
  onComplete: (result: MinigameResult) => void;
  timeLimit?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
}

// Fact-Check Arena Minigame
export function FactCheckArena({ onComplete, timeLimit = 180, difficulty = 3 }: MinigameProps) {
  const [currentClaim, setCurrentClaim] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'true' | 'false' | 'misleading' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const claims = [
    {
      id: 1,
      text: "Österreich hat die höchste Lebensqualität weltweit laut UN Human Development Index 2023.",
      source: "Angeblich UN HDI Bericht 2023",
      correct: "false",
      explanation: "Österreich rangiert auf Platz 25 im HDI 2023. Norwegen, Island und die Schweiz führen die Liste an.",
      difficulty: 2
    },
    {
      id: 2,
      text: "Die Wahlbeteiligung bei der österreichischen Nationalratswahl 2019 lag bei 75,6%.",
      source: "Bundesministerium für Inneres",
      correct: "true",
      explanation: "Das ist korrekt. Die offizielle Wahlbeteiligung lag bei genau 75,59%.",
      difficulty: 1
    },
    {
      id: 3,
      text: "In Wien leben mehr als 50% Menschen mit Migrationshintergrund.",
      source: "Statistik Austria 2022",
      correct: "misleading",
      explanation: "Etwa 46% haben Migrationshintergrund, aber der Begriff wird unterschiedlich definiert. Die Aussage ist vereinfachend.",
      difficulty: 4
    },
    {
      id: 4,
      text: "Das österreichische Pensionsalter liegt bei 67 Jahren für alle Personen.",
      source: "Pensionsversicherungsanstalt",
      correct: "false",
      explanation: "Das Regelpensionsalter liegt aktuell bei 65 Jahren für Männer und 60 Jahren für Frauen (wird schrittweise auf 65 angehoben).",
      difficulty: 3
    },
    {
      id: 5,
      text: "Österreich produziert 100% seines Stroms aus erneuerbaren Energien.",
      source: "E-Control Austria",
      correct: "false",
      explanation: "Österreich produziert etwa 75-80% seines Stroms aus erneuerbaren Energien, hauptsächlich Wasserkraft.",
      difficulty: 2
    }
  ];

  const filteredClaims = claims.filter(claim => claim.difficulty <= difficulty);
  const currentClaimData = filteredClaims[currentClaim];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentClaimData.correct;
    const points = isCorrect ? (6 - currentClaimData.difficulty) : 0;
    
    setScore(score + points);
    setResults([...results, {
      claim: currentClaimData,
      userAnswer: selectedAnswer,
      correct: isCorrect,
      points
    }]);

    setShowFeedback(true);
    
    setTimeout(() => {
      if (currentClaim < filteredClaims.length - 1) {
        setCurrentClaim(currentClaim + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        endGame();
      }
    }, 3000);
  };

  const endGame = () => {
    const maxPossibleScore = filteredClaims.reduce((sum, claim) => sum + (6 - claim.difficulty), 0);
    const result: MinigameResult = {
      score,
      maxScore: maxPossibleScore,
      timeUsed: timeLimit - timeLeft,
      timeLimit,
      feedback: score >= maxPossibleScore * 0.8 
        ? "Ausgezeichnet! Du hast ein sehr gutes Gespür für Falschinformationen."
        : score >= maxPossibleScore * 0.6
          ? "Gut gemacht! Mit etwas mehr Übung wirst du zum Fact-Check-Profi."
          : "Das war ein guter Anfang. Fact-Checking braucht Übung und kritisches Denken.",
      details: { results, claimsChecked: currentClaim + 1 }
    };
    onComplete(result);
  };

  if (!gameStarted) {
    return (
      <Card className="card-modern max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <MinigameIcon type="fact-check" size={80} />
          <CardTitle>Fact-Check Arena</CardTitle>
          <p className="text-muted-foreground">
            Prüfe {filteredClaims.length} Behauptungen in {timeLimit / 60} Minuten
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600">Wahr</div>
                <div className="text-muted-foreground">Faktisch korrekt</div>
              </div>
              <div>
                <div className="font-medium text-red-600">Falsch</div>
                <div className="text-muted-foreground">Faktisch falsch</div>
              </div>
              <div>
                <div className="font-medium text-yellow-600">Irreführend</div>
                <div className="text-muted-foreground">Verwirrend oder unvollständig</div>
              </div>
            </div>
          </div>
          <Button onClick={startGame} className="btn-primary-gradient" size="lg">
            <Clock className="w-5 h-5 mr-2" />
            Fact-Check starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showFeedback) {
    const isCorrect = selectedAnswer === currentClaimData.correct;
    return (
      <Card className="card-modern max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </motion.div>
          
          <h3 className={`mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'Richtig!' : 'Nicht ganz richtig'}
          </h3>
          
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm leading-relaxed">
              {currentClaimData.explanation}
            </p>
          </div>
          
          <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
            <span>Punkte: +{isCorrect ? (6 - currentClaimData.difficulty) : 0}</span>
            <span>•</span>
            <span>Gesamtscore: {score}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Behauptung {currentClaim + 1} von {filteredClaims.length}</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">
                {'★'.repeat(currentClaimData.difficulty)} Schwierigkeit
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Punkte</div>
          </div>
        </div>
        <Progress value={(currentClaim / filteredClaims.length) * 100} className="mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg">
          <p className="text-lg leading-relaxed mb-4">
            "{currentClaimData.text}"
          </p>
          <div className="text-sm text-muted-foreground">
            <strong>Quelle:</strong> {currentClaimData.source}
          </div>
        </div>

        <div className="space-y-3">
          <h4>Wie bewertest du diese Behauptung?</h4>
          
          <div className="grid gap-3">
            {[
              { value: 'true', label: 'Wahr', color: 'border-green-200 hover:bg-green-50', icon: CheckCircle, iconColor: 'text-green-600' },
              { value: 'false', label: 'Falsch', color: 'border-red-200 hover:bg-red-50', icon: XCircle, iconColor: 'text-red-600' },
              { value: 'misleading', label: 'Irreführend', color: 'border-yellow-200 hover:bg-yellow-50', icon: AlertTriangle, iconColor: 'text-yellow-600' }
            ].map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setSelectedAnswer(option.value as any)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAnswer === option.value
                      ? 'border-primary bg-primary/5'
                      : option.color
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <option.icon className={`w-5 h-5 ${option.iconColor}`} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <Button 
          onClick={submitAnswer}
          disabled={!selectedAnswer}
          className="w-full btn-primary-gradient"
          size="lg"
        >
          Antwort bestätigen
        </Button>
      </CardContent>
    </Card>
  );
}

// Bridge Puzzle Minigame
export function BridgePuzzle({ onComplete, timeLimit = 300, difficulty = 3 }: MinigameProps) {
  const [connections, setConnections] = useState<number[][]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Gesellschaftliche Gruppen für das Puzzle
  const groups = [
    { id: 0, name: "Jugendliche", values: ["Zukunft", "Innovation", "Gerechtigkeit"], position: { x: 50, y: 50 } },
    { id: 1, name: "Eltern", values: ["Familie", "Sicherheit", "Bildung"], position: { x: 150, y: 100 } },
    { id: 2, name: "Senior*innen", values: ["Erfahrung", "Stabilität", "Gesundheit"], position: { x: 250, y: 80 } },
    { id: 3, name: "Arbeiter*innen", values: ["Fairness", "Sicherheit", "Respekt"], position: { x: 100, y: 200 } },
    { id: 4, name: "Unternehmer*innen", values: ["Innovation", "Wachstum", "Flexibilität"], position: { x: 200, y: 180 } },
    { id: 5, name: "Migrant*innen", values: ["Integration", "Chancen", "Respekt"], position: { x: 150, y: 250 } }
  ];

  // Finde gemeinsame Werte zwischen Gruppen
  const getSharedValues = (group1: number, group2: number) => {
    const values1 = groups[group1].values;
    const values2 = groups[group2].values;
    return values1.filter(value => values2.includes(value));
  };

  const isValidConnection = (group1: number, group2: number) => {
    return getSharedValues(group1, group2).length > 0;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
  };

  const handleGroupClick = (groupId: number) => {
    if (selectedGroup === null) {
      setSelectedGroup(groupId);
    } else if (selectedGroup === groupId) {
      setSelectedGroup(null);
    } else {
      // Versuche Verbindung zu erstellen
      if (isValidConnection(selectedGroup, groupId)) {
        const newConnection = [selectedGroup, groupId].sort();
        const connectionExists = connections.some(conn => 
          conn[0] === newConnection[0] && conn[1] === newConnection[1]
        );
        
        if (!connectionExists) {
          setConnections([...connections, newConnection]);
          const sharedValues = getSharedValues(selectedGroup, groupId);
          setScore(score + sharedValues.length * 10);
        }
      }
      setSelectedGroup(null);
    }
  };

  const endGame = () => {
    // Berechne Bonuspunkte für Netzwerk-Effekte
    const networkBonus = connections.length >= 5 ? 50 : 0;
    const timeBonus = Math.max(0, timeLeft * 2);
    const finalScore = score + networkBonus + timeBonus;
    
    const result: MinigameResult = {
      score: finalScore,
      maxScore: 200,
      timeUsed: timeLimit - timeLeft,
      timeLimit,
      feedback: finalScore >= 160 
        ? "Fantastic! Du hast ein starkes Netzwerk aufgebaut und Gemeinsamkeiten erkannt."
        : finalScore >= 120
          ? "Gut gemacht! Deine Brücken verbinden verschiedene Gruppen erfolgreich."
          : "Ein solider Anfang. Gesellschaftliche Brücken brauchen Zeit und Verständnis.",
      details: { 
        connections: connections.length, 
        networkBonus,
        timeBonus,
        sharedValuesFound: connections.reduce((sum, conn) => 
          sum + getSharedValues(conn[0], conn[1]).length, 0
        )
      }
    };
    onComplete(result);
  };

  const areAllConnected = () => {
    // Prüfe ob alle Gruppen durch Brücken verbunden sind (Graph-Konnektivität)
    if (connections.length === 0) return false;
    
    const visited = new Set<number>();
    const queue = [0]; // Starte mit Gruppe 0
    visited.add(0);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      connections.forEach(([a, b]) => {
        if (a === current && !visited.has(b)) {
          visited.add(b);
          queue.push(b);
        } else if (b === current && !visited.has(a)) {
          visited.add(a);
          queue.push(a);
        }
      });
    }
    
    return visited.size === groups.length;
  };

  if (!gameStarted) {
    return (
      <Card className="card-modern max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <MinigameIcon type="bridge-puzzle" size={80} />
          <CardTitle>Brücken-Puzzle</CardTitle>
          <p className="text-muted-foreground">
            Verbinde gesellschaftliche Gruppen durch gemeinsame Werte
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4 mb-6">
            <p className="text-sm">
              Klicke auf zwei Gruppen, um eine Brücke zu bauen. 
              Brücken entstehen nur, wenn Gruppen gemeinsame Werte haben.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Punkte sammeln:</h4>
              <ul className="text-sm space-y-1">
                <li>• +10 pro gemeinsamen Wert</li>
                <li>• +50 Bonus wenn alle verbunden sind</li>
                <li>• +2 pro verbleibende Sekunde</li>
              </ul>
            </div>
          </div>
          <Button onClick={startGame} className="btn-primary-gradient" size="lg">
            <Target className="w-5 h-5 mr-2" />
            Puzzle starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gesellschaftliche Brücken bauen</CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Badge>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Punkte</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 min-h-[400px]">
          {/* SVG für Verbindungen */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((connection, index) => {
              const [groupA, groupB] = connection;
              const posA = groups[groupA].position;
              const posB = groups[groupB].position;
              const sharedValues = getSharedValues(groupA, groupB);
              
              return (
                <g key={index}>
                  <line
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  {/* Gemeinsame Werte als Labels */}
                  <text
                    x={(posA.x + posB.x) / 2}
                    y={(posA.y + posB.y) / 2}
                    fill="#1d4ed8"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {sharedValues.join(', ')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Gruppen */}
          {groups.map((group) => (
            <motion.div
              key={group.id}
              style={{
                position: 'absolute',
                left: group.position.x - 40,
                top: group.position.y - 40,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-20 h-20 rounded-full border-3 cursor-pointer transition-all ${
                selectedGroup === group.id
                  ? 'border-primary bg-primary text-white shadow-lg'
                  : 'border-muted bg-white hover:border-primary/50 shadow-md'
              }`}
              onClick={() => handleGroupClick(group.id)}
            >
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-1">
                <div className="text-xs font-medium leading-tight">
                  {group.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Anzeige */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {connections.length} Brücken gebaut • {areAllConnected() ? 'Alle verbunden!' : 'Noch nicht alle verbunden'}
          </div>
          <Button 
            onClick={endGame}
            variant="outline"
          >
            Puzzle beenden
          </Button>
        </div>

        {/* Werte-Legende */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-muted/50 p-3 rounded">
              <div className="font-medium text-sm mb-1">{group.name}</div>
              <div className="text-xs text-muted-foreground">
                {group.values.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Export all minigames
export const MinigameComponents = {
  FactCheckArena,
  BridgePuzzle,
  // Weitere Minigames würden hier folgen:
  // DebateDuel,
  // CitySim,
  // CrisisCouncil,
  // DialogRPG,
  // NetworkAnalysis
};

export default MinigameComponents;