import axios from "axios";

const API_URL = "https://backend-makeover.com"; // Gunakan domain Anda

export const getHello = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/hello`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return { message: "Failed to fetch" };
  }
};