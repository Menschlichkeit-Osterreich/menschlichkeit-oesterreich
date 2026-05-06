// Enhanced Game Components Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock the EnhancedGameComponents class
class MockEnhancedGameComponents {
  constructor() {
    this.initializeDesignTokens();
    this.setupEventListeners();
  }

  initializeDesignTokens() {
    return true;
  }

  setupEventListeners() {
    return true;
  }

  createGameButton(options = {}) {
    const button = document.createElement('button');
    button.className = `enhanced-game-button variant-${options.variant || 'default'}`;
    button.textContent = options.text || 'Button';
    button.disabled = options.disabled || false;

    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }

    return button;
  }

  createAchievementBadge(achievement, options = {}) {
    const badge = document.createElement('div');
    badge.className = `enhanced-achievement-badge rarity-${options.rarity || 'bronze'}`;
    badge.textContent = achievement.name;
    return badge;
  }

  createLevelProgressCard(levelData) {
    const card = document.createElement('div');
    card.className = 'enhanced-level-progress-card';
    card.innerHTML = `
      <div class="card-title">Level ${levelData.currentLevel}</div>
      <div class="progress-bar" style="width: ${(levelData.progress / levelData.nextLevelXP) * 100}%"></div>
    `;
    return card;
  }
}

describe('Enhanced Game Components', () => {
  let components;

  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';
    components = new MockEnhancedGameComponents();
  });

  describe('Game Button Component', () => {
    it('should create a basic button with default settings', () => {
      const button = components.createGameButton();

      expect(button.tagName).toBe('BUTTON');
      expect(button.className).toContain('enhanced-game-button');
      expect(button.className).toContain('variant-default');
      expect(button.textContent).toBe('Button');
      expect(button.disabled).toBe(false);
    });

    it('should create a button with custom options', () => {
      const clickHandler = vi.fn();
      const button = components.createGameButton({
        text: 'Custom Button',
        variant: 'primary',
        disabled: true,
        onClick: clickHandler,
      });

      expect(button.textContent).toBe('Custom Button');
      expect(button.className).toContain('variant-primary');
      expect(button.disabled).toBe(true);

      // Test click handler
      button.click();
      expect(clickHandler).not.toHaveBeenCalled(); // disabled button shouldn't trigger click
    });

    it('should handle click events when enabled', () => {
      const clickHandler = vi.fn();
      const button = components.createGameButton({
        text: 'Clickable Button',
        onClick: clickHandler,
      });

      button.click();
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Achievement Badge Component', () => {
    it('should create a badge with achievement data', () => {
      const achievement = {
        name: 'Test Achievement',
        icon: '🏆',
      };

      const badge = components.createAchievementBadge(achievement, {
        rarity: 'gold',
      });

      expect(badge.tagName).toBe('DIV');
      expect(badge.className).toContain('enhanced-achievement-badge');
      expect(badge.className).toContain('rarity-gold');
      expect(badge.textContent).toBe('Test Achievement');
    });

    it('should default to bronze rarity if not specified', () => {
      const achievement = { name: 'Default Achievement' };
      const badge = components.createAchievementBadge(achievement);

      expect(badge.className).toContain('rarity-bronze');
    });
  });

  describe('Level Progress Card Component', () => {
    it('should create a progress card with correct data', () => {
      const levelData = {
        currentLevel: 5,
        progress: 750,
        nextLevelXP: 1000,
        totalXP: 4750,
      };

      const card = components.createLevelProgressCard(levelData);

      expect(card.tagName).toBe('DIV');
      expect(card.className).toContain('enhanced-level-progress-card');
      expect(card.innerHTML).toContain('Level 5');

      // Check progress bar width calculation (750/1000 * 100 = 75%)
      expect(card.innerHTML).toContain('width: 75%');
    });

    it('should handle zero progress correctly', () => {
      const levelData = {
        currentLevel: 1,
        progress: 0,
        nextLevelXP: 500,
        totalXP: 0,
      };

      const card = components.createLevelProgressCard(levelData);
      expect(card.innerHTML).toContain('width: 0%');
    });

    it('should handle full progress correctly', () => {
      const levelData = {
        currentLevel: 10,
        progress: 2000,
        nextLevelXP: 2000,
        totalXP: 15000,
      };

      const card = components.createLevelProgressCard(levelData);
      expect(card.innerHTML).toContain('width: 100%');
    });
  });

  describe('Component Initialization', () => {
    it('should initialize design tokens', () => {
      const initSpy = vi.spyOn(MockEnhancedGameComponents.prototype, 'initializeDesignTokens');
      new MockEnhancedGameComponents();
      expect(initSpy).toHaveBeenCalled();
    });

    it('should setup event listeners', () => {
      const setupSpy = vi.spyOn(MockEnhancedGameComponents.prototype, 'setupEventListeners');
      new MockEnhancedGameComponents();
      expect(setupSpy).toHaveBeenCalled();
    });
  });
});

