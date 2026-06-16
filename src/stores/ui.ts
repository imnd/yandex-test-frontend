import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useOrganizationStore } from "@/stores/organization";
import { getAxiosErrorMessage } from "@/utils/api";

export const useUiStore = defineStore('ui', () => {
    const urlInput = ref<string>('');
    const isSaving = ref<boolean>(false);
    const isRefreshing = ref<boolean>(false);
    const errorAlert = ref<string>('');
    const successAlert = ref<string>('');

    const organizationStore = useOrganizationStore();
    const { saveSettings, refresh } = organizationStore;

    const clearAlerts = () => {
        errorAlert.value = ''
        successAlert.value = ''
    }

    const handleSaveSettings = async () => {
        if (!urlInput.value) {
            errorAlert.value = 'Пожалуйста, введите URL-ссылку.';
            return;
        }

        isSaving.value = true;
        errorAlert.value = '';
        successAlert.value = '';

        try {
            await saveSettings(urlInput.value)
            successAlert.value = 'Настройки сохранены. Запущен парсинг отзывов...';
        } catch (err: unknown) {
            console.error('Error saving settings:', err);
            errorAlert.value = getAxiosErrorMessage(err);
        } finally {
            isSaving.value = false;
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing.value) {
            return;
        }

        isRefreshing.value = true;
        errorAlert.value = '';
        successAlert.value = '';

        try {
            await refresh();
            successAlert.value = 'Запущено обновление отзывов...';
        } catch (err: unknown) {
            console.error('Error refreshing reviews:', err);
            errorAlert.value = getAxiosErrorMessage(err);
            isRefreshing.value = false;
        }
    };

    return {
        urlInput, isSaving, isRefreshing, errorAlert, successAlert,
        clearAlerts, handleSaveSettings, handleRefresh,
    }
})