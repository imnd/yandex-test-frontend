<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api, { getCsrfToken } from '../utils/api';

const router = useRouter();
const email = ref<string>('admin@example.com');
const password = ref<string>('password');
const isLoading = ref<boolean>(false);
const error = ref<string>('');

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Пожалуйста, заполните все поля.';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // 1. Sanctum CSRF Handshake
    await getCsrfToken();

    // 2. Perform Login Request
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    });

    // 3. Cache user in local storage to preserve state
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));

    // 4. Redirect to dashboard
    router.push('/');
  } catch (err: any) {
    console.error('Login error:', err);
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else if (err.response && err.response.data && err.response.data.errors) {
      // Validation errors
      const validationErrors = Object.values(err.response.data.errors).flat();
      error.value = (validationErrors[0] as string) || 'Ошибка валидации.';
    } else {
      error.value = 'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card glass animate-fade">
      <div class="login-header">
        <h2>Вход в панель</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-alert">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Электронная почта</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="admin@example.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Войти</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1.5rem;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%),
              radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.1), transparent 40%);
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.login-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-heading);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.login-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-heading);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  outline: none;
  transition: var(--transition);
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-alert {
  padding: 0.75rem 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 0.875rem;
  font-weight: 500;
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  outline: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}
</style>
