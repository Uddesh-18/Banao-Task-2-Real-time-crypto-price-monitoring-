
import axios from 'axios';

const API_URL = 'http://localhost:3000'; //Port

export const fetchPrices = async () => {
  try {
    const response = await axios.get(`${API_URL}/prices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
};

export const createAlert = async (alert) => {
  try {
    await axios.post(`${API_URL}/set-alert`, alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};
  