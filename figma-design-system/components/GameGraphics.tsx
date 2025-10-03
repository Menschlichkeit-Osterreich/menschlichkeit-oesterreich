import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Enhanced Graphics System für Democracy Games
 * SVG-basierte, animierte Grafiken für immersive Lernexperience
 */

export interface GraphicOptions {
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface MinigameIconProps extends GraphicOptions {
  type: 'fact-check' | 'bridge-puzzle' | 'debate-duel' | 'city-sim' | 'crisis-council' | 'dialog-rpg' | 'network-analysis';
}

export interface StakeholderAvatarProps extends GraphicOptions {
  role: 'neighbor' | 'worker' | 'student' | 'elder' | 'parent' | 'official' | 'activist' | 'immigrant';
  emotion?: 'happy' | 'neutral' | 'concerned' | 'angry' | 'thoughtful';
  diversity?: 'diverse' | 'standard';
}

export interface ProgressVisualizationProps extends GraphicOptions {
  type: 'bridge' | 'tree' | 'map' | 'network' | 'timeline';
  progress: number; // 0-100
  segments?: number;
  interactive?: boolean;
}

export interface LevelThumbnailProps extends GraphicOptions {
  category: 'neighborhood' | 'workplace' | 'digital' | 'society' | 'politics' | 'crisis' | 'climate' | 'global' | 'democracy' | 'future';
  difficulty: 1 | 2 | 3 | 4 | 5;
  completed?: boolean;
  locked?: boolean;
}

// Minigame Icons Component
export function MinigameIcon({ type, size = 64, color = "#3b82f6", animated = true, className = "", style }: MinigameIconProps) {
  const baseStyles = {
    width: size,
    height: size,
    ...style
  };

  const animations = animated ? {
    initial: { scale: 0.9, opacity: 0.8 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { scale: 1.05, rotate: 5 },
    transition: { duration: 0.3, ease: "easeOut" }
  } : {};

  const iconContent = {
    'fact-check': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="factCheckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Document Background */}
        <rect x="12" y="8" width="40" height="48" rx="4" fill="white" stroke={color} strokeWidth="2"/>
        
        {/* Text Lines */}
        <rect x="18" y="16" width="24" height="2" fill="#e5e7eb" rx="1"/>
        <rect x="18" y="22" width="32" height="2" fill="#e5e7eb" rx="1"/>
        <rect x="18" y="28" width="28" height="2" fill="#e5e7eb" rx="1"/>
        <rect x="18" y="34" width="20" height="2" fill="#e5e7eb" rx="1"/>
        
        {/* Magnifying Glass */}
        <circle cx="45" cy="25" r="8" fill="none" stroke="url(#factCheckGradient)" strokeWidth="3"/>
        <circle cx="45" cy="25" r="5" fill="rgba(239, 68, 68, 0.1)"/>
        <line x1="51" y1="31" x2="56" y2="36" stroke="url(#factCheckGradient)" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Verification Badge */}
        <circle cx="35" cy="45" r="8" fill="url(#factCheckGradient)"/>
        <path d="M31 45 L34 48 L39 42" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        
        {animated && (
          <>
            <animateTransform attributeName="transform" type="rotate" values="0 45 25;360 45 25" dur="8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
          </>
        )}
      </svg>
    ),

    'bridge-puzzle': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        
        {/* Bridge Structure */}
        <path d="M8 40 Q32 20 56 40" stroke="url(#bridgeGradient)" strokeWidth="4" fill="none"/>
        <path d="M8 42 L56 42" stroke="url(#bridgeGradient)" strokeWidth="3"/>
        
        {/* Bridge Supports */}
        <line x1="20" y1="42" x2="20" y2="32" stroke="url(#bridgeGradient)" strokeWidth="2"/>
        <line x1="32" y1="42" x2="32" y2="28" stroke="url(#bridgeGradient)" strokeWidth="2"/>
        <line x1="44" y1="42" x2="44" y2="32" stroke="url(#bridgeGradient)" strokeWidth="2"/>
        
        {/* Connection Points */}
        <circle cx="8" cy="42" r="4" fill="#22c55e"/>
        <circle cx="32" cy="42" r="4" fill="#eab308"/>
        <circle cx="56" cy="42" r="4" fill="#22c55e"/>
        
        {/* Floating Puzzle Pieces */}
        <g opacity={animated ? "0.8" : "1"}>
          <path d="M16 16 L24 16 L24 20 Q26 20 26 22 Q26 24 24 24 L16 24 Q14 22 16 20 Z" fill="#f97316"/>
          <path d="M40 52 L48 52 L48 56 Q50 56 50 58 Q50 60 48 60 L40 60 Q38 58 40 56 Z" fill="#f97316"/>
        </g>
        
        {animated && (
          <>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="3s" repeatCount="indefinite"/>
          </>
        )}
      </svg>
    ),

