import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaFoundation from "./WarnaFoundation";

const AnalisisFace = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white text-black flex items-center justify-between px-6 md:px-8 py-5 shadow-md">
        <h1 className="text-2xl md:text-4xl font-black tracking-widest">
          Face <span className="text-pink-500">Analisist</span>
        </h1>

        <button
          className="text-3xl md:text-4xl hover:text-pink-500 transition-all duration-300"
          title="Back"
          onClick={() => navigate("/")} // <-- kembali ke User
        >
          <i className="bx bx-log-out-circle"></i>
        </button>
      </nav>

      {/* CONTENT */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 space-y-10 max-w-full overflow-hidden">
        {/* AREA FOTO */}
        <div className="relative border-4 border-white rounded-3xl w-[95%] md:w-[850px] h-[400px] md:h-[550px] flex items-center justify-center shadow-2xl bg-black overflow-hidden">
          {/* ICONS POJOK KANAN ATAS */}
          <div className="absolute top-4 right-4 flex items-center gap-3 md:gap-4">
            {/* Save */}
            <button
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
              title="Simpan"
            >
              <i className="bx bx-save"></i>
            </button>

            {/* Mata */}
            <button
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
              title="Lihat"
            >
              <i className="bx bx-show"></i>
            </button>
          </div>
        </div>

        {/* Upload Button */}
        {!photo && (
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-xl inline-block">
              <i className="bx bx-upload mr-2"></i> Choose Your Photo
            </div>
          </label>
        )}

        {/* Komponen Warna */}
        {photo && (
          <div className="w-full max-w-[850px] px-3 md:px-6 overflow-hidden">
            <WarnaFoundation />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisFace;
