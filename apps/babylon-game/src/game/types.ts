export type ScreenState = 'auth' | 'role' | 'world' | 'scenario' | 'result';

export interface GameSettings {
  reducedMotion: boolean;
  lowGraphics: boolean;
}

export interface GameStats {
  empathy: number;
  rights: number;
  participation: number;
  courage: number;
}

export interface WorldTrackState {
  trust: number;
  participation: number;
  ruleOfLaw: number;
  socialTension: number;
  futureLoad: number;
}

export interface RoleDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  summary: string;
  focusStat: keyof GameStats;
  signatureLabel: string;
  signatureSummary: string;
}

export interface WorldDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
  status: 'playable' | 'roadmap';
  release: string;
  summary: string;
  learningFocus: string;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  summary: string;
  immediate: string;
  mediumTerm: string;
  tags: string[];
}

export interface ScenarioDefinition {
  id: string;
  worldId: string;
  title: string;
  difficulty: number;
  summary: string;
  prompt: string;
  learningFocus: string;
  teacherPrompt: string;
  stakes: string[];
  choices: ScenarioChoice[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthPayload {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
  sessionId?: string;
}

export interface GameProfile {
  selectedRole: string;
  currentWorldId: string;
  resumeScenarioId: string | null;
  settings: GameSettings;
  stats: GameStats;
  worldState: Record<string, WorldTrackState>;
  totalXp: number;
  playerLevel: number;
}

export interface GameProgress {
  completedScenarioIds: string[];
  completedCount: number;
  unlockedScenarioIds: string[];
  nextScenarioId: string | null;
  unlockedWorldIds: string[];
}

export interface GamePrivacyState {
  analyticsEnabled: boolean;
  analyticsConsentId: string | null;
  analyticsSource: string;
}

export interface GameBootstrapData {
  member: AuthUser;
  privacy: GamePrivacyState;
  profile: GameProfile;
  progress: GameProgress;
  contentVersion: string;
  gameplaySummary: {
    roleCount: number;
    worldCount: number;
    playableWorldCount: number;
    scenarioCount: number;
  };
}

export interface GameOutcome {
  choiceId: string;
  roleId: string;
  usedSignatureAction: boolean;
  score: number;
  xpAwarded: number;
  band: string;
  statsDelta: GameStats;
  worldDelta: Record<string, number>;
  worldStateAfter: WorldTrackState;
  summary: string;
  immediate: string;
  mediumTerm: string;
}

export interface GameScenarioResult {
  scenarioId: string;
  alreadyCompleted: boolean;
  outcome: GameOutcome;
  profile: GameProfile;
  progress: GameProgress;
}