    'debate-duel': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="debateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b59b6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        
        {/* Balance Scale Base */}
        <rect x="30" y="45" width="4" height="15" fill="url(#debateGradient)"/>
        <ellipse cx="32" cy="58" rx="12" ry="4" fill="url(#debateGradient)"/>
        
        {/* Scale Beam */}
        <rect x="8" y="30" width="48" height="3" fill="url(#debateGradient)" rx="1.5"/>
        
        {/* Left Scale */}
        <rect x="6" y="32" width="20" height="8" fill="rgba(155, 89, 182, 0.2)" stroke="url(#debateGradient)" strokeWidth="2" rx="2"/>
        <line x1="10" y1="32" x2="16" y2="25" stroke="url(#debateGradient)" strokeWidth="2"/>
        <line x1="22" y1="32" x2="16" y2="25" stroke="url(#debateGradient)" strokeWidth="2"/>
        
        {/* Right Scale */}
        <rect x="38" y="32" width="20" height="8" fill="rgba(155, 89, 182, 0.2)" stroke="url(#debateGradient)" strokeWidth="2" rx="2"/>
        <line x1="42" y1="32" x2="48" y2="25" stroke="url(#debateGradient)" strokeWidth="2"/>
        <line x1="54" y1="32" x2="48" y2="25" stroke="url(#debateGradient)" strokeWidth="2"/>
        
        {/* Argument Symbols */}
        <circle cx="16" cy="18" r="6" fill="#22c55e"/>
        <text x="16" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">✓</text>
        
        <circle cx="48" cy="18" r="6" fill="#ef4444"/>
        <text x="48" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">?</text>
        
