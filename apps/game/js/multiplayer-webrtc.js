/**
 * WebRTC Multiplayer System
 * Democracy Metaverse - Kollaborative Democracy Education
 *
 * Ermöglicht 2-4 Spieler Sessions für gemeinsame demokratische Entscheidungsfindung
 * Pädagogisch optimiert für Classroom-Szenarien und Gruppenlernen
 */

class DemocracyMultiplayer {
  constructor() {
    this.localPeer = null;
    this.connections = new Map();
    this.gameRoom = null;
    this.isHost = false;
    this.playerId = this.generatePlayerId();
    this.playerName = '';

    // Game state synchronization
    this.gameState = {
      currentLevel: 1,
      currentScenario: null,
      votes: new Map(),
      playerDecisions: new Map(),
      consensusReached: false,
      timeRemaining: 0,
    };

    // Educational collaboration features
    this.collaborationMode = 'consensus'; // consensus, majority, discussion
    this.discussionPhase = false;
    this.votingPhase = false;

    // Event handlers
    this.eventHandlers = new Map();

    // Configuration
    this.config = {
      maxPlayers: 4,
      minPlayers: 2,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      gameSettings: {
        discussionTimeLimit: 120000, // 2 minutes
        votingTimeLimit: 60000, // 1 minute
        consensusThreshold: 0.75, // 75% agreement needed
        allowRevoting: true,
        enableTextChat: true,
        enableVoiceChat: false, // Für Schulumgebung meist deaktiviert
      },
    };

    console.log('[Multiplayer] Democracy Multiplayer System initialized', this.playerId);
  }

