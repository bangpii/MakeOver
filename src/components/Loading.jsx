import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      {/* Animasi Lingkaran */}
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
      
      {/* Teks Loading dengan efek fade */}
      <p className="text-lg font-semibold animate-pulse tracking-wide">
        Loading, please wait...
      </p>
    </div>
  );
};

export default Loading;
