/**
 * Real-time Synchronization System
 * Democracy Metaverse - Collaborative Game State Management
 *
 * Verwaltet synchrone Spielzustände zwischen mehreren Spielern
 * für konsistente kollaborative Democracy-Education
 */

class DemocracySync {
  constructor() {
    this.multiplayer = null;
    this.gameEngine = null;
    this.syncEnabled = false;

    // Synchronization state
    this.gameState = {
      levelId: 1,
      currentScenario: null,
      playerActions: new Map(),
      sharedDecisions: new Map(),
      gamePhase: 'waiting', // waiting, discussion, voting, consensus, progression
      timestamp: Date.now(),
    };

    // Conflict resolution
    this.conflictResolver = new ConflictResolver();

    // Event batching for performance
    this.eventQueue = [];
    this.batchInterval = 100; // ms
    this.batchTimer = null;

    // Synchronization settings
    this.config = {
      syncInterval: 1000, // 1 second full sync
      deltaSync: true, // Send only changes
      conflictResolution: 'host', // host, timestamp, vote
      maxDesyncTime: 5000, // 5 seconds max desync
      enableRollback: true, // Allow state rollback
      debugSync: false, // Log sync operations
    };

    // Performance monitoring
    this.syncStats = {
      messagesSent: 0,
      messagesReceived: 0,
      syncLatency: [],
      conflictsResolved: 0,
      rollbacksPerformed: 0,
    };

    console.log('[Sync] Real-time Synchronization System initialized');
  }

  /**
   * Initialize synchronization with multiplayer system
   */
  initialize(multiplayerSystem, gameEngineInstance) {
    this.multiplayer = multiplayerSystem;
    this.gameEngine = gameEngineInstance;

    if (!this.multiplayer) {
      throw new Error('Multiplayer system required for synchronization');
    }

    this.setupMultiplayerEventHandlers();
    this.setupGameEventHandlers();
    this.startSyncLoop();

    this.syncEnabled = true;

    console.log('[Sync] Synchronization initialized');
    return true;
  }

  /**
   * Setup multiplayer event handlers for sync
   */
  setupMultiplayerEventHandlers() {
    // Handle incoming sync messages
    this.multiplayer.on('syncStateUpdate', data => {
      this.handleSyncStateUpdate(data);
    });

    this.multiplayer.on('syncDeltaUpdate', data => {
      this.handleSyncDeltaUpdate(data);
    });

    this.multiplayer.on('syncConflict', data => {
      this.handleSyncConflict(data);
    });

    this.multiplayer.on('syncRequest', data => {
      this.handleSyncRequest(data.senderId);
    });

    // Handle player state changes
    this.multiplayer.on('playerJoined', data => {
      this.sendFullSyncToPlayer(data.playerId);
    });

    this.multiplayer.on('playerLeft', data => {
      this.cleanupPlayerState(data.playerId);
    });

    console.log('[Sync] Multiplayer event handlers setup complete');
  }

  /**
   * Setup game engine event handlers
   */
  setupGameEventHandlers() {
    if (!this.gameEngine) return;

    // Level progression events
    this.gameEngine.on('levelStart', data => {
      this.syncGameEvent('level_start', data);
    });

    this.gameEngine.on('levelComplete', data => {
      this.syncGameEvent('level_complete', data);
    });

    // Democracy decision events
    this.gameEngine.on('scenarioPresented', data => {
      this.syncGameEvent('scenario_presented', data);
    });

    this.gameEngine.on('playerDecision', data => {
      this.syncPlayerAction('decision', data);
    });

    this.gameEngine.on('discussionStarted', data => {
      this.syncGamePhase('discussion', data);
    });

    this.gameEngine.on('votingStarted', data => {
      this.syncGamePhase('voting', data);
    });

    this.gameEngine.on('consensusReached', data => {
      this.syncGamePhase('consensus', data);
    });

    // Game state changes
    this.gameEngine.on('stateChanged', data => {
      this.syncGameState(data);
    });

    console.log('[Sync] Game engine event handlers setup complete');
  }

