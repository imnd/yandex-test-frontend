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

export default api;
