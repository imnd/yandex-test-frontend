<script setup lang="ts">
defineProps<{ rating: number }>();
</script>

<template>
  <div class="star-rating">
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ 'star-filled': n <= Math.round(rating) }"
    >★</span>
  </div>
</template>

<style scoped lang="scss">
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  color: var(--border-color);
  font-size: 1rem;
}

.star-filled {
  color: #f59e0b;
}
</style>
