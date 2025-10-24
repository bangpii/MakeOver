import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import WarnaFoundation from "./WarnaFoundation";
import { analyzeSkin, applyFoundation } from "./Api";

const AnalisisFace = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [selectedFoundation, setSelectedFoundation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [skinAnalysis, setSkinAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setIsAnalyzing(true);
      
      try {
        // Analyze skin tone
        const analysis = await analyzeSkin(file);
        setSkinAnalysis(analysis);
        setProcessedPhoto(analysis.processed_image);
        
        // Auto-select the best matching foundation
        if (analysis.foundation_recommendations.recommended_matches.length > 0) {
          setSelectedFoundation(analysis.foundation_recommendations.recommended_matches[0]);
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        // Fallback to original image
        const reader = new FileReader();
        reader.onload = (e) => setProcessedPhoto(e.target.result);
        reader.readAsDataURL(file);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFoundationSelect = async (foundation) => {
    setSelectedFoundation(foundation);
    
    if (photo) {
      try {
        const result = await applyFoundation(photo, foundation.hex);
        setProcessedPhoto(result.processed_image);
      } catch (error) {
        console.error("Failed to apply foundation:", error);
      }
    }
  };

  const handleSaveImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `makeover-${selectedFoundation?.name || 'foundation'}.jpg`;
      link.href = processedPhoto;
      link.click();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white text-black flex items-center justify-between px-6 md:px-8 py-5 shadow-md">
        <h1 className="text-2xl md:text-4xl font-black tracking-widest">
          Face <span className="text-pink-500">Analysis</span>
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
        {/* AREA FOTO */}
        <div className="relative border-4 border-white rounded-3xl w-[95%] md:w-[850px] h-[400px] md:h-[550px] flex items-center justify-center shadow-2xl bg-black overflow-hidden">
          {isAnalyzing ? (
            <div className="text-white text-xl">Analyzing your skin tone...</div>
          ) : processedPhoto ? (
            <>
              <img 
                src={processedPhoto} 
                alt="Processed" 
                className="w-full h-full object-cover rounded-2xl"
                ref={canvasRef}
              />
              
              {/* Skin tone info */}
              {skinAnalysis && (
                <div className="absolute top-4 left-4 bg-black/70 p-3 rounded-lg text-left">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded border border-white"
                        style={{ backgroundColor: skinAnalysis.skin_tone_hex }}
                      ></div>
                      <span>Your Skin Tone</span>
                    </div>
                    <div className="text-xs opacity-80">
                      {skinAnalysis.foundation_recommendations.primary_category} undertone
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-white text-xl">Upload your photo to begin analysis</div>
          )}

          {/* ICONS POJOK KANAN ATAS */}
          <div className="absolute top-4 right-4 flex items-center gap-3 md:gap-4">
            {/* Save */}
            {processedPhoto && (
              <button
                onClick={handleSaveImage}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
                title="Save"
              >
                <i className="bx bx-save"></i>
              </button>
            )}

            {/* Fullscreen */}
            {processedPhoto && (
              <button
                onClick={handleFullscreen}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-white text-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-md"
                title="View Fullscreen"
              >
                <i className="bx bx-fullscreen"></i>
              </button>
            )}
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
              ref={fileInputRef}
            />
            <div className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 text-base md:text-xl inline-block">
              <i className="bx bx-upload mr-2"></i> Choose Your Photo
            </div>
          </label>
        )}

        {/* Komponen Warna dengan Foundation Selection */}
        {photo && (
          <div className="w-full max-w-[850px] px-3 md:px-6 overflow-hidden">
            <WarnaFoundation 
              onFoundationSelect={handleFoundationSelect}
              selectedFoundation={selectedFoundation}
              recommendations={skinAnalysis?.foundation_recommendations}
            />
          </div>
        )}
      </div>

      {/* FULLSCREEN MODAL */}
      {isFullscreen && processedPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img 
            src={processedPhoto} 
            alt="Fullscreen" 
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-6 right-6 text-white text-4xl hover:text-pink-500 transition-all duration-300"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalisisFace;