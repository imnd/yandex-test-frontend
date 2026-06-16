<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { storeToRefs } from "pinia";

const organizationStore = useOrganizationStore();
const { organization } = storeToRefs(organizationStore);
</script>

<template>
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
</template>

<style scoped lang="scss">
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
</style>
