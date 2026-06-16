import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useOrganizationStore } from "@/stores/organization";

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
        } catch (err: any) {
            console.error('Error saving settings:', err);
            if (err.response && err.response.data && err.response.data.errors) {
                errorAlert.value = Object.values(err.response.data.errors).flat()[0] as string || 'Ошибка валидации.';
            } else if (err.response && err.response.data && err.response.data.message) {
                errorAlert.value = err.response.data.message;
            } else {
                errorAlert.value = 'Не удалось сохранить настройки.';
            }
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
        } catch (err: any) {
            console.error('Error refreshing reviews:', err);
            if (err.response && err.response.data && err.response.data.message) {
                errorAlert.value = err.response.data.message;
            } else {
                errorAlert.value = 'Не удалось запустить обновление.';
            }
            isRefreshing.value = false;
        }
    };

    return {
        urlInput, isSaving, isRefreshing, errorAlert, successAlert,
        clearAlerts, handleSaveSettings, handleRefresh,
    }
})