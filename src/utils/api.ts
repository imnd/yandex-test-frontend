import axios, { AxiosInstance, AxiosResponse } from 'axios';

const getBaseApiUrl = (): string => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname.endsWith('-frontend.onrender.com')) {
        const backendHost = hostname.replace('-frontend.onrender.com', '-backend.onrender.com');
        return `https://${backendHost}/api`;
    }
    return 'http://localhost:8000/api';
};

const getCsrfCookieUrl = (): string => {
    if (import.meta.env.VITE_SANCTUM_CSRF_URL) {
        return import.meta.env.VITE_SANCTUM_CSRF_URL;
    }
    const hostname = window.location.hostname;
    if (hostname.endsWith('-frontend.onrender.com')) {
        const backendHost = hostname.replace('-frontend.onrender.com', '-backend.onrender.com');
        return `https://${backendHost}/sanctum/csrf-cookie`;
    }
    return 'http://localhost:8000/sanctum/csrf-cookie';
};

const api: AxiosInstance = axios.create({
    baseURL: getBaseApiUrl(),
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

let csrfTokenPromise: Promise<void> | null = null;

// Helper to fetch the plain-text CSRF token and set it in the headers for cross-domain support
export const getCsrfToken = async (): Promise<void> => {
    const response = await api.get('/csrf-token');
    if (response.data && response.data.token) {
        api.defaults.headers.common['X-CSRF-TOKEN'] = response.data.token;
    }
};

// Request interceptor to manually set CSRF headers for stateful requests
api.interceptors.request.use(
    async (config) => {
        // Set X-XSRF-TOKEN from cookie if accessible (local fallback)
        const matches = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
        const cookieToken = matches ? decodeURIComponent(matches[1]) : null;
        if (cookieToken) {
            config.headers['X-XSRF-TOKEN'] = cookieToken;
        }

        // Lazy fetch plain-text X-CSRF-TOKEN for POST/PUT/PATCH/DELETE requests (Render cross-domain fix)
        const method = config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            if (!api.defaults.headers.common['X-CSRF-TOKEN']) {
                if (!csrfTokenPromise) {
                    csrfTokenPromise = getCsrfToken().finally(() => {
                        csrfTokenPromise = null;
                    });
                }
                await csrfTokenPromise;
            }
            config.headers['X-CSRF-TOKEN'] = api.defaults.headers.common['X-CSRF-TOKEN'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthenticated state and transparent CSRF retries
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }

        // Auto-retry once on CSRF mismatch (419) by fetching a fresh token
        if (error.response && error.response.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            delete api.defaults.headers.common['X-CSRF-TOKEN'];
            try {
                await getCsrfToken();
                originalRequest.headers['X-CSRF-TOKEN'] = api.defaults.headers.common['X-CSRF-TOKEN'];
                return api(originalRequest);
            } catch (csrfError) {
                return Promise.reject(csrfError);
            }
        }

        return Promise.reject(error);
    }
);

// Method to perform Sanctum CSRF handshake
export const getCsrfCookie = (): Promise<AxiosResponse> => {
    return axios.get(getCsrfCookieUrl(), {
        withCredentials: true
    });
};

export default api;
