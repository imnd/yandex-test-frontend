<script setup lang="ts">
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();

const handleLogout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('auth_user');
    router.push('/login');
  }
};
</script>

<template>
    <header class="navbar glass">
      <div class="container navbar-content">
        <div class="logo">
          <span class="logo-icon">📍</span>
          <h1>Яндекс.Карты отзывы</h1>
        </div>
        <button @click="handleLogout" class="logout-btn">
          Выйти 
          <span class="logout-icon">🚪</span>
        </button>
      </div>
    </header>
</template>

<style scoped lang="scss">
.navbar {
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;

  &-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-heading);
    letter-spacing: -0.5px;
  }

  &-icon {
    font-size: 1.5rem;
  }

  &-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);


    &:hover {
      background-color: var(--border-color);
    }
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.logout-btn:hover {
  background-color: var(--border-color);
}
</style>