        {/* Balancing Animation */}
        {animated && (
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            values="0 32 31;-3 32 31;3 32 31;0 32 31" 
            dur="4s" 
            repeatCount="indefinite"
          />
        )}
      </svg>
    ),

    'city-sim': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="cityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        
        {/* City Skyline */}
        <rect x="8" y="35" width="12" height="25" fill="url(#cityGradient)" rx="2"/>
        <rect x="22" y="28" width="10" height="32" fill="url(#cityGradient)" rx="2"/>
        <rect x="34" y="32" width="14" height="28" fill="url(#cityGradient)" rx="2"/>
        <rect x="50" y="38" width="8" height="22" fill="url(#cityGradient)" rx="2"/>
        
        {/* Building Windows */}
        <g fill="rgba(255,255,255,0.8)">
          <rect x="10" y="38" width="2" height="2" rx="0.5"/>
          <rect x="13" y="38" width="2" height="2" rx="0.5"/>
          <rect x="16" y="38" width="2" height="2" rx="0.5"/>
          <rect x="10" y="42" width="2" height="2" rx="0.5"/>
          <rect x="13" y="42" width="2" height="2" rx="0.5"/>
          <rect x="16" y="42" width="2" height="2" rx="0.5"/>
          
          <rect x="24" y="32" width="2" height="2" rx="0.5"/>
          <rect x="27" y="32" width="2" height="2" rx="0.5"/>
          <rect x="24" y="36" width="2" height="2" rx="0.5"/>
          <rect x="27" y="36" width="2" height="2" rx="0.5"/>
          
          <rect x="36" y="36" width="2" height="2" rx="0.5"/>
          <rect x="40" y="36" width="2" height="2" rx="0.5"/>
          <rect x="44" y="36" width="2" height="2" rx="0.5"/>
        </g>
        
        {/* Green Spaces */}
        <ellipse cx="16" cy="55" rx="8" ry="3" fill="#84cc16"/>
        <ellipse cx="42" cy="55" rx="10" ry="3" fill="#84cc16"/>
        
        {/* Trees */}
        <circle cx="12" cy="53" r="2" fill="#22c55e"/>
        <circle cx="20" cy="53" r="2" fill="#22c55e"/>
        <circle cx="38" cy="53" r="2" fill="#22c55e"/>
        <circle cx="46" cy="53" r="2" fill="#22c55e"/>
        
        {/* Activity Indicators */}
        {animated && (
          <>
            <circle cx="11" cy="39" r="1" fill="#fbbf24">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="25" cy="33" r="1" fill="#fbbf24">
              <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="41" cy="37" r="1" fill="#fbbf24">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
      </svg>
    ),

    'crisis-council': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="crisisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="urgentGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Warning Triangle */}
        <polygon 
          points="32,8 52,48 12,48" 
          fill="url(#crisisGradient)" 
          stroke="#ffffff" 
          strokeWidth="2"
          filter={animated ? "url(#urgentGlow)" : ""}
        />
        
        {/* Exclamation Mark */}
        <rect x="30" y="20" width="4" height="18" fill="white" rx="2"/>
        <circle cx="32" cy="42" r="3" fill="white"/>
        
        {/* Clock */}
        <circle cx="48" cy="20" r="12" fill="white" stroke="url(#crisisGradient)" strokeWidth="2"/>
        <circle cx="48" cy="20" r="8" fill="rgba(239, 68, 68, 0.1)"/>
        <line x1="48" y1="20" x2="48" y2="14" stroke="url(#crisisGradient)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="48" y1="20" x2="52" y2="20" stroke="url(#crisisGradient)" strokeWidth="2" strokeLinecap="round"/>
        
        {/* Alert Waves */}
        {animated && (
          <>
            <circle cx="32" cy="48" r="20" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6">
              <animate attributeName="r" values="20;35;20" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="32" cy="48" r="25" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values="25;40;25" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
        
        {/* Pulsing Effect */}
        {animated && (
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite"/>
        )}
      </svg>
    ),

    'dialog-rpg': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="dialogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        
        {/* Main Speech Bubble */}
        <ellipse cx="35" cy="25" rx="22" ry="15" fill="url(#dialogGradient)" opacity="0.9"/>
        <polygon points="20,35 15,45 25,38" fill="url(#dialogGradient)" opacity="0.9"/>
        
        {/* Heart in Speech Bubble (Empathy) */}
        <path d="M30,20 C28,18 25,18 24,21 C23,18 20,18 18,20 C16,22 18,26 24,30 C30,26 32,22 30,20 Z" fill="white"/>
        
        {/* Smaller Speech Bubbles */}
        <ellipse cx="15" cy="15" rx="10" ry="7" fill="rgba(249, 115, 22, 0.7)"/>
        <polygon points="12,20 8,25 16,22" fill="rgba(249, 115, 22, 0.7)"/>
        
        <ellipse cx="50" cy="45" rx="8" ry="6" fill="rgba(249, 115, 22, 0.7)"/>
        <polygon points="47,50 42,55 50,52" fill="rgba(249, 115, 22, 0.7)"/>
        
        {/* Conversation Flow Lines */}
        <path d="M15 22 Q25 30 35 32" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="3,2"/>
        <path d="M40 35 Q45 40 47 43" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="3,2"/>
        
        {/* Floating Elements */}
        {animated && (
          <>
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3s" repeatCount="indefinite"/>
              <circle cx="12" cy="12" r="2" fill="#22c55e" opacity="0.8"/>
              <circle cx="52" cy="48" r="2" fill="#3b82f6" opacity="0.8"/>
            </g>
          </>
        )}
      </svg>
    ),

    'network-analysis': (
      <svg viewBox="0 0 64 64" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>
        
        {/* Network Nodes */}
        <circle cx="32" cy="20" r="6" fill="#3b82f6"/>
        <circle cx="15" cy="35" r="5" fill="#22c55e"/>
        <circle cx="49" cy="35" r="5" fill="#22c55e"/>
        <circle cx="25" cy="50" r="4" fill="#eab308"/>
        <circle cx="39" cy="50" r="4" fill="#eab308"/>
        <circle cx="55" cy="20" r="3" fill="#ef4444"/> {/* Bot Node */}
        <circle cx="8" cy="20" r="3" fill="#ef4444"/>  {/* Bot Node */}
        
        {/* Connection Lines */}
        <line x1="32" y1="20" x2="15" y2="35" stroke="url(#networkGradient)" strokeWidth="2"/>
        <line x1="32" y1="20" x2="49" y2="35" stroke="url(#networkGradient)" strokeWidth="2"/>
        <line x1="15" y1="35" x2="25" y2="50" stroke="url(#networkGradient)" strokeWidth="2"/>
        <line x1="49" y1="35" x2="39" y2="50" stroke="url(#networkGradient)" strokeWidth="2"/>
        <line x1="25" y1="50" x2="39" y2="50" stroke="url(#networkGradient)" strokeWidth="2"/>
        
        {/* Bot Network (Suspicious) */}
        <line x1="55" y1="20" x2="32" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2"/>
        <line x1="8" y1="20" x2="32" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2"/>
        
        {/* Data Flow Animation */}
        {animated && (
          <>
            <circle r="2" fill="#3b82f6" opacity="0.7">
              <animateMotion dur="3s" repeatCount="indefinite" path="M32,20 L15,35 L25,50"/>
            </circle>
            <circle r="2" fill="#3b82f6" opacity="0.7">
              <animateMotion dur="3s" repeatCount="indefinite" path="M32,20 L49,35 L39,50"/>
            </circle>
            
            {/* Bot Warning */}
            <circle cx="55" cy="20" r="8" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" values="3;12;3" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
        
        {/* Analysis Scanner */}
        <rect x="5" y="55" width="54" height="6" fill="rgba(59, 130, 246, 0.2)" rx="3"/>
        <rect x="5" y="55" width="30" height="6" fill="#3b82f6" rx="3">
          {animated && (
            <animate attributeName="width" values="0;54;0" dur="4s" repeatCount="indefinite"/>
          )}
        </rect>
      </svg>
    )
  };

  return (
    <motion.div {...animations}>
      {iconContent[type]}
    </motion.div>
  );
}

// Stakeholder Avatar Component
export function StakeholderAvatar({ 
  role, 
  emotion = 'neutral', 
  diversity = 'diverse',
  size = 48, 
  className = "", 
  style 
}: StakeholderAvatarProps) {
  const baseStyles = {
    width: size,
    height: size,
    ...style
  };

  const emotionColors = {
    happy: "#22c55e",
    neutral: "#6b7280", 
    concerned: "#eab308",
    angry: "#ef4444",
    thoughtful: "#8b5cf6"
  };

  const roleData = {
    neighbor: { bgColor: "#f0f9ff", iconColor: "#0ea5e9", symbol: "🏠" },
    worker: { bgColor: "#fef3c7", iconColor: "#f59e0b", symbol: "👷" },
    student: { bgColor: "#f0fdf4", iconColor: "#22c55e", symbol: "🎓" },
    elder: { bgColor: "#fef7ed", iconColor: "#ea580c", symbol: "👴" },
    parent: { bgColor: "#fdf2f8", iconColor: "#ec4899", symbol: "👨‍👩‍👧‍👦" },
    official: { bgColor: "#f8fafc", iconColor: "#475569", symbol: "🏛️" },
    activist: { bgColor: "#f3e8ff", iconColor: "#8b5cf6", symbol: "✊" },
    immigrant: { bgColor: "#ecfdf5", iconColor: "#10b981", symbol: "🌍" }
  };

  const currentRole = roleData[role];

  return (
    <div className={`relative ${className}`} style={baseStyles}>
      <svg viewBox="0 0 48 48" width="100%" height="100%">
        <defs>
          <linearGradient id={`avatar-${role}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentRole.bgColor} />
            <stop offset="100%" stopColor={currentRole.iconColor} />
          </linearGradient>
        </defs>
        
        {/* Avatar Background */}
        <circle cx="24" cy="24" r="22" fill={currentRole.bgColor} stroke={currentRole.iconColor} strokeWidth="2"/>
        
        {/* Role Icon */}
        <text x="24" y="30" textAnchor="middle" fontSize="16" fill={currentRole.iconColor}>
          {currentRole.symbol}
        </text>
        
        {/* Emotion Indicator */}
        <circle cx="36" cy="12" r="6" fill={emotionColors[emotion]}>
          <text x="36" y="15" textAnchor="middle" fontSize="8" fill="white">
            {emotion === 'happy' ? '😊' : 
             emotion === 'concerned' ? '😟' : 
             emotion === 'angry' ? '😠' : 
             emotion === 'thoughtful' ? '🤔' : '😐'}
          </text>
        </circle>
      </svg>
    </div>
  );
}

// Progress Visualization Component
export function ProgressVisualization({ 
  type, 
  progress, 
  segments = 10, 
  size = 200, 
  interactive = false,
  className = "",
  style 
}: ProgressVisualizationProps) {
  const [hoverSegment, setHoverSegment] = useState<number | null>(null);
  const baseStyles = {
    width: size,
    height: size,
    ...style
  };

  const visualizations = {
    bridge: (
      <svg viewBox="0 0 200 100" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="bridgeProgress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${progress}%`} stopColor="#22c55e" />
            <stop offset={`${progress}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Bridge Structure */}
        <path 
          d="M20 70 Q100 30 180 70" 
          stroke="url(#bridgeProgress)" 
          strokeWidth="8" 
          fill="none"
        />
        <line x1="20" y1="72" x2="180" y2="72" stroke="url(#bridgeProgress)" strokeWidth="4"/>
        
        {/* Progress Segments */}
        {Array.from({ length: segments }, (_, i) => {
          const x = 20 + (160 / segments) * i;
          const isCompleted = (i / segments) * 100 < progress;
          
          return (
            <g key={i}>
              <line 
                x1={x} y1="72" x2={x} y2="60" 
                stroke={isCompleted ? "#22c55e" : "#e5e7eb"} 
                strokeWidth="3"
              />
              <circle 
                cx={x} cy="72" r="4" 
                fill={isCompleted ? "#22c55e" : "#e5e7eb"}
                className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}
                onMouseEnter={interactive ? () => setHoverSegment(i) : undefined}
                onMouseLeave={interactive ? () => setHoverSegment(null) : undefined}
              />
              {hoverSegment === i && (
                <text x={x} y="50" textAnchor="middle" fontSize="10" fill="#374151">
                  {Math.round((i / segments) * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    ),

    tree: (
      <svg viewBox="0 0 200 200" className={className} style={baseStyles}>
        <defs>
          <linearGradient id="treeGrowth" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset={`${100 - progress}%`} stopColor="#e5e7eb" />
            <stop offset={`${100 - progress}%`} stopColor="#22c55e" />
          </linearGradient>
        </defs>
        
        {/* Tree Trunk */}
        <rect x="90" y="140" width="20" height="40" fill="url(#treeGrowth)" rx="10"/>
        
        {/* Tree Canopy Layers */}
        <circle cx="100" cy="120" r="40" fill="url(#treeGrowth)" opacity="0.8"/>
        <circle cx="100" cy="100" r="35" fill="url(#treeGrowth)" opacity="0.9"/>
        <circle cx="100" cy="85" r="25" fill="url(#treeGrowth)"/>
        
        {/* Growth Rings */}
        {Array.from({ length: 5 }, (_, i) => {
          const radius = 60 + i * 10;
          const opacity = progress > (i * 20) ? 0.1 : 0;
          
          return (
            <circle 
              key={i}
              cx="100" cy="100" r={radius} 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="2" 
              opacity={opacity}
            />
          );
        })}
      </svg>
    ),

    map: (
      <svg viewBox="0 0 200 200" className={className} style={baseStyles}>
        {/* Map Regions */}
        {Array.from({ length: segments }, (_, i) => {
          const angle = (360 / segments) * i;
          const isUnlocked = (i / segments) * 100 < progress;
          const radius = 60;
          const x = 100 + Math.cos((angle * Math.PI) / 180) * radius;
          const y = 100 + Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <g key={i}>
              {/* Connection Lines */}
              {i > 0 && isUnlocked && (
                <line 
                  x1="100" y1="100" x2={x} y2={y} 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Region Nodes */}
              <circle 
                cx={x} cy={y} r="15" 
                fill={isUnlocked ? "#22c55e" : "#e5e7eb"}
                stroke={isUnlocked ? "#16a34a" : "#9ca3af"}
                strokeWidth="2"
                className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}
                onMouseEnter={interactive ? () => setHoverSegment(i) : undefined}
                onMouseLeave={interactive ? () => setHoverSegment(null) : undefined}
              />
              
              <text x={x} y={y + 5} textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">
                {i + 1}
              </text>
              
              {hoverSegment === i && (
                <text x={x} y={y - 25} textAnchor="middle" fontSize="10" fill="#374151">
                  Region {i + 1}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Center Hub */}
        <circle cx="100" cy="100" r="20" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3"/>
        <text x="100" y="105" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
          HUB
        </text>
      </svg>
    ),

    network: (
      <svg viewBox="0 0 200 200" className={className} style={baseStyles}>
        {/* Network Grid */}
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const x = 40 + col * 40;
            const y = 40 + row * 40;
            const nodeIndex = row * 4 + col;
            const isActive = (nodeIndex / 16) * 100 < progress;
            
            return (
              <g key={`${row}-${col}`}>
                {/* Horizontal connections */}
                {col < 3 && isActive && (
                  <line 
                    x1={x} y1={y} x2={x + 40} y2={y} 
                    stroke="#3b82f6" 
                    strokeWidth="2"
                  />
                )}
                
                {/* Vertical connections */}
                {row < 3 && isActive && (
                  <line 
                    x1={x} y1={y} x2={x} y2={y + 40} 
                    stroke="#3b82f6" 
                    strokeWidth="2"
                  />
                )}
                
                {/* Network Node */}
                <circle 
                  cx={x} cy={y} r="8" 
                  fill={isActive ? "#22c55e" : "#e5e7eb"}
                  stroke={isActive ? "#16a34a" : "#9ca3af"}
                  strokeWidth="2"
                />
              </g>
            );
          })
        )}
        
        {/* Data Flow Animation */}
        <circle r="3" fill="#f59e0b">
          <animateMotion dur="3s" repeatCount="indefinite" path="M40,40 L80,40 L80,80 L120,80 L120,120 L160,120 L160,160"/>
        </circle>
      </svg>
    ),

    timeline: (
      <svg viewBox="0 0 200 100" className={className} style={baseStyles}>
        {/* Timeline Base */}
        <line x1="20" y1="50" x2="180" y2="50" stroke="#e5e7eb" strokeWidth="4"/>
        <line x1="20" y1="50" x2={20 + (160 * progress / 100)} y2="50" stroke="#3b82f6" strokeWidth="4"/>
        
        {/* Timeline Events */}
        {Array.from({ length: segments }, (_, i) => {
          const x = 20 + (160 / (segments - 1)) * i;
          const isPassed = (i / (segments - 1)) * 100 < progress;
          
          return (
            <g key={i}>
              <circle 
                cx={x} cy="50" r="8" 
                fill={isPassed ? "#22c55e" : "#e5e7eb"}
                stroke={isPassed ? "#16a34a" : "#9ca3af"}
                strokeWidth="2"
              />
              <line 
                x1={x} y1="50" x2={x} y2={isPassed ? "35" : "40"} 
                stroke={isPassed ? "#22c55e" : "#e5e7eb"} 
                strokeWidth="2"
              />
              <text x={x} y="75" textAnchor="middle" fontSize="10" fill="#6b7280">
                T{i + 1}
              </text>
            </g>
          );
        })}
        
        {/* Progress Indicator */}
        <circle cx={20 + (160 * progress / 100)} cy="50" r="6" fill="#f59e0b">
          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    )
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {visualizations[type]}
    </motion.div>
  );
}

// Level Thumbnail Component
export function LevelThumbnail({ 
  category, 
  difficulty, 
  completed = false, 
  locked = false, 
  size = 120, 
  className = "",
  style 
}: LevelThumbnailProps) {
  const baseStyles = {
    width: size,
    height: size,
    ...style
  };

  const categoryData = {
    neighborhood: { color: "#22c55e", icon: "🏘️", bg: "#f0fdf4" },
    workplace: { color: "#f59e0b", icon: "🏢", bg: "#fefbeb" },
    digital: { color: "#3b82f6", icon: "💻", bg: "#eff6ff" },
    society: { color: "#8b5cf6", icon: "🌍", bg: "#f5f3ff" },
    politics: { color: "#ef4444", icon: "🏛️", bg: "#fef2f2" },
    crisis: { color: "#dc2626", icon: "⚡", bg: "#fee2e2" },
    climate: { color: "#10b981", icon: "🌱", bg: "#ecfdf5" },
    global: { color: "#0ea5e9", icon: "🌐", bg: "#f0f9ff" },
    democracy: { color: "#6366f1", icon: "⚖️", bg: "#eef2ff" },
    future: { color: "#ec4899", icon: "🚀", bg: "#fdf2f8" }
  };

  const currentCategory = categoryData[category];
  const difficultyStars = '★'.repeat(difficulty);

  return (
    <div className={`relative ${className}`} style={baseStyles}>
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <defs>
          <linearGradient id={`thumbnail-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentCategory.bg} />
            <stop offset="100%" stopColor={currentCategory.color} />
          </linearGradient>
          <filter id="lockedFilter">
            <feColorMatrix type="saturate" values="0.3"/>
          </filter>
        </defs>
        
        {/* Thumbnail Background */}
        <rect 
          x="5" y="5" width="110" height="110" 
          rx="15" 
          fill={locked ? "#f3f4f6" : `url(#thumbnail-${category})`}
          filter={locked ? "url(#lockedFilter)" : "none"}
          stroke={completed ? "#22c55e" : locked ? "#9ca3af" : currentCategory.color}
          strokeWidth="3"
        />
        
        {/* Category Icon */}
        <text 
          x="60" y="55" 
          textAnchor="middle" 
          fontSize="32" 
          opacity={locked ? "0.5" : "1"}
        >
          {locked ? "🔒" : currentCategory.icon}
        </text>
        
        {/* Difficulty Stars */}
        {!locked && (
          <text x="60" y="85" textAnchor="middle" fontSize="12" fill={currentCategory.color}>
            {difficultyStars}
          </text>
        )}
        
        {/* Completion Indicator */}
        {completed && (
          <circle cx="95" cy="25" r="12" fill="#22c55e">
            <text x="95" y="30" textAnchor="middle" fontSize="16" fill="white">✓</text>
          </circle>
        )}
        
        {/* Lock Indicator */}
        {locked && (
          <circle cx="95" cy="25" r="12" fill="#9ca3af">
            <text x="95" y="30" textAnchor="middle" fontSize="12" fill="white">🔒</text>
          </circle>
        )}
      </svg>
    </div>
  );
}

export default {
  MinigameIcon,
  StakeholderAvatar,
  ProgressVisualization,
  LevelThumbnail
};