import React from 'react'

export default function Animasi_Background({ children }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0210]">
      {/* Layered pink aura blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-1/4 top-1/4 w-[60rem] h-[60rem] rounded-full opacity-70 blur-[80px] animate-slow-pulse bg-gradient-to-r from-pink-400 via-pink-300 to-transparent mix-blend-screen" />
        <div className="absolute right-0 -bottom-1/4 w-[48rem] h-[48rem] rounded-full opacity-60 blur-[60px] animate-slow-slide bg-gradient-to-tr from-pink-600 via-pink-400 to-transparent mix-blend-screen" />
        <div className="absolute left-1/3 bottom-1/3 w-[28rem] h-[28rem] rounded-full opacity-40 blur-[40px] animate-slow-rotate bg-gradient-to-r from-pink-300 via-pink-200 to-transparent mix-blend-screen" />
      </div>

      {/* Content goes on top */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>

      {/* Local CSS for subtle, elegant slow animations */}
      <style>{`
        @keyframes slowPulse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes slowSlide {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(-60px) scale(1.02); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes slowRotate {
          0% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(12deg) translateY(-10px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        .animate-slow-pulse { animation: slowPulse 9s ease-in-out infinite; }
        .animate-slow-slide { animation: slowSlide 14s ease-in-out infinite; }
        .animate-slow-rotate { animation: slowRotate 18s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