  /**
   * Start synchronization loop
   */
  startSyncLoop() {
    // Periodic full sync for consistency
    this.syncInterval = setInterval(() => {
      if (this.syncEnabled && this.multiplayer.isHost) {
        this.performFullSync();
      }
    }, this.config.syncInterval);

    // Batch event processing
    this.batchTimer = setInterval(() => {
      this.processBatchedEvents();
    }, this.batchInterval);

    console.log('[Sync] Synchronization loop started');
  }

  /**
   * Sync game event to all players
   */
  syncGameEvent(eventType, eventData) {
    if (!this.syncEnabled) return;

    const syncMessage = {
      type: 'sync_game_event',
      eventType: eventType,
      eventData: eventData,
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
      sequenceId: this.generateSequenceId(),
    };

    if (this.config.deltaSync) {
      this.queueForBatch(syncMessage);
    } else {
      this.sendSyncMessage(syncMessage);
    }

    // Update local state
    this.updateLocalGameState(eventType, eventData);
  }

  /**
   * Sync player action
   */
  syncPlayerAction(actionType, actionData) {
    if (!this.syncEnabled) return;

    const playerId = this.multiplayer.playerId;
    const action = {
      playerId: playerId,
      actionType: actionType,
      actionData: actionData,
      timestamp: Date.now(),
    };

    // Store locally
    this.gameState.playerActions.set(playerId, action);

    // Sync to other players
    const syncMessage = {
      type: 'sync_player_action',
      action: action,
      timestamp: Date.now(),
      senderId: playerId,
      sequenceId: this.generateSequenceId(),
    };

    this.sendSyncMessage(syncMessage);

    if (this.config.debugSync) {
      console.log('[Sync] Synced player action:', actionType, actionData);
    }
  }

  /**
   * Sync game phase change
   */
  syncGamePhase(newPhase, phaseData) {
    if (!this.syncEnabled) return;

    // Only host can change game phase
    if (!this.multiplayer.isHost) {
      console.warn('[Sync] Only host can change game phase');
      return;
    }

    const previousPhase = this.gameState.gamePhase;
    this.gameState.gamePhase = newPhase;
    this.gameState.timestamp = Date.now();

    const syncMessage = {
      type: 'sync_game_phase',
      newPhase: newPhase,
      previousPhase: previousPhase,
      phaseData: phaseData,
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
      sequenceId: this.generateSequenceId(),
    };

    this.sendSyncMessage(syncMessage);

    console.log('[Sync] Game phase changed:', previousPhase, '→', newPhase);
  }

  /**
   * Sync complete game state
   */
  syncGameState(stateChanges) {
    if (!this.syncEnabled) return;

    // Update local state
    Object.assign(this.gameState, stateChanges);
    this.gameState.timestamp = Date.now();

    if (this.config.deltaSync) {
      // Send only changes
      const deltaMessage = {
        type: 'sync_delta_update',
        changes: stateChanges,
        timestamp: Date.now(),
        senderId: this.multiplayer.playerId,
        sequenceId: this.generateSequenceId(),
      };

      this.queueForBatch(deltaMessage);
    } else {
      // Send full state
      this.performFullSync();
    }
  }

  /**
   * Perform full synchronization
   */
  performFullSync() {
    if (!this.multiplayer.isHost) return;

    const fullSyncMessage = {
      type: 'sync_state_update',
      gameState: this.serializeGameState(),
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
      sequenceId: this.generateSequenceId(),
    };

    this.sendSyncMessage(fullSyncMessage);

    if (this.config.debugSync) {
      console.log('[Sync] Full sync performed');
    }
  }

  /**
   * Send sync message to all players
   */
  sendSyncMessage(message) {
    if (!this.multiplayer) return;

    try {
      this.multiplayer.broadcastToAll(message);
      this.syncStats.messagesSent++;

      // Track latency for performance monitoring
      message.sendTime = Date.now();
    } catch (error) {
      console.error('[Sync] Failed to send sync message:', error);
    }
  }

  /**
   * Queue message for batch processing
   */
  queueForBatch(message) {
    this.eventQueue.push(message);
  }

