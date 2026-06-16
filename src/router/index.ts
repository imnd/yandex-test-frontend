import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';

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
