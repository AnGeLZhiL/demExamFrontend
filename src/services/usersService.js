import apiClient from './api'

export const UsersService = {
  // Получить всех пользователей
  async getAllUsers(search = '') {
    try {
      const params = {}
      if (search) {
        params.search = search
      }
      
      const response = await apiClient.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
      throw error
    }
  }
}