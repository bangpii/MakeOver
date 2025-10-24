import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "boxicons/css/boxicons.min.css";

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 500, once: true });
  }, []);

  const toggleSearch = () => setShowSearch(!showSearch);

  return (
    <header className="bg-black text-white font-[DM_Sans] shadow-lg fixed w-full top-0 left-0 z-50">
      {/* Navbar utama */}
      <nav
        className="flex items-center justify-between px-6 md:px-10 py-4 relative z-50"
        data-aos="fade-down"
      >
        {/* Logo */}
        <div className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-2">
          <span className="text-white">MAKE</span>
          <span className="text-pink-400">OVER</span>
        </div>

        {/* Menu Desktop / Tablet */}
        <div className="hidden md:flex items-center gap-8 text-lg relative z-50">
          <div
            className={`flex items-center gap-2 cursor-pointer transition-all ${
              showSearch ? "text-pink-400" : "hover:text-pink-400"
            }`}
            onClick={toggleSearch}
          >
            <i className="bx bx-search-alt-2 text-2xl"></i>
            <span className="select-none">Search</span>
          </div>

          <div className="flex items-center gap-2 hover:text-pink-400 cursor-pointer transition">
            <i className="bx bx-heart text-2xl"></i> Love
          </div>

          <div className="flex items-center gap-2 hover:text-pink-400 cursor-pointer transition">
            <i className="bx bx-info-circle text-2xl"></i> Info
          </div>
        </div>

        {/* Menu HP */}
        <div className="flex md:hidden items-center gap-5 text-2xl relative z-50">
          <i
            className={`bx bx-search-alt-2 cursor-pointer transition ${
              showSearch ? "text-pink-400" : "hover:text-pink-400"
            }`}
            onClick={toggleSearch}
          ></i>

          <i className="bx bx-heart hover:text-pink-400 cursor-pointer transition"></i>
          <i className="bx bx-info-circle hover:text-pink-400 cursor-pointer transition"></i>
        </div>
      </nav>

      {/* FORM PENCARIAN - Absolute, selalu putih */}
      {showSearch && (
        <div
          data-aos="fade-down"
          className="absolute top-full left-0 w-full bg-white border-t border-black text-black px-6 md:px-10 py-3 flex justify-center md:justify-end z-40"
        >
          <input
            type="text"
            placeholder="Search something..."
            className="w-full md:w-1/3 bg-white text-black rounded-full px-4 py-2 outline-none border border-blackfocus:ring-2 focus:ring-pink-400 transition-all duration-300"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
