import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from "@/utils/api"

export interface Review {
    id: number;
    author_name: string;
    author_avatar?: string;
    rating: number;
    published_at_str: string;
    text?: string;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export const useReviewsStore = defineStore('reviews', () => {
    const reviews = ref<Review[]>([])
    const isReviewsLoading = ref<boolean>(false)
    const pagination = ref<Pagination>({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 50,
    })

    const fetchReviews = async (page: number = 1) => {
        isReviewsLoading.value = true
        try {
            const response = await api.get(`/organization/reviews?page=${page}`)
            reviews.value = response.data.data || []
            pagination.value = {
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                total: response.data.total || 0,
                per_page: response.data.per_page || 50,
            }
        } catch (err) {
            console.error('Error fetching reviews:', err)
        } finally {
            isReviewsLoading.value = false
        }
    }

    return { reviews, isReviewsLoading, pagination, fetchReviews }
})