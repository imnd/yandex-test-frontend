<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";
import { useUiStore } from "@/stores/ui";
import { onMounted } from "vue";

const organizationStore = useOrganizationStore();
const uiStore = useUiStore();

const { isSaving, isRefreshing } = storeToRefs(uiStore);
const { handleRefresh } = uiStore;
const { organization } = storeToRefs(organizationStore);

const { fetchOrganization } = organizationStore;
onMounted(fetchOrganization);
</script>

<template>
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
</template>

<style scoped lang="scss">
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

.button-spinner {
  border-top-color: var(--text-main);
}
</style>
