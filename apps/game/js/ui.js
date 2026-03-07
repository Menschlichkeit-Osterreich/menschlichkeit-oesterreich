/* ==========================================================================
   Brücken Bauen - UI Controller
   User Interface management and animations
   ========================================================================== */

class GameUI {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.currentScreen = null;
    this.animationQueue = [];
    this.init();
  }

  init() {
    console.log('🎨 UI Controller initialized');
    this.setupScreens();
    this.setupAnimations();
  }

  setupScreens() {
    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen'),
      final: document.getElementById('final-screen'),
    };

    this.elements = {
      progress: {
        bar: document.querySelector('.progress-fill'),
        text: document.getElementById('current-scenario'),
      },
      scenario: {
        category: document.getElementById('scenario-category'),
        title: document.getElementById('scenario-title'),
        description: document.getElementById('scenario-description'),
        image: document.getElementById('scenario-image'),
        options: document.getElementById('decision-options'),
      },
      result: {
        title: document.getElementById('result-title'),
        feedback: document.getElementById('feedback-text'),
        perspectives: document.getElementById('perspectives-list'),
        scores: {
          empathy: document.getElementById('empathy-score'),
          rights: document.getElementById('rights-score'),
          participation: document.getElementById('participation-score'),
          courage: document.getElementById('courage-score'),
        },
      },
      final: {
        profile: document.getElementById('democracy-profile'),
      },
      loading: document.getElementById('loading-screen'),
      submitBtn: document.getElementById('submit-decision-btn'),
    };
  }

  setupAnimations() {
    // Add morphing background
    document.body.classList.add('morphing-background');

    // Setup intersection observer for stagger animations
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all glass cards
    document.querySelectorAll('.glass-card').forEach(card => {
      observer.observe(card);
    });
  }

  showScreen(screenName) {
    const newScreen = this.screens[screenName];
    if (!newScreen) return;

    // Hide current screen
    if (this.currentScreen && this.currentScreen !== newScreen) {
      this.currentScreen.classList.remove('active');
      this.currentScreen.classList.add('scale-out');

      setTimeout(() => {
        this.currentScreen.classList.remove('scale-out');
      }, 300);
    }

    // Show new screen with animation
    setTimeout(
      () => {
        newScreen.classList.add('active');
        newScreen.classList.add('scale-in');

        setTimeout(() => {
          newScreen.classList.remove('scale-in');
        }, 300);

        this.currentScreen = newScreen;

        // Focus management
        this.manageFocus(screenName);
      },
      this.currentScreen === newScreen ? 0 : 150
    );
  }

  manageFocus(screenName) {
    switch (screenName) {
      case 'start':
        {
          const startBtn = document.getElementById('start-game-btn');
          if (startBtn) startBtn.focus();
        }
        break;
      case 'game':
        {
          const firstDecision = document.querySelector('.decision-option');
          if (firstDecision) firstDecision.focus();
        }
        break;
      case 'result':
        {
          const continueBtn = document.getElementById('continue-btn');
          if (continueBtn) continueBtn.focus();
        }
        break;
      case 'final':
        {
          const restartBtn = document.getElementById('restart-btn');
          if (restartBtn) restartBtn.focus();
        }
        break;
    }
  }

  updateProgress(current, total) {
    const percentage = (current / total) * 100;

    if (this.elements.progress.bar) {
      this.elements.progress.bar.style.width = `${percentage}%`;
    }

    if (this.elements.progress.text) {
      this.elements.progress.text.textContent = current;
    }

    // Update progress bar accessibility
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', current);
      progressBar.setAttribute('aria-valuemax', total);
    }
  }

  renderScenario(scenario) {
    // Update scenario content
    if (this.elements.scenario.category) {
      this.elements.scenario.category.textContent = scenario.category;
    }

    if (this.elements.scenario.title) {
      this.elements.scenario.title.textContent = scenario.title;
    }

    if (this.elements.scenario.description) {
      this.elements.scenario.description.textContent = scenario.description;
    }

    // Update scenario image
    if (this.elements.scenario.image) {
      this.elements.scenario.image.className = `scenario-image scenario-${scenario.image}`;
    }

    // Render decision options
    this.renderDecisionOptions(scenario.decisions);

    // Add stagger animation to decision options
    setTimeout(() => {
      const options = document.querySelectorAll('.decision-option');
      options.forEach((option, index) => {
        option.classList.add('stagger-item');
        option.style.animationDelay = `${index * 0.1}s`;
      });
    }, 100);
  }

  renderDecisionOptions(decisions) {
    if (!this.elements.scenario.options) return;

    const optionsHTML = decisions
      .map(
        decision => `
      <button 
        class="decision-option" 
        data-decision-id="${decision.id}"
        type="button"
        role="radio"
        aria-checked="false"
        tabindex="0">
        <p class="decision-option-text">${decision.text}</p>
      </button>
    `
      )
      .join('');

    this.elements.scenario.options.innerHTML = optionsHTML;

    // Update radiogroup attributes
    this.elements.scenario.options.setAttribute('aria-label', 'Wähle deine Entscheidung');
  }

  selectDecisionOption(decisionId) {
    // Remove previous selection
    document.querySelectorAll('.decision-option').forEach(option => {
      option.classList.remove('selected');
      option.setAttribute('aria-checked', 'false');
    });

    // Select new option
    const selectedOption = document.querySelector(`[data-decision-id="${decisionId}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
      selectedOption.setAttribute('aria-checked', 'true');

      // Add selection animation
      selectedOption.classList.add('bounce');
      setTimeout(() => {
        selectedOption.classList.remove('bounce');
      }, 600);
    }
  }

  updateSubmitButton(enabled) {
    if (this.elements.submitBtn) {
      this.elements.submitBtn.disabled = !enabled;

      if (enabled) {
        this.elements.submitBtn.classList.add('glow');
      } else {
        this.elements.submitBtn.classList.remove('glow');
      }
    }
  }

  renderResult(scenario, decision, currentScores, maxPossibleScore) {
    // Update result feedback
    if (this.elements.result.feedback) {
      this.elements.result.feedback.textContent = decision.feedback;
    }

    // Render perspectives
    this.renderPerspectives(scenario.perspectives);

    // Update score bars with animation
    this.animateScores(currentScores, maxPossibleScore);
  }

  renderPerspectives(perspectives) {
    if (!this.elements.result.perspectives) return;

    const perspectivesHTML = perspectives
      .map(
        (perspective, index) => `
      <div class="perspective-item stagger-item" style="animation-delay: ${index * 0.2}s">
        <div class="perspective-icon">${perspective.icon}</div>
        <div class="perspective-content">
          <h4 class="perspective-title">${perspective.title}</h4>
          <p class="perspective-text">${perspective.text}</p>
        </div>
      </div>
    `
      )
      .join('');

    this.elements.result.perspectives.innerHTML = perspectivesHTML;
  }

  animateScores(scores, maxPossibleScore) {
    const maxScore = maxPossibleScore / 4; // Max per category

    Object.keys(scores).forEach((scoreType, index) => {
      const scoreElement = this.elements.result.scores[scoreType];
      if (scoreElement) {
        const percentage = (scores[scoreType] / maxScore) * 100;

        // Animate with delay
        setTimeout(() => {
          scoreElement.style.width = `${Math.min(percentage, 100)}%`;
          scoreElement.classList.add('score-fill');
        }, index * 200);
      }
    });
  }

  renderFinalResult(gameState) {
    if (!this.elements.final.profile) return;

    const { profile, scores, totalScore } = gameState;
    const percentage = Math.round((totalScore / this.game.maxPossibleScore) * 100);

    const profileHTML = `
      <div class="profile-badge fade-in">
        <span style="font-size: 1.5em;" aria-hidden="true">${profile.emoji}</span>
        <span>${profile.title}</span>
      </div>
      <p class="profile-description fade-in-delay-1">${profile.description}</p>
      <div class="final-scores fade-in-delay-2">
        <h4>Deine Werte:</h4>
        <div class="score-summary">
          <div class="score-item">
            <span>Empathie:</span>
            <strong>${scores.empathy}/24</strong>
          </div>
          <div class="score-item">
            <span>Menschenrechte:</span>
            <strong>${scores.rights}/24</strong>
          </div>
          <div class="score-item">
            <span>Partizipation:</span>
            <strong>${scores.participation}/24</strong>
          </div>
          <div class="score-item">
            <span>Zivilcourage:</span>
            <strong>${scores.courage}/24</strong>
          </div>
        </div>
        <div class="total-score">
          <strong>Gesamt: ${totalScore}/96 Punkte (${percentage}%)</strong>
        </div>
      </div>
    `;

    this.elements.final.profile.innerHTML = profileHTML;

    // Add particle effect for high scores
    if (percentage >= 80) {
      this.addParticleEffect();
    }
  }

  addParticleEffect() {
    const container = document.querySelector('.final-card');
    if (!container) return;

    container.classList.add('particle-container');

    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${20 + i * 15}%`;
      particle.style.animationDelay = `${i * 0.5}s`;
      container.appendChild(particle);

      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  }

  showLoadingScreen(show) {
    const loadingScreen = this.elements.loading;
    if (!loadingScreen) return;

    if (show) {
      loadingScreen.classList.add('active');
      loadingScreen.setAttribute('aria-hidden', 'false');

      // Update loading text randomly
      const loadingTexts = [
        'Szenario wird geladen...',
        'Perspektiven werden vorbereitet...',
        'Demokratische Werte werden analysiert...',
        'Nächste Herausforderung kommt...',
      ];

      const loadingText = loadingScreen.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
      }
    } else {
      loadingScreen.classList.remove('active');
      loadingScreen.setAttribute('aria-hidden', 'true');
    }
  }

  // Utility methods for animations
  addAnimation(element, animationClass, duration = 300) {
    return new Promise(resolve => {
      element.classList.add(animationClass);

      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, duration);
    });
  }

  async animateSequence(animations) {
    for (const animation of animations) {
      await this.addAnimation(animation.element, animation.class, animation.duration);
      if (animation.delay) {
        await new Promise(resolve => setTimeout(resolve, animation.delay));
      }
    }
  }

  // Accessibility helpers
  announceToScreenReader(message) {
    const announcement = document.getElementById('announcements');
    if (announcement) {
      announcement.textContent = message;
    }
  }

  setupHighContrastMode() {
    // Check if user prefers high contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast-mode');
    }
  }

  setupReducedMotion() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');

      // Disable problematic animations
      document.querySelectorAll('.morphing-background').forEach(el => {
        el.classList.remove('morphing-background');
      });
    }
  }

  // Error handling
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
      <strong>Fehler:</strong> ${message}
      <button type="button" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Performance optimization
  optimizePerformance() {
    // Use passive event listeners for scroll
    document.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(this.onResize.bind(this), 150);
    });
  }

  onScroll() {
    // Handle scroll-based animations
    const scrollY = window.scrollY;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5;
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  onResize() {
    // Handle responsive adjustments
    this.updateViewportHeight();
  }

  updateViewportHeight() {
    // Fix for mobile viewport height issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

// Initialize viewport height fix
document.addEventListener('DOMContentLoaded', () => {
  const ui = new GameUI(null);
  ui.updateViewportHeight();
  ui.setupHighContrastMode();
  ui.setupReducedMotion();
  ui.optimizePerformance();
});
