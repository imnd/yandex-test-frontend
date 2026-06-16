<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../utils/api';

interface Organization {
  id?: number;
  name?: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rating?: number | string;
  rating_count?: number;
  review_count?: number;
  last_parsed_at?: string;
  error_message?: string;
}

interface Review {
  id: number;
  author_name: string;
  author_avatar?: string;
  rating: number;
  published_at_str: string;
  text?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// State
const organization = ref<Organization | null>(null);
const reviews = ref<Review[]>([]);
const pagination = ref<Pagination>({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 50,
});

const urlInput = ref<string>('');
const isSaving = ref<boolean>(false);
const isRefreshing = ref<boolean>(false);
const isReviewsLoading = ref<boolean>(false);
const errorAlert = ref<string>('');
const successAlert = ref<string>('');

const fetchOrganization = async () => {
  try {
    const response = await api.get('/organization');
    organization.value = response.data.organization;
    
    if (organization.value) {
      urlInput.value = organization.value.url;
      
      // If organization is currently parsing, start polling
      if (organization.value.status === 'pending' || organization.value.status === 'processing') {
        startPolling();
      } else if (organization.value.status === 'completed') {
        fetchReviews(pagination.value.current_page);
      }
    }
  } catch (err) {
    console.error('Error fetching organization:', err);
  }
};

const fetchReviews = async (page: number = 1) => {
  isReviewsLoading.value = true;
  try {
    const response = await api.get(`/organization/reviews?page=${page}`);
    reviews.value = response.data.data || [];
    pagination.value = {
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
      total: response.data.total || 0,
      per_page: response.data.per_page || 50,
    };
  } catch (err) {
    console.error('Error fetching reviews:', err);
  } finally {
    isReviewsLoading.value = false;
  }
};

const handleSaveSettings = async () => {
  if (!urlInput.value) {
    errorAlert.value = 'Пожалуйста, введите URL-ссылку.';
    return;
  }

  isSaving.value = true;
  errorAlert.value = '';
  successAlert.value = '';

  try {
    const response = await api.post('/organization/settings', {
      url: urlInput.value
    });
    organization.value = response.data.organization;
    successAlert.value = 'Настройки сохранены. Запущен парсинг отзывов...';

    reviews.value = [];
    startPolling();
  } catch (err: any) {
    console.error('Error saving settings:', err);
    if (err.response && err.response.data && err.response.data.errors) {
      errorAlert.value = Object.values(err.response.data.errors).flat()[0] as string || 'Ошибка валидации.';
    } else if (err.response && err.response.data && err.response.data.message) {
      errorAlert.value = err.response.data.message;
    } else {
      errorAlert.value = 'Не удалось сохранить настройки.';
    }
  } finally {
    isSaving.value = false;
  }
};

const handleRefresh = async () => {
  if (isRefreshing.value || !organization.value) return;

  isRefreshing.value = true;
  errorAlert.value = '';
  successAlert.value = '';

  try {
    const response = await api.post('/organization/refresh');
    organization.value = response.data.organization;
    successAlert.value = 'Запущено обновление отзывов...';
    startPolling();
  } catch (err: any) {
    console.error('Error refreshing reviews:', err);
    if (err.response && err.response.data && err.response.data.message) {
      errorAlert.value = err.response.data.message;
    } else {
      errorAlert.value = 'Не удалось запустить обновление.';
    }
    isRefreshing.value = false;
  }
};

// Polling for scraping status
let statusPollInterval: ReturnType<typeof setInterval> | null = null;

// Polling Helper Functions
const startPolling = () => {
  if (statusPollInterval) clearInterval(statusPollInterval);

  statusPollInterval = setInterval(async () => {
    try {
      const response = await api.get('/organization');
      const org = response.data.organization;
      organization.value = org;

      if (!org || org.status === 'completed' || org.status === 'failed') {
        stopPolling();
        isRefreshing.value = false;
        
        if (org && org.status === 'completed') {
          successAlert.value = 'Импорт отзывов успешно завершен!';
          fetchReviews(1);
        } else if (org && org.status === 'failed') {
          errorAlert.value = `Ошибка парсинга: ${org.error_message || 'Неизвестная ошибка'}`;
        }
      }
    } catch (err) {
      console.error('Error during polling status:', err);
      stopPolling();
      isRefreshing.value = false;
    }
  }, 3000); // Check every 3 seconds
};

const stopPolling = () => {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
};

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) {
    return;
  }
  fetchReviews(page);
};

