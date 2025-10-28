import React from 'react'

export default function Animasi_Background({ children }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Floating giant pink hearts with rotation and pulsing glow */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-500 animate-float-heart animate-rotate-heart drop-shadow-[0_0_16px_rgba(255,105,180,0.9)]"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 40 + 20}%`,
              fontSize: `${Math.random() * 4 + 3}rem`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${25 + Math.random() * 20}s`
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* Content on top */}
      <div className="relative z-10 flex items-center justify-center h-full text-white">
        {children}
      </div>

      {/* Custom CSS animation for floating, rotating, and pulsing hearts */}
      <style>{`
        @keyframes floatHeart {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-60vh) scale(1.25) rotate(10deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-130vh) scale(1.5) rotate(-10deg);
            opacity: 0;
          }
        }

        @keyframes rotateHeart {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.1); }
          100% { transform: rotate(-8deg) scale(1); }
        }

        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255,105,180,0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(255,105,180,1)); }
        }

        .animate-float-heart {
          position: absolute;
          color: #ff4da6;
          -webkit-text-stroke: 1px black;
          animation: floatHeart ease-in-out infinite, pulseGlow 3s ease-in-out infinite;
        }

        .animate-rotate-heart {
          animation: rotateHeart 6s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  )
}