  /**
   * Process batched events
   */
  processBatchedEvents() {
    if (this.eventQueue.length === 0) return;

    const batchMessage = {
      type: 'sync_batch_update',
      events: [...this.eventQueue],
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
      sequenceId: this.generateSequenceId(),
    };

    this.sendSyncMessage(batchMessage);
    this.eventQueue = [];

    if (this.config.debugSync && batchMessage.events.length > 0) {
      console.log('[Sync] Processed batch:', batchMessage.events.length, 'events');
    }
  }

  /**
   * Handle incoming sync state update
   */
  handleSyncStateUpdate(data) {
    if (data.senderId === this.multiplayer.playerId) return; // Ignore own messages

    this.syncStats.messagesReceived++;

    try {
      // Calculate latency
      if (data.sendTime) {
        const latency = Date.now() - data.sendTime;
        this.syncStats.syncLatency.push(latency);

        // Keep only recent latency data
        if (this.syncStats.syncLatency.length > 100) {
          this.syncStats.syncLatency.shift();
        }
      }

      // Check for conflicts
      if (this.detectStateConflict(data.gameState)) {
        this.handleStateConflict(data);
        return;
      }

      // Apply state update
      this.applyStateUpdate(data.gameState);

      if (this.config.debugSync) {
        console.log('[Sync] Applied state update from:', data.senderId);
      }
    } catch (error) {
      console.error('[Sync] Failed to handle state update:', error);
    }
  }

  /**
   * Handle incoming delta update
   */
  handleSyncDeltaUpdate(data) {
    if (data.senderId === this.multiplayer.playerId) return;

    this.syncStats.messagesReceived++;

    try {
      // Apply incremental changes
      this.applyDeltaUpdate(data.changes);

      if (this.config.debugSync) {
        console.log('[Sync] Applied delta update:', Object.keys(data.changes));
      }
    } catch (error) {
      console.error('[Sync] Failed to handle delta update:', error);
    }
  }

  /**
   * Handle batch update
   */
  handleSyncBatchUpdate(data) {
    if (data.senderId === this.multiplayer.playerId) return;

    this.syncStats.messagesReceived++;

    try {
      // Process each event in the batch
      for (const event of data.events) {
        switch (event.type) {
          case 'sync_game_event':
            this.applyGameEvent(event.eventType, event.eventData);
            break;
          case 'sync_delta_update':
            this.applyDeltaUpdate(event.changes);
            break;
          default:
            console.warn('[Sync] Unknown batch event type:', event.type);
        }
      }

      if (this.config.debugSync) {
        console.log('[Sync] Processed batch update:', data.events.length, 'events');
      }
    } catch (error) {
      console.error('[Sync] Failed to handle batch update:', error);
    }
  }

  /**
   * Detect state conflicts
   */
  detectStateConflict(incomingState) {
    // Check timestamp for temporal conflicts
    const timeDiff = Math.abs(incomingState.timestamp - this.gameState.timestamp);
    if (timeDiff > this.config.maxDesyncTime) {
      console.warn('[Sync] Temporal conflict detected:', timeDiff + 'ms');
      return true;
    }

    // Check for phase conflicts
    if (incomingState.gamePhase !== this.gameState.gamePhase) {
      console.warn(
        '[Sync] Phase conflict:',
        this.gameState.gamePhase,
        '≠',
        incomingState.gamePhase
      );
      return true;
    }

    // Check for level conflicts
    if (incomingState.levelId !== this.gameState.levelId) {
      console.warn('[Sync] Level conflict:', this.gameState.levelId, '≠', incomingState.levelId);
      return true;
    }

    return false;
  }

  /**
   * Handle state conflicts
   */
  handleStateConflict(conflictData) {
    this.syncStats.conflictsResolved++;

    console.log('[Sync] Resolving state conflict using strategy:', this.config.conflictResolution);

    switch (this.config.conflictResolution) {
      case 'host':
        if (this.multiplayer.isHost) {
          // Host wins - reject incoming state
          this.rejectStateUpdate(conflictData);
        } else {
          // Accept host state
          this.applyStateUpdate(conflictData.gameState);
        }
        break;

      case 'timestamp':
        // Most recent timestamp wins
        if (conflictData.gameState.timestamp > this.gameState.timestamp) {
          this.applyStateUpdate(conflictData.gameState);
        } else {
          this.rejectStateUpdate(conflictData);
        }
        break;

      case 'vote':
        // Request vote from all players (implement if needed)
        this.requestConflictVote(conflictData);
        break;

      default:
        console.warn('[Sync] Unknown conflict resolution strategy');
        // Default to host authority
        if (!this.multiplayer.isHost) {
          this.applyStateUpdate(conflictData.gameState);
        }
    }
  }

