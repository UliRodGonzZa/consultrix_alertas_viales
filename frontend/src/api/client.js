import axios from 'axios';

const BASE = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({ baseURL: `${BASE}/api` });

export const fetchKpis            = () => api.get('/kpis').then(r => r.data);
export const fetchTraficoAnual    = () => api.get('/trafico/anual').then(r => r.data);
export const fetchTraficoMensual  = (anio) => api.get('/trafico/mensual', { params: { anio } }).then(r => r.data);
export const fetchHeatmap         = () => api.get('/trafico/heatmap').then(r => r.data);
export const fetchAccidentesDia   = () => api.get('/accidentes/por_dia').then(r => r.data);
export const fetchIluminacion     = () => api.get('/accidentes/iluminacion').then(r => r.data);
export const fetchRiesgoEstados   = () => api.get('/accidentes/riesgo_estados').then(r => r.data);
export const fetchModeloDatos     = () => api.get('/modelo/datos').then(r => r.data);
export const fetchAlertas         = (nivel) => api.get('/alertas', { params: nivel ? { nivel } : {} }).then(r => r.data);
export const predecirAlerta       = (data) => api.post('/modelo/predecir', data).then(r => r.data);

export default api;
