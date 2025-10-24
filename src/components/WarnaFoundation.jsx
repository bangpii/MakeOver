import React, { useState } from "react";

const WarnaFoundation = () => {
  const warna = {
    COOL: [
      { name: "Fair", hex: "#F9E6E6" },
      { name: "Warm Vanilla", hex: "#FBE8D0" },
      { name: "Peach", hex: "#FFD5B8" },
      { name: "Almond", hex: "#E6B89C" },
      { name: "Walnut", hex: "#C9A17D" },
      { name: "Chest-nut", hex: "#B07B50" },
      { name: "Khaki", hex: "#C9B28A" },
      { name: "Earth", hex: "#9E7C55" },
      { name: "Sandal-wood", hex: "#D6A77A" },
      { name: "Hazel-nut", hex: "#C2A385" },
      { name: "Deep", hex: "#8B5E3C" },
    ],

    NEUTRAL: [
      { name: "Chantilly", hex: "#FCEFE8" },
      { name: "Shell", hex: "#F2E3D5" },
      { name: "Sand", hex: "#E7CBA9" },
      { name: "Wheat", hex: "#F5D7A5" },
      { name: "Cappuccino", hex: "#C9A97E" },
      { name: "Cashew", hex: "#D8B68A" },
      { name: "Mocha", hex: "#A67C58" },
      { name: "Nutmeg", hex: "#B8805A" },
      { name: "Russet", hex: "#8E5A3C" },
      { name: "Dark Clove", hex: "#704836" },
    ],

    WARM: [
      { name: "Porce-lain", hex: "#FFF3E8" },
      { name: "Nude", hex: "#F9DBC4" },
      { name: "Honey", hex: "#EAB676" },
      { name: "Butter-Scotch", hex: "#FFD18C" },
      { name: "Golden", hex: "#EFCB68" },
      { name: "Caramel", hex: "#D9A25F" },
      { name: "Mahog-any", hex: "#A0522D" },
      { name: "Toffee", hex: "#A86B32" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Truffle", hex: "#7E5E43" },
      { name: "Sepia", hex: "#704214" },
    ],
  };

  const [selectedCategory, setSelectedCategory] = useState(null);

  const bgColors = {
    COOL: "bg-blue-300 hover:bg-blue-400",
    NEUTRAL: "bg-gray-300 hover:bg-gray-400",
    WARM: "bg-orange-300 hover:bg-orange-400",
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 text-center">
      {/* Kategori Utama */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar justify-center mb-5 flex-wrap md:flex-nowrap">
        {Object.keys(warna).map((key) => (
          <div
            key={key}
            onClick={() =>
              setSelectedCategory(selectedCategory === key ? null : key)
            }
            className={`flex-shrink-0 w-28 h-14 md:w-28 md:h-14 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${
              bgColors[key]
            } ${
              selectedCategory === key
                ? "ring-4 ring-white ring-opacity-90 shadow-xl scale-105 font-bold"
                : "shadow-md hover:shadow-lg"
            }`}
          >
            <h2 className="text-sm md:text-xs lg:text-sm font-semibold text-gray-800 uppercase tracking-wide">
              {key}
            </h2>
          </div>
        ))}
      </div>

      {/* Warna Anak */}
      {selectedCategory && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 lg:p-6 shadow-inner border border-white/20 transition-all">
          <div
            className="flex flex-wrap md:flex-nowrap gap-3 md:gap-3 justify-center md:justify-start overflow-x-auto no-scrollbar"
            tabIndex={0}
          >
            {warna[selectedCategory].map((item, i) => (
              <div
                key={i}
                title={item.name}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className="w-12 h-12 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: item.hex }}
                ></div>
                <span className="text-[11px] md:text-[10px] lg:text-xs text-white mt-2 group-hover:font-semibold transition-all">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// CSS untuk sembunyikan scrollbar
const style = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

if (!document.querySelector('style[data-warna-foundation]')) {
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-warna-foundation', 'true');
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}

export default WarnaFoundation;
