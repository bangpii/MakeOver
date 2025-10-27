import axios from "axios";

const API_URL = "https://backendmakeover-production.up.railway.app";

// Buat instance axios dengan timeout yang lebih pendek untuk live processing
const liveApi = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 second timeout untuk live processing (lebih pendek)
});

// Instance untuk upload biasa
const uploadApi = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const getHello = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/hello`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { message: "Failed to fetch" };
  }
};

export const uploadPhoto = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    
    const response = await axios.post(`${API_URL}/api/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

export const applyFoundation = async (imageFile, foundationHex, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("foundation_hex", foundationHex);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await axios.post(`${API_URL}/api/apply-foundation`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying foundation:", error);
    throw error;
  }
};

export const resetToOriginal = async (sessionId) => {
  try {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    
    const response = await axios.post(`${API_URL}/api/reset-to-original`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting to original:", error);
    throw error;
  }
};

// ========== OPTIMIZED LIVE CAMERA PROCESSING ==========

// Cache untuk mencegah request berlebihan
let lastProcessTime = 0;
const PROCESS_INTERVAL = 300; // Minimum 300ms antara request
let activeRequest = null;

export const processLiveFrameOptimized = async (imageData, cheekColor = null, lipstickColor = null) => {
  const now = Date.now();
  
  // Skip jika terlalu cepat dari request sebelumnya
  if (now - lastProcessTime < PROCESS_INTERVAL) {
    return null;
  }
  
  // Skip jika ada request yang masih aktif
  if (activeRequest) {
    return null;
  }
  
  try {
    activeRequest = true;
    lastProcessTime = now;
    
    const response = await liveApi.post('/api/process-live-frame-optimized', {
      image: imageData,
      cheek_color: cheekColor,
      lipstick_color: lipstickColor
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error processing live frame:", error);
    
    // Fallback ke efek lokal jika backend error
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
      return await applyLocalEffects(imageData, cheekColor, lipstickColor);
    }
    
    throw error;
  } finally {
    activeRequest = false;
  }
};

// Fallback efek lokal
const applyLocalEffects = (imageData, cheekColor, lipstickColor) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0);
      
      if (cheekColor) {
        ctx.fillStyle = cheekColor + '40'; // Opacity rendah
        ctx.globalCompositeOperation = 'soft-light';
        
        // Cheek areas
        const cheekWidth = canvas.width * 0.25;
        const cheekHeight = canvas.height * 0.15;
        const cheekTop = canvas.height * 0.45;
        
        // Left cheek
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.25, cheekTop, cheekWidth, cheekHeight, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Right cheek
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.75, cheekTop, cheekWidth, cheekHeight, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      if (lipstickColor) {
        ctx.fillStyle = lipstickColor + '60'; // Opacity sedang
        ctx.globalCompositeOperation = 'color';
        
        // Lip area
        const lipWidth = canvas.width * 0.3;
        const lipHeight = canvas.height * 0.08;
        const lipTop = canvas.height * 0.65;
        
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, lipTop, lipWidth, lipHeight, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      const processedImage = canvas.toDataURL('image/jpeg', 0.8);
      
      resolve({
        success: true,
        processed_image: processedImage,
        message: "Local effects applied (fallback mode)"
      });
    };
    img.src = imageData;
  });
};

export const applyCheekColor = async (imageFile, cheekHex, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("cheek_hex", cheekHex);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await uploadApi.post(`/api/apply-cheek-color`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error applying cheek color:", error);
    throw error;
  }
};

export const applyLipstick = async (imageFile, lipstickHex, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("lipstick_hex", lipstickHex);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await uploadApi.post(`/api/apply-lipstick`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error applying lipstick:", error);
    throw error;
  }
};

// Utility function untuk convert image ke base64
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Utility function untuk capture frame dari video dengan optimasi
export const captureVideoFrame = (videoElement, quality = 0.7) => {
  const canvas = document.createElement('canvas');
  
  // Resize untuk performa
  const scale = 0.7; // Scale down untuk performa
  canvas.width = videoElement.videoWidth * scale;
  canvas.height = videoElement.videoHeight * scale;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
};