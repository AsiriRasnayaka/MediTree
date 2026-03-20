import axios from 'axios';

// Base URL of your Java Spring Boot backend
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Get dashboard stats
export const getDashboard = () => API.get('/dashboard');

// Get full sorted patient queue
export const getQueue = () => API.get('/patients/queue');

// Add a new patient
export const addPatient = (data) => API.post('/patients', data);

// Treat the next (highest priority) patient
export const treatNext = () => API.post('/patients/treat-next');

// Treat a specific patient
export const treatPatient = (id) => API.post(`/patients/${id}/treat`);

// Update a patient's severity (Novelty Feature 1)
export const updateSeverity = (id, severity) =>
  API.put(`/patients/${id}/severity`, { severity });

// Get estimated wait time for a patient (Novelty Feature 2)
export const getWaitTime = (id) => API.get(`/patients/${id}/wait-time`);

// Get all alerts (Novelty Feature 3)
export const getAlerts = () => API.get('/alerts');