import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { guestOnly: true }
    },
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    // Fallback redirect
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth_user') !== null;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } else if (to.meta.guestOnly && isAuthenticated) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;
