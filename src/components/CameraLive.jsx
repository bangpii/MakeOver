import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaKulitPipi from "./WarnaKulitPipi";
import WarnaLipstik from "./WarnaLipstik";
import { processLiveFrame, checkBackendHealth, applyLocalColorOverlay } from "../Api_Camera";

const CameraLive = () => {
  const navigate = useNavigate(); 
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [selectedCheekColor, setSelectedCheekColor] = useState(null);
  const [selectedLipstickColor, setSelectedLipstickColor] = useState(null);
  const [stream, setStream] = useState(null);
  const [backendStatus, setBackendStatus] = useState("unknown");
  const [useBackend, setUseBackend] = useState(true);
  
  // Refs untuk kontrol yang lebih baik
  const processingRef = useRef(false);
  const selectedCheekColorRef = useRef(selectedCheekColor);
  const selectedLipstickColorRef = useRef(selectedLipstickColor);
  const frameCounterRef = useRef(0);
  const lastProcessedFrameRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const pendingProcessRef = useRef(false);

  // Sync refs dengan state
  useEffect(() => {
    selectedCheekColorRef.current = selectedCheekColor;
  }, [selectedCheekColor]);

  useEffect(() => {
    selectedLipstickColorRef.current = selectedLipstickColor;
  }, [selectedLipstickColor]);

  // Check backend status saat component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      console.log("🔍 Checking backend status...");
      const health = await checkBackendHealth();
      
      if (health.status === "healthy" && health.mediapipe_available) {
        setBackendStatus("healthy");
        setUseBackend(true);
        console.log("✅ Backend is healthy with MediaPipe support");
      } else if (health.status === "healthy") {
        setBackendStatus("limited");
        setUseBackend(true);
        console.log("⚠️ Backend is healthy but MediaPipe not available");
      } else {
        setBackendStatus("offline");
        setUseBackend(false);
        console.log("❌ Backend is offline - using local effects");
      }
    } catch (error) {
      console.error("❌ Backend health check failed:", error);
      setBackendStatus("offline");
      setUseBackend(false);
    }
  };

  // Fungsi utama untuk memproses frame
  const processFrame = useCallback(async (frameData) => {
    const currentCheekColor = selectedCheekColorRef.current;
    const currentLipstickColor = selectedLipstickColorRef.current;

    // Jika tidak ada warna yang dipilih, return null (tidak ada efek)
    if (!currentCheekColor && !currentLipstickColor) {
      return null;
    }

    // Prevent multiple simultaneous processing
    if (processingRef.current || pendingProcessRef.current) {
      return null;
    }

    try {
      processingRef.current = true;
      pendingProcessRef.current = true;
      
      let processedFrame;
      
      if (useBackend && backendStatus !== "offline") {
        // Gunakan backend processing
        const result = await processLiveFrame(frameData, currentCheekColor, currentLipstickColor);
        processedFrame = result.processed_image;
      } else {
        // Gunakan efek lokal
        processedFrame = await applyLocalColorOverlay(frameData, currentCheekColor, currentLipstickColor);
      }
      
      return processedFrame;
      
    } catch (error) {
      console.error('❌ Error processing frame:', error);
      
      // Fallback ke efek lokal
      try {
        const fallbackResult = await applyLocalColorOverlay(frameData, currentCheekColor, currentLipstickColor);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('💥 Even fallback failed:', fallbackError);
        return null;
      }
    } finally {
      processingRef.current = false;
      pendingProcessRef.current = false;
    }
  }, [useBackend, backendStatus]);

  // Fungsi untuk capture frame dan proses
  const captureAndProcessFrame = useCallback(async () => {
    if (!videoRef.current || !isCameraOn || processingRef.current || pendingProcessRef.current) {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Skip jika frame sama dengan sebelumnya (optimization)
      if (lastProcessedFrameRef.current === frameData) {
        return;
      }
      lastProcessedFrameRef.current = frameData;
      
      // Process the frame dengan efek makeup
      const processedFrame = await processFrame(frameData);
      
      // Display processed frame di canvas - HANYA jika ada efek
      if (canvasRef.current && processedFrame) {
        const displayCtx = canvasRef.current.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Clear canvas terlebih dahulu
          displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw processed image dengan ukuran yang tepat
          displayCtx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
        
        img.src = processedFrame;
      } else if (canvasRef.current && !processedFrame) {
        // Jika tidak ada efek, clear canvas untuk menunjukkan video asli
        const displayCtx = canvasRef.current.getContext('2d');
        displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    } catch (error) {
      console.error('❌ Error in captureAndProcessFrame:', error);
    }
  }, [isCameraOn, processFrame]);

  // Setup video stream
  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        console.log("📷 Starting camera...");
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });
        
        videoRef.current.srcObject = userStream;
        setStream(userStream);
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraOn(true);
          setCapturedPhoto(false);
          
          // Setup canvas size - Match video dimensions
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          
          // Reset status ketika camera hidup
          lastProcessedFrameRef.current = null;
        };

      } catch (err) {
        console.error("❌ Failed to open camera:", err);
        alert("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.");
      }
    } else {
      closeCamera();
    }
  };

  const closeCamera = () => {
    // Stop animation frame loop
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    
    // Reset states
    setSelectedCheekColor(null);
    setSelectedLipstickColor(null);
    processingRef.current = false;
    pendingProcessRef.current = false;
    lastProcessedFrameRef.current = null;
  };

  // Processing loop untuk real-time effects
  useEffect(() => {
    let lastProcessTime = 0;
    const PROCESS_INTERVAL = 300;

    const processLoop = (currentTime) => {
      if (!isCameraOn) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        return;
      }

      const hasColorEffect = selectedCheekColorRef.current || selectedLipstickColorRef.current;
      
      // Only process if we have color effects and enough time has passed
      if (hasColorEffect && (currentTime - lastProcessTime > PROCESS_INTERVAL)) {
        captureAndProcessFrame();
        lastProcessTime = currentTime;
        frameCounterRef.current++;
      }
      
      // Always continue the loop when camera is on
      if (isCameraOn) {
        animationFrameIdRef.current = requestAnimationFrame(processLoop);
      }
    };

    if (isCameraOn) {
      frameCounterRef.current = 0;
      lastProcessTime = 0;
      
      // Start the loop immediately
      animationFrameIdRef.current = requestAnimationFrame(processLoop);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isCameraOn, captureAndProcessFrame]);

  const handleTakePhoto = async () => {
    if (!isCameraOn) return;

    try {
      console.log("📸 Taking photo...");
      
      // Capture frame langsung dari canvas yang udah ada efeknya
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw video frame dulu
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Jika canvasRef ada gambar efek, draw di atas video frame
      if (canvasRef.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvasRef.current, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
      
      // Tampilkan hasil foto di canvas utama
      const displayCtx = canvasRef.current.getContext('2d');
      displayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      displayCtx.drawImage(canvas, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      setCapturedPhoto(true);
      console.log("✅ Photo captured successfully with live effects");
      
    } catch (error) {
      console.error('❌ Error taking photo:', error);
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
      console.log(`🔄 Switching camera to: ${newFacingMode}`);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      videoRef.current.srcObject = newStream;
      setStream(newStream);
      videoRef.current.play();
      
      // Reset status ketika switch camera
      lastProcessedFrameRef.current = null;
      
      // Update canvas size
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }
    } catch (err) {
      console.error("❌ Failed to switch camera:", err);
    }
  };

  // Handler untuk pilihan warna
  const handleCheekColorSelect = useCallback((colorHex) => {
    console.log(`🎨 Cheek color selected: ${colorHex}`);
    setSelectedCheekColor(colorHex);
    
    // Reset frame cache ketika warna berubah
    lastProcessedFrameRef.current = null;
  }, []);

  const handleLipstickColorSelect = useCallback((colorHex) => {
    console.log(`💄 Lipstick color selected: ${colorHex}`);
    setSelectedLipstickColor(colorHex);
    
    // Reset frame cache ketika warna berubah
    lastProcessedFrameRef.current = null;
  }, []);

  const handleRetakePhoto = () => {
    setCapturedPhoto(false);
    lastProcessedFrameRef.current = null;
    
    // Clear canvas untuk kembali ke live camera dengan efek
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleSavePhoto = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `makeover-${new Date().getTime()}.jpg`;
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
      link.click();
      console.log("💾 Photo saved");
    }
  };

  // Clear semua efek ketika component unmount
  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white backdrop-blur-md border-b border-white flex items-center justify-between px-4 md:px-8 py-4 shadow-lg">
        <h1 className="text-xl text-black md:text-3xl font-black tracking-widest">
          Live <span className="text-pink-500">Camera</span>
        </h1>

        <button
          className="text-2xl md:text-3xl hover:text-pink-500 transition-all duration-300 bg-black hover:bg-white p-2 rounded-full"
          title="Back"
          onClick={() => navigate("/")}
        >
          <i className="bx bx-log-out-circle"></i>
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 space-y-4 md:space-y-6">
        {/* BACKEND STATUS */}
        <div className="w-full max-w-4xl">
          {backendStatus === "limited" && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-2 md:p-3 text-center mb-3 md:mb-4">
              <p className="text-yellow-300 text-xs md:text-sm">
                ⚠️ Backend limited - Using basic effects
              </p>
            </div>
          )}
          {backendStatus === "offline" && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-2 md:p-3 text-center mb-3 md:mb-4">
              <p className="text-red-300 text-xs md:text-sm">
                ❌ Backend offline - Using local effects
              </p>
            </div>
          )}
        </div>

        {/* CAMERA CONTAINER */}
        <div className="relative w-full max-w-4xl aspect-[3/4] md:aspect-[4/3] bg-black rounded-xl md:rounded-3xl border-2 md:border-4 border-white/30 shadow-xl md:shadow-2xl overflow-hidden">
          {/* Video Element - SELALU TERLIHAT */}
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            autoPlay 
            muted
            playsInline
          />
          
          {/* Canvas Element - Overlay transparan di atas video */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              capturedPhoto ? 'opacity-100' : (selectedCheekColor || selectedLipstickColor) ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              mixBlendMode: 'normal',
              pointerEvents: 'none'
            }}
          />

          {/* ICONS TOP RIGHT */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-2 md:gap-3 z-10">
            {!capturedPhoto && isCameraOn && (
              <button
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-lg md:text-xl hover:bg-white hover:text-black transition-all duration-300 shadow-lg backdrop-blur-sm"
                title="Switch Camera"
                onClick={handleSwitchCamera}
              >
                <i className="bx bx-refresh"></i>
              </button>
            )}

            {capturedPhoto && (
              <>
                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-lg md:text-xl hover:bg-green-500 hover:border-green-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Save Photo"
                  onClick={handleSavePhoto}
                >
                  <i className="bx bx-save"></i>
                </button>

                <button
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 border-white/80 bg-black/50 text-white text-lg md:text-xl hover:bg-blue-500 hover:border-blue-500 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  title="Retake Photo"
                  onClick={handleRetakePhoto}
                >
                  <i className="bx bx-reset"></i>
                </button>
              </>
            )}
          </div>

          {/* COLOR SELECTORS - BOTTOM - PERBAIKAN LAYOUT MOBILE */}
          {isCameraOn && !capturedPhoto && (
            <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-3xl z-10">
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {/* Blush */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20">
                  <WarnaKulitPipi 
                    onColorSelect={handleCheekColorSelect}
                    selectedColor={selectedCheekColor}
                  />
                </div>

                {/* Lipstick */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/20">
                  <WarnaLipstik 
                    onColorSelect={handleLipstickColorSelect}
                    selectedColor={selectedLipstickColor}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Camera Off Placeholder */}
          {!isCameraOn && !capturedPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white/70">
                <i className="bx bx-camera-off text-4xl md:text-6xl lg:text-8xl mb-3 md:mb-4"></i>
                <p className="text-base md:text-lg lg:text-xl">Kamera belum aktif</p>
                <p className="text-xs md:text-sm lg:text-base mt-1 md:mt-2">Klik "Open Camera" untuk memulai</p>
              </div>
            </div>
          )}
        </div>

        {/* CONTROL BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full max-w-md">
          <button
            onClick={handleToggleCamera}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base min-w-[160px] md:min-w-[200px] justify-center flex-1"
          >
            <i className="bx bx-camera text-lg md:text-xl"></i>
            {isCameraOn ? "Close Camera" : "Open Camera"}
          </button>

          <button
            onClick={handleTakePhoto}
            disabled={!isCameraOn}
            className={`flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base min-w-[160px] md:min-w-[200px] justify-center flex-1 ${
              isCameraOn
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            <i className="bx bx-camera text-lg md:text-xl"></i>
            Take Photo
          </button>
        </div>

        {/* PERFORMANCE INFO */}
        {isCameraOn && (
          <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/10 w-full max-w-md">
            <div className="text-center text-white/70 text-xs md:text-sm">
              <p>Effects: {selectedCheekColor ? "Blush " : ""}{selectedLipstickColor ? "Lipstick" : "None"}</p>
            </div>
          </div>
        )}

        {/* SELECTED COLORS DISPLAY */}
        {(selectedCheekColor || selectedLipstickColor) && isCameraOn && (
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20 w-full max-w-md">
            <span className="text-white font-semibold text-sm md:text-base">Active Effects:</span>
            {selectedCheekColor && (
              <div className="flex items-center gap-1 md:gap-2 bg-pink-500/20 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                <div 
                  className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedCheekColor }}
                ></div>
                <span className="text-white text-xs md:text-sm">Blush</span>
                <button 
                  onClick={() => {
                    setSelectedCheekColor(null);
                    // Clear canvas ketika efek dihapus
                    if (canvasRef.current) {
                      const ctx = canvasRef.current.getContext('2d');
                      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                  }}
                  className="text-xs bg-red-500 hover:bg-red-600 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            {selectedLipstickColor && (
              <div className="flex items-center gap-1 md:gap-2 bg-red-500/20 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                <div 
                  className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedLipstickColor }}
                ></div>
                <span className="text-white text-xs md:text-sm">Lipstick</span>
                <button 
                  onClick={() => {
                    setSelectedLipstickColor(null);
                    // Clear canvas ketika efek dihapus
                    if (canvasRef.current) {
                      const ctx = canvasRef.current.getContext('2d');
                      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                  }}
                  className="text-xs bg-red-500 hover:bg-red-600 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center"
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