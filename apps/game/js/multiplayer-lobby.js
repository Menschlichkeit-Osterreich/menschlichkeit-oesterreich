/**
 * Multiplayer Lobby System
 * Democracy Metaverse - Kollaboratives Lernen
 *
 * Verwaltet Spieler-Lobbies für 2-4 Personen Democracy-Sessions
 * Optimiert für Klassenzimmer-Szenarien und Gruppenarbeit
 */

class DemocracyLobby {
  constructor() {
    this.currentLobby = null;
    this.lobbyId = null;
    this.isHost = false;
    this.players = new Map();
    this.gameSettings = {};

    // Lobby-Status
    this.lobbyState = 'idle'; // idle, waiting, ready, starting, in-game

    // Events
    this.eventHandlers = new Map();

    // UI-Elemente werden dynamisch erstellt
    this.lobbyContainer = null;
    this.initialized = false;

    // Standard-Konfiguration für Schulklassen
    this.config = {
      maxPlayers: 4,
      minPlayers: 2,
      defaultGameMode: 'collaborative',
      allowedGameModes: [
        'collaborative', // Konsens-basiert
        'democratic', // Mehrheits-Entscheidungen
        'discussion', // Freie Diskussion ohne Zeitlimit
      ],
      sessionTimeouts: {
        lobbyWait: 300000, // 5 Minuten Wartezeit
        gameSession: 2700000, // 45 Minuten Spielzeit
        discussionMax: 600000, // 10 Minuten max Diskussion
      },
      educationalFeatures: {
        teacherObserver: true, // Lehrkraft kann beobachten
        recordSession: false, // Session-Recording (opt-in)
        guidedMode: true, // Strukturierte Diskussionen
        reflectionPhase: true, // Nachbesprechungs-Phase
      },
    };

    console.log('[Lobby] Democracy Lobby System initialized');
  }

  /**
   * Initialize Lobby UI
   */
  initialize(containerId = 'lobby-container') {
    if (this.initialized) return;

    this.lobbyContainer = document.getElementById(containerId);
    if (!this.lobbyContainer) {
      this.createLobbyContainer(containerId);
    }

    this.createLobbyUI();
    this.setupEventListeners();

    this.initialized = true;
    console.log('[Lobby] UI initialized');
  }

  /**
   * Create Lobby Container
   */
  createLobbyContainer(containerId) {
    this.lobbyContainer = document.createElement('div');
    this.lobbyContainer.id = containerId;
    this.lobbyContainer.className = 'democracy-lobby-container';
    document.body.appendChild(this.lobbyContainer);
  }

