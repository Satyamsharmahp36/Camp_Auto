import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeSheet = async (sheetUrl) => {
  const response = await api.post('/api/sheets/analyze', { sheetUrl });
  return response.data;
};

export const createCampaign = async (campaignData) => {
  const response = await api.post('/api/campaign/create', campaignData);
  return response.data;
};

export const generateQuery = async (queryData) => {
  const response = await api.post('/api/ai/generate-query', queryData);
  return response.data;
};

export const generateAppsScript = async (scriptData) => {
  const response = await api.post('/api/ai/generate-apps-script', scriptData);
  return response.data;
};

export const getCampaigns = async () => {
  const response = await api.get('/api/campaigns');
  return response.data;
};

export const getCampaign = async (id) => {
  const response = await api.get(`/api/campaigns/${id}`);
  return response.data;
};

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/api/campaigns/${id}`);
  return response.data;
};

export const getTriggers = async () => {
  const response = await api.get('/api/triggers');
  return response.data;
};

export default api;
