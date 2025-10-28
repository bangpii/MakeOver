import React from 'react'

export default function Animasi_Background({ children }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Floating big pink hearts with white border */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-500 animate-float-heart drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 30 + 10}%`, // start from below the screen
              fontSize: `${Math.random() * 2 + 2}rem`, // bigger hearts
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 15}s` // slower movement
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

      {/* Custom CSS animation for slow floating hearts */}
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
            transform: translateY(-50vh) scale(1.1) rotate(10deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-120vh) scale(1.3) rotate(-10deg);
            opacity: 0;
          }
        }
        .animate-float-heart {
          position: absolute;
          animation: floatHeart ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}