  /**
   * Create Lobby UI
   */
  createLobbyUI() {
    this.lobbyContainer.innerHTML = `
            <div class="lobby-main">
                <div class="lobby-header">
                    <h2>🏛️ Democracy Metaverse - Multiplayer Lobby</h2>
                    <div class="lobby-status">
                        <span id="lobby-status-text">Bereit für Multiplayer</span>
                        <div id="lobby-status-indicator" class="status-idle"></div>
                    </div>
                </div>
                
                <div class="lobby-content">
                    <!-- Lobby erstellen oder beitreten -->
                    <div id="lobby-join-create" class="lobby-section">
                        <div class="join-create-options">
                            <div class="option-card create-lobby">
                                <h3>🎯 Neue Session erstellen</h3>
                                <p>Starte eine neue Democracy-Session für deine Gruppe</p>
                                <div class="player-input">
                                    <label for="host-name">Dein Name:</label>
                                    <input type="text" id="host-name" placeholder="z.B. Max Mustermann" maxlength="20">
                                </div>
                                <div class="game-settings">
                                    <label for="game-mode">Spielmodus:</label>
                                    <select id="game-mode">
                                        <option value="collaborative">🤝 Kollaborativ (Konsens)</option>
                                        <option value="democratic">🗳️ Demokratisch (Mehrheit)</option>
                                        <option value="discussion">💬 Diskussion (offen)</option>
                                    </select>
                                </div>
                                <div class="game-settings">
                                    <label for="max-players">Max. Spieler:</label>
                                    <select id="max-players">
                                        <option value="2">2 Spieler</option>
                                        <option value="3">3 Spieler</option>
                                        <option value="4" selected>4 Spieler</option>
                                    </select>
                                </div>
                                <button id="create-lobby-btn" class="lobby-btn primary">
                                    Session erstellen
                                </button>
                            </div>
                            
                            <div class="option-card join-lobby">
                                <h3>🚪 Session beitreten</h3>
                                <p>Trete einer bestehenden Democracy-Session bei</p>
                                <div class="player-input">
                                    <label for="player-name">Dein Name:</label>
                                    <input type="text" id="player-name" placeholder="z.B. Anna Schmidt" maxlength="20">
                                </div>
                                <div class="room-input">
                                    <label for="room-code">Raum-Code:</label>
                                    <input type="text" id="room-code" placeholder="z.B. DEMO123" maxlength="6" 
                                           style="text-transform: uppercase;">
                                </div>
                                <button id="join-lobby-btn" class="lobby-btn secondary">
                                    Session beitreten
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Aktive Lobby -->
                    <div id="active-lobby" class="lobby-section" style="display: none;">
                        <div class="lobby-info">
                            <div class="room-info">
                                <h3>Raum: <span id="current-room-code">------</span></h3>
                                <p>Modus: <span id="current-game-mode">Kollaborativ</span></p>
                                <div class="room-share">
                                    <button id="share-room-btn" class="lobby-btn small">
                                        📋 Code teilen
                                    </button>
                                    <button id="qr-code-btn" class="lobby-btn small">
                                        📱 QR-Code
                                    </button>
                                </div>
                            </div>
                            
                            <div class="teacher-controls" id="teacher-controls" style="display: none;">
                                <h4>👩‍🏫 Lehrkraft-Optionen</h4>
                                <label>
                                    <input type="checkbox" id="guided-mode"> Geführter Modus
                                </label>
                                <label>
                                    <input type="checkbox" id="reflection-phase"> Reflexions-Phase
                                </label>
                                <label>
                                    <input type="checkbox" id="record-session"> Session aufzeichnen
                                </label>
                            </div>
                        </div>
                        
                        <div class="players-list">
                            <h3>Teilnehmer (<span id="player-count">0</span>/<span id="max-player-count">4</span>)</h3>
                            <div id="players-container" class="players-grid">
                                <!-- Spieler werden dynamisch hinzugefügt -->
                            </div>
                            
                            <div class="waiting-area">
                                <div id="waiting-message">
                                    <p>⏳ Warte auf weitere Spieler...</p>
                                    <p class="min-players">Mindestens <span id="min-players-needed">2</span> Spieler erforderlich</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lobby-actions">
                            <button id="start-game-btn" class="lobby-btn primary" disabled>
                                🚀 Spiel starten
                            </button>
                            <button id="leave-lobby-btn" class="lobby-btn danger">
                                🚪 Lobby verlassen
                            </button>
                        </div>
                    </div>
                    
                    <!-- Game Starting Countdown -->
                    <div id="game-starting" class="lobby-section" style="display: none;">
                        <div class="starting-countdown">
                            <h2>🎮 Spiel startet in...</h2>
                            <div id="countdown-timer" class="countdown-display">3</div>
                            <p>Bereite dich auf kollaborative Democracy vor!</p>
                            <button id="cancel-start-btn" class="lobby-btn secondary">
                                Abbrechen
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- QR-Code Modal -->
                <div id="qr-modal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>📱 QR-Code zum Beitreten</h3>
                            <button id="close-qr-modal" class="close-btn">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="qr-code-display"></div>
                            <p>Scanne diesen Code mit dem Smartphone, um der Session beizutreten</p>
                            <div class="manual-join">
                                <p>Oder gehe zu: <strong>democracy-game.at/join</strong></p>
                                <p>Raum-Code: <strong id="qr-room-code">------</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    this.addLobbyStyles();
  }

  /**
   * Add CSS Styles for Lobby
   */
  addLobbyStyles() {
    const style = document.createElement('style');
    style.textContent = `
            .democracy-lobby-container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            
            .lobby-main {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            .lobby-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding-bottom: 16px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .lobby-header h2 {
                margin: 0;
                color: #2c3e50;
                font-size: 24px;
            }
            
            .lobby-status {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .status-idle { background: #95a5a6; }
            .status-waiting { background: #f39c12; }
            .status-ready { background: #27ae60; }
            .status-starting { background: #e74c3c; }
            
            #lobby-status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .join-create-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 32px;
            }
            
            .option-card {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 24px;
                transition: all 0.3s ease;
            }
            
            .option-card:hover {
                border-color: #667eea;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            }
            
            .option-card h3 {
                margin: 0 0 12px 0;
                color: #2c3e50;
                font-size: 18px;
            }
            
            .player-input, .room-input, .game-settings {
                margin: 16px 0;
            }
            
            .player-input label, .room-input label, .game-settings label {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: #555;
            }
            
            .player-input input, .room-input input, .game-settings select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .lobby-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                display: inline-block;
                text-decoration: none;
            }
            
            .lobby-btn.primary {
                background: #667eea;
                color: white;
            }
            
            .lobby-btn.primary:hover {
                background: #5a67d8;
            }
            
            .lobby-btn.secondary {
                background: #e2e8f0;
                color: #4a5568;
            }
            
            .lobby-btn.secondary:hover {
                background: #cbd5e0;
            }
            
            .lobby-btn.danger {
                background: #f56565;
                color: white;
            }
            
            .lobby-btn.danger:hover {
                background: #e53e3e;
            }
            
            .lobby-btn.small {
                padding: 8px 16px;
                font-size: 12px;
            }
            
            .lobby-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .lobby-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 24px;
            }
            
            .room-info h3 {
                margin: 0 0 12px 0;
                font-size: 20px;
                color: #2c3e50;
            }
            
            .room-share {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .teacher-controls {
                background: #f0f4f8;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            
            .teacher-controls h4 {
                margin: 0 0 12px 0;
                color: #2c3e50;
            }
            
            .teacher-controls label {
                display: block;
                margin: 8px 0;
                cursor: pointer;
            }
            
            .teacher-controls input[type="checkbox"] {
                margin-right: 8px;
            }
            
            .players-list h3 {
                margin: 0 0 16px 0;
                color: #2c3e50;
            }
            
            .players-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .player-card {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                position: relative;
            }
            
            .player-card.host {
                border-color: #ffd700;
                background: #fffdf0;
            }
            
            .player-card.ready {
                border-color: #27ae60;
                background: #f0fff4;
            }
            
            .player-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin: 0 auto 8px auto;
                background: linear-gradient(45deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                font-weight: bold;
            }
            
            .player-name {
                font-weight: 500;
                margin-bottom: 4px;
                color: #2c3e50;
            }
            
            .player-status {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .host-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ffd700;
                color: #333;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
            
            .waiting-area {
                text-align: center;
                padding: 32px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 2px dashed #dee2e6;
            }
            
            .waiting-area p {
                margin: 8px 0;
                color: #6c757d;
            }
            
            .min-players {
                font-size: 14px;
                font-weight: 500;
            }
            
            .lobby-actions {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-top: 24px;
            }
            
            .starting-countdown {
                text-align: center;
                padding: 48px 24px;
            }
            
            .starting-countdown h2 {
                margin: 0 0 24px 0;
                color: #2c3e50;
            }
            
            .countdown-display {
                font-size: 72px;
                font-weight: bold;
                color: #667eea;
                margin: 24px 0;
                animation: countdownPulse 1s infinite;
            }
            
            @keyframes countdownPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px 0 24px;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #2c3e50;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 20px 24px 24px 24px;
                text-align: center;
            }
            
            #qr-code-display {
                margin: 20px 0;
                padding: 20px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
            }
            
            .manual-join {
                margin-top: 20px;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 6px;
            }
            
            .manual-join p {
                margin: 4px 0;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .join-create-options {
                    grid-template-columns: 1fr;
                }
                
                .lobby-info {
                    grid-template-columns: 1fr;
                }
                
                .players-grid {
                    grid-template-columns: 1fr 1fr;
                }
                
                .room-share {
                    flex-direction: column;
                }
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    // Create Lobby Button
    document.getElementById('create-lobby-btn').addEventListener('click', () => {
      this.handleCreateLobby();
    });

    // Join Lobby Button
    document.getElementById('join-lobby-btn').addEventListener('click', () => {
      this.handleJoinLobby();
    });

    // Room Code Input - Auto Uppercase
    document.getElementById('room-code').addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase();
    });

    // Start Game Button
    document.getElementById('start-game-btn').addEventListener('click', () => {
      this.handleStartGame();
    });

    // Leave Lobby Button
    document.getElementById('leave-lobby-btn').addEventListener('click', () => {
      this.handleLeaveLobby();
    });

    // Share Room Button
    document.getElementById('share-room-btn').addEventListener('click', () => {
      this.handleShareRoom();
    });

    // QR Code Button
    document.getElementById('qr-code-btn').addEventListener('click', () => {
      this.handleShowQRCode();
    });

    // Close QR Modal
    document.getElementById('close-qr-modal').addEventListener('click', () => {
      document.getElementById('qr-modal').style.display = 'none';
    });

    // Cancel Start Button
    document.getElementById('cancel-start-btn').addEventListener('click', () => {
      this.handleCancelStart();
    });

    // Enter key handlers
    document.getElementById('host-name').addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        document.getElementById('create-lobby-btn').click();
      }
    });

    document.getElementById('room-code').addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        document.getElementById('join-lobby-btn').click();
      }
    });
  }

  /**
   * Handle Create Lobby
   */
  async handleCreateLobby() {
    const hostName = document.getElementById('host-name').value.trim();
    const gameMode = document.getElementById('game-mode').value;
    const maxPlayers = parseInt(document.getElementById('max-players').value);

    if (!hostName) {
      alert('Bitte gib deinen Namen ein!');
      return;
    }

    try {
      this.updateStatus('Erstelle Lobby...', 'waiting');

      // Initialize multiplayer system if not already done
      if (!window.democracyMultiplayer) {
        window.democracyMultiplayer = new window.DemocracyMultiplayer();
        await window.democracyMultiplayer.initialize(hostName);
      }

      // Create room
      const { roomCode } = window.democracyMultiplayer.createRoom();

      this.isHost = true;
      this.lobbyId = roomCode;
      this.gameSettings = {
        gameMode,
        maxPlayers,
        hostName,
      };

      // Add host as first player
      this.players.set(window.democracyMultiplayer.playerId, {
        id: window.democracyMultiplayer.playerId,
        name: hostName,
        isHost: true,
        isReady: true,
        isLocal: true,
      });

      // Setup multiplayer event handlers
      this.setupMultiplayerHandlers();

      // Switch to lobby view
      this.showActiveLobby();

      this.updateStatus('Lobby erstellt - Warte auf Spieler', 'ready');

      console.log('[Lobby] Created lobby:', roomCode);
    } catch (error) {
      console.error('[Lobby] Failed to create lobby:', error);
      alert('Fehler beim Erstellen der Lobby: ' + error.message);
      this.updateStatus('Fehler beim Erstellen', 'idle');
    }
  }

  /**
   * Handle Join Lobby
   */
  async handleJoinLobby() {
    const playerName = document.getElementById('player-name').value.trim();
    const roomCode = document.getElementById('room-code').value.trim().toUpperCase();

    if (!playerName) {
      alert('Bitte gib deinen Namen ein!');
      return;
    }

    if (!roomCode || roomCode.length !== 6) {
      alert('Bitte gib einen gültigen Raum-Code ein (6 Zeichen)!');
      return;
    }

    try {
      this.updateStatus('Trete Lobby bei...', 'waiting');

      // Initialize multiplayer system
      if (!window.democracyMultiplayer) {
        window.democracyMultiplayer = new window.DemocracyMultiplayer();
        await window.democracyMultiplayer.initialize(playerName);
      }

      // Join room
      await window.democracyMultiplayer.joinRoom(roomCode);

      this.isHost = false;
      this.lobbyId = roomCode;

      // Add local player
      this.players.set(window.democracyMultiplayer.playerId, {
        id: window.democracyMultiplayer.playerId,
        name: playerName,
        isHost: false,
        isReady: false,
        isLocal: true,
      });

      // Setup multiplayer event handlers
      this.setupMultiplayerHandlers();

      // Switch to lobby view
      this.showActiveLobby();

      this.updateStatus('Lobby beigetreten', 'ready');

      console.log('[Lobby] Joined lobby:', roomCode);
    } catch (error) {
      console.error('[Lobby] Failed to join lobby:', error);
      alert('Fehler beim Beitreten der Lobby: ' + error.message);
      this.updateStatus('Fehler beim Beitreten', 'idle');
    }
  }

  /**
   * Setup Multiplayer Event Handlers
   */
  setupMultiplayerHandlers() {
    if (!window.democracyMultiplayer) return;

    // Player joined
    window.democracyMultiplayer.on('playerJoined', data => {
      this.players.set(data.playerId, {
        id: data.playerId,
        name: data.playerName,
        isHost: false,
        isReady: false,
        isLocal: false,
      });

      this.updatePlayersDisplay();
      this.emit('playerJoined', data);

      console.log('[Lobby] Player joined:', data.playerName);
    });

    // Player left
    window.democracyMultiplayer.on('playerLeft', data => {
      this.players.delete(data.playerId);
      this.updatePlayersDisplay();
      this.emit('playerLeft', data);

      console.log('[Lobby] Player left:', data.playerId);
    });

    // Game state updated
    window.democracyMultiplayer.on('gameStateUpdated', gameState => {
      // Handle game state updates from host
      this.emit('gameStateUpdated', gameState);
    });

    // Connection lost
    window.democracyMultiplayer.on('disconnected', () => {
      this.handleConnectionLost();
    });
  }

  /**
   * Show Active Lobby
   */
  showActiveLobby() {
    document.getElementById('lobby-join-create').style.display = 'none';
    document.getElementById('active-lobby').style.display = 'block';

    // Update room info
    document.getElementById('current-room-code').textContent = this.lobbyId;
    document.getElementById('current-game-mode').textContent = this.getGameModeDisplayName();
    document.getElementById('max-player-count').textContent = this.config.maxPlayers;

    // Show teacher controls if host
    if (this.isHost) {
      document.getElementById('teacher-controls').style.display = 'block';
    }

    this.updatePlayersDisplay();
  }

  /**
   * Update Players Display
   */
  updatePlayersDisplay() {
    const container = document.getElementById('players-container');
    const playerCount = document.getElementById('player-count');
    const startButton = document.getElementById('start-game-btn');
    const waitingMessage = document.getElementById('waiting-message');

    // Update player count
    playerCount.textContent = this.players.size;

    // Clear container
    container.innerHTML = '';

    // Add player cards
    for (const player of this.players.values()) {
      const playerCard = this.createPlayerCard(player);
      container.appendChild(playerCard);
    }

    // Update start button state
    const canStart = this.players.size >= this.config.minPlayers && this.isHost;
    startButton.disabled = !canStart;

    // Update waiting message
    if (this.players.size < this.config.minPlayers) {
      waitingMessage.style.display = 'block';
      document.getElementById('min-players-needed').textContent =
        this.config.minPlayers - this.players.size;
    } else {
      waitingMessage.style.display = 'none';
    }
  }

  /**
   * Create Player Card Element
   */
  createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = `player-card ${player.isReady ? 'ready' : ''}`;
    if (player.isHost) card.classList.add('host');

    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    avatar.textContent = player.name.charAt(0).toUpperCase();

    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;

    const status = document.createElement('div');
    status.className = 'player-status';
    status.textContent = player.isHost ? 'Host' : player.isReady ? 'Bereit' : 'Wartet';

    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(status);

    if (player.isHost) {
      const badge = document.createElement('div');
      badge.className = 'host-badge';
      badge.textContent = '👑';
      card.appendChild(badge);
    }

    return card;
  }

  /**
   * Handle Start Game
   */
  handleStartGame() {
    if (!this.isHost) {
      console.warn('[Lobby] Only host can start game');
      return;
    }

    if (this.players.size < this.config.minPlayers) {
      alert(`Mindestens ${this.config.minPlayers} Spieler erforderlich!`);
      return;
    }

    this.startGameCountdown();
  }

  /**
   * Start Game Countdown
   */
  startGameCountdown() {
    document.getElementById('active-lobby').style.display = 'none';
    document.getElementById('game-starting').style.display = 'block';

    this.updateStatus('Spiel startet...', 'starting');

    let countdown = 3;
    const countdownElement = document.getElementById('countdown-timer');

    const countdownInterval = setInterval(() => {
      countdownElement.textContent = countdown;

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        this.launchGame();
      }

      countdown--;
    }, 1000);

    // Store for cancellation
    this.countdownInterval = countdownInterval;

    // Notify other players
    if (window.democracyMultiplayer) {
      window.democracyMultiplayer.broadcastToAll({
        type: 'game_starting',
        countdown: 3,
      });
    }
  }

  /**
   * Handle Cancel Start
   */
  handleCancelStart() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    document.getElementById('game-starting').style.display = 'none';
    document.getElementById('active-lobby').style.display = 'block';

    this.updateStatus('Lobby bereit', 'ready');

    // Notify other players
    if (window.democracyMultiplayer) {
      window.democracyMultiplayer.broadcastToAll({
        type: 'start_cancelled',
      });
    }
  }

  /**
   * Launch Game
   */
  launchGame() {
    this.lobbyState = 'in-game';

    // Hide lobby UI
    this.lobbyContainer.style.display = 'none';

    // Initialize game with multiplayer
    this.emit('gameStarted', {
      players: Array.from(this.players.values()),
      gameSettings: this.gameSettings,
      multiplayer: window.democracyMultiplayer,
    });

    console.log('[Lobby] Game launched with', this.players.size, 'players');
  }

  /**
   * Handle Leave Lobby
   */
  handleLeaveLobby() {
    if (confirm('Möchtest du die Lobby wirklich verlassen?')) {
      this.leaveLobby();
    }
  }

  /**
   * Leave Lobby
   */
  leaveLobby() {
    // Cleanup multiplayer connection
    if (window.democracyMultiplayer) {
      window.democracyMultiplayer.disconnect();
    }

    // Reset state
    this.players.clear();
    this.lobbyId = null;
    this.isHost = false;
    this.lobbyState = 'idle';

    // Show initial UI
    document.getElementById('active-lobby').style.display = 'none';
    document.getElementById('game-starting').style.display = 'none';
    document.getElementById('lobby-join-create').style.display = 'block';

    this.updateStatus('Bereit für Multiplayer', 'idle');

    console.log('[Lobby] Left lobby');
  }

  /**
   * Handle Share Room
   */
  handleShareRoom() {
    if (navigator.share) {
      navigator.share({
        title: 'Democracy Metaverse - Multiplayer Session',
        text: `Tritt meiner Democracy Session bei! Raum-Code: ${this.lobbyId}`,
        url: `${window.location.origin}/games/user-testing-ready.html?join=${this.lobbyId}`,
      });
    } else {
      // Fallback: Copy to clipboard
      const shareText = `Democracy Metaverse - Raum-Code: ${this.lobbyId}\n${window.location.origin}/games/user-testing-ready.html?join=${this.lobbyId}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Raum-Code und Link kopiert!');
        });
      } else {
        prompt('Kopiere diesen Link zum Teilen:', shareText);
      }
    }
  }

  /**
   * Handle Show QR Code
   */
  handleShowQRCode() {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-code-display');
    const roomCodeSpan = document.getElementById('qr-room-code');

    roomCodeSpan.textContent = this.lobbyId;

    // Generate QR code (requires QR code library)
    // const joinUrl = `${window.location.origin}/games/user-testing-ready.html?join=${this.lobbyId}`;

    // Placeholder for QR code generation
    qrContainer.innerHTML = `
            <div style="width: 200px; height: 200px; background: #f0f0f0; 
                        display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto; border-radius: 8px;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
                    <div>QR-Code</div>
                    <div style="font-size: 12px; margin-top: 4px;">${this.lobbyId}</div>
                </div>
            </div>
        `;

    modal.style.display = 'flex';
  }

  /**
   * Handle Connection Lost
   */
  handleConnectionLost() {
    alert('Verbindung zur Lobby verloren!');
    this.leaveLobby();
  }

  /**
   * Utility Functions
   */
  updateStatus(message, statusType) {
    const statusText = document.getElementById('lobby-status-text');
    const statusIndicator = document.getElementById('lobby-status-indicator');

    if (statusText) statusText.textContent = message;

    if (statusIndicator) {
      statusIndicator.className = `status-${statusType}`;
    }

    this.lobbyState = statusType;
  }

  getGameModeDisplayName() {
    const modes = {
      collaborative: '🤝 Kollaborativ (Konsens)',
      democratic: '🗳️ Demokratisch (Mehrheit)',
      discussion: '💬 Diskussion (offen)',
    };
    return modes[this.gameSettings.gameMode] || 'Unbekannt';
  }

  /**
   * Event System
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventHandlers.has(event)) return;
    const handlers = this.eventHandlers.get(event);
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error('[Lobby] Event handler error:', error);
      }
    }
  }

  /**
   * Get Lobby Status
   */
  getStatus() {
    return {
      lobbyId: this.lobbyId,
      isHost: this.isHost,
      playerCount: this.players.size,
      maxPlayers: this.config.maxPlayers,
      gameSettings: this.gameSettings,
      lobbyState: this.lobbyState,
      players: Array.from(this.players.values()),
    };
  }
}

// Export for global use
window.DemocracyLobby = DemocracyLobby;

console.log('[Lobby] Democracy Lobby System loaded successfully');
