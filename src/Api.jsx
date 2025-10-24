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

export const analyzeSkin = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    
    const response = await axios.post(`${API_URL}/api/analyze-skin`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing skin:", error);
    throw error;
  }
};

export const applyFoundation = async (imageFile, foundationHex) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("foundation_hex", foundationHex);
    
    const response = await axios.post(`${API_URL}/api/apply-foundation`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error applying foundation:", error);
    throw error;
  }
};