// Lifecycle hooks
onMounted(() => {
  fetchOrganization();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div class="dashboard-layout">
    <Navbar />

    <!-- Main Content -->
    <main class="container main-content animate-fade">
      <!-- Alerts -->
      <div v-if="errorAlert" class="alert error-alert animate-fade">
        <span class="alert-icon">⚠️</span>
        <div class="alert-text">{{ errorAlert }}</div>
      </div>
      <div v-if="successAlert" class="alert success-alert animate-fade">
        <span class="alert-icon">✅</span>
        <div class="alert-text">{{ successAlert }}</div>
      </div>

      <!-- Settings Card -->
      <section class="card settings-card">
        <h3>Настройка ссылки организации</h3>
        <p class="card-desc">Введите полную или короткую ссылку на организацию с Яндекс.Карт, чтобы загрузить ее отзывы.</p>
        <form @submit.prevent="handleSaveSettings" class="settings-form">
          <input
              type="text"
              v-model="urlInput"
              placeholder="https://yandex.ru/maps/org/yandex/1124715036/"
              class="url-input"
              :disabled="isSaving || isRefreshing || organization?.status === 'pending' || organization?.status === 'processing'"
          />
          <button
              type="submit"
              class="save-btn"
              :disabled="isSaving || isRefreshing || organization?.status === 'pending' || organization?.status === 'processing'"
          >
            <span v-if="isSaving" class="spinner"></span>
            <span v-else>Сохранить и загрузить</span>
          </button>
        </form>
      </section>

      <!-- Scraping Active Status Loader -->
      <section
          v-if="organization && (organization.status === 'pending' || organization.status === 'processing')"
          class="card loading-card text-center"
      >
        <div class="loader-box">
          <div class="pulse-loader"></div>
          <h4>Загрузка данных организации</h4>
          <p>
            Парсер сейчас прокручивает страницу на Яндекс.Картах и собирает до ~600 последних отзывов.
            Это может занять от 30 секунд до 2 минут в зависимости от количества отзывов. Пожалуйста, подождите...
          </p>
          <div class="loading-stats animate-pulse" v-if="organization.status === 'processing'">
            Статус: <span>сбор отзывов в процессе...</span>
          </div>
        </div>
      </section>

      <!-- Organization Details Summary -->
      <section
          v-if="organization && organization.status === 'completed'"
          class="card org-summary-card"
      >
        <div class="org-summary-grid">
          <div class="org-main-details">
            <span class="org-badge">Организация загружена</span>
            <h2>{{ organization.name || 'Организация без названия' }}</h2>
            <a :href="organization.url" target="_blank" class="org-link">
              Открыть на Яндекс.Картах ↗
            </a>
            <div class="last-parsed">
              Последнее обновление: {{ organization.last_parsed_at ? new Date(organization.last_parsed_at).toLocaleString('ru-RU') : 'недавно' }}
            </div>
          </div>
          
          <div class="org-stats">
            <div class="rating-box">
              <div class="rating-value">{{ parseFloat(String(organization.rating || 0)).toFixed(1) }}</div>
              <div class="rating-stars-container">
                <div class="star-rating">
                  <span 
                    v-for="n in 5" 
                    :key="n" 
                    class="star"
                    :class="{ 'star-filled': n <= Math.round(Number(organization.rating || 0)) }"
                  >★</span>
                </div>
              </div>
            </div>
            
            <div class="counts-box">
              <div class="count-item">
                <div class="count-num">{{ organization.rating_count || 0 }}</div>
                <div class="count-label">оценок</div>
              </div>
              <div class="count-item">
                <div class="count-num">{{ organization.review_count || 0 }}</div>
                <div class="count-label">отзывов</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button 
            @click="handleRefresh" 
            class="refresh-btn" 
            :disabled="isRefreshing || isSaving"
          >
            <span v-if="isRefreshing" class="spinner button-spinner"></span>
            <span v-else>🔄 Обновить отзывы</span>
          </button>
        </div>
      </section>

      <!-- Reviews Section -->
      <section
          v-if="organization && organization.status === 'completed'"
          class="reviews-section"
      >
        <div class="reviews-header">
          <h3>Отзывы пользователей ({{ pagination.total }})</h3>
          <p>Показано 50 отзывов на страницу</p>
        </div>

        <!-- Skeletons Loader for Reviews -->
        <div v-if="isReviewsLoading" class="reviews-list">
          <div v-for="n in 3" :key="n" class="card review-card skeleton-card">
            <div class="skeleton-header">
              <div class="skeleton-avatar animate-pulse"></div>
              <div class="skeleton-meta">
                <div class="skeleton-line w-40 animate-pulse"></div>
                <div class="skeleton-line w-20 animate-pulse"></div>
              </div>
            </div>
            <div class="skeleton-line w-100 animate-pulse"></div>
            <div class="skeleton-line w-80 animate-pulse"></div>
          </div>
        </div>

        <!-- Reviews List -->
        <div v-else-if="reviews.length > 0" class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="card review-card">
            <div class="review-header">
              <div class="author-avatar-box">
                <img v-if="review.author_avatar" :src="review.author_avatar" :alt="review.author_name" class="author-avatar" />
                <div v-else class="author-avatar-placeholder">
                  {{ review.author_name.charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <div class="review-meta">
                <div class="author-name">{{ review.author_name }}</div>
                <div class="review-meta-row">
                  <div class="star-rating">
                    <span 
                      v-for="n in 5" 
                      :key="n" 
                      class="star"
                      :class="{ 'star-filled': n <= review.rating }"
                    >★</span>
                  </div>
                  <span class="review-date">{{ review.published_at_str }}</span>
                </div>
              </div>
            </div>
            
            <div class="review-text">
              {{ review.text || 'Без текста (пользователь оставил только оценку).' }}
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="pagination-container">
            <button 
              @click="changePage(pagination.current_page - 1)" 
              class="page-nav-btn"
              :disabled="pagination.current_page === 1"
            >
              ◀ Назад
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in pagination.last_page" 
                :key="page"
                @click="changePage(page)"
                class="page-num-btn"
                :class="{ 'active': page === pagination.current_page }"
              >
                {{ page }}
              </button>
            </div>

            <button 
              @click="changePage(pagination.current_page + 1)" 
              class="page-nav-btn"
              :disabled="pagination.current_page === pagination.last_page"
            >
              Вперед ▶
            </button>
          </div>
        </div>

        <div v-else class="card empty-card text-center">
          <span class="empty-icon">📭</span>
          <h4>Отзывы отсутствуют</h4>
          <p>В базе данных пока нет отзывов по этой организации.</p>
        </div>
      </section>

      <!-- Empty Configured State -->
      <section v-else-if="!organization" class="card empty-card text-center">
        <span class="empty-icon">📍</span>
        <h4>Организация еще не настроена</h4>
        <p>Пожалуйста, введите URL-адрес вашей организации на Яндекс.Картах в поле ввода выше, чтобы начать импорт отзывов.</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Content spacing */
.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card basic styling */
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);

  &-desc {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }

  &-footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-start;
  }
}

/* Settings Form */
.settings-form {
  display: flex;
  gap: 1rem;
}

.url-input {
  flex-grow: 1;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  background-color: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  outline: none;
  transition: var(--transition);

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Alerts */
.alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 500;
}

.alert-icon {
  font-size: 1.2rem;
}

.error-alert {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.success-alert {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--success);
}

/* Loading Card */
.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  gap: 1rem;
}

