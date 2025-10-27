import axios from "axios";

const API_URL = "https://backendmakeover-production.up.railway.app";

// Fungsi untuk memproses frame live camera
export const processLiveFrame = async (frameData, cheekColor = null, lipstickColor = null) => {
  try {
    console.log("🎨 Sending frame to backend for processing...");
    
    const payload = {
      image: frameData,
      cheek_color: cheekColor,
      lipstick_color: lipstickColor
    };

    const response = await axios.post(`${API_URL}/api/process-live-frame`, payload, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("✅ Frame processed successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Error processing live frame:", error);
    
    // Fallback ke efek lokal jika backend error
    if (error.code === 'ECONNABORTED') {
      throw new Error("Request timeout - using local effects");
    }
    
    if (error.response) {
      throw new Error(`Backend error: ${error.response.status} - ${error.response.data.detail || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error("Cannot connect to backend - using local effects");
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

// Fungsi untuk check health backend
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error("❌ Backend health check failed:", error);
    return {
      status: "offline",
      mediapipe_available: false,
      live_tracker_available: false
    };
  }
};

// Fungsi fallback untuk efek lokal
export const applyLocalColorOverlay = (frameData, cheekColor = null, lipstickColor = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply cheek color jika ada
      if (cheekColor) {
        ctx.fillStyle = cheekColor + '40'; // 25% opacity
        ctx.globalCompositeOperation = 'soft-light';
        
        const cheekWidth = canvas.width * 0.25;
        const cheekHeight = canvas.height * 0.15;
        const cheekTop = canvas.height * 0.45;
        
        // Left cheek
        ctx.fillRect(canvas.width * 0.15, cheekTop, cheekWidth, cheekHeight);
        // Right cheek
        ctx.fillRect(canvas.width * 0.6, cheekTop, cheekWidth, cheekHeight);
      }
      
      // Apply lipstick color jika ada
      if (lipstickColor) {
        ctx.fillStyle = lipstickColor + '60'; // 37.5% opacity
        ctx.globalCompositeOperation = 'color';
        
        const lipWidth = canvas.width * 0.35;
        const lipHeight = canvas.height * 0.08;
        const lipTop = canvas.height * 0.68;
        
        ctx.fillRect((canvas.width - lipWidth) / 2, lipTop, lipWidth, lipHeight);
      }
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = frameData;
  });
};

export default {
  processLiveFrame,
  checkBackendHealth,
  applyLocalColorOverlay
};