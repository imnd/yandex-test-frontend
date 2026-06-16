<script setup lang="ts">
import AlertsBlock from '@/components/AlertsBlock.vue';
import ActiveStatusLoader from '@/components/ActiveStatusLoader.vue';
import EmptyCard from '@/components/EmptyCard.vue';
import NavbarBlock from '@/components/NavbarBlock.vue';
import OrganizationBlock from '@/components/OrganizationBlock.vue';
import ReviewsSection from '@/components/ReviewsSection.vue';
import SettingsCard from '@/components/SettingsCard.vue';
</script>

<template>
  <div class="dashboard-layout">
    <NavbarBlock />

    <main class="container main-content animate-fade">
      <AlertsBlock />

      <SettingsCard />

      <ActiveStatusLoader />

      <OrganizationBlock />

      <ReviewsSection />

      <EmptyCard />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
