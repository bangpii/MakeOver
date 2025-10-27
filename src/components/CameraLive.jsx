import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaKulitPipi from "./WarnaKulitPipi";
import WarnaLipstik from "./WarnaLipstik";
import { processLiveFrame } from "../Api";

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
  const [backendStatus, setBackendStatus] = useState("unknown");
  
  // Refs untuk state management yang lebih baik
  const processingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastProcessTimeRef = useRef(0);

  // Check backend status
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("https://backendmakeover-production.up.railway.app/api/health");
      const data = await response.json();
      setBackendStatus(data.mediapipe_available ? "healthy" : "limited");
    } catch (error) {
      console.error("Backend health check failed:", error);
      setBackendStatus("offline");
    }
  };

  // Optimized frame processing dengan debouncing
  const processFrame = useCallback(async (frameData) => {
    if (processingRef.current) return frameData;

    const currentCheekColor = selectedCheekColor;
    const currentLipstickColor = selectedLipstickColor;

    if (!currentCheekColor && !currentLipstickColor) {
      return frameData;
    }

    try {
      processingRef.current = true;
      setIsProcessing(true);
      
      const result = await processLiveFrame(frameData, currentCheekColor, currentLipstickColor);
      return result.processed_image;
      
    } catch (error) {
      console.error('Error processing frame:', error);
      // Fallback ke efek lokal sederhana
      return applyLocalColorEffect(frameData, currentCheekColor, currentLipstickColor);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [selectedCheekColor, selectedLipstickColor]);

  // Efek lokal sebagai fallback
  const applyLocalColorEffect = (frameData, cheekColor, lipstickColor) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Apply cheek color effect
        if (cheekColor) {
          ctx.fillStyle = cheekColor + '40'; // 25% opacity
          ctx.globalCompositeOperation = 'color';
          
          const cheekWidth = canvas.width * 0.25;
          const cheekHeight = canvas.height * 0.15;
          const cheekTop = canvas.height * 0.45;
          
          // Left cheek
          ctx.fillRect(canvas.width * 0.15, cheekTop, cheekWidth, cheekHeight);
          // Right cheek
          ctx.fillRect(canvas.width * 0.6, cheekTop, cheekWidth, cheekHeight);
        }
        
        // Apply lipstick effect
        if (lipstickColor) {
          ctx.fillStyle = lipstickColor + '60'; // 37.5% opacity
          ctx.globalCompositeOperation = 'color';
          
          const lipWidth = canvas.width * 0.35;
          const lipHeight = canvas.height * 0.08;
          const lipTop = canvas.height * 0.68;
          
          ctx.fillRect((canvas.width - lipWidth) / 2, lipTop, lipWidth, lipHeight);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      img.src = frameData;
    });
  };

  // Optimized frame capture dengan throttling
  const captureAndProcessFrame = useCallback(async () => {
    if (!videoRef.current || !isCameraOn || processingRef.current) return;

    const now = Date.now();
    if (now - lastProcessTimeRef.current < 300) return; // Throttle to 300ms
    
    lastProcessTimeRef.current = now;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video.videoWidth || !video.videoHeight) return;

      const ctx = canvas.getContext('2d');
      
      // Capture frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Process frame
      const processedFrame = await processFrame(frameData);
      
      if (processedFrame) {
        const displayCtx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          displayCtx.clearRect(0, 0, canvas.width, canvas.height);
          displayCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = processedFrame;
      }
    } catch (error) {
      console.error('Error in captureAndProcessFrame:', error);
    }
  }, [isCameraOn, processFrame]);

  // Setup camera dengan error handling yang lebih baik
  const handleToggleCamera = async () => {
    if (isCameraOn) {
      closeCamera();
      return;
    }

    try {
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      };

      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      videoRef.current.srcObject = userStream;
      setStream(userStream);
      
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve);
        };
      });

      // Setup canvas size
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      setIsCameraOn(true);
      setCapturedPhoto(false);
      
    } catch (err) {
      console.error("Gagal membuka kamera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.");
    }
  };

  const closeCamera = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    
    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
  };

  // Optimized processing loop
  useEffect(() => {
    if (!isCameraOn) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const processLoop = () => {
      if (!isCameraOn) return;
      
      const hasColorEffect = selectedCheekColor || selectedLipstickColor;
      
      if (hasColorEffect) {
        captureAndProcessFrame();
      } else {
        // Jika tidak ada efek, langsung render video ke canvas
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.videoWidth && video.videoHeight) {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(processLoop);
    };

    animationFrameRef.current = requestAnimationFrame(processLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraOn, selectedCheekColor, selectedLipstickColor, captureAndProcessFrame]);

  const handleTakePhoto = async () => {
    if (!isCameraOn) return;

    try {
      setCapturedPhoto(true);
      
      // Tunggu sebentar untuk memastikan frame terakhir sudah diproses
      setTimeout(() => {
        closeCamera();
      }, 500);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSwitchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (!isCameraOn) return;

    // Close current stream
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
      await videoRef.current.play();
    } catch (err) {
      console.error("Gagal switch kamera:", err);
    }
  };

  const handleCheekColorSelect = useCallback((colorHex) => {
    setSelectedCheekColor(colorHex);
  }, []);

  const handleLipstickColorSelect = useCallback((colorHex) => {
    setSelectedLipstickColor(colorHex);
  }, []);

  const handleRetakePhoto = () => {
    setCapturedPhoto(false);
    setSelectedCheekColor(null);
    setSelectedLipstickColor(null);
    handleToggleCamera();
  };

  const handleSavePhoto = () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `makeover-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Gagal menyimpan foto');
    }
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
        {/* BACKEND STATUS */}
        {backendStatus === "limited" && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-center">
            <p className="text-yellow-300 text-sm">
              Backend dalam mode terbatas - menggunakan efek dasar
            </p>
          </div>
        )}
        {backendStatus === "offline" && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-center">
            <p className="text-red-300 text-sm">
              Backend offline - menggunakan efek lokal
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

          {/* CAMERA CONTROLS */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            {!capturedPhoto && isCameraOn && (
              <button
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-xl hover:bg-white hover:text-black transition-all duration-300 shadow-lg backdrop-blur-sm"
                title="Switch Camera"
                onClick={handleSwitchCamera}
              >
                <i className="bx bx-refresh"></i>
              </button>
            )}

            {capturedPhoto && (
              <>
                <button
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-xl hover:bg-green-500 hover:border-green-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Save Photo"
                  onClick={handleSavePhoto}
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

          {/* COLOR SELECTORS */}
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

          {isCameraOn && (
            <button
              onClick={handleTakePhoto}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-lg min-w-[200px] justify-center"
            >
              <i className="bx bx-camera text-xl"></i>
              Take Photo
            </button>
          )}
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
                <button 
                  onClick={() => setSelectedCheekColor(null)}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-2 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            {selectedLipstickColor && (
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedLipstickColor }}
                ></div>
                <span className="text-white text-sm">Lipstick</span>
                <button 
                  onClick={() => setSelectedLipstickColor(null)}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-2 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraLive;