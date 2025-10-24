import React, { useState } from "react";

const WarnaKulitPipi = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const warna = {
    WarnaKulitPipi: [
      { name: "Soft Pink", hex: "#FFB6C1" },
      { name: "Light Coral", hex: "#F08080" },
      { name: "Peach", hex: "#FFDAB9" },
      { name: "Mouve Pink", hex: "#E0B0FF" },
      { name: "Warm Pink", hex: "#FF69B4" },
      { name: "Warm Move", hex: "#FF6F61" },
      { name: "Deep Peach", hex: "#FFCBA4" },
      { name: "Coral Pink", hex: "#F88379" },
      { name: "Rose", hex: "#FF007F" },
      { name: "Tangrine", hex: "#FFA500" },
      { name: "Merah Bata", hex: "#B22222" },
      { name: "Tangerine", hex: "#FF9505" },
      { name: "Warm Brown", hex: "#A52A2A" },
      { name: "Deep Fushia", hex: "#C71585" },
    ],
  };

  return (
    <div className="w-full p-1 sm:p-2 md:p-4 lg:p-6 text-center">
      {/* Kategori Utama */}
      <div className="flex gap-1 sm:gap-2 md:gap-3 overflow-x-auto no-scrollbar justify-center mb-3 sm:mb-4 md:mb-5 flex-wrap md:flex-nowrap">
        {Object.keys(warna).map((key) => (
          <div
            key={key}
            onClick={() =>
              setSelectedCategory(selectedCategory === key ? null : key)
            }
            className={`flex-shrink-0 w-20 sm:w-24 md:w-28 h-10 sm:h-12 md:h-16 flex items-center justify-center rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden ${
              selectedCategory === key ? "ring-4 ring-pink-400 scale-105" : ""
            }`}
          >
            <img
              src="/blush.png"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
            />
          </div>
        ))}
      </div>

      {/* Warna Anak */}
      {selectedCategory && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-4 shadow-inner border border-white/20 transition-all">
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 sm:gap-2 md:gap-3 justify-center md:justify-start overflow-x-auto no-scrollbar"
            tabIndex={0}
          >
            {warna[selectedCategory].map((item, i) => (
              <div
                key={i}
                title={item.name}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: item.hex }}
                ></div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-white mt-1 sm:mt-1.5 group-hover:font-semibold transition-all">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS untuk sembunyikan scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WarnaKulitPipi;
