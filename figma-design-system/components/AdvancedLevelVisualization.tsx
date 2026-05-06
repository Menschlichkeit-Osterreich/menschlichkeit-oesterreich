import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Map,
  Trophy,
  Star,
  Lock,
  Unlock,
  CheckCircle,
  Circle,
  Target,
  Zap,
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
  Network,
  Globe,
  Layers
} from 'lucide-react';
import { ProgressVisualization, LevelThumbnail } from './GameGraphics';
import GameDataGenerator, { type Chapter, type GameLevel } from './GameDataGenerator';

interface LevelNode {
  id: number;
  title: string;
  chapter: number;
  difficulty: number;
  position: { x: number; y: number };
  completed: boolean;
  locked: boolean;
  category: string;
  connections: number[];
}

interface WorldMapProps {
  chapters: Chapter[];
  currentChapter: number;
  completedChapters: number[];
  onChapterSelect: (chapterId: number) => void;
}

interface ProgressOverviewProps {
  totalLevels: number;
  completedLevels: number[];
  currentLevel: number;
  playerStats: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
}

// Interactive World Map Component
export function WorldMap({ chapters, currentChapter, completedChapters, onChapterSelect }: WorldMapProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const svgRef = useRef<SVGSVGElement>(null);

  // Chapter positions auf einer stilisierten Weltkarte
  const chapterPositions = [
    { x: 150, y: 200, region: "neighborhood" }, // Nachbarschaft
    { x: 250, y: 180, region: "workplace" },    // Arbeitsplatz
    { x: 350, y: 160, region: "digital" },      // Digital
    { x: 180, y: 120, region: "society" },      // Gesellschaft
    { x: 320, y: 100, region: "politics" },     // Politik
    { x: 200, y: 300, region: "crisis" },       // Krise
    { x: 400, y: 250, region: "climate" },      // Klima
    { x: 500, y: 150, region: "global" },       // Global
    { x: 420, y: 80, region: "democracy" },     // Demokratie
    { x: 550, y: 200, region: "future" }        // Zukunft
  ];

  const getChapterStatus = (chapterId: number) => {
    if (completedChapters.includes(chapterId)) return 'completed';
    if (chapterId === currentChapter) return 'current';
    if (chapterId <= currentChapter + 1) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'current': return '#3b82f6';
      case 'available': return '#f59e0b';
      case 'locked': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const handleChapterClick = (chapterId: number) => {
    const status = getChapterStatus(chapterId);
    if (status !== 'locked') {
      setSelectedChapter(chapterId);
      onChapterSelect(chapterId);
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Democracy World Map</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Übersicht
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              <Layers className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox="0 0 600 400"
            className="w-full h-96 border rounded-lg bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700"
          >
            {/* Hintergrund-Kontinente */}
            <g opacity="0.1" fill="#6b7280">
              <ellipse cx="200" cy="150" rx="120" ry="80" />
              <ellipse cx="450" cy="180" rx="100" ry="70" />
              <ellipse cx="350" cy="280" rx="80" ry="50" />
            </g>

            {/* Verbindungslinien zwischen Kapiteln */}
            {viewMode === 'detailed' && chapters.map((chapter, index) => {
              if (index === 0) return null;
              const currentPos = chapterPositions[index];
              const prevPos = chapterPositions[index - 1];
              const currentStatus = getChapterStatus(chapter.id);
              
              return (
                <line
                  key={`connection-${chapter.id}`}
                  x1={prevPos.x}
                  y1={prevPos.y}
                  x2={currentPos.x}
                  y2={currentPos.y}
                  stroke={currentStatus === 'locked' ? '#e5e7eb' : '#3b82f6'}
                  strokeWidth="2"
                  strokeDasharray={currentStatus === 'locked' ? '5,5' : 'none'}
                  opacity="0.6"
                />
              );
            })}

            {/* Kapitel-Nodes */}
            {chapters.map((chapter, index) => {
              const position = chapterPositions[index];
              const status = getChapterStatus(chapter.id);
              const isSelected = selectedChapter === chapter.id;
              
              return (
                <g key={chapter.id}>
                  {/* Node Background */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={isSelected ? "28" : "25"}
                    fill={getStatusColor(status)}
                    stroke={isSelected ? "#1d4ed8" : "white"}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="cursor-pointer transition-all"
                    onClick={() => handleChapterClick(chapter.id)}
                  >
                    {status !== 'locked' && (
                      <animate
                        attributeName="r"
                        values={isSelected ? "25;30;25" : "25;27;25"}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>

                  {/* Chapter Number/Icon */}
                  <text
                    x={position.x}
                    y={position.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {status === 'completed' ? '✓' : 
                     status === 'locked' ? '🔒' : 
                     chapter.id}
                  </text>

                  {/* Chapter Title */}
                  <text
                    x={position.x}
                    y={position.y + 45}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="11"
                    fontWeight="medium"
                    className="pointer-events-none"
                  >
                    {chapter.title.split(' ')[0]}
                  </text>

                  {/* Progress Ring for current chapter */}
                  {status === 'current' && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="30"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="60 120"
                      opacity="0.7"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0;360"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Completion indicator */}
                  {status === 'completed' && (
                    <circle
                      cx={position.x + 15}
                      cy={position.y - 15}
                      r="8"
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Current Path Indicator */}
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            
            {/* Legend */}
            <g transform="translate(20, 350)">
              <rect x="0" y="0" width="200" height="35" fill="white" stroke="#e5e7eb" rx="5" opacity="0.9"/>
              <circle cx="15" cy="15" r="5" fill="#22c55e" />
              <text x="25" y="18" fontSize="10">Abgeschlossen</text>
              <circle cx="90" cy="15" r="5" fill="#3b82f6" />
              <text x="100" y="18" fontSize="10">Aktuell</text>
              <circle cx="140" cy="15" r="5" fill="#9ca3af" />
              <text x="150" y="18" fontSize="10">Gesperrt</text>
            </g>
          </svg>

          {/* Chapter Details Panel */}
          <AnimatePresence>
            {selectedChapter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-4 right-4 max-w-sm"
              >
                <Card className="card-modern shadow-lg">
                  <CardContent className="p-4">
                    {(() => {
                      const chapter = chapters.find(c => c.id === selectedChapter);
                      if (!chapter) return null;
                      
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{chapter.title}</h4>
                            <Badge variant="outline">
                              {chapter.iconSymbol}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {chapter.description}
                          </p>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Level:</span>
                              <span>{chapter.levelRange[0]}-{chapter.levelRange[1]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dauer:</span>
                              <span>{chapter.estimatedDuration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge 
                                variant={getChapterStatus(chapter.id) === 'completed' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {getChapterStatus(chapter.id) === 'completed' ? 'Abgeschlossen' :
                                 getChapterStatus(chapter.id) === 'current' ? 'Aktuell' :
                                 getChapterStatus(chapter.id) === 'available' ? 'Verfügbar' : 'Gesperrt'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Progress Overview
export function ProgressOverview({ totalLevels, completedLevels, currentLevel, playerStats }: ProgressOverviewProps) {
  const overallProgress = (completedLevels.length / totalLevels) * 100;
  const totalStats = Object.values(playerStats).reduce((sum, stat) => sum + stat, 0);
  const avgStat = totalStats / 4;

  // Berechne Demokratie-Profil
  const getDemocracyProfile = () => {
    if (avgStat >= 80) return { level: "Demokratie-Visionär", color: "text-purple-600", description: "Du gestaltest die Zukunft" };
    if (avgStat >= 65) return { level: "Demokratie-Champion", color: "text-green-600", description: "Du bist ein Vorbild" };
    if (avgStat >= 50) return { level: "Brückenbauer*in", color: "text-blue-600", description: "Du verbindest Menschen" };
    if (avgStat >= 35) return { level: "Demokratie-Lernende*r", color: "text-yellow-600", description: "Du entwickelst dich" };
    return { level: "Demokratie-Entdecker*in", color: "text-purple-600", description: "Du startest die Reise" };
  };

  const profile = getDemocracyProfile();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Gesamtfortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level abgeschlossen</span>
              <span className="text-2xl font-bold text-primary">
                {completedLevels.length} / {totalLevels}
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(overallProgress)}% der Democracy Journey
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Profile */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Dein Demokratie-Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${profile.color}`}>
              {profile.level}
            </h3>
            <p className="text-muted-foreground">{profile.description}</p>
          </div>

          {/* Stats Visualization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <ProgressVisualization
                  type="bridge"
                  progress={(playerStats.empathy / 100) * 100}
                  size={64}
                />
              </div>
              <div className="text-sm font-medium">Empathie</div>
              <div className="text-xs text-muted-foreground">{playerStats.empathy}/100</div>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <ProgressVisualization
                  type="bridge"
                  progress={(playerStats.humanRights / 100) * 100}
                  size={64}
                />
              </div>
              <div className="text-sm font-medium">Menschenrechte</div>
              <div className="text-xs text-muted-foreground">{playerStats.humanRights}/100</div>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <ProgressVisualization
                  type="bridge"
                  progress={(playerStats.participation / 100) * 100}
                  size={64}
                />
              </div>
              <div className="text-sm font-medium">Partizipation</div>
              <div className="text-xs text-muted-foreground">{playerStats.participation}/100</div>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <ProgressVisualization
                  type="bridge"
                  progress={(playerStats.civilCourage / 100) * 100}
                  size={64}
                />
              </div>
              <div className="text-sm font-medium">Zivilcourage</div>
              <div className="text-xs text-muted-foreground">{playerStats.civilCourage}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Preview */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Nächste Meilensteine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Erstes Kapitel meistern</div>
                <Progress value={(completedLevels.filter(l => l <= 10).length / 10) * 100} className="h-2 mt-1" />
              </div>
              <Badge variant="outline">
                {completedLevels.filter(l => l <= 10).length}/10
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Empathie-Experte werden</div>
                <Progress value={playerStats.empathy} className="h-2 mt-1" />
              </div>
              <Badge variant="outline">
                {playerStats.empathy}/100
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">50 Level abschließen</div>
                <Progress value={(completedLevels.length / 50) * 100} className="h-2 mt-1" />
              </div>
              <Badge variant="outline">
                {completedLevels.length}/50
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Level Network Visualization
export function LevelNetwork({ levels, onLevelSelect }: { levels: LevelNode[], onLevelSelect: (levelId: number) => void }) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <Card className="card-modern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Network className="w-5 h-5 mr-2 text-primary" />
            Level Netzwerk
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            >
              -
            </Button>
            <span className="text-sm px-2 py-1">{Math.round(zoomLevel * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            >
              +
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative overflow-auto max-h-96">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Verbindungslinien */}
            {levels.map(level => 
              level.connections.map(targetId => {
                const target = levels.find(l => l.id === targetId);
                if (!target) return null;
                
                return (
                  <line
                    key={`${level.id}-${targetId}`}
                    x1={level.position.x}
                    y1={level.position.y}
                    x2={target.position.x}
                    y2={target.position.y}
                    stroke={level.completed && target.completed ? "#22c55e" : "#e5e7eb"}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                );
              })
            )}

            {/* Level Nodes */}
            {levels.map(level => (
              <g key={level.id}>
                <circle
                  cx={level.position.x}
                  cy={level.position.y}
                  r={selectedLevel === level.id ? "20" : "15"}
                  fill={
                    level.completed ? "#22c55e" :
                    level.locked ? "#9ca3af" : "#3b82f6"
                  }
                  stroke={selectedLevel === level.id ? "#1d4ed8" : "white"}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedLevel(level.id);
                    onLevelSelect(level.id);
                  }}
                />
                
                <text
                  x={level.position.x}
                  y={level.position.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {level.completed ? '✓' : level.locked ? '🔒' : level.id}
                </text>

                {/* Level Title */}
                <text
                  x={level.position.x}
                  y={level.position.y + 30}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {level.title.length > 15 ? level.title.substring(0, 15) + '...' : level.title}
                </text>

                {/* Difficulty Stars */}
                <text
                  x={level.position.x}
                  y={level.position.y - 25}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="8"
                >
                  {'★'.repeat(level.difficulty)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Selected Level Info */}
        {selectedLevel && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            {(() => {
              const level = levels.find(l => l.id === selectedLevel);
              if (!level) return null;
              
              return (
                <div>
                  <h4 className="font-semibold mb-2">{level.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kapitel:</span>
                      <span className="ml-2">{level.chapter}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Schwierigkeit:</span>
                      <span className="ml-2">{'★'.repeat(level.difficulty)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        {level.completed ? 'Abgeschlossen' : 
                         level.locked ? 'Gesperrt' : 'Verfügbar'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kategorie:</span>
                      <span className="ml-2">{level.category}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default {
  WorldMap,
  ProgressOverview,
  LevelNetwork
};