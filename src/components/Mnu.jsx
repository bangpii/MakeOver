import React, { useState } from "react";
import "boxicons/css/boxicons.min.css";
import { useNavigate } from "react-router-dom"; // import useNavigate
import Loading from "./Loading"; // pastikan file Loading.jsx ada di folder yang sama

const Mnu = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // hook untuk navigasi

  const handleClick = (target) => {
    setIsLoading(true);
    // simulasi proses loading 2 detik
    setTimeout(() => {
      setIsLoading(false);
      navigate(target); // arahkan ke halaman target
    }, 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
      {/* Tombol Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-all hover:scale-110"
      >
        <i className="bx bx-x"></i>
      </button>

      {/* Container utama */}
      <div className="flex flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-3xl px-4">
        {/* Box 1 */}
        <div
          onClick={() => handleClick("/analisis-face")}
          className="flex flex-col items-start justify-center bg-white text-black rounded-xl p-6 w-[45%] shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 cursor-pointer"
        >
          <h2 className="bg-black text-white w-full py-2 rounded-md font-semibold text-lg md:text-xl mb-3 text-center">
            Face Analisist
          </h2>
          <p className="text-gray-800 text-sm md:text-base mb-2 text-start">
            Choose your JPG or PNG file here to start the analysis.
          </p>
          <p className="text-gray-600 text-xs md:text-sm text-start">
            Our system will detect and analyze your facial features precisely.
          </p>
        </div>

        {/* Box 2 */}
        <div
          onClick={() => handleClick("/camera-live")}
          className="flex flex-col items-start justify-center bg-white text-black rounded-xl p-6 w-[45%] shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-1 cursor-pointer"
        >
          <h2 className="bg-black text-white w-full py-2 rounded-md font-semibold text-lg md:text-xl mb-3 text-center">
            Camera Live
          </h2>
          <p className="text-gray-800 text-sm md:text-base mb-2 text-start">
            Turn on your virtual camera for real-time face tracking.
          </p>
          <p className="text-gray-600 text-xs md:text-sm text-start">
            Get live feedback and tone recommendations instantly and accurately.
          </p>
        </div>
      </div>

      {/* Overlay Loading */}
      {isLoading && <Loading />}
    </div>
  );
};

export default Mnu;
