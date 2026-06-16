<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organization";
import { useReviewsStore } from "@/stores/reviews";
import StarRating from "@/components/StarRating.vue";

const organizationStore = useOrganizationStore();
const reviewsStore = useReviewsStore();

import { storeToRefs } from "pinia";
const { organization } = storeToRefs(organizationStore);
const { reviews, pagination, isReviewsLoading } = storeToRefs(reviewsStore);
const { fetchReviews } = reviewsStore;

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) {
    return;
  }
  fetchReviews(page);
};

</script>

<template>
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
              {{ review.author_name?.charAt(0)?.toUpperCase() }}
            </div>
          </div>

          <div class="review-meta">
            <div class="author-name">{{ review.author_name }}</div>
            <div class="review-meta-row">
              <StarRating :rating="review.rating" />
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
</template>

<style scoped lang="scss">
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
</style>
