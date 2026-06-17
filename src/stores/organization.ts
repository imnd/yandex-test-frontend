import {defineStore, storeToRefs} from 'pinia'
import { ref } from 'vue'
import api from "@/utils/api"
import { useReviewsStore } from './reviews'
import { useUiStore } from './ui'

export interface Organization {
    id?: number;
    name?: string;
    url: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    rating?: number;
    rating_count?: number;
    review_count?: number;
    last_parsed_at?: string;
    error_message?: string;
}

export const useOrganizationStore = defineStore('organization', () => {
    const reviewsStore = useReviewsStore()
    const uiStore = useUiStore()

    const organization = ref<Organization | null>(null)
    let statusPollInterval: ReturnType<typeof setInterval> | null = null

    const fetchOrganization = async () => {
        try {
            const response = await api.get('/organization')
            organization.value = response.data.organization

            if (organization.value) {
                uiStore.urlInput = organization.value.url

                if (organization.value.status === 'pending' || organization.value.status === 'processing') {
                    startPolling()
                } else if (organization.value.status === 'completed') {
                    reviewsStore.fetchReviews(reviewsStore.pagination.current_page)
                }
            }
        } catch (err) {
            console.error('Error fetching organization:', err)
        }
    }

    const startPolling = () => {
        if (statusPollInterval) clearInterval(statusPollInterval)

        statusPollInterval = setInterval(async () => {
            try {
                const response = await api.get('/organization')
                const org = response.data.organization as Organization
                organization.value = org

                if (!org || org.status === 'completed' || org.status === 'failed') {
                    stopPolling()
                    uiStore.isRefreshing = false

                    if (org && org.status === 'completed') {
                        uiStore.successAlert = 'Импорт отзывов успешно завершен!'
                        reviewsStore.fetchReviews(1)
                    } else if (org && org.status === 'failed') {
                        uiStore.errorAlert = `Ошибка парсинга: ${org.error_message || 'Неизвестная ошибка'}`
                    }
                }
            } catch (err) {
                console.error('Error during polling status:', err)
                stopPolling()
                uiStore.isRefreshing = false
            }
        }, 3000)
    }

    const stopPolling = () => {
        if (statusPollInterval) {
            clearInterval(statusPollInterval)
            statusPollInterval = null
        }
    }

    const { reviews } = storeToRefs(reviewsStore);

    const saveSettings = async (url: string) => {
        const response = await api.post('/organization/settings', { url });
        organization.value = response.data.organization;
        reviews.value = [];

        startPolling();
    };

    const refresh = async () => {
        const response = await api.post('/organization/refresh');
        organization.value = response.data.organization;
        startPolling();
    };


    return { organization, fetchOrganization, startPolling, stopPolling, saveSettings, refresh }
})