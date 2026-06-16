<script setup lang="ts">
import {storeToRefs} from "pinia";
import { useOrganizationStore } from "@/stores/organization";

const organizationStore = useOrganizationStore();
const { organization } = storeToRefs(organizationStore);
</script>
<template>
  <section v-if="!organization" class="card empty-card text-center">
    <span class="empty-icon">📍</span>
    <h4>Организация еще не настроена</h4>
    <p>Пожалуйста, введите URL-адрес вашей организации на Яндекс.Картах в поле ввода выше, чтобы начать импорт отзывов.</p>
  </section>
</template>

<style scoped lang="scss">
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
</style>
