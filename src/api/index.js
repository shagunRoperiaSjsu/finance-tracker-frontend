import axios from 'axios';

const api = axios.create({
  baseURL: 'https://xmyjrw3dcw.us-west-2.awsapprunner.com'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;