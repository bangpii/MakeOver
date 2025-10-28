import React from 'react'

export default function Animasi_Background({ children }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0210]">
      {/* Floating pink hearts animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute text-pink-400 opacity-70 animate-float-heart"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 20}%`,
              fontSize: `${Math.random() * 1.5 + 1}rem`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* Content on top */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>

      {/* Custom CSS animation for floating hearts */}
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
            transform: translateY(-50vh) scale(1.2) rotate(15deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(1.4) rotate(-15deg);
            opacity: 0;
          }
        }
        .animate-float-heart {
          position: absolute;
          animation: floatHeart linear infinite;
        }
      `}</style>
    </div>
  )
}