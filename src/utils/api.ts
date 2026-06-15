import axios, { AxiosInstance, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Request interceptor to manually set X-XSRF-TOKEN header for cross-port/cross-origin requests
api.interceptors.request.use(
    (config) => {
        const matches = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
        const token = matches ? decodeURIComponent(matches[1]) : null;
        if (token) {
            config.headers['X-XSRF-TOKEN'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthenticated state automatically
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Method to perform Sanctum CSRF handshake
export const getCsrfCookie = (): Promise<AxiosResponse> => {
    return axios.get(import.meta.env.VITE_SANCTUM_CSRF_URL || 'http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
    });
};

// Helper to fetch the plain-text CSRF token and set it in the headers for cross-domain support
export const getCsrfToken = async (): Promise<void> => {
    const response = await api.get('/csrf-token');
    if (response.data && response.data.token) {
        api.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token;
    }
};

export default api;
