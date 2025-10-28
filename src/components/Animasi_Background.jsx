import React, { useMemo } from "react";

export default function Animasi_Background({ children }) {
  // Generate hearts once only
  const hearts = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: -(Math.random() * 40 + 10),
      size: Math.random() * 4 + 3,
      delay: Math.random() * 15,
      duration: 25 + Math.random() * 20,
    }));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Floating giant pink hearts with rotation and pulsing glow */}
      <div className="absolute inset-0 pointer-events-none">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-pink-500 animate-float-heart drop-shadow-[0_0_16px_rgba(255,105,180,0.9)]"
            style={{
              left: `${heart.left}%`,
              bottom: `${heart.bottom}%`,
              fontSize: `${heart.size}rem`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
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

      {/* Custom CSS animation */}
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
      `}</style>
    </div>
  );
}
