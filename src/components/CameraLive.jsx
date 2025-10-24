import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaKulitPipi from "./WarnaKulitPipi";
import WarnaLipstik from "./WarnaLipstik";

const CameraLive = () => {
  const navigate = useNavigate(); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [selectedCheekColor, setSelectedCheekColor] = useState(null);
  const [selectedLipstickColor, setSelectedLipstickColor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [processedImage, setProcessedImage] = useState(null);

  // API URL untuk live processing
  const LIVE_PROCESSING_URL = "https://backendmakeover-production.up.railway.app/api/process-live-frame";

  const processFrame = useCallback(async (frameData) => {
    if (!selectedCheekColor && !selectedLipstickColor) {
      return frameData; // Return original jika tidak ada efek
    }

    try {
      setIsProcessing(true);
      
      const response = await fetch(LIVE_PROCESSING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: frameData,
          cheek_color: selectedCheekColor,
          lipstick_color: selectedLipstickColor
        }),
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      return data.processed_image;
    } catch (error) {
      console.error('Error processing frame:', error);
      return frameData; // Return original jika error
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCheekColor, selectedLipstickColor]);

  const captureAndProcessFrame = useCallback(async () => {
    if (!videoRef.current || !isCameraOn) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw current video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const frameData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process frame dengan efek
    const processedFrame = await processFrame(frameData);
    
    // Update video display dengan frame yang sudah diproses
    if (canvasRef.current) {
      const displayCtx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => {
        displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        displayCtx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
      img.src = processedFrame;
    }
  }, [isCameraOn, processFrame]);

  // Setup video stream dan processing loop
  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOn(true);
        setCapturedPhoto(false);

        // Start processing loop
        const processLoop = () => {
          if (isCameraOn) {
            captureAndProcessFrame();
            requestAnimationFrame(processLoop);
          }
        };
        processLoop();

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

  const handleTakePhoto = async () => {
    if (!isCameraOn) return;

    // Capture final processed photo
    await captureAndProcessFrame();
    setCapturedPhoto(true);
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

  const handleCheekColorSelect = (colorHex) => {
    setSelectedCheekColor(colorHex);
  };

  const handleLipstickColorSelect = (colorHex) => {
    setSelectedLipstickColor(colorHex);
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
          {/* Video element untuk capture */}
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            muted
            style={{ display: isCameraOn && !capturedPhoto ? 'block' : 'none' }}
          />
          
          {/* Canvas untuk display processed frame */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            style={{ display: isCameraOn ? 'block' : 'none' }}
          />

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

          {/* WARNA KULIT PIPI & WARNA LIPSTIK */}
          {isCameraOn && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[90%] flex justify-center gap-4">
              {/* WARNA KULIT PIPI */}
              <div className="relative flex-1">
                <WarnaKulitPipi onColorSelect={handleCheekColorSelect} />
              </div>

              {/* WARNA LIPSTIK */}
              <div className="relative flex-1">
                <WarnaLipstik onColorSelect={handleLipstickColorSelect} />
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-lg">Processing...</div>
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
            className={`cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-xl inline-block ${
              !isCameraOn ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <i className="bx bx-camera-movie mr-2"></i> Foto
          </div>
        </div>

        {/* Selected Colors Display */}
        {(selectedCheekColor || selectedLipstickColor) && (
          <div className="flex gap-4 items-center">
            {selectedCheekColor && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: selectedCheekColor }}
                ></div>
                <span className="text-white text-sm">Cheek Color</span>
              </div>
            )}
            {selectedLipstickColor && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: selectedLipstickColor }}
                ></div>
                <span className="text-white text-sm">Lipstick Color</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraLive;