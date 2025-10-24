import React, { useState } from "react";
import Mnu from "./Mnu"; // pastikan path-nya sesuai lokasi file

const Hero = () => {
  const [showMnu, setShowMnu] = useState(false); // state kontrol tampilan Mnu

  // ketika gambar diklik
  const handleImageClick = () => {
    setShowMnu(true);
  };

  // ketika tombol close diklik
  const handleCloseMnu = () => {
    setShowMnu(false);
  };

  return (
    <div className="relative px-4 md:px-10 py-6 md:py-12 flex justify-center overflow-auto">
      {/* Container untuk membatasi lebar */}
      <div className="w-full max-w-5xl flex flex-col gap-6 md:gap-10">
        {/* Child 1 - Foto 1 */}
        <div
          className="overflow-hidden rounded-xl shadow-lg mt-10 md:mt-6 transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
          onClick={handleImageClick}
          data-aos="fade-up"
        >
          <img
            src="/fhoto1.png"
            alt="Foto 1"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Child 2 - Foto 2 & Foto 3 */}
        <div
          className="flex flex-row flex-wrap gap-2 md:gap-6 mt-4 md:mt-6"
          data-aos="fade-up"
          data-aos-delay="150"
        >
          <div
            className="flex-1 overflow-hidden rounded-xl shadow-md w-1/2 transform transition duration-300 hover:scale-105 hover:shadow-xl mt-2 md:mt-0 cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src="/fhoto2.png"
              alt="Foto 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="flex-1 overflow-hidden rounded-xl shadow-md w-1/2 transform transition duration-300 hover:scale-105 hover:shadow-xl mt-2 md:mt-0 cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src="/fhoto3.png"
              alt="Foto 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Kondisi munculnya Mnu */}
      {showMnu && <Mnu onClose={handleCloseMnu} />}
    </div>
  );
};

export default Hero;