  /**
   * Apply state update
   */
  applyStateUpdate(newGameState) {
    try {
      // Validate incoming state
      if (!this.validateGameState(newGameState)) {
        console.error('[Sync] Invalid game state received');
        return false;
      }

      // Store previous state for potential rollback
      const previousState = this.serializeGameState();

      // Apply new state
      this.gameState = this.deserializeGameState(newGameState);

      // Update game engine if available
      if (this.gameEngine && typeof this.gameEngine.updateState === 'function') {
        this.gameEngine.updateState(this.gameState);
      }

      // Store rollback data
      if (this.config.enableRollback) {
        this.storeRollbackPoint(previousState);
      }

      return true;
    } catch (error) {
      console.error('[Sync] Failed to apply state update:', error);
      return false;
    }
  }

  /**
   * Apply delta update
   */
  applyDeltaUpdate(changes) {
    try {
      // Apply incremental changes to game state
      for (const [key, value] of Object.entries(changes)) {
        if (key in this.gameState) {
          this.gameState[key] = value;
        }
      }

      // Update timestamp
      this.gameState.timestamp = Date.now();

      // Notify game engine of changes
      if (this.gameEngine && typeof this.gameEngine.updateState === 'function') {
        this.gameEngine.updateState(this.gameState, changes);
      }

      return true;
    } catch (error) {
      console.error('[Sync] Failed to apply delta update:', error);
      return false;
    }
  }

  /**
   * Apply game event
   */
  applyGameEvent(eventType, eventData) {
    try {
      // Update local state based on event
      this.updateLocalGameState(eventType, eventData);

      // Forward to game engine
      if (this.gameEngine && typeof this.gameEngine.handleSyncEvent === 'function') {
        this.gameEngine.handleSyncEvent(eventType, eventData);
      }

      return true;
    } catch (error) {
      console.error('[Sync] Failed to apply game event:', error);
      return false;
    }
  }

  /**
   * Update local game state
   */
  updateLocalGameState(eventType, eventData) {
    switch (eventType) {
      case 'level_start':
        this.gameState.levelId = eventData.levelId;
        this.gameState.gamePhase = 'active';
        break;

      case 'level_complete':
        this.gameState.gamePhase = 'completed';
        break;

      case 'scenario_presented':
        this.gameState.currentScenario = eventData.scenarioId;
        this.gameState.gamePhase = 'discussion';
        break;

      default:
        // Handle custom events
        if (this.gameEngine && typeof this.gameEngine.updateLocalState === 'function') {
          this.gameEngine.updateLocalState(eventType, eventData);
        }
    }

    this.gameState.timestamp = Date.now();
  }

  /**
   * Send full sync to specific player
   */
  sendFullSyncToPlayer(playerId) {
    if (!this.multiplayer.isHost) return;

    const syncMessage = {
      type: 'sync_state_update',
      gameState: this.serializeGameState(),
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
      sequenceId: this.generateSequenceId(),
    };

    this.multiplayer.sendToPeer(playerId, syncMessage);

    console.log('[Sync] Sent full sync to player:', playerId);
  }

  /**
   * Handle sync request from player
   */
  handleSyncRequest(senderId) {
    if (this.multiplayer.isHost) {
      this.sendFullSyncToPlayer(senderId);
    }
  }

  /**
   * Request sync from host
   */
  requestSync() {
    if (this.multiplayer.isHost) return; // Host doesn't need to request

    const requestMessage = {
      type: 'sync_request',
      senderId: this.multiplayer.playerId,
      timestamp: Date.now(),
    };

    // Send to host (assuming we can identify host)
    for (const [peerId, connection] of this.multiplayer.connections.entries()) {
      if (connection.metadata?.isHost) {
        this.multiplayer.sendToPeer(peerId, requestMessage);
        break;
      }
    }

    console.log('[Sync] Requested sync from host');
  }

