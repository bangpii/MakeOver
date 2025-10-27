import React, { useState, useEffect } from "react";

const WarnaKulitPipi = ({ onColorSelect, selectedColor }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const warna = {
    Blush: [
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

  const handleColorClick = (item) => {
    console.log(`🎨 Selected cheek color: ${item.name} - ${item.hex}`);
    if (onColorSelect) {
      onColorSelect(item.hex);
    }
  };

  const handleCategoryClick = (key) => {
    if (selectedCategory === key) {
      setSelectedCategory(null);
      if (onColorSelect) {
        onColorSelect(null); // Reset color ketika kategori ditutup
      }
    } else {
      setSelectedCategory(key);
    }
  };

  // Auto-select category jika color dipilih dari luar
  useEffect(() => {
    if (selectedColor && !selectedCategory) {
      setSelectedCategory("Blush");
    }
  }, [selectedColor, selectedCategory]);

  return (
    <div className="w-full p-1 sm:p-2 md:p-4 lg:p-6 text-center">
      {/* Kategori Utama */}
      <div className="flex gap-1 sm:gap-2 md:gap-3 overflow-x-auto no-scrollbar justify-center mb-3 sm:mb-4 md:mb-5 flex-wrap md:flex-nowrap">
        {Object.keys(warna).map((key) => (
          <div
            key={key}
            onClick={() => handleCategoryClick(key)}
            className={`flex-shrink-0 w-20 sm:w-24 md:w-28 h-10 sm:h-12 md:h-16 flex items-center justify-center rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden ${
              selectedCategory === key ? "ring-4 ring-pink-400 scale-105" : ""
            }`}
          >
            <img
              src="/blush.png"
              alt="Blush"
              className="absolute inset-0 w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
            />
            <span className="relative z-10 text-white text-xs font-bold text-shadow bg-black/30 px-2 py-1 rounded">
              {key}
            </span>
            
            {/* Indicator untuk warna yang aktif */}
            {selectedColor && selectedCategory === key && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md" 
                   style={{ backgroundColor: selectedColor }}></div>
            )}
          </div>
        ))}
      </div>

      {/* Warna Anak */}
      {selectedCategory && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-4 shadow-inner border border-white/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-xs font-semibold">Pilih Warna Pipi:</span>
            {selectedColor && (
              <button 
                onClick={() => {
                  if (onColorSelect) onColorSelect(null);
                }}
                className="text-white text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 sm:gap-2 md:gap-3 justify-center md:justify-start overflow-x-auto no-scrollbar"
            tabIndex={0}
          >
            {warna[selectedCategory].map((item, i) => (
              <div
                key={i}
                title={item.name}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleColorClick(item)}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 shadow-md hover:scale-110 transition-transform duration-300 ${
                    selectedColor === item.hex ? "border-yellow-400 ring-2 ring-yellow-300 scale-110" : "border-white"
                  }`}
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
        .text-shadow {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
};

export default WarnaKulitPipi;