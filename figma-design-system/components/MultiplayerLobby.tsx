import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Users,
  Globe,
  Lock,
  Unlock,
  Crown,
  Star,
  Copy,
  Check,
  Play,
  Settings,
  UserPlus,
  MessageCircle,
  Wifi,
  WifiOff,
  Trophy,
  Target,
  BookOpen,
  Sparkles,
  Zap,
  GraduationCap,
  School
} from 'lucide-react';
import { Advanced3DCard, AnimatedCounter, HolographicBadge, DynamicBackground } from './Enhanced3DGameGraphics';

interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  role: 'host' | 'player';
  ready: boolean;
  status: 'online' | 'away' | 'offline';
  stats: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
}

interface Room {
  id: string;
  name: string;
  host: string;
  mode: 'cooperative' | 'competitive' | 'classroom';
  chapter: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'playing' | 'completed';
}

interface MultiplayerLobbyProps {
  currentPlayer: Player;
  onStartGame: (roomId: string, players: Player[]) => void;
  onLeaveRoom: () => void;
}

export function MultiplayerLobby({
  currentPlayer,
  onStartGame,
  onLeaveRoom
}: MultiplayerLobbyProps) {
  const [view, setView] = useState<'browse' | 'create' | 'room'>('browse');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([currentPlayer]);
  const [roomCode, setRoomCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ player: string; message: string; timestamp: string }>>([]);

  // Mock Rooms für Demo
  const [availableRooms] = useState<Room[]>([
    {
      id: 'room-1',
      name: 'Nachbarschafts-Challenge',
      host: 'Anna M.',
      mode: 'cooperative',
      chapter: 1,
      difficulty: 2,
      maxPlayers: 4,
      currentPlayers: 2,
      isPrivate: false,
      status: 'waiting'
    },
    {
      id: 'room-2',
      name: 'Arbeitsplatz-Dilemmas',
      host: 'Thomas K.',
      mode: 'competitive',
      chapter: 2,
      difficulty: 3,
      maxPlayers: 6,
      currentPlayers: 4,
      isPrivate: false,
      status: 'waiting'
    },
    {
      id: 'room-3',
      name: 'Schulklasse 7B - Democracy Training',
      host: 'Frau Schmidt',
      mode: 'classroom',
      chapter: 1,
      difficulty: 1,
      maxPlayers: 30,
      currentPlayers: 18,
      isPrivate: true,
      status: 'waiting'
    },
    {
      id: 'room-4',
      name: 'Boss-Fight: Der Populist',
      host: 'DemocracyPro',
      mode: 'cooperative',
      chapter: 5,
      difficulty: 5,
      maxPlayers: 4,
      currentPlayers: 3,
      isPrivate: false,
      status: 'waiting'
    }
  ]);

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newRoomCode);
    setCurrentRoom({
      id: 'new-room',
      name: 'Mein Raum',
      host: currentPlayer.name,
      mode: 'cooperative',
      chapter: 1,
      difficulty: 2,
      maxPlayers: 4,
      currentPlayers: 1,
      isPrivate: false,
      status: 'waiting'
    });
    setView('room');
  };

  const joinRoom = (room: Room) => {
    setCurrentRoom(room);
    setView('room');
    // In einer echten Implementierung würden hier Server-Calls erfolgen
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          player: currentPlayer.name,
          message: chatMessage,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setChatMessage('');
    }
  };

  const toggleReady = () => {
    setPlayers(players.map(p =>
      p.id === currentPlayer.id ? { ...p, ready: !p.ready } : p
    ));
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'cooperative': return Users;
      case 'competitive': return Trophy;
      case 'classroom': return School;
      default: return Users;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'cooperative': return 'Kooperativ';
      case 'competitive': return 'Kompetitiv';
      case 'classroom': return 'Klassenraum';
      default: return mode;
    }
  };

  // Browse Rooms View
  if (view === 'browse') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <DynamicBackground variant="network" intensity="medium" color="#3b82f6" animated={true} />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <HolographicBadge
              icon={<Globe />}
              title="Multiplayer Lobby"
              description="Spiele mit Freunden und der Community"
              rarity="epic"
              size="large"
            />
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Advanced3DCard glowColor="#3b82f6" className="cursor-pointer" onClick={createRoom}>
                <CardContent className="p-6 text-center">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="mb-2">Raum erstellen</h4>
                  <p className="text-sm text-muted-foreground">
                    Erstelle deinen eigenen Multiplayer-Raum
                  </p>
                </CardContent>
              </Advanced3DCard>

              <Advanced3DCard glowColor="#22c55e">
                <CardContent className="p-6 text-center">
                  <div className="flex space-x-2 mb-3">
                    <Input
                      placeholder="Raum-Code eingeben"
                      className="flex-1"
                      onChange={(e) => setRoomCode(e.target.value)}
                    />
                    <Button className="btn-primary-gradient">
                      Beitreten
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trete einem privaten Raum mit Code bei
                  </p>
                </CardContent>
              </Advanced3DCard>
            </div>

            {/* Room List */}
            <Advanced3DCard glowColor="#8b5cf6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Verfügbare Räume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableRooms.map((room) => {
                    const ModeIcon = getModeIcon(room.mode);
                    return (
                      <motion.div
                        key={room.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="cursor-pointer hover:border-primary transition-all"
                          onClick={() => joinRoom(room)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                  <ModeIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5>{room.name}</h5>
                                    {room.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>Host: {room.host}</span>
                                    <span>•</span>
                                    <span>{getModeLabel(room.mode)}</span>
                                    <span>•</span>
                                    <span>Kapitel {room.chapter}</span>
                                    <span>•</span>
                                    <span>{'★'.repeat(room.difficulty)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {room.currentPlayers}/{room.maxPlayers}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Spieler</div>
                                </div>
                                <Button className="btn-primary-gradient">
                                  Beitreten
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Advanced3DCard>
          </div>
        </div>
      </div>
    );
  }

  // Room View
  if (view === 'room' && currentRoom) {
    const allPlayersReady = players.every(p => p.ready || p.role === 'host');
    const isHost = currentPlayer.id === players.find(p => p.role === 'host')?.id;

    return (
      <div className="relative min-h-screen overflow-hidden">
        <DynamicBackground variant="geometric" intensity="medium" color="#8b5cf6" animated={true} />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Room Header */}
            <Advanced3DCard glowColor="#8b5cf6" className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3>{currentRoom.name}</h3>
                      <Badge>{getModeLabel(currentRoom.mode)}</Badge>
                      {currentRoom.isPrivate && (
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          Privat
                        </Badge>
                      )}
                    </div>
                    {roomCode && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Raum-Code:</span>
                        <code className="px-3 py-1 bg-muted rounded text-lg font-mono font-bold">
                          {roomCode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyRoomCode}
                        >
                          {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setView('browse');
                      onLeaveRoom();
                    }}
                  >
                    Raum verlassen
                  </Button>
                </div>
              </CardHeader>
            </Advanced3DCard>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Players List */}
              <div className="lg:col-span-2 space-y-4">
                <Advanced3DCard glowColor="#3b82f6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Spieler ({players.length}/{currentRoom.maxPlayers})
                      </span>
                      <Progress 
                        value={(players.length / currentRoom.maxPlayers) * 100} 
                        className="w-32 h-2"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {players.map((player) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className={player.ready ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-white font-bold">
                                      {player.name.charAt(0)}
                                    </span>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{player.name}</span>
                                      {player.role === 'host' && (
                                        <Badge variant="secondary">
                                          <Crown className="w-3 h-3 mr-1" />
                                          Host
                                        </Badge>
                                      )}
                                      {player.status === 'online' && (
                                        <Wifi className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                      <span>Level {player.level}</span>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        <span>{Object.values(player.stats).reduce((a, b) => a + b, 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {player.ready ? (
                                  <Badge className="bg-green-500">
                                    <Check className="w-3 h-3 mr-1" />
                                    Bereit
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    Wartet...
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Advanced3DCard>

                {/* Chat */}
                <Advanced3DCard glowColor="#22c55e">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-48 overflow-y-auto space-y-2 mb-4">
                        {chatMessages.map((msg, index) => (
                          <div key={index} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{msg.player}</span>
                              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        ))}
                        {chatMessages.length === 0 && (
                          <div className="text-center text-muted-foreground text-sm py-8">
                            Noch keine Nachrichten. Sei der/die Erste!
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Nachricht eingeben..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} className="btn-primary-gradient">
                          Senden
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Advanced3DCard>
              </div>

              {/* Room Settings & Actions */}
              <div className="space-y-4">
                <Advanced3DCard glowColor="#f59e0b">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Einstellungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Spielmodus</label>
                      <Select value={currentRoom.mode} disabled={!isHost}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cooperative">Kooperativ</SelectItem>
                          <SelectItem value="competitive">Kompetitiv</SelectItem>
                          <SelectItem value="classroom">Klassenraum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Kapitel</label>
                      <Select value={currentRoom.chapter.toString()} disabled={!isHost}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Kapitel {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Schwierigkeit</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            disabled={!isHost}
                            className={`flex-1 py-2 rounded ${
                              currentRoom.difficulty >= level
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            } ${isHost ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Advanced3DCard>

                {/* Ready Button */}
                <Advanced3DCard glowColor={players.find(p => p.id === currentPlayer.id)?.ready ? '#22c55e' : '#3b82f6'}>
                  <CardContent className="p-6 text-center">
                    {isHost ? (
                      <>
                        <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <h4 className="mb-2">Du bist der Host</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Warte, bis alle Spieler bereit sind
                        </p>
                        <Button
                          onClick={() => onStartGame(currentRoom.id, players)}
                          disabled={!allPlayersReady || players.length < 2}
                          className="w-full btn-primary-gradient"
                          size="lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Spiel starten
                        </Button>
                      </>
                    ) : (
                      <>
                        <Target className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <Button
                          onClick={toggleReady}
                          className={`w-full ${
                            players.find(p => p.id === currentPlayer.id)?.ready
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'btn-primary-gradient'
                          }`}
                          size="lg"
                        >
                          {players.find(p => p.id === currentPlayer.id)?.ready ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Bereit!
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Bereit machen
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-4">
                          {allPlayersReady
                            ? 'Alle bereit! Warte auf Host...'
                            : 'Warte auf andere Spieler...'}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Advanced3DCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default MultiplayerLobby;