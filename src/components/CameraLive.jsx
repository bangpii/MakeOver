import React, { useRef, useState, useCallback, useEffect } from "react";
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
  const [stream, setStream] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const API_URL = "https://backendmakeover-production.up.railway.app";

  const processFrame = useCallback(async (frameData) => {
    if (!selectedCheekColor && !selectedLipstickColor) {
      return frameData;
    }

    try {
      setIsProcessing(true);
      
      const response = await fetch(`${API_URL}/api/process-live-frame`, {
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
      
      // Fallback: apply simple color overlay locally
      if (useFallback) {
        return applyLocalColorEffect(frameData, selectedCheekColor, selectedLipstickColor);
      }
      
      return frameData;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCheekColor, selectedLipstickColor, useFallback]);

  // Simple local color effect sebagai fallback
  const applyLocalColorEffect = (frameData, cheekColor, lipstickColor) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Apply simple color overlay (basic implementation)
        if (cheekColor) {
          ctx.fillStyle = cheekColor + '40'; // Add transparency
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (lipstickColor) {
          ctx.fillStyle = lipstickColor + '60';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = frameData;
    });
  };

  const captureAndProcessFrame = useCallback(async () => {
    if (!videoRef.current || !isCameraOn) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      const processedFrame = await processFrame(frameData);
      
      if (canvasRef.current) {
        const displayCtx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => {
          displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          displayCtx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
        img.src = processedFrame;
      }
    } catch (error) {
      console.error('Error in captureAndProcessFrame:', error);
    }
  }, [isCameraOn, processFrame]);

  // Setup video stream
  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
        });
        
        videoRef.current.srcObject = userStream;
        setStream(userStream);
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraOn(true);
          setCapturedPhoto(false);
          
          // Setup canvas size
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };

      } catch (err) {
        console.error("Gagal membuka kamera:", err);
        alert("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.");
      }
    } else {
      closeCamera();
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    videoRef.current.srcObject = null;
    setIsCameraOn(false);
  };

  // Processing loop
  useEffect(() => {
    let animationFrameId;
    let lastProcessTime = 0;
    const PROCESS_INTERVAL = 200; // Process every 200ms untuk mengurangi load

    const processLoop = (currentTime) => {
      if (isCameraOn && (selectedCheekColor || selectedLipstickColor)) {
        if (currentTime - lastProcessTime > PROCESS_INTERVAL) {
          captureAndProcessFrame();
          lastProcessTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(processLoop);
    };

    if (isCameraOn) {
      animationFrameId = requestAnimationFrame(processLoop);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isCameraOn, selectedCheekColor, selectedLipstickColor, captureAndProcessFrame]);

  const handleTakePhoto = async () => {
    if (!isCameraOn) return;

    try {
      await captureAndProcessFrame();
      setCapturedPhoto(true);
      
      setTimeout(() => {
        closeCamera();
      }, 100);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSwitchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (!isCameraOn) return;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      });
      
      videoRef.current.srcObject = newStream;
      setStream(newStream);
      videoRef.current.play();
    } catch (err) {
      console.error("Gagal switch kamera:", err);
    }
  };

  const handleCheekColorSelect = (colorHex) => {
    setSelectedCheekColor(colorHex);
  };

  const handleLipstickColorSelect = (colorHex) => {
    setSelectedLipstickColor(colorHex);
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(false);
    handleToggleCamera();
  };

  const enableFallbackMode = () => {
    setUseFallback(true);
    alert("Menggunakan mode fallback - efek mungkin kurang presisi");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 md:px-8 py-4 shadow-lg">
        <h1 className="text-xl md:text-3xl font-black tracking-widest">
          Live <span className="text-pink-500">Camera</span>
        </h1>

        <button
          className="text-2xl md:text-3xl hover:text-pink-500 transition-all duration-300 bg-white/10 hover:bg-white/20 p-2 rounded-full"
          title="Back"
          onClick={() => navigate("/")}
        >
          <i className="bx bx-log-out-circle"></i>
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        {/* FALLBACK WARNING */}
        {useFallback && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-center">
            <p className="text-yellow-300 text-sm">
              Menggunakan mode fallback - efek warna dasar saja
            </p>
          </div>
        )}

        {/* CAMERA CONTAINER */}
        <div className="relative w-full max-w-4xl aspect-[4/3] bg-black rounded-3xl border-4 border-white/30 shadow-2xl overflow-hidden">
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              capturedPhoto ? 'opacity-0' : 'opacity-100'
            }`}
            autoPlay 
            muted
            playsInline
          />
          
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              capturedPhoto ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* ICONS TOP RIGHT */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            {!capturedPhoto && isCameraOn && (
              <>
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-xl hover:bg-white hover:text-black transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Switch Camera"
                  onClick={handleSwitchCamera}
                >
                  <i className="bx bx-refresh"></i>
                </button>
                
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-yellow-500/80 bg-yellow-500/50 text-white text-xl hover:bg-yellow-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Enable Fallback Mode"
                  onClick={enableFallbackMode}
                >
                  <i className="bx bx-error"></i>
                </button>
              </>
            )}

            {capturedPhoto && (
              <>
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-xl hover:bg-green-500 hover:border-green-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Save Photo"
                  onClick={() => console.log("Simulasi simpan foto")}
                >
                  <i className="bx bx-save"></i>
                </button>

                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-xl hover:bg-blue-500 hover:border-blue-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Retake Photo"
                  onClick={handleRetakePhoto}
                >
                  <i className="bx bx-reset"></i>
                </button>
              </>
            )}
          </div>

          {/* COLOR SELECTORS - BOTTOM */}
          {isCameraOn && !capturedPhoto && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-3xl flex flex-col md:flex-row gap-3 md:gap-4 z-10">
              <div className="flex-1 min-w-0">
                <WarnaKulitPipi onColorSelect={handleCheekColorSelect} />
              </div>

              <div className="flex-1 min-w-0">
                <WarnaLipstik onColorSelect={handleLipstickColorSelect} />
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white text-lg font-semibold">Processing...</span>
              </div>
            </div>
          )}

          {/* Camera Off Placeholder */}
          {!isCameraOn && !capturedPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white/70">
                <i className="bx bx-camera-off text-6xl md:text-8xl mb-4"></i>
                <p className="text-lg md:text-xl">Kamera belum aktif</p>
                <p className="text-sm md:text-base mt-2">Klik "Open Camera" untuk memulai</p>
              </div>
            </div>
          )}
        </div>

        {/* CONTROL BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={handleToggleCamera}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-lg min-w-[200px] justify-center"
          >
            <i className="bx bx-camera text-xl"></i>
            {isCameraOn ? "Close Camera" : "Open Camera"}
          </button>

          <button
            onClick={handleTakePhoto}
            disabled={!isCameraOn}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-lg min-w-[200px] justify-center ${
              isCameraOn 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            <i className="bx bx-camera text-xl"></i>
            Take Photo
          </button>
        </div>

        {/* SELECTED COLORS DISPLAY */}
        {(selectedCheekColor || selectedLipstickColor) && isCameraOn && (
          <div className="flex flex-wrap gap-4 items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <span className="text-white font-semibold">Active Effects:</span>
            {selectedCheekColor && (
              <div className="flex items-center gap-2 bg-pink-500/20 px-3 py-2 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedCheekColor }}
                ></div>
                <span className="text-white text-sm">Blush</span>
              </div>
            )}
            {selectedLipstickColor && (
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedLipstickColor }}
                ></div>
                <span className="text-white text-sm">Lipstick</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraLive;