import React, { useState, useEffect, useRef } from 'react';

const PersonaReveal = ({ persona, onReveal, isRevealing, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showShine, setShowShine] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const cardRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isRevealing) {
      // Cinematic sequence
      setTimeout(() => setShowSmoke(true), 200);
      setTimeout(() => setShowGlow(true), 600);
      setTimeout(() => setShowLightning(true), 1200);
      setTimeout(() => setShowShine(true), 1600);
      setTimeout(() => setIsFlipped(true), 2200);
      setTimeout(() => {
        // Subtle particle effects
        const newParticles = Array.from({ length: 25 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          decay: Math.random() * 0.015 + 0.008,
          size: Math.random() * 3 + 1,
          color: ['#1a1a1a', '#2d2d2d', '#404040', '#525252', '#666666'][Math.floor(Math.random() * 5)],
          rotation: Math.random() * 360
        }));
        setParticles(newParticles);
      }, 2800);
    }
  }, [isRevealing]);

  useEffect(() => {
    // Animate particles with subtle movement
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - particle.decay,
            vx: particle.vx * 0.99,
            vy: particle.vy * 0.99,
            rotation: particle.rotation + 2
          })).filter(particle => particle.life > 0)
        );
      }, 40);

      return () => clearInterval(interval);
    }
  }, [particles]);

  const handleReveal = () => {
    if (onReveal) {
      onReveal();
    }
  };

  const handleClose = () => {
    setIsFlipped(false);
    setShowGlow(false);
    setShowShine(false);
    setShowLightning(false);
    setShowSmoke(false);
    setParticles([]);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95" style={{ perspective: '1200px' }}>
      {/* Smoke effect */}
      {showSmoke && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
      )}

      {/* Particle effects - subtle and dark */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life * 0.6,
            transform: `scale(${particle.life * 1.5}) rotate(${particle.rotation}deg)`,
            zIndex: 1000
          }}
        />
      ))}

      {/* Lightning effect */}
      {showLightning && (
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" style={{ animationDuration: '0.2s' }} />
      )}

      {/* Dramatic lighting effects */}
      <div className={`absolute inset-0 transition-all duration-1500 ${
        showGlow ? 'bg-gradient-to-r from-slate-800/30 via-gray-800/30 to-slate-900/30' : ''
      }`} />

      {/* Shine effect */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        showShine ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : ''
      }`} />

      <div className="relative z-10 text-center">
        {!isRevealing ? (
          // Initial state - mysterious
          <div className="space-y-8">
            <div className="text-6xl mb-8 animate-pulse" style={{ animationDuration: '2s' }}>⚡</div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-wider">
              DISCOVER YOUR TRUE NATURE
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto tracking-wide">
              Your musical DNA has been analyzed.
              <br />
              <span className="text-gray-300 font-medium">The revelation awaits...</span>
            </p>
            <button
              onClick={handleReveal}
              className="bg-gradient-to-r from-slate-800 to-gray-900 text-white px-12 py-6 rounded-lg font-bold text-xl hover:from-slate-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600"
            >
              REVEAL PERSONA
            </button>
          </div>
        ) : (
          // Revealing state - card flip animation
          <div className="relative" style={{ perspective: '1200px' }}>
            <div
              ref={cardRef}
              className={`relative w-96 h-112 mx-auto transition-all duration-2000 preserve-3d ${isFlipped ? 'card-flip' : ''}`}
              style={{
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of card (mystery) */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-700 shadow-2xl flex items-center justify-center backface-hidden"
                style={{
                  transform: 'rotateY(0deg)',
                  opacity: isFlipped ? 0 : 1,
                  transition: 'opacity 0.8s ease-in-out'
                }}
              >
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-pulse">⚡</div>
                  <div className="text-2xl font-bold text-white mb-2 tracking-wider">ANALYZING</div>
                  <div className="text-gray-400 animate-pulse">Decoding your musical signature...</div>
                </div>
              </div>

              {/* Back of card (persona) */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-xl border border-gray-300 shadow-2xl flex items-center justify-center backface-hidden"
                style={{
                  transform: 'rotateY(180deg)',
                  opacity: isFlipped ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out'
                }}
              >
                {persona && (
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4 animate-pulse">⚡</div>
                    <div className="text-9xl mb-4 font-bold text-gray-800">{persona.id}</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-wide">{persona.name}</h3>
                    <p className="text-gray-700 italic text-lg leading-relaxed">{persona.description}</p>
                    <div className="mt-8">
                      <button
                        onClick={handleClose}
                        className="bg-gradient-to-r from-gray-800 to-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:from-gray-700 hover:to-slate-800 transition-all duration-200 border border-gray-600"
                      >
                        ACCEPT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle glow effects */}
            <div 
              className={`absolute inset-0 -z-10 rounded-xl transition-all duration-1500 ${showGlow ? 'dramatic-glow' : ''}`}
              style={{
                background: showGlow ? 'radial-gradient(circle, rgba(75, 85, 99, 0.4) 0%, rgba(31, 41, 55, 0.4) 50%, rgba(17, 24, 39, 0.4) 100%)' : 'transparent',
                filter: showGlow ? 'blur(30px)' : 'blur(0px)',
                transform: showGlow ? 'scale(1.8)' : 'scale(1)'
              }}
            />

            {/* Additional depth */}
            <div 
              className="absolute inset-0 -z-20 rounded-xl transition-all duration-1500"
              style={{
                background: showGlow ? 'radial-gradient(circle, rgba(55, 65, 81, 0.3) 0%, rgba(31, 41, 55, 0.3) 100%)' : 'transparent',
                filter: showGlow ? 'blur(40px)' : 'blur(0px)',
                transform: showGlow ? 'scale(2.2)' : 'scale(1)'
              }}
            />
          </div>
        )}
      </div>

      {/* Audio element for sound effects */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/card-flip.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default PersonaReveal; 