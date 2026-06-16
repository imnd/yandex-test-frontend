import { RouteRecordRaw } from 'vue-router';
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

export default routes;
