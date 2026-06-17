import axios, { AxiosInstance, AxiosResponse } from 'axios';
import router from '@/router';

const getBaseApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || '/api';
};

const getCsrfCookieUrl = (): string => {
    return import.meta.env.VITE_SANCTUM_CSRF_URL || '/sanctum/csrf-cookie';
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

let csrfCookiePromise: Promise<unknown> | null = null;
let memoryCsrfToken: string | null = null;

// Request interceptor to manually set CSRF headers for stateful requests
api.interceptors.request.use(
    async (config) => {
        // Set X-XSRF-TOKEN from cookie if accessible (local fallback)
        const matches = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
        let cookieToken = matches ? decodeURIComponent(matches[1]) : null;
        if (cookieToken) {
            config.headers['X-XSRF-TOKEN'] = cookieToken;
        }

        if (memoryCsrfToken) {
            config.headers['X-CSRF-TOKEN'] = memoryCsrfToken;
        }

        // Lazy fetch CSRF cookie for POST/PUT/PATCH/DELETE requests if not present (cross-domain support)
        const method = config.method?.toUpperCase();
        if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            if (!cookieToken && !memoryCsrfToken) {
                if (!csrfCookiePromise) {
                    csrfCookiePromise = getCsrfCookie().finally(() => {
                        csrfCookiePromise = null;
                    });
                }
                await csrfCookiePromise;
                
                if (memoryCsrfToken) {
                    config.headers['X-CSRF-TOKEN'] = memoryCsrfToken;
                } else {
                    const matchesAfter = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
                    cookieToken = matchesAfter ? decodeURIComponent(matchesAfter[1]) : null;
                    if (cookieToken) {
                        config.headers['X-XSRF-TOKEN'] = cookieToken;
                    }
                }
            }
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
            router.push('/login');
        }

        // Auto-retry once on CSRF mismatch (419) by fetching a fresh CSRF cookie
        if (error.response && error.response.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                memoryCsrfToken = null; // force refetch
                await getCsrfCookie();
                const matches = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
                const cookieToken = matches ? decodeURIComponent(matches[1]) : null;
                if (cookieToken) {
                    originalRequest.headers['X-XSRF-TOKEN'] = cookieToken;
                }
                return api(originalRequest);
            } catch (csrfError) {
                return Promise.reject(csrfError);
            }
        }

        return Promise.reject(error);
    }
);

// Method to perform Sanctum CSRF handshake
export const getCsrfCookie = async (): Promise<AxiosResponse> => {
    const response = await axios.get(getCsrfCookieUrl(), {
        withCredentials: true
    });
    if (response.data && response.data.token) {
        memoryCsrfToken = response.data.token;
    }
    return response;
};

export const getAxiosErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: string | Record<string, string[]> } } };
        if (axiosErr.response?.data?.errors) {
            const first = Object.values(axiosErr.response.data.errors).flat()[0];
            return (first as string) || 'Ошибка валидации.';
        }
        return axiosErr.response?.data?.message ?? 'Неизвестная ошибка';
    }
    if (err instanceof Error) {
        return err.message;
    }
    return 'Неизвестная ошибка';
};

export default api;