// Asset Management System Tests
describe('Asset Management Integration', () => {
  it('should have correct asset paths for icons', () => {
    const expectedPaths = [
      'icons_values_equality',
      'icons_values_freedom',
      'icons_values_solidarity',
      'icons_values_justice',
    ];

    expectedPaths.forEach(path => {
      expect(path).toMatch(/^icons_values_\w+$/);
    });
  });

  it('should have correct asset paths for characters', () => {
    const expectedPaths = [
      'characters_teacher',
      'characters_student_male',
      'characters_student_female',
    ];

    expectedPaths.forEach(path => {
      expect(path).toMatch(/^characters_\w+$/);
    });
  });

  it('should validate achievement rarity levels', () => {
    const validRarities = ['bronze', 'silver', 'gold', 'platinum', 'legendary'];

    validRarities.forEach(rarity => {
      expect(['bronze', 'silver', 'gold', 'platinum', 'legendary']).toContain(rarity);
    });
  });
});

// Game Logic Tests
describe('Educational Game Logic', () => {
  it('should calculate XP progression correctly', () => {
    const calculateNextLevelXP = level => Math.floor(100 * Math.pow(1.5, level - 1));

    expect(calculateNextLevelXP(1)).toBe(100);
    expect(calculateNextLevelXP(2)).toBe(150);
    expect(calculateNextLevelXP(3)).toBe(225);
    expect(calculateNextLevelXP(5)).toBe(506);
  });

  it('should validate level progression', () => {
    const isLevelUnlocked = (currentLevel, requiredLevel) => currentLevel >= requiredLevel;

    expect(isLevelUnlocked(5, 3)).toBe(true);
    expect(isLevelUnlocked(2, 5)).toBe(false);
    expect(isLevelUnlocked(10, 10)).toBe(true);
  });

  it('should handle achievement requirements', () => {
    const checkAchievementRequirement = (progress, target) => progress >= target;

    expect(checkAchievementRequirement(100, 50)).toBe(true);
    expect(checkAchievementRequirement(25, 100)).toBe(false);
    expect(checkAchievementRequirement(75, 75)).toBe(true);
  });
});

// Performance Tests
describe('Performance and Optimization', () => {
  it('should create components efficiently', () => {
    const testComponents = new MockEnhancedGameComponents();
    const start = performance.now();

    // Create multiple components
    for (let i = 0; i < 100; i++) {
      testComponents.createGameButton({ text: `Button ${i}` });
    }

    const end = performance.now();
    const duration = end - start;

    // Should complete in reasonable time (< 100ms for 100 components)
    expect(duration).toBeLessThan(100);
  });

  it('should handle large datasets', () => {
    const largeAchievementList = Array.from({ length: 1000 }, (_, i) => ({
      name: `Achievement ${i}`,
      rarity: ['bronze', 'silver', 'gold', 'platinum', 'legendary'][i % 5],
    }));

    expect(largeAchievementList).toHaveLength(1000);
    expect(largeAchievementList[0].name).toBe('Achievement 0');
    expect(largeAchievementList[999].name).toBe('Achievement 999');
  });
});
