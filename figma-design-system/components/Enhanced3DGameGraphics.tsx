import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';

/**
 * Enhanced 3D Game Graphics System
 * Hochmoderne Visualisierungen für maximale Immersion
 */

export interface ParticleSystemProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'radial';
  shape?: 'circle' | 'star' | 'diamond' | 'heart';
  trigger?: boolean;
}

export interface Advanced3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltIntensity?: number;
  depth?: number;
  interactive?: boolean;
}

export interface DynamicBackgroundProps {
  variant?: 'democracy' | 'network' | 'particles' | 'geometric' | 'organic';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  animated?: boolean;
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

// Particle System Component
export function ParticleSystem({ 
  count = 50, 
  color = "#3b82f6", 
  size = 4, 
  speed = 1, 
  direction = 'up',
  shape = 'circle',
  trigger = false 
}: ParticleSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    opacity: number;
    scale: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.2,
      scale: Math.random() * 0.8 + 0.4,
      rotation: Math.random() * 360
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger, count]);

  const getShapeElement = (particle: any) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: size,
      height: size,
      opacity: particle.opacity,
      transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
    };

    switch (shape) {
      case 'star':
        return (
          <div key={particle.id} style={baseStyle}>
            <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      case 'diamond':
        return (
          <div 
            key={particle.id} 
            style={{
              ...baseStyle,
              backgroundColor: color,
              transform: `${baseStyle.transform} rotate(45deg)`,
              borderRadius: '2px'
            }} 
          />
        );
      case 'heart':
        return (
          <div key={particle.id} style={baseStyle}>
            <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
            </svg>
          </div>
        );
      default:
        return (
          <div 
            key={particle.id} 
            style={{
              ...baseStyle,
              backgroundColor: color,
              borderRadius: '50%'
            }} 
          />
        );
    }
  };

  const getAnimationDirection = () => {
    switch (direction) {
      case 'up': return { y: [0, -100] };
      case 'down': return { y: [0, 100] };
      case 'left': return { x: [0, -100] };
      case 'right': return { x: [0, 100] };
      case 'radial': return { scale: [1, 3], opacity: [1, 0] };
      default: return { y: [0, -100] };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, particle.opacity, 0],
              scale: [0, particle.scale, 0],
              ...getAnimationDirection()
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              ease: "easeOut",
              delay: Math.random() * 0.5
            }}
          >
            {getShapeElement(particle)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Advanced 3D Card Component
export function Advanced3DCard({ 
  children, 
  className = "", 
  glowColor = "#3b82f6",
  tiltIntensity = 15,
  depth = 20,
  interactive = true 
}: Advanced3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);
  const translateZ = useTransform([rotateX, rotateY], ([rX, rY]) => 
    Math.abs(rX) + Math.abs(rY) > 5 ? depth : 0
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!cardRef.current || !interactive) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (event.clientX - centerX) / (rect.width / 2);
    const mouseY = (event.clientY - centerY) / (rect.height / 2);
    
    x.set(mouseX);
    y.set(mouseY);
    setMousePosition({ x: mouseX, y: mouseY });
  }, [x, y, interactive]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  }, [x, y]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          translateZ,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full h-full"
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 blur-xl"
          style={{
            background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, ${glowColor}40, transparent 70%)`,
            scale: isHovered ? 1.1 : 1,
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Card Surface */}
        <motion.div
          className="relative w-full h-full rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255,255,255,${isHovered ? 0.15 : 0.1}) 0%, 
              rgba(255,255,255,${isHovered ? 0.05 : 0.02}) 100%)`,
            backdropFilter: "blur(20px)",
            border: `1px solid rgba(255,255,255,${isHovered ? 0.3 : 0.1})`,
            boxShadow: isHovered 
              ? `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 30px ${glowColor}30`
              : `0 10px 15px -3px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Reflective Surface */}
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background: `linear-gradient(${135 + mousePosition.x * 30}deg, 
                transparent 30%, 
                rgba(255,255,255,0.1) 50%, 
                transparent 70%)`,
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Content */}
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Dynamic Background Component
export function DynamicBackground({ 
  variant = 'democracy', 
  intensity = 'medium', 
  color = "#3b82f6",
  animated = true 
}: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        canvasRef.current.width = rect.width * 2; // For retina
        canvasRef.current.height = rect.height * 2;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !animated) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationTime = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    // Initialize particles based on variant
    const particleCount = intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: color
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      animationTime += 0.01;

      if (variant === 'democracy') {
        // Democracy network visualization
        particles.forEach((particle, i) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Wrap around edges
          if (particle.x < 0) particle.x = dimensions.width;
          if (particle.x > dimensions.width) particle.x = 0;
          if (particle.y < 0) particle.y = dimensions.height;
          if (particle.y > dimensions.height) particle.y = 0;

          // Draw connections
          particles.forEach((other, j) => {
            if (i !== j) {
              const dx = particle.x - other.x;
              const dy = particle.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 100) {
                ctx.strokeStyle = `${color}${Math.floor((1 - distance / 100) * 20).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            }
          });

          // Draw particle
          ctx.fillStyle = `${color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (variant === 'geometric') {
        // Geometric patterns
        ctx.strokeStyle = `${color}20`;
        ctx.lineWidth = 1;
        
        for (let x = 0; x < dimensions.width; x += 50) {
          for (let y = 0; y < dimensions.height; y += 50) {
            const wave = Math.sin(animationTime + x * 0.01 + y * 0.01) * 10;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 25 + wave, y + 25 + wave);
            ctx.stroke();
          }
        }
      } else if (variant === 'organic') {
        // Organic flowing shapes
        ctx.fillStyle = `${color}10`;
        for (let i = 0; i < 5; i++) {
          const centerX = dimensions.width * (0.2 + i * 0.15);
          const centerY = dimensions.height * 0.5;
          const radius = 50 + Math.sin(animationTime + i) * 20;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY + Math.sin(animationTime * 2 + i) * 30, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, intensity, color, animated, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        opacity: intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7,
        zIndex: 1
      }}
    />
  );
}

// Animated Counter Component
export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = "", 
  suffix = "", 
  className = "" 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (value - startValue) * easeOut);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isVisible]);

  return (
    <div ref={ref} className={className}>
      <motion.span
        key={displayValue}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        {prefix}{displayValue.toLocaleString()}{suffix}
      </motion.span>
    </div>
  );
}

// Holographic Badge Component
export function HolographicBadge({ 
  icon, 
  title, 
  description, 
  rarity = 'common',
  size = 'medium',
  animated = true 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const rarityColors = {
    common: ['#6b7280', '#9ca3af'],
    rare: ['#3b82f6', '#60a5fa'],
    epic: ['#8b5cf6', '#a78bfa'],
    legendary: ['#f59e0b', '#fbbf24']
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Holographic Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${rarityColors[rarity][0]}, ${rarityColors[rarity][1]}, ${rarityColors[rarity][0]})`,
          opacity: 0.8
        }}
        animate={animated ? {
          rotate: [0, 360]
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner Badge */}
      <motion.div
        className="absolute inset-1 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center"
        style={{
          boxShadow: `inset 0 0 20px ${rarityColors[rarity][0]}40`
        }}
      >
        <div className="text-2xl">
          {icon}
        </div>
      </motion.div>

      {/* Sparkle Effects */}
      {rarity !== 'common' && (
        <ParticleSystem
          count={rarity === 'legendary' ? 20 : rarity === 'epic' ? 12 : 8}
          color={rarityColors[rarity][0]}
          size={2}
          shape="star"
          direction="radial"
          trigger={isHovered}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white rounded-lg shadow-xl z-50 whitespace-nowrap"
          >
            <div className="font-semibold">{title}</div>
            <div className="text-sm opacity-80">{description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Interactive Democracy Wheel
export function DemocracyWheel({ 
  segments, 
  selectedSegment, 
  onSegmentSelect,
  size = 300 
}: {
  segments: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
  }>;
  selectedSegment?: string;
  onSegmentSelect?: (segmentId: string) => void;
  size?: number;
}) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);
  let currentAngle = 0;

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const randomRotation = rotation + 720 + Math.random() * 360;
    setRotation(randomRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      // Calculate which segment is selected after spin
      const normalizedAngle = (360 - (randomRotation % 360)) % 360;
      let angleSum = 0;
      
      for (const segment of segments) {
        const segmentAngle = (segment.value / totalValue) * 360;
        if (normalizedAngle >= angleSum && normalizedAngle < angleSum + segmentAngle) {
          onSegmentSelect?.(segment.id);
          break;
        }
        angleSum += segmentAngle;
      }
    }, 2000);
  };

  return (
    <div className="relative flex items-center justify-center">
      <motion.svg
        width={size}
        height={size}
        className="cursor-pointer"
        onClick={handleSpin}
        animate={{ rotate: rotation }}
        transition={{ 
          duration: isSpinning ? 2 : 0.5,
          ease: isSpinning ? [0.23, 1, 0.32, 1] : "easeOut"
        }}
      >
        {segments.map((segment, index) => {
          const segmentAngle = (segment.value / totalValue) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + segmentAngle;
          
          const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * (size / 2 - 20);
          const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * (size / 2 - 20);
          const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * (size / 2 - 20);
          const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * (size / 2 - 20);
          
          const largeArcFlag = segmentAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${size / 2} ${size / 2}`,
            `L ${size / 2 + x1} ${size / 2 + y1}`,
            `A ${size / 2 - 20} ${size / 2 - 20} 0 ${largeArcFlag} 1 ${size / 2 + x2} ${size / 2 + y2}`,
            'Z'
          ].join(' ');

          const isSelected = selectedSegment === segment.id;
          currentAngle = endAngle;

          return (
            <g key={segment.id}>
              <motion.path
                d={pathData}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="2"
                whileHover={{ scale: 1.02 }}
                animate={{
                  filter: isSelected ? 'brightness(1.2)' : 'brightness(1)',
                }}
                style={{
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                }}
              />
              
              {/* Segment Label */}
              <text
                x={size / 2 + Math.cos((startAngle + segmentAngle / 2 - 90) * Math.PI / 180) * (size / 3)}
                y={size / 2 + Math.sin((startAngle + segmentAngle / 2 - 90) * Math.PI / 180) * (size / 3)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {segment.label}
              </text>
            </g>
          );
        })}
        
        {/* Center circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="30"
          fill="#ffffff"
          stroke="#333333"
          strokeWidth="3"
        />
        
        {/* Spin indicator */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#333333"
          fontSize="10"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {isSpinning ? '⟳' : 'SPIN'}
        </text>
      </motion.svg>
      
      {/* Pointer */}
      <div 
        className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '20px solid #ef4444',
        }}
      />
    </div>
  );
}

export default {
  ParticleSystem,
  Advanced3DCard,
  DynamicBackground,
  AnimatedCounter,
  HolographicBadge,
  DemocracyWheel
};