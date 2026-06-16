<script setup lang="ts">
import { useUiStore } from "@/stores/ui";
import { storeToRefs } from "pinia";

const uiStore = useUiStore();
const { errorAlert, successAlert } = storeToRefs(uiStore);
</script>

<template>
  <div v-if="errorAlert" class="alert error-alert animate-fade">
    <span class="alert-icon">⚠️</span>
    <div class="alert-text">{{ errorAlert }}</div>
  </div>
  <div v-if="successAlert" class="alert success-alert animate-fade">
    <span class="alert-icon">✅</span>
    <div class="alert-text">{{ successAlert }}</div>
  </div>
</template>

<style scoped lang="scss">
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
</style>
