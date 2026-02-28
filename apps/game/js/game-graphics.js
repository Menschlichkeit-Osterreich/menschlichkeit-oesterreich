/* ==========================================================================
   EDUCATIONAL GAMING GRAPHICS & ICONS
   SVG-basierte Grafiken für das Demokratie-Lernspiel-System
   ========================================================================== */

class GameGraphics {
  constructor() {
    this.svgNamespace = 'http://www.w3.org/2000/svg';
    this.iconCache = new Map();
  }

  /* ==========================================================================
     GAME ICONS - Minispiele Illustrationen
     ========================================================================== */

  createFactCheckIcon(size = 32, color = '#e74c3c') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="factCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#factCheckGrad)" />
        <path d="M12 8 L20 8 M12 12 L24 12 M8 16 L18 16 M8 20 L22 20 M12 24 L20 24" 
              stroke="white" stroke-width="2" stroke-linecap="round" />
        <circle cx="24" cy="8" r="4" fill="#27ae60" />
        <path d="M22 8 L24 9.5 L26 7" stroke="white" stroke-width="1.5" 
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  createBridgePuzzleIcon(size = 32, color = '#3498db') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
        </defs>
        <!-- Bridge Structure -->
        <path d="M2 20 Q8 12 16 14 Q24 12 30 20" fill="none" stroke="url(#bridgeGrad)" stroke-width="3" />
        <path d="M2 22 L30 22" stroke="url(#bridgeGrad)" stroke-width="4" />
        <!-- Bridge Pillars -->
        <rect x="7" y="14" width="2" height="8" fill="url(#bridgeGrad)" />
        <rect x="15" y="12" width="2" height="10" fill="url(#bridgeGrad)" />
        <rect x="23" y="14" width="2" height="8" fill="url(#bridgeGrad)" />
        <!-- Connection Points -->
        <circle cx="8" cy="18" r="2" fill="#f39c12" />
        <circle cx="16" cy="16" r="2" fill="#e74c3c" />
        <circle cx="24" cy="18" r="2" fill="#27ae60" />
      </svg>
    `;
  }

  createDebateDuelIcon(size = 32, color = '#9b59b6') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="debateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
        </defs>
        <!-- Balance Scale -->
        <path d="M16 4 L16 24" stroke="url(#debateGrad)" stroke-width="3" />
        <path d="M6 12 L26 12" stroke="url(#debateGrad)" stroke-width="2" />
        <!-- Left Scale -->
        <path d="M6 12 L3 18 L9 18 Z" fill="${color}" opacity="0.8" />
        <!-- Right Scale -->
        <path d="M26 12 L23 18 L29 18 Z" fill="${color}" opacity="0.8" />
        <!-- Arguments -->
        <circle cx="6" cy="15" r="2" fill="#e74c3c" />
        <circle cx="26" cy="15" r="2" fill="#27ae60" />
        <!-- Base -->
        <rect x="12" y="24" width="8" height="4" rx="2" fill="url(#debateGrad)" />
      </svg>
    `;
  }

  createCitySimulationIcon(size = 32, color = '#27ae60') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 30)}" />
          </linearGradient>
        </defs>
        <!-- Buildings -->
        <rect x="2" y="16" width="6" height="12" fill="url(#cityGrad)" rx="1" />
        <rect x="10" y="12" width="5" height="16" fill="url(#cityGrad)" rx="1" />
        <rect x="17" y="8" width="6" height="20" fill="url(#cityGrad)" rx="1" />
        <rect x="25" y="14" width="5" height="14" fill="url(#cityGrad)" rx="1" />
        <!-- Windows -->
        <rect x="3" y="18" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="5" y="18" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="3" y="21" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="11" y="15" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="13" y="15" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="18" y="11" width="1" height="1" fill="white" opacity="0.8" />
        <rect x="20" y="11" width="1" height="1" fill="white" opacity="0.8" />
        <!-- Parks/Green Spaces -->
        <circle cx="8" cy="26" r="1.5" fill="#2ecc71" />
        <circle cx="27" cy="26" r="1" fill="#2ecc71" />
      </svg>
    `;
  }

  createCrisisCouncilIcon(size = 32, color = '#e74c3c') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="crisisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
          <filter id="alertGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Alert Triangle -->
        <path d="M16 4 L28 26 L4 26 Z" fill="url(#crisisGrad)" filter="url(#alertGlow)" />
        <!-- Exclamation Mark -->
        <rect x="15" y="10" width="2" height="8" fill="white" rx="1" />
        <circle cx="16" cy="21" r="1.5" fill="white" />
        <!-- Clock indicators -->
        <circle cx="24" cy="8" r="3" fill="#f39c12" opacity="0.9" />
        <path d="M24 6 L24 8 L25.5 9" stroke="white" stroke-width="1" 
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  createDialogueRPGIcon(size = 32, color = '#f39c12') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="dialogueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
        </defs>
        <!-- Speech Bubbles -->
        <ellipse cx="10" cy="12" rx="8" ry="6" fill="url(#dialogueGrad)" />
        <path d="M6 16 L4 20 L8 18 Z" fill="url(#dialogueGrad)" />
        
        <ellipse cx="22" cy="20" rx="8" ry="6" fill="${this.lightenColor(color, 30)}" />
        <path d="M26 24 L28 28 L24 26 Z" fill="${this.lightenColor(color, 30)}" />
        
        <!-- Conversation Icons -->
        <circle cx="7" cy="10" r="1" fill="white" />
        <circle cx="10" cy="10" r="1" fill="white" />
        <circle cx="13" cy="10" r="1" fill="white" />
        
        <path d="M19 18 Q22 16 25 18" stroke="white" stroke-width="1.5" 
              stroke-linecap="round" fill="none" />
        <!-- Hearts for Empathy -->
        <path d="M16 6 C16 5 17 4 18 5 C19 4 20 5 20 6 C20 7 18 9 16 11 C14 9 12 7 12 6 C12 5 13 4 14 5 C15 4 16 5 16 6 Z" 
              fill="#e74c3c" opacity="0.7" />
      </svg>
    `;
  }

  createNetworkAnalysisIcon(size = 32, color = '#34495e') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="networkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" />
            <stop offset="100%" stop-color="${this.darkenColor(color, 20)}" />
          </linearGradient>
        </defs>
        <!-- Network Connections -->
        <path d="M8 8 L16 16 M16 16 L24 8 M8 24 L16 16 M16 16 L24 24 M8 8 L24 24 M8 24 L24 8" 
              stroke="url(#networkGrad)" stroke-width="1.5" opacity="0.6" />
        
        <!-- Network Nodes -->
        <circle cx="8" cy="8" r="3" fill="#3498db" />
        <circle cx="24" cy="8" r="3" fill="#27ae60" />
        <circle cx="16" cy="16" r="4" fill="url(#networkGrad)" />
        <circle cx="8" cy="24" r="3" fill="#e74c3c" />
        <circle cx="24" cy="24" r="3" fill="#f39c12" />
        
        <!-- Bot Indicator -->
        <circle cx="24" cy="8" r="5" fill="none" stroke="#e74c3c" stroke-width="2" 
                stroke-dasharray="2,2" opacity="0.8" />
        <text x="26" y="6" fill="#e74c3c" font-size="8" font-weight="bold">!</text>
      </svg>
    `;
  }

  /* ==========================================================================
     ACHIEVEMENT BADGES
     ========================================================================== */

  createAchievementBadge(type = 'bronze', icon = '🏆', size = 48) {
    const colors = {
      bronze: { primary: '#cd7f32', secondary: '#b8711c' },
      silver: { primary: '#c0c0c0', secondary: '#a8a8a8' },
      gold: { primary: '#ffd700', secondary: '#e6c200' },
      platinum: { primary: '#e5e4e2', secondary: '#d3d2cf' },
      legendary: { primary: '#9b59b6', secondary: '#8e44ad' },
    };

    const color = colors[type] || colors.bronze;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="badgeGrad_${type}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color.primary}" />
            <stop offset="100%" stop-color="${color.secondary}" />
          </linearGradient>
          <filter id="badgeGlow_${type}">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Badge Background -->
        <circle cx="24" cy="24" r="20" fill="url(#badgeGrad_${type})" filter="url(#badgeGlow_${type})" />
        <circle cx="24" cy="24" r="18" fill="none" stroke="white" stroke-width="2" opacity="0.3" />
        
        <!-- Inner Circle -->
        <circle cx="24" cy="24" r="14" fill="rgba(255,255,255,0.2)" />
        
        <!-- Icon -->
        <text x="24" y="30" text-anchor="middle" font-size="16" fill="white">${icon}</text>
        
        <!-- Sparkles for higher tiers -->
        ${
          type === 'gold' || type === 'platinum' || type === 'legendary'
            ? `
          <text x="12" y="12" font-size="8" fill="white" opacity="0.8">✨</text>
          <text x="36" y="12" font-size="8" fill="white" opacity="0.8">✨</text>
          <text x="12" y="36" font-size="8" fill="white" opacity="0.8">✨</text>
          <text x="36" y="36" font-size="8" fill="white" opacity="0.8">✨</text>
        `
            : ''
        }
      </svg>
    `;
  }

  /* ==========================================================================
     PROGRESS INDICATORS
     ========================================================================== */

  createProgressRing(percentage, size = 64, strokeWidth = 6) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3498db" />
            <stop offset="50%" stop-color="#2ecc71" />
            <stop offset="100%" stop-color="#27ae60" />
          </linearGradient>
        </defs>
        
        <!-- Background Circle -->
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" 
                stroke="#ecf0f1" stroke-width="${strokeWidth}" />
        
        <!-- Progress Circle -->
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" 
                stroke="url(#progressGrad)" stroke-width="${strokeWidth}"
                stroke-dasharray="${circumference} ${circumference}"
                stroke-dashoffset="${offset}" stroke-linecap="round"
                transform="rotate(-90 ${size / 2} ${size / 2})" />
        
        <!-- Percentage Text -->
        <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" font-size="${size / 4}" 
              font-weight="bold" fill="#2c3e50">${Math.round(percentage)}%</text>
      </svg>
    `;
  }

  /* ==========================================================================
     DASHBOARD ELEMENTS
     ========================================================================== */

  createDashboardChart(data, width = 200, height = 100) {
    const maxValue = Math.max(...data);
    const barWidth = width / data.length;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="${this.svgNamespace}">
        <defs>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3498db" />
            <stop offset="100%" stop-color="#2980b9" />
          </linearGradient>
        </defs>
        
        ${data
          .map((value, index) => {
            const barHeight = (value / maxValue) * height * 0.8;
            const x = index * barWidth + barWidth * 0.1;
            const y = height - barHeight;

            return `
            <rect x="${x}" y="${y}" width="${barWidth * 0.8}" height="${barHeight}" 
                  fill="url(#chartGrad)" rx="2" opacity="0.8">
              <animate attributeName="height" from="0" to="${barHeight}" 
                       dur="1s" begin="${index * 0.1}s" />
              <animate attributeName="y" from="${height}" to="${y}" 
                       dur="1s" begin="${index * 0.1}s" />
            </rect>
          `;
          })
          .join('')}
      </svg>
    `;
  }

  /* ==========================================================================
     UTILITY FUNCTIONS
     ========================================================================== */

  darkenColor(color, percent) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  lightenColor(color, percent) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  /* ==========================================================================
     ANIMATION HELPERS
     ========================================================================== */

  addPulseAnimation(element, duration = '2s') {
    element.style.animation = `pulse ${duration} ease-in-out infinite`;
  }

  addFloatAnimation(element, duration = '3s') {
    element.style.animation = `float ${duration} ease-in-out infinite`;
  }

  addRotateAnimation(element, duration = '10s') {
    element.style.animation = `rotate ${duration} linear infinite`;
  }

  /* ==========================================================================
     INTERACTIVE GRAPHICS
     ========================================================================== */

  createInteractiveGameCard(gameData) {
    const { id, title, description, status, progress } = gameData;

    return `
      <div class="interactive-game-card" data-game-id="${id}">
        <div class="card-icon">
          ${this.getGameIcon(id)}
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
          <p class="card-description">${description}</p>
          <div class="card-progress">
            ${this.createProgressRing(progress, 32, 4)}
            <span class="progress-text">${progress}%</span>
          </div>
        </div>
        <div class="card-status ${status}">
          ${this.getStatusIcon(status)}
        </div>
      </div>
    `;
  }

  getGameIcon(gameId) {
    const iconMap = {
      factcheck_speedrun: () => this.createFactCheckIcon(),
      bridge_puzzle: () => this.createBridgePuzzleIcon(),
      debate_duel: () => this.createDebateDuelIcon(),
      city_simulation: () => this.createCitySimulationIcon(),
      crisis_council: () => this.createCrisisCouncilIcon(),
      dialogue_rpg: () => this.createDialogueRPGIcon(),
      network_analysis: () => this.createNetworkAnalysisIcon(),
    };

    return iconMap[gameId] ? iconMap[gameId]() : this.createFactCheckIcon();
  }

  getStatusIcon(status) {
    const statusIcons = {
      locked: '🔒',
      available: '🎮',
      current: '⚡',
      completed: '✅',
      mastered: '🏆',
    };

    return statusIcons[status] || '❓';
  }

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */

  init() {
    // CSS für Animationen hinzufügen
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .interactive-game-card {
        background: linear-gradient(135deg, #fff, #f8f9fa);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      
      .interactive-game-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
      
      .card-icon {
        margin-bottom: 15px;
      }
      
      .card-content {
        text-align: center;
      }
      
      .card-title {
        color: #2c3e50;
        margin-bottom: 8px;
      }
      
      .card-description {
        color: #7f8c8d;
        font-size: 0.9em;
        margin-bottom: 15px;
      }
      
      .card-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      
      .card-status {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 1.2em;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize graphics system
const gameGraphics = new GameGraphics();
gameGraphics.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameGraphics;
} else if (typeof window !== 'undefined') {
  window.GameGraphics = GameGraphics;
}