.pulse-loader {
  width: 50px;
  height: 50px;
  background-color: var(--primary);
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-stats {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  background-color: var(--primary-light);
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

/* Org Summary Card */
.org-summary-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .org-summary-grid {
    grid-template-columns: 1fr;
  }
}

.org-main-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.org-badge {
  background-color: var(--primary-light);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: uppercase;
}

.org-main-details h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.5px;
}

.org-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

.org-link:hover {
  text-decoration: underline;
}

.org-stats {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  justify-content: center;
}

.last-parsed {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-heading);
  line-height: 1;
}

.rating-stars-container {
  display: flex;
  flex-direction: column;
}

.counts-box {
  display: flex;
  gap: 1.5rem;
}

.count-item {
  display: flex;
  flex-direction: column;
}

.count-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-heading);
  line-height: 1.2;
}

.count-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.refresh-btn {
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

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Reviews List */
.reviews-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.reviews-header {
  margin-top: 1rem;
}

.reviews-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-heading);
}

.reviews-header p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.author-avatar-box {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.author-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid var(--border-color);
}

.author-avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.author-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
}

.review-meta {
  display: flex;
  flex-direction: column;

  &-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
}

.review-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.review-text {
  font-size: 0.95rem;
  color: var(--text-main);
  white-space: pre-line;
}

/* Empty Card */
.empty-card {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-heading);
  }

  p {
    color: var(--text-muted);
    font-size: 0.95rem;
    max-width: 400px;
  }
}

.empty-icon {
  font-size: 3rem;
}

/* Skeletons */
.skeleton {
  &-card {
    border-color: var(--border-color);
  }

  &-header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  &-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--border-color);
  }

  &-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &-line {
    height: 12px;
    background-color: var(--border-color);
    border-radius: 4px;
  }
}

.w-40 { width: 140px; }
.w-20 { width: 70px; }
.w-100 { width: 100%; height: 14px; margin-top: 0.5rem; }
.w-80 { width: 80%; height: 14px; }

/* Pagination Styling */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem 0;
}

.page {
  &-nav-btn {
    padding: 0.6rem 1.2rem;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);

    &:hover:not(:disabled) {
      background-color: var(--border-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &-numbers {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  &-num-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
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

    &.active {
      background-color: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }
  }
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

.button-spinner {
  border-top-color: var(--text-main);
}
</style>