  /**
   * Utility functions
   */
  serializeGameState() {
    return {
      levelId: this.gameState.levelId,
      currentScenario: this.gameState.currentScenario,
      playerActions: Object.fromEntries(this.gameState.playerActions),
      sharedDecisions: Object.fromEntries(this.gameState.sharedDecisions),
      gamePhase: this.gameState.gamePhase,
      timestamp: this.gameState.timestamp,
    };
  }

  deserializeGameState(serializedState) {
    return {
      levelId: serializedState.levelId,
      currentScenario: serializedState.currentScenario,
      playerActions: new Map(Object.entries(serializedState.playerActions || {})),
      sharedDecisions: new Map(Object.entries(serializedState.sharedDecisions || {})),
      gamePhase: serializedState.gamePhase,
      timestamp: serializedState.timestamp,
    };
  }

  validateGameState(gameState) {
    // Basic validation
    return (
      typeof gameState === 'object' &&
      typeof gameState.levelId === 'number' &&
      typeof gameState.gamePhase === 'string' &&
      typeof gameState.timestamp === 'number'
    );
  }

  generateSequenceId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  cleanupPlayerState(playerId) {
    this.gameState.playerActions.delete(playerId);
    console.log('[Sync] Cleaned up state for player:', playerId);
  }

  storeRollbackPoint(gameState) {
    // Store rollback data (implement as needed)
    if (!this.rollbackHistory) {
      this.rollbackHistory = [];
    }

    this.rollbackHistory.push({
      gameState: gameState,
      timestamp: Date.now(),
    });

    // Keep only recent history
    if (this.rollbackHistory.length > 10) {
      this.rollbackHistory.shift();
    }
  }

  performRollback(steps = 1) {
    if (!this.config.enableRollback || !this.rollbackHistory) {
      console.warn('[Sync] Rollback not available');
      return false;
    }

    if (this.rollbackHistory.length < steps) {
      console.warn('[Sync] Not enough rollback history');
      return false;
    }

    const rollbackState = this.rollbackHistory[this.rollbackHistory.length - steps];
    this.applyStateUpdate(rollbackState.gameState);

    this.syncStats.rollbacksPerformed++;
    console.log('[Sync] Performed rollback:', steps, 'steps');

    return true;
  }

  rejectStateUpdate(conflictData) {
    // Send rejection message (optional)
    const rejectionMessage = {
      type: 'sync_rejection',
      rejectedSequenceId: conflictData.sequenceId,
      reason: 'conflict_resolved_locally',
      timestamp: Date.now(),
      senderId: this.multiplayer.playerId,
    };

    this.multiplayer.sendToPeer(conflictData.senderId, rejectionMessage);

    console.log('[Sync] Rejected state update from:', conflictData.senderId);
  }

  requestConflictVote(conflictData) {
    // Vote-based conflict resolution: broadcast conflict to all peers and collect votes
    if (!this.multiplayer) return;

    const voteRequest = {
      type: 'conflict_vote_request',
      conflictId: `conflict_${Date.now()}`,
      conflictData: {
        localState: conflictData.localState,
        remoteState: conflictData.remoteState,
        sequenceId: conflictData.sequenceId,
      },
      requesterId: this.multiplayer.playerId,
      timestamp: Date.now(),
      timeout: 3000, // 3 seconds to vote
    };

    // Initialize vote tracking
    this._pendingVotes = this._pendingVotes || new Map();
    this._pendingVotes.set(voteRequest.conflictId, {
      votes: new Map(),
      conflictData,
      timeout: setTimeout(() => {
        this._resolveConflictVote(voteRequest.conflictId);
      }, voteRequest.timeout),
    });

    // Broadcast vote request to all peers
    if (this.multiplayer.broadcastToPeers) {
      this.multiplayer.broadcastToPeers(voteRequest);
    }

    // Cast own vote (prefer local state)
    this._castConflictVote(voteRequest.conflictId, 'local', this.multiplayer.playerId);

    console.log('[Sync] Vote-based conflict resolution initiated:', voteRequest.conflictId);
  }

  _castConflictVote(conflictId, vote, voterId) {
    const pending = this._pendingVotes?.get(conflictId);
    if (!pending) return;
    pending.votes.set(voterId, vote);
    // If all connected peers voted, resolve immediately
    const peerCount = this.multiplayer?.connectedPeers?.size || 1;
    if (pending.votes.size >= peerCount) {
      clearTimeout(pending.timeout);
      this._resolveConflictVote(conflictId);
    }
  }

  _resolveConflictVote(conflictId) {
    const pending = this._pendingVotes?.get(conflictId);
    if (!pending) return;
    const votes = Array.from(pending.votes.values());
    const localVotes = votes.filter(v => v === 'local').length;
    const remoteVotes = votes.filter(v => v === 'remote').length;
    const winner = localVotes >= remoteVotes ? 'local' : 'remote';
    if (winner === 'remote' && pending.conflictData.remoteState) {
      this.applyStateUpdate(pending.conflictData.remoteState);
    }
    this.syncStats.conflictsResolved++;
    this._pendingVotes.delete(conflictId);
    console.log(`[Sync] Conflict ${conflictId} resolved via vote: ${winner} (${localVotes} vs ${remoteVotes})`);
  }

  /**
   * Get synchronization statistics
   */
  getStats() {
    const avgLatency =
      this.syncStats.syncLatency.length > 0
        ? this.syncStats.syncLatency.reduce((a, b) => a + b, 0) / this.syncStats.syncLatency.length
        : 0;

    return {
      messagesSent: this.syncStats.messagesSent,
      messagesReceived: this.syncStats.messagesReceived,
      averageLatency: Math.round(avgLatency),
      conflictsResolved: this.syncStats.conflictsResolved,
      rollbacksPerformed: this.syncStats.rollbacksPerformed,
      syncEnabled: this.syncEnabled,
      gamePhase: this.gameState.gamePhase,
      currentLevel: this.gameState.levelId,
    };
  }

  /**
   * Cleanup synchronization system
   */
  cleanup() {
    console.log('[Sync] Cleaning up synchronization system...');

    this.syncEnabled = false;

    // Clear intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Clear queues
    this.eventQueue = [];
    this.rollbackHistory = [];

    // Reset state
    this.gameState.playerActions.clear();
    this.gameState.sharedDecisions.clear();

    console.log('[Sync] Cleanup complete');
  }
}

/**
 * Conflict Resolution Helper Class
 */
class ConflictResolver {
  constructor() {
    this.strategies = {
      host_authority: this.hostAuthority,
      timestamp_priority: this.timestampPriority,
      democratic_vote: this.democraticVote,
      last_writer_wins: this.lastWriterWins,
    };
  }

  resolve(conflict, strategy = 'host_authority') {
    const resolverFunction = this.strategies[strategy];
    if (!resolverFunction) {
      console.error('[ConflictResolver] Unknown strategy:', strategy);
      return null;
    }

    return resolverFunction.call(this, conflict);
  }

  hostAuthority(conflict) {
    // Host's state takes precedence
    return conflict.states.find(state => state.isHost) || conflict.states[0];
  }

  timestampPriority(conflict) {
    // Most recent timestamp wins
    return conflict.states.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  democraticVote(conflict) {
    // Vote-based resolution (simplified)
    const votes = new Map();
    for (const state of conflict.states) {
      const key = JSON.stringify(state.data);
      votes.set(key, (votes.get(key) || 0) + 1);
    }

    let maxVotes = 0;
    let winningState = null;
    for (const [stateKey, voteCount] of votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winningState = conflict.states.find(s => JSON.stringify(s.data) === stateKey);
      }
    }

    return winningState;
  }

  lastWriterWins(conflict) {
    // Simply take the last state received
    return conflict.states[conflict.states.length - 1];
  }
}

// Export for global use
window.DemocracySync = DemocracySync;
window.ConflictResolver = ConflictResolver;

console.log('[Sync] Real-time Synchronization System loaded successfully');
