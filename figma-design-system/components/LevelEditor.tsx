import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Plus,
  Trash2,
  Eye,
  Save,
  Download,
  Upload,
  Settings,
  Users,
  Target,
  BookOpen,
  Gamepad2,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Zap
} from 'lucide-react';
import { MinigameIcon, StakeholderAvatar, LevelThumbnail } from './GameGraphics';
import GameDataGenerator, { 
  type GameLevel, 
  type ScenarioData, 
  type Stakeholder, 
  type Choice,
  type StakeholderReaction
} from './GameDataGenerator';

interface LevelEditorProps {
  onSave?: (level: GameLevel) => void;
  onPreview?: (level: GameLevel) => void;
  initialLevel?: GameLevel;
  mode?: 'create' | 'edit' | 'template';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function LevelEditor({ 
  onSave, 
  onPreview, 
  initialLevel,
  mode = 'create' 
}: LevelEditorProps) {
  const [currentLevel, setCurrentLevel] = useState<Partial<GameLevel>>(
    initialLevel || {
      id: 0,
      chapter: 1,
      title: '',
      description: '',
      category: 'scenario',
      difficulty: 1,
      estimatedTime: 10,
      learningObjectives: [''],
      scenario: {
        situation: '',
        context: '',
        stakeholders: [],
        choices: [],
        reflection: {
          question: '',
          learningPoint: '',
          transferQuestions: [''],
          discussionPrompts: ['']
        },
        realWorldConnection: ''
      },
      unlockRequirements: [],
      rewards: []
    }
  );

  const [activeTab, setActiveTab] = useState('basic');
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: []
  });
  const [showPreview, setShowPreview] = useState(false);

  // Validation Logic
  useEffect(() => {
    validateLevel();
  }, [currentLevel]);

  const validateLevel = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic Validation
    if (!currentLevel.title?.trim()) errors.push('Titel ist erforderlich');
    if (!currentLevel.description?.trim()) errors.push('Beschreibung ist erforderlich');
    if (!currentLevel.learningObjectives?.some(obj => obj.trim())) {
      errors.push('Mindestens ein Lernziel ist erforderlich');
    }

    // Scenario Validation
    if (currentLevel.category === 'scenario' && currentLevel.scenario) {
      if (!currentLevel.scenario.situation?.trim()) {
        errors.push('Situationsbeschreibung ist erforderlich');
      }
      if (!currentLevel.scenario.stakeholders?.length) {
        errors.push('Mindestens ein Stakeholder ist erforderlich');
      }
      if (!currentLevel.scenario.choices?.length) {
        errors.push('Mindestens eine Entscheidungsoption ist erforderlich');
      }
      if (currentLevel.scenario.choices && currentLevel.scenario.choices.length < 2) {
        warnings.push('Empfohlen: Mindestens 2 Entscheidungsoptionen für bessere Lernerfahrung');
      }
      if (currentLevel.scenario.stakeholders && currentLevel.scenario.stakeholders.length > 5) {
        warnings.push('Mehr als 5 Stakeholder können die Übersichtlichkeit beeinträchtigen');
      }
    }

    // Time Validation
    if (currentLevel.estimatedTime && currentLevel.estimatedTime > 45) {
      warnings.push('Level über 45 Minuten können die Aufmerksamkeit überfordern');
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  // Level Data Handlers
  const updateLevel = (path: string, value: any) => {
    setCurrentLevel(prev => {
      const newLevel = { ...prev };
      const keys = path.split('.');
      let current: any = newLevel;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newLevel;
    });
  };

  const addStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: `stakeholder-${Date.now()}`,
      name: '',
      role: '',
      motivation: '',
      concerns: [''],
      power: 5,
      influence: 5
    };

    setCurrentLevel(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario!,
        stakeholders: [...(prev.scenario?.stakeholders || []), newStakeholder]
      }
    }));
  };

  const removeStakeholder = (index: number) => {
    setCurrentLevel(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario!,
        stakeholders: prev.scenario?.stakeholders?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addChoice = () => {
    const newChoice: Choice = {
      id: (currentLevel.scenario?.choices?.length || 0) + 1,
      text: '',
      shortTermConsequence: '',
      longTermConsequence: '',
      stakeholderReactions: [],
      scores: {
        empathy: 0,
        humanRights: 0,
        participation: 0,
        civilCourage: 0
      },
      difficulty: 1
    };

    setCurrentLevel(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario!,
        choices: [...(prev.scenario?.choices || []), newChoice]
      }
    }));
  };

  const removeChoice = (index: number) => {
    setCurrentLevel(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario!,
        choices: prev.scenario?.choices?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addLearningObjective = () => {
    setCurrentLevel(prev => ({
      ...prev,
      learningObjectives: [...(prev.learningObjectives || []), '']
    }));
  };

  const handleSave = () => {
    if (validation.isValid && onSave) {
      onSave(currentLevel as GameLevel);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(currentLevel as GameLevel);
    }
    setShowPreview(true);
  };

  const exportLevel = () => {
    const dataStr = JSON.stringify(currentLevel, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `level-${currentLevel.title?.replace(/\s+/g, '-').toLowerCase() || 'unnamed'}.json`;
    link.click();
  };

  const importLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setCurrentLevel(imported);
        } catch (error) {
          alert('Fehler beim Importieren der Datei');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Level Editor</h1>
          <p className="text-muted-foreground">
            {mode === 'create' ? 'Erstelle ein neues Democracy Level' : 
             mode === 'edit' ? 'Bearbeite bestehendes Level' : 
             'Verwende Template als Grundlage'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importLevel}
            className="hidden"
            id="import-level"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-level')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={exportLevel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Vorschau
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!validation.isValid}
            className="btn-primary-gradient"
          >
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <Card className="border-warning bg-warning-50 dark:bg-warning-900/20">
          <CardContent className="p-4">
            {validation.errors.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center text-destructive mb-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Fehler ({validation.errors.length})</span>
                </div>
                <ul className="text-sm space-y-1 ml-6">
                  {validation.errors.map((error, i) => (
                    <li key={i} className="text-destructive">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div>
                <div className="flex items-center text-warning mb-2">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="font-medium">Warnungen ({validation.warnings.length})</span>
                </div>
                <ul className="text-sm space-y-1 ml-6">
                  {validation.warnings.map((warning, i) => (
                    <li key={i} className="text-warning">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">
            <Settings className="w-4 h-4 mr-2" />
            Grundlagen
          </TabsTrigger>
          <TabsTrigger value="scenario">
            <BookOpen className="w-4 h-4 mr-2" />
            Szenario
          </TabsTrigger>
          <TabsTrigger value="stakeholders">
            <Users className="w-4 h-4 mr-2" />
            Stakeholder
          </TabsTrigger>
          <TabsTrigger value="choices">
            <Target className="w-4 h-4 mr-2" />
            Entscheidungen
          </TabsTrigger>
          <TabsTrigger value="reflection">
            <Lightbulb className="w-4 h-4 mr-2" />
            Reflexion
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Level Grundlagen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={currentLevel.title || ''}
                    onChange={(e) => updateLevel('title', e.target.value)}
                    placeholder="z.B. Nachbarschaftskonflikt"
                  />
                </div>
                
                <div>
                  <Label htmlFor="chapter">Kapitel</Label>
                  <Select 
                    value={currentLevel.chapter?.toString()} 
                    onValueChange={(value) => updateLevel('chapter', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kapitel wählen" />
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
              </div>

              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={currentLevel.description || ''}
                  onChange={(e) => updateLevel('description', e.target.value)}
                  placeholder="Kurze Beschreibung des Levels"
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={currentLevel.category} 
                    onValueChange={(value) => updateLevel('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scenario">Szenario</SelectItem>
                      <SelectItem value="minigame">Minigame</SelectItem>
                      <SelectItem value="boss">Boss-Kampf</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Schwierigkeit</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[currentLevel.difficulty || 1]}
                      onValueChange={(value) => updateLevel('difficulty', value[0])}
                      max={5}
                      min={1}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">
                      {'★'.repeat(currentLevel.difficulty || 1)} ({currentLevel.difficulty || 1}/5)
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="time">Geschätzte Zeit (Min)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={currentLevel.estimatedTime || ''}
                    onChange={(e) => updateLevel('estimatedTime', parseInt(e.target.value))}
                    min={5}
                    max={60}
                  />
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Lernziele *</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addLearningObjective}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Lernziel hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentLevel.learningObjectives?.map((objective, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...(currentLevel.learningObjectives || [])];
                          newObjectives[index] = e.target.value;
                          updateLevel('learningObjectives', newObjectives);
                        }}
                        placeholder="z.B. Empathie für verschiedene Perspektiven entwickeln"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newObjectives = currentLevel.learningObjectives?.filter((_, i) => i !== index);
                          updateLevel('learningObjectives', newObjectives);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div>
                <Label>Level Vorschau</Label>
                <div className="mt-2">
                  <LevelThumbnail
                    category="neighborhood"
                    difficulty={currentLevel.difficulty || 1}
                    size={120}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Tab */}
        <TabsContent value="scenario" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Szenario Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="situation">Situationsbeschreibung *</Label>
                <Textarea
                  id="situation"
                  value={currentLevel.scenario?.situation || ''}
                  onChange={(e) => updateLevel('scenario.situation', e.target.value)}
                  placeholder="Beschreibe die konkrete Situation, in der sich die Spieler*innen befinden..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="context">Kontext</Label>
                <Textarea
                  id="context"
                  value={currentLevel.scenario?.context || ''}
                  onChange={(e) => updateLevel('scenario.context', e.target.value)}
                  placeholder="Zusätzliche Hintergrundinformationen zum Setting..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="realworld">Realweltbezug</Label>
                <Textarea
                  id="realworld"
                  value={currentLevel.scenario?.realWorldConnection || ''}
                  onChange={(e) => updateLevel('scenario.realWorldConnection', e.target.value)}
                  placeholder="Bezug zu aktuellen gesellschaftlichen Themen..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stakeholders Tab */}
        <TabsContent value="stakeholders" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stakeholder ({currentLevel.scenario?.stakeholders?.length || 0})</CardTitle>
                <Button onClick={addStakeholder}>
                  <Plus className="w-4 h-4 mr-2" />
                  Stakeholder hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentLevel.scenario?.stakeholders?.map((stakeholder, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <StakeholderAvatar
                          role="neighbor"
                          emotion="neutral"
                          size={48}
                        />
                        <div>
                          <h4>Stakeholder {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">ID: {stakeholder.id}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStakeholder(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={stakeholder.name}
                          onChange={(e) => {
                            const newStakeholders = [...(currentLevel.scenario?.stakeholders || [])];
                            newStakeholders[index] = { ...stakeholder, name: e.target.value };
                            updateLevel('scenario.stakeholders', newStakeholders);
                          }}
                          placeholder="z.B. Frau Weber"
                        />
                      </div>
                      
                      <div>
                        <Label>Rolle</Label>
                        <Input
                          value={stakeholder.role}
                          onChange={(e) => {
                            const newStakeholders = [...(currentLevel.scenario?.stakeholders || [])];
                            newStakeholders[index] = { ...stakeholder, role: e.target.value };
                            updateLevel('scenario.stakeholders', newStakeholders);
                          }}
                          placeholder="z.B. Krankenschwester"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Motivation</Label>
                      <Textarea
                        value={stakeholder.motivation}
                        onChange={(e) => {
                          const newStakeholders = [...(currentLevel.scenario?.stakeholders || [])];
                          newStakeholders[index] = { ...stakeholder, motivation: e.target.value };
                          updateLevel('scenario.stakeholders', newStakeholders);
                        }}
                        placeholder="Was treibt diese Person an?"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Macht (1-10)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[stakeholder.power]}
                            onValueChange={(value) => {
                              const newStakeholders = [...(currentLevel.scenario?.stakeholders || [])];
                              newStakeholders[index] = { ...stakeholder, power: value[0] };
                              updateLevel('scenario.stakeholders', newStakeholders);
                            }}
                            max={10}
                            min={1}
                            step={1}
                          />
                          <div className="text-sm text-muted-foreground">
                            Aktuell: {stakeholder.power}/10
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Einfluss (1-10)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[stakeholder.influence]}
                            onValueChange={(value) => {
                              const newStakeholders = [...(currentLevel.scenario?.stakeholders || [])];
                              newStakeholders[index] = { ...stakeholder, influence: value[0] };
                              updateLevel('scenario.stakeholders', newStakeholders);
                            }}
                            max={10}
                            min={1}
                            step={1}
                          />
                          <div className="text-sm text-muted-foreground">
                            Aktuell: {stakeholder.influence}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!currentLevel.scenario?.stakeholders?.length) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Stakeholder hinzugefügt</p>
                    <p className="text-sm">Füge Personen hinzu, die in diesem Szenario eine Rolle spielen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Choices Tab */}
        <TabsContent value="choices" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Entscheidungsoptionen ({currentLevel.scenario?.choices?.length || 0})</CardTitle>
                <Button onClick={addChoice}>
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentLevel.scenario?.choices?.map((choice, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4>Option {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeChoice(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Entscheidungstext</Label>
                        <Textarea
                          value={choice.text}
                          onChange={(e) => {
                            const newChoices = [...(currentLevel.scenario?.choices || [])];
                            newChoices[index] = { ...choice, text: e.target.value };
                            updateLevel('scenario.choices', newChoices);
                          }}
                          placeholder="Die Entscheidungsoption, die den Spieler*innen angezeigt wird..."
                          rows={2}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Kurzfristige Konsequenz</Label>
                          <Textarea
                            value={choice.shortTermConsequence}
                            onChange={(e) => {
                              const newChoices = [...(currentLevel.scenario?.choices || [])];
                              newChoices[index] = { ...choice, shortTermConsequence: e.target.value };
                              updateLevel('scenario.choices', newChoices);
                            }}
                            placeholder="Was passiert unmittelbar nach der Entscheidung?"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label>Langfristige Konsequenz</Label>
                          <Textarea
                            value={choice.longTermConsequence}
                            onChange={(e) => {
                              const newChoices = [...(currentLevel.scenario?.choices || [])];
                              newChoices[index] = { ...choice, longTermConsequence: e.target.value };
                              updateLevel('scenario.choices', newChoices);
                            }}
                            placeholder="Welche langfristigen Auswirkungen entstehen?"
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Score Settings */}
                      <div>
                        <Label>Kompetenz-Punkte</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <Label className="text-sm">Empathie</Label>
                            </div>
                            <Slider
                              value={[choice.scores.empathy]}
                              onValueChange={(value) => {
                                const newChoices = [...(currentLevel.scenario?.choices || [])];
                                newChoices[index] = { 
                                  ...choice, 
                                  scores: { ...choice.scores, empathy: value[0] }
                                };
                                updateLevel('scenario.choices', newChoices);
                              }}
                              max={10}
                              min={0}
                              step={1}
                            />
                            <div className="text-xs text-center mt-1">{choice.scores.empathy}/10</div>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <Label className="text-sm">Menschenrechte</Label>
                            </div>
                            <Slider
                              value={[choice.scores.humanRights]}
                              onValueChange={(value) => {
                                const newChoices = [...(currentLevel.scenario?.choices || [])];
                                newChoices[index] = { 
                                  ...choice, 
                                  scores: { ...choice.scores, humanRights: value[0] }
                                };
                                updateLevel('scenario.choices', newChoices);
                              }}
                              max={10}
                              min={0}
                              step={1}
                            />
                            <div className="text-xs text-center mt-1">{choice.scores.humanRights}/10</div>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <Label className="text-sm">Partizipation</Label>
                            </div>
                            <Slider
                              value={[choice.scores.participation]}
                              onValueChange={(value) => {
                                const newChoices = [...(currentLevel.scenario?.choices || [])];
                                newChoices[index] = { 
                                  ...choice, 
                                  scores: { ...choice.scores, participation: value[0] }
                                };
                                updateLevel('scenario.choices', newChoices);
                              }}
                              max={10}
                              min={0}
                              step={1}
                            />
                            <div className="text-xs text-center mt-1">{choice.scores.participation}/10</div>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <Label className="text-sm">Zivilcourage</Label>
                            </div>
                            <Slider
                              value={[choice.scores.civilCourage]}
                              onValueChange={(value) => {
                                const newChoices = [...(currentLevel.scenario?.choices || [])];
                                newChoices[index] = { 
                                  ...choice, 
                                  scores: { ...choice.scores, civilCourage: value[0] }
                                };
                                updateLevel('scenario.choices', newChoices);
                              }}
                              max={10}
                              min={0}
                              step={1}
                            />
                            <div className="text-xs text-center mt-1">{choice.scores.civilCourage}/10</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Schwierigkeit dieser Option</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[choice.difficulty]}
                            onValueChange={(value) => {
                              const newChoices = [...(currentLevel.scenario?.choices || [])];
                              newChoices[index] = { ...choice, difficulty: value[0] };
                              updateLevel('scenario.choices', newChoices);
                            }}
                            max={5}
                            min={1}
                            step={1}
                          />
                          <div className="text-sm text-muted-foreground">
                            {'★'.repeat(choice.difficulty)} ({choice.difficulty}/5)
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(!currentLevel.scenario?.choices?.length) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Entscheidungsoptionen hinzugefügt</p>
                    <p className="text-sm">Füge mindestens 2 Optionen hinzu, zwischen denen Spieler*innen wählen können</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reflection Tab */}
        <TabsContent value="reflection" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Reflexion & Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reflection-question">Reflexionsfrage</Label>
                <Textarea
                  id="reflection-question"
                  value={currentLevel.scenario?.reflection?.question || ''}
                  onChange={(e) => updateLevel('scenario.reflection.question', e.target.value)}
                  placeholder="Eine offene Frage, die zum Nachdenken anregt..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="learning-point">Lernpunkt</Label>
                <Textarea
                  id="learning-point"
                  value={currentLevel.scenario?.reflection?.learningPoint || ''}
                  onChange={(e) => updateLevel('scenario.reflection.learningPoint', e.target.value)}
                  placeholder="Die zentrale Lernerkenntnis dieses Levels..."
                  rows={2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Transfer-Fragen</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const current = currentLevel.scenario?.reflection?.transferQuestions || [''];
                      updateLevel('scenario.reflection.transferQuestions', [...current, '']);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Frage hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentLevel.scenario?.reflection?.transferQuestions?.map((question, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...(currentLevel.scenario?.reflection?.transferQuestions || [])];
                          newQuestions[index] = e.target.value;
                          updateLevel('scenario.reflection.transferQuestions', newQuestions);
                        }}
                        placeholder="z.B. Wie könntest du das in deinem Alltag anwenden?"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newQuestions = currentLevel.scenario?.reflection?.transferQuestions?.filter((_, i) => i !== index);
                          updateLevel('scenario.reflection.transferQuestions', newQuestions);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Diskussions-Prompts</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const current = currentLevel.scenario?.reflection?.discussionPrompts || [''];
                      updateLevel('scenario.reflection.discussionPrompts', [...current, '']);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Prompt hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentLevel.scenario?.reflection?.discussionPrompts?.map((prompt, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={prompt}
                        onChange={(e) => {
                          const newPrompts = [...(currentLevel.scenario?.reflection?.discussionPrompts || [])];
                          newPrompts[index] = e.target.value;
                          updateLevel('scenario.reflection.discussionPrompts', newPrompts);
                        }}
                        placeholder="z.B. Diskutiert in 2er-Gruppen über..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPrompts = currentLevel.scenario?.reflection?.discussionPrompts?.filter((_, i) => i !== index);
                          updateLevel('scenario.reflection.discussionPrompts', newPrompts);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Level Vorschau</h2>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Schließen
                  </Button>
                </div>
                
                {/* Preview Content würde hier das actual Level Component rendern */}
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">{currentLevel.title || 'Unbenanntes Level'}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{currentLevel.description}</p>
                    
                    {currentLevel.scenario?.situation && (
                      <div className="bg-white dark:bg-gray-700 p-4 rounded">
                        <h4 className="font-medium mb-2">Situation</h4>
                        <p className="text-sm">{currentLevel.scenario.situation}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center text-muted-foreground">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2" />
                    <p>Vollständige Vorschau verfügbar nach dem Speichern</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LevelEditor;