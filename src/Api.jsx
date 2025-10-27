import axios from "axios";

const API_URL = "https://backendmakeover-production.up.railway.app";

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

// ========== TAMBAHAN BARU UNTUK LIVE CAMERA PROCESSING ==========

export const processLiveFrame = async (imageData, cheekColor = null, lipstickColor = null) => {
  try {
    const formData = new FormData();
    formData.append("image_data", imageData);
    if (cheekColor) {
      formData.append("cheek_color", cheekColor);
    }
    if (lipstickColor) {
      formData.append("lipstick_color", lipstickColor);
    }
    
    const response = await axios.post(`${API_URL}/api/process-live-frame`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Error processing live frame:", error);
    throw error;
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

