import apiClient from './api'

export const EventAccountsService = {
  /**
   * Создание обычной учётной записи (с event_id)
   */
  async create(data) {
    const response = await apiClient.post('/event-accounts', data)
    return response.data
  },

  /**
   * Создание системной учётной записи (без event_id)
   */
  async createSystemAccount(data) {
    const response = await apiClient.post('/system-accounts', data)
    return response.data
  }
}
