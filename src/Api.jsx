import axios from "axios";

const API_URL = "https://backendmakeover-production.up.railway.app";

// Buat instance axios dengan timeout yang lebih pendek untuk live processing
const liveApi = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 second timeout untuk live processing
});

// Fallback function untuk efek lokal
export const applyLocalEffects = (imageData, cheekColor = null, lipstickColor = null) => {
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
        ctx.fillStyle = cheekColor + '30';
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
        ctx.fillStyle = lipstickColor + '50';
        ctx.globalCompositeOperation = 'color';
        
        const lipWidth = canvas.width * 0.35;
        const lipHeight = canvas.height * 0.08;
        const lipTop = canvas.height * 0.68;
        
        ctx.fillRect((canvas.width - lipWidth) / 2, lipTop, lipWidth, lipHeight);
      }
      
      resolve({
        processed_image: canvas.toDataURL('image/jpeg', 0.9),
        message: "Local effects applied"
      });
    };
    
    img.src = imageData;
  });
};

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
      timeout: 30000,
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

// ========== LIVE CAMERA PROCESSING ==========

export const processLiveFrame = async (imageData, cheekColor = null, lipstickColor = null) => {
  try {
    // Jika tidak ada warna yang dipilih, return image asli
    if (!cheekColor && !lipstickColor) {
      return {
        processed_image: imageData,
        message: "No effects selected"
      };
    }

    const response = await liveApi.post('/api/process-live-frame', {
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
    console.error("Error processing live frame, using local effects:", error);
    
    // Fallback ke efek lokal
    return await applyLocalEffects(imageData, cheekColor, lipstickColor);
  }
};

export const applyCheekColor = async (imageFile, cheekHex, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("cheek_hex", cheekHex);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await axios.post(`${API_URL}/api/apply-cheek-color`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
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
    
    const response = await axios.post(`${API_URL}/api/apply-lipstick`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying lipstick:", error);
    throw error;
  }
};

export const applyCombinedMakeup = async (imageFile, cheekHex = null, lipstickHex = null, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    if (cheekHex) {
      formData.append("cheek_hex", cheekHex);
    }
    if (lipstickHex) {
      formData.append("lipstick_hex", lipstickHex);
    }
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    
    const response = await axios.post(`${API_URL}/api/apply-combined-makeup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying combined makeup:", error);
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

// Utility function untuk capture frame dari video
export const captureVideoFrame = (videoElement, quality = 0.8) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
};