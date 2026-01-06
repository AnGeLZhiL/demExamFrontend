// systemAccountService.js
import apiClient from './api'

export const SystemAccountService = {
  async createSystemAccount(data) {
    const response = await apiClient.post('system-accounts', data)
    return response.data
  },

  async deleteSystemAccounts(userId) {
    await apiClient.delete(`users/${userId}/system-accounts`)
  },

  async generatePassword(userId) {
    const response = await apiClient.post(`system-accounts/${userId}/generate-password`)
    return response.data
  },
  
  async updateSystemAccount(userId, data) {
    const response = await apiClient.put(`users/${userId}/system-accounts`, data)
    return response.data
  },
  
  async checkSystemAccount(userId) {
    try {
      const response = await apiClient.get(`users/${userId}/event-accounts`)
      const accounts = response.data || []
      
      // Ищем системный аккаунт (event_id = null)
      const systemAccount = accounts.find(account => account.event_id === null)
      return systemAccount || null
    } catch (error) {
      console.error('Error checking system account:', error)
      return null
    }
  }
}