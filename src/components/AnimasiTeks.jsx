import React from "react";

const AnimasiTeks = () => {
  const teksGabung = `
    | Face Analysis | The Right Color For You | Perfect Match | Beauty in Harmony | Natural Glow | Enhance Your True Tone |
  `;

  return (
    <div className="text-center py-6 bg-white font-dmsans">
      {/* Garis atas */}
      <hr className="border-gray-500 mb-3 border-2 w-full rounded-full" />

      {/* Wrapper animasi */}
      <div className="overflow-hidden relative h-12">
        <div
          className="
            flex whitespace-nowrap
            animate-[slide_20s_linear_infinite]
            text-2xl md:text-4xl font-bold text-black tracking-tight
          "
        >
          {/* Ulang teks dua kali biar looping mulus */}
          <span className="mx-4">{teksGabung}</span>
          <span className="mx-4">{teksGabung}</span>
        </div>
      </div>

      {/* Garis bawah */}
      <hr className="border-gray-500 mt-3 border-2 w-full rounded-full" />

      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Responsif tambahan */
        @media (max-width: 768px) {
          .animate-[slide_20s_linear_infinite] {
            animation: slide 25s linear infinite;
          }
        }

        @media (max-width: 480px) {
          .animate-[slide_20s_linear_infinite] {
            font-size: 1.75rem; /* Lebih besar di HP (≈text-3xl) */
            animation: slide 30s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimasiTeks;
