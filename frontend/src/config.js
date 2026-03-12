const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost');
export const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : 'https://smart-ai-non-invasive-glucometer.onrender.com');
