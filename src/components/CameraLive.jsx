import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaKulitPipi from "./WarnaKulitPipi";
import WarnaLipstik from "./WarnaLipstik";

const CameraLive = () => {
  const navigate = useNavigate(); 
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOn(true);
        setCapturedPhoto(false); // reset flag
      } catch (err) {
        console.error("Gagal membuka kamera:", err);
      }
    } else {
      closeCamera();
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoRef.current.srcObject = null;
    setIsCameraOn(false);
  };

  const handleTakePhoto = () => {
    if (!isCameraOn) return;

    // Tangkap foto
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL("image/png");

    console.log("Foto berhasil ditangkap (frontend):", photoData);

    setCapturedPhoto(true);

    // Matikan kamera
    closeCamera();
  };

  const handleSwitchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (!isCameraOn) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
    });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white text-black flex items-center justify-between px-6 md:px-8 py-5 shadow-md">
        <h1 className="text-2xl md:text-4xl font-black tracking-widest">
          Live <span className="text-pink-500">Camera</span>
        </h1>

        <button
          className="text-3xl md:text-4xl hover:text-pink-500 transition-all duration-300"
          title="Back"
          onClick={() => navigate("/")}
        >
          <i className="bx bx-log-out-circle"></i>
        </button>
      </nav>

      {/* CONTENT */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 space-y-10 max-w-full overflow-hidden">
        {/* AREA KAMERA */}
        <div className="relative border-4 border-white rounded-3xl w-[95%] md:w-[850px] h-[600px] md:h-[550px] flex items-center justify-center shadow-2xl bg-black overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay />

          {/* ICONS POJOK KANAN ATAS */}
          <div className="absolute top-4 right-4 flex items-center gap-3 md:gap-4">
            {!capturedPhoto && isCameraOn && (
              <button
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
                title="Balik Camera"
                onClick={handleSwitchCamera}
              >
                <i className="bx bx-refresh"></i>
              </button>
            )}

            {capturedPhoto && (
              <>
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
                  title="Simpan"
                  onClick={() => console.log("Simulasi simpan foto")}
                >
                  <i className="bx bx-save"></i>
                </button>

                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
                  title="Lihat"
                  onClick={() => console.log("Simulasi lihat foto")}
                >
                  <i className="bx bx-show"></i>
                </button>
              </>
            )}
          </div>

            {/* WARNA KULIT PIPI & WARNA LIPSTIK - di bawah tengah */}
            {isCameraOn && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[90%] flex justify-center gap-4">
                {/* WARNA KULIT PIPI */}
                <div className="relative flex-1">
                <WarnaKulitPipi />
                </div>

                {/* WARNA LIPSTIK */}
                <div className="relative flex-1">
                <WarnaLipstik />
                </div>
            </div>
            )}

        </div>

        {/* Tombol */}
        <div className="flex gap-4">
          <div
            onClick={handleToggleCamera}
            className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-xl inline-block"
          >
            <i className="bx bx-camera mr-2"></i>{" "}
            {isCameraOn ? "Close Camera" : "Open Camera"}
          </div>

          <div
            onClick={handleTakePhoto}
            className={`cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-xl inline-block ${!isCameraOn ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <i className="bx bx-camera-movie mr-2"></i> Foto
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default CameraLive;
