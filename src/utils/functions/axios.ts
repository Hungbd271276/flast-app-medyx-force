import axios from 'axios';
import { Storage } from '@capacitor/storage';
import { SSL_CONFIG, isAllowedDomain } from './sslConfig';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  ...SSL_CONFIG.axiosConfig,
});

let isRedirecting = false;

async function forceLogout(intendedPath?: string) {
  try {
    await Storage.clear(); // Xóa auth_token và mọi thứ trong Capacitor Storage
  } catch {}
  
  try {
    sessionStorage.clear(); // Xóa sessionStorage để ProtectedLoginRoute không nghĩ là đã login
    localStorage.clear();   // Nếu bạn có lưu ở localStorage thì xóa luôn
  } catch {}

  if (intendedPath) {
    sessionStorage.setItem('intendedPath', intendedPath);
  }

  window.location.replace('/login');
}

axiosInstance.interceptors.request.use(async (config) => {
  const result = await Storage.get({ key: 'auth_token' });
  const token = result?.value ? JSON.parse(result.value) : null;
  if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  if (SSL_CONFIG.ignoreSSL && config.url && isAllowedDomain(config.url)) {
    // @ts-ignore
    config.httpsAgent = { rejectUnauthorized: false };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && !isRedirecting) {
      isRedirecting = true;
      const intended =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      await forceLogout(intended);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
