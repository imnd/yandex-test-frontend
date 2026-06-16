<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useOrganizationStore } from "@/stores/organization";
import { useUiStore } from "@/stores/ui";

const organizationStore = useOrganizationStore();
const uiStore = useUiStore();

const { urlInput, isSaving, isRefreshing } = storeToRefs(uiStore);
const { handleSaveSettings } = uiStore;
const { organization } = storeToRefs(organizationStore);
</script>

<template>
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
</template>

<style scoped lang="scss">
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
</style>