  /**
   * Initialize WebRTC and set up peer connections
   */
  async initialize(playerName, roomCode = null) {
    try {
      this.playerName = playerName || `Spieler_${this.playerId.slice(0, 4)}`;

      // Initialize PeerJS (requires PeerJS library to be loaded)
      if (typeof window.Peer === 'undefined') {
        throw new Error('PeerJS library not loaded. Please include PeerJS script.');
      }

      this.localPeer = new window.Peer(this.playerId, {
        config: { iceServers: this.config.iceServers },
      });

      return new Promise((resolve, reject) => {
        this.localPeer.on('open', id => {
          console.log('[Multiplayer] Peer connection established:', id);
          this.setupPeerEventHandlers();

          if (roomCode) {
            this.joinRoom(roomCode);
          }

          resolve({ success: true, playerId: id, playerName: this.playerName });
        });

        this.localPeer.on('error', error => {
          console.error('[Multiplayer] Peer connection error:', error);
          reject({ success: false, error: error.message });
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.localPeer.open) {
            reject({ success: false, error: 'Connection timeout' });
          }
        }, 10000);
      });
    } catch (error) {
      console.error('[Multiplayer] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a new game room (become host)
   */
  createRoom() {
    if (!this.localPeer || !this.localPeer.open) {
      throw new Error('Peer not initialized');
    }

    this.isHost = true;
    this.gameRoom = this.generateRoomCode();

    console.log('[Multiplayer] Created room:', this.gameRoom);

    // Initialize game state as host
    this.resetGameState();

    this.emit('roomCreated', {
      roomCode: this.gameRoom,
      playerId: this.playerId,
      playerName: this.playerName,
    });

    return {
      roomCode: this.gameRoom,
      isHost: true,
      maxPlayers: this.config.maxPlayers,
    };
  }

  /**
   * Join an existing game room
   */
  async joinRoom(roomCode) {
    if (!this.localPeer || !this.localPeer.open) {
      throw new Error('Peer not initialized');
    }

    this.gameRoom = roomCode;
    this.isHost = false;

    try {
      // Try to connect to room host
      const hostId = this.getRoomHostId(roomCode);
      await this.connectToPeer(hostId);

      console.log('[Multiplayer] Joined room:', roomCode);

      this.emit('roomJoined', {
        roomCode: roomCode,
        playerId: this.playerId,
        playerName: this.playerName,
      });

      return {
        roomCode: roomCode,
        isHost: false,
        connected: true,
      };
    } catch (error) {
      console.error('[Multiplayer] Failed to join room:', error);
      throw error;
    }
  }

  /**
   * Connect to a specific peer
   */
  async connectToPeer(peerId) {
    return new Promise((resolve, reject) => {
      const connection = this.localPeer.connect(peerId, {
        metadata: {
          playerName: this.playerName,
          roomCode: this.gameRoom,
        },
      });

      connection.on('open', () => {
        this.connections.set(peerId, connection);
        this.setupConnectionHandlers(connection);

        console.log('[Multiplayer] Connected to peer:', peerId);

        // Request current game state if joining
        if (!this.isHost) {
          this.sendToPeer(peerId, {
            type: 'request_game_state',
            playerId: this.playerId,
            playerName: this.playerName,
          });
        }

        resolve(connection);
      });

      connection.on('error', error => {
        console.error('[Multiplayer] Connection error:', error);
        reject(error);
      });

      // Store connection immediately for cleanup
      this.connections.set(peerId, connection);
    });
  }

  /**
   * Setup peer event handlers
   */
  setupPeerEventHandlers() {
    // Handle incoming connections
    this.localPeer.on('connection', connection => {
      console.log('[Multiplayer] Incoming connection from:', connection.peer);

      this.connections.set(connection.peer, connection);
      this.setupConnectionHandlers(connection);

      // Send current game state to new player
      if (this.isHost) {
        this.sendGameState(connection.peer);
      }

      this.emit('playerJoined', {
        playerId: connection.peer,
        playerName: connection.metadata?.playerName || 'Unknown Player',
        totalPlayers: this.connections.size + 1,
      });
    });

    this.localPeer.on('disconnected', () => {
      console.log('[Multiplayer] Peer disconnected');
      this.emit('disconnected');
    });

    this.localPeer.on('close', () => {
      console.log('[Multiplayer] Peer connection closed');
      this.cleanup();
    });
  }

  /**
   * Setup handlers for individual connections
   */
  setupConnectionHandlers(connection) {
    connection.on('data', data => {
      this.handleMessage(data, connection.peer);
    });

    connection.on('close', () => {
      console.log('[Multiplayer] Connection closed:', connection.peer);
      this.connections.delete(connection.peer);

      this.emit('playerLeft', {
        playerId: connection.peer,
        totalPlayers: this.connections.size + 1,
      });
    });

    connection.on('error', error => {
      console.error('[Multiplayer] Connection error:', error);
      this.connections.delete(connection.peer);
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message, senderId) {
    console.log('[Multiplayer] Received message:', message.type, 'from:', senderId);

    switch (message.type) {
      case 'game_state_update':
        this.handleGameStateUpdate(message.gameState);
        break;

      case 'player_decision':
        this.handlePlayerDecision(message.playerId, message.decision, message.scenarioId);
        break;

      case 'vote_cast':
        this.handleVote(message.playerId, message.vote, message.option);
        break;

      case 'chat_message':
        this.handleChatMessage(message.playerId, message.playerName, message.text);
        break;

      case 'start_discussion':
        this.handleStartDiscussion(message.scenarioId, message.options);
        break;

      case 'start_voting':
        this.handleStartVoting(message.scenarioId, message.options);
        break;

      case 'consensus_reached':
        this.handleConsensusReached(message.decision, message.scenarioId);
        break;

      case 'request_game_state':
        if (this.isHost) {
          this.sendGameState(senderId);
        }
        break;

      case 'level_progression':
        this.handleLevelProgression(message.newLevel);
        break;

      default:
        console.warn('[Multiplayer] Unknown message type:', message.type);
    }
  }

  /**
   * Start a democratic discussion phase
   */
  startDiscussion(scenarioId, options) {
    if (!this.isHost) {
      console.warn('[Multiplayer] Only host can start discussion');
      return;
    }

    this.discussionPhase = true;
    this.votingPhase = false;
    this.gameState.currentScenario = scenarioId;
    this.gameState.votes.clear();
    this.gameState.consensusReached = false;
    this.gameState.timeRemaining = this.config.gameSettings.discussionTimeLimit;

    const message = {
      type: 'start_discussion',
      scenarioId: scenarioId,
      options: options,
      timeLimit: this.config.gameSettings.discussionTimeLimit,
    };

    this.broadcastToAll(message);
    this.emit('discussionStarted', { scenarioId, options, timeLimit: message.timeLimit });

    // Start discussion timer
    this.startDiscussionTimer();
  }

  /**
   * Start voting phase after discussion
   */
  startVoting(scenarioId, options) {
    if (!this.isHost) {
      console.warn('[Multiplayer] Only host can start voting');
      return;
    }

    this.discussionPhase = false;
    this.votingPhase = true;
    this.gameState.votes.clear();
    this.gameState.timeRemaining = this.config.gameSettings.votingTimeLimit;

    const message = {
      type: 'start_voting',
      scenarioId: scenarioId,
      options: options,
      timeLimit: this.config.gameSettings.votingTimeLimit,
    };

    this.broadcastToAll(message);
    this.emit('votingStarted', { scenarioId, options, timeLimit: message.timeLimit });

    // Start voting timer
    this.startVotingTimer();
  }

  /**
   * Cast a vote for a democratic decision
   */
  castVote(scenarioId, optionId, reasoning = '') {
    if (!this.votingPhase) {
      console.warn('[Multiplayer] Voting is not currently active');
      return false;
    }

    const vote = {
      playerId: this.playerId,
      playerName: this.playerName,
      option: optionId,
      reasoning: reasoning,
      timestamp: Date.now(),
    };

    // Store vote locally
    this.gameState.votes.set(this.playerId, vote);

    // Broadcast vote to all peers
    const message = {
      type: 'vote_cast',
      playerId: this.playerId,
      playerName: this.playerName,
      vote: vote,
      option: optionId,
      scenarioId: scenarioId,
    };

    this.broadcastToAll(message);
    this.emit('voteCast', vote);

    // Check for consensus if host
    if (this.isHost) {
      this.checkForConsensus(scenarioId);
    }

    return true;
  }

  /**
   * Send a chat message during discussion
   */
  sendChatMessage(text) {
    if (!this.config.gameSettings.enableTextChat) {
      console.warn('[Multiplayer] Text chat is disabled');
      return false;
    }

    const message = {
      type: 'chat_message',
      playerId: this.playerId,
      playerName: this.playerName,
      text: text,
      timestamp: Date.now(),
    };

    this.broadcastToAll(message);
    this.emit('chatMessage', message);

    return true;
  }

  /**
   * Check if consensus has been reached
   */
  checkForConsensus(scenarioId) {
    const totalPlayers = this.connections.size + 1; // +1 for host
    const totalVotes = this.gameState.votes.size;

    // Wait for all players to vote
    if (totalVotes < totalPlayers) {
      return false;
    }

    // Count votes by option
    const voteCounts = new Map();
    for (const vote of this.gameState.votes.values()) {
      const count = voteCounts.get(vote.option) || 0;
      voteCounts.set(vote.option, count + 1);
    }

    // Find most popular option
    let maxVotes = 0;
    let consensusOption = null;
    for (const [option, count] of voteCounts.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        consensusOption = option;
      }
    }

    // Check consensus threshold
    const consensusRatio = maxVotes / totalPlayers;
    const thresholdMet = consensusRatio >= this.config.gameSettings.consensusThreshold;

    if (thresholdMet || this.collaborationMode === 'majority') {
      this.reachConsensus(consensusOption, scenarioId, {
        voteCounts: Object.fromEntries(voteCounts),
        consensusRatio: consensusRatio,
        totalVotes: totalVotes,
      });
      return true;
    }

    return false;
  }

  /**
   * Reach consensus and progress game
   */
  reachConsensus(decision, scenarioId, voteData) {
    this.gameState.consensusReached = true;
    this.votingPhase = false;
    this.discussionPhase = false;

    const message = {
      type: 'consensus_reached',
      decision: decision,
      scenarioId: scenarioId,
      voteData: voteData,
      timestamp: Date.now(),
    };

    this.broadcastToAll(message);
    this.emit('consensusReached', message);

    console.log('[Multiplayer] Consensus reached:', decision);
  }

  /**
   * Progress to next level (host only)
   */
  progressToNextLevel() {
    if (!this.isHost) {
      console.warn('[Multiplayer] Only host can progress levels');
      return;
    }

    this.gameState.currentLevel++;
    this.resetGameState();

    const message = {
      type: 'level_progression',
      newLevel: this.gameState.currentLevel,
      timestamp: Date.now(),
    };

    this.broadcastToAll(message);
    this.emit('levelProgression', { newLevel: this.gameState.currentLevel });
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcastToAll(message) {
    for (const [peerId, connection] of this.connections.entries()) {
      if (connection.open) {
        try {
          connection.send(message);
        } catch (error) {
          console.error('[Multiplayer] Failed to send to peer:', peerId, error);
        }
      }
    }
  }

  /**
   * Send message to specific peer
   */
  sendToPeer(peerId, message) {
    const connection = this.connections.get(peerId);
    if (connection && connection.open) {
      try {
        connection.send(message);
        return true;
      } catch (error) {
        console.error('[Multiplayer] Failed to send to peer:', peerId, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Send current game state to a peer
   */
  sendGameState(peerId) {
    const gameStateMessage = {
      type: 'game_state_update',
      gameState: {
        currentLevel: this.gameState.currentLevel,
        currentScenario: this.gameState.currentScenario,
        votes: Object.fromEntries(this.gameState.votes),
        playerDecisions: Object.fromEntries(this.gameState.playerDecisions),
        consensusReached: this.gameState.consensusReached,
        discussionPhase: this.discussionPhase,
        votingPhase: this.votingPhase,
        timeRemaining: this.gameState.timeRemaining,
      },
      players: this.getConnectedPlayers(),
    };

    this.sendToPeer(peerId, gameStateMessage);
  }

  /**
   * Event Handlers
   */
  handleGameStateUpdate(gameState) {
    this.gameState.currentLevel = gameState.currentLevel;
    this.gameState.currentScenario = gameState.currentScenario;
    this.gameState.votes = new Map(Object.entries(gameState.votes || {}));
    this.gameState.playerDecisions = new Map(Object.entries(gameState.playerDecisions || {}));
    this.gameState.consensusReached = gameState.consensusReached;
    this.discussionPhase = gameState.discussionPhase;
    this.votingPhase = gameState.votingPhase;
    this.gameState.timeRemaining = gameState.timeRemaining;

    this.emit('gameStateUpdated', gameState);
  }

  handlePlayerDecision(playerId, decision, scenarioId) {
    this.gameState.playerDecisions.set(playerId, { decision, scenarioId, timestamp: Date.now() });
    this.emit('playerDecisionMade', { playerId, decision, scenarioId });
  }

  handleVote(playerId, vote, option) {
    this.gameState.votes.set(playerId, vote);
    this.emit('voteReceived', { playerId, vote, option });
  }

  handleChatMessage(playerId, playerName, text) {
    this.emit('chatMessageReceived', { playerId, playerName, text, timestamp: Date.now() });
  }

  handleStartDiscussion(scenarioId, options) {
    this.discussionPhase = true;
    this.votingPhase = false;
    this.gameState.currentScenario = scenarioId;
    this.emit('discussionStarted', { scenarioId, options });
  }

  handleStartVoting(scenarioId, options) {
    this.discussionPhase = false;
    this.votingPhase = true;
    this.gameState.votes.clear();
    this.emit('votingStarted', { scenarioId, options });
  }

  handleConsensusReached(decision, scenarioId) {
    this.gameState.consensusReached = true;
    this.votingPhase = false;
    this.discussionPhase = false;
    this.emit('consensusReached', { decision, scenarioId });
  }

  handleLevelProgression(newLevel) {
    this.gameState.currentLevel = newLevel;
    this.resetGameState();
    this.emit('levelProgression', { newLevel });
  }

  /**
   * Timer Management
   */
  startDiscussionTimer() {
    if (this.discussionTimer) {
      clearInterval(this.discussionTimer);
    }

    this.discussionTimer = setInterval(() => {
      this.gameState.timeRemaining -= 1000;

      if (this.gameState.timeRemaining <= 0) {
        clearInterval(this.discussionTimer);

        // Automatically start voting phase
        if (this.isHost) {
          this.startVoting(this.gameState.currentScenario, []); // Options should be passed from game
        }
      }

      this.emit('timerUpdate', {
        timeRemaining: this.gameState.timeRemaining,
        phase: 'discussion',
      });
    }, 1000);
  }

  startVotingTimer() {
    if (this.votingTimer) {
      clearInterval(this.votingTimer);
    }

    this.votingTimer = setInterval(() => {
      this.gameState.timeRemaining -= 1000;

      if (this.gameState.timeRemaining <= 0) {
        clearInterval(this.votingTimer);

        // Force consensus with current votes
        if (this.isHost) {
          this.checkForConsensus(this.gameState.currentScenario);
        }
      }

      this.emit('timerUpdate', { timeRemaining: this.gameState.timeRemaining, phase: 'voting' });
    }, 1000);
  }

  /**
   * Utility Functions
   */
  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  getRoomHostId(roomCode) {
    // In a real implementation, this would query a signaling server
    // For now, assume room code maps to host peer ID
    return `host_${roomCode.toLowerCase()}`;
  }

  getConnectedPlayers() {
    const players = [
      {
        playerId: this.playerId,
        playerName: this.playerName,
        isHost: this.isHost,
        isLocal: true,
      },
    ];

    for (const [peerId, connection] of this.connections.entries()) {
      players.push({
        playerId: peerId,
        playerName: connection.metadata?.playerName || 'Unknown Player',
        isHost: false,
        isLocal: false,
      });
    }

    return players;
  }

  resetGameState() {
    this.gameState.votes.clear();
    this.gameState.playerDecisions.clear();
    this.gameState.consensusReached = false;
    this.discussionPhase = false;
    this.votingPhase = false;
    this.gameState.timeRemaining = 0;

    // Clear timers
    if (this.discussionTimer) {
      clearInterval(this.discussionTimer);
      this.discussionTimer = null;
    }
    if (this.votingTimer) {
      clearInterval(this.votingTimer);
      this.votingTimer = null;
    }
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
        console.error('[Multiplayer] Event handler error:', error);
      }
    }
  }

  /**
   * Get current multiplayer status
   */
  getStatus() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      roomCode: this.gameRoom,
      isHost: this.isHost,
      isConnected: this.localPeer && this.localPeer.open,
      connectedPlayers: this.connections.size + 1,
      maxPlayers: this.config.maxPlayers,
      gameState: {
        currentLevel: this.gameState.currentLevel,
        currentScenario: this.gameState.currentScenario,
        discussionPhase: this.discussionPhase,
        votingPhase: this.votingPhase,
        consensusReached: this.gameState.consensusReached,
        totalVotes: this.gameState.votes.size,
      },
    };
  }

  /**
   * Cleanup connections and resources
   */
  cleanup() {
    console.log('[Multiplayer] Cleaning up connections...');

    // Clear timers
    if (this.discussionTimer) {
      clearInterval(this.discussionTimer);
      this.discussionTimer = null;
    }
    if (this.votingTimer) {
      clearInterval(this.votingTimer);
      this.votingTimer = null;
    }

    // Close all peer connections
    for (const [peerId, connection] of this.connections.entries()) {
      try {
        connection.close();
      } catch (error) {
        console.warn('[Multiplayer] Error closing connection:', peerId, error);
      }
    }
    this.connections.clear();

    // Close peer
    if (this.localPeer) {
      try {
        this.localPeer.destroy();
      } catch (error) {
        console.warn('[Multiplayer] Error destroying peer:', error);
      }
      this.localPeer = null;
    }

    // Reset state
    this.resetGameState();
    this.gameRoom = null;
    this.isHost = false;

    this.emit('cleanup');
  }

  /**
   * Disconnect from current session
   */
  disconnect() {
    console.log('[Multiplayer] Disconnecting from session...');
    this.cleanup();
    this.emit('disconnected');
  }
}

// Export for use in other modules
window.DemocracyMultiplayer = DemocracyMultiplayer;

console.log('[Multiplayer] WebRTC Multiplayer System loaded successfully');
