import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const urlInput = ref<string>('')
    const isSaving = ref<boolean>(false)
    const isRefreshing = ref<boolean>(false)
    const errorAlert = ref<string>('')
    const successAlert = ref<string>('')

    const clearAlerts = () => {
        errorAlert.value = ''
        successAlert.value = ''
    }

    return { urlInput, isSaving, isRefreshing, errorAlert, successAlert, clearAlerts }
})