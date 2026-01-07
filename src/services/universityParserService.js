import apiClient from './api'

export const UniversityParserService = {
  /**
   * Поиск групп на портале НОВГУ через бэкенд
   * @param {string} searchTerm - Номер или часть номера группы
   * @returns {Promise<Array>} - Массив найденных групп
   */
  async searchGroups(searchTerm = '') {
    console.log('🔍 Поиск групп через бэкенд:', searchTerm)
    
    try {
      if (!searchTerm.trim()) {
        return []
      }
      
      const response = await apiClient.get('/university/groups/search', {
        params: { search: searchTerm }
      })
      
      if (response.data.success) {
        console.log(`✅ Найдено ${response.data.groups.length} групп`)
        return response.data.groups
      } else {
        console.error('❌ Ошибка от сервера:', response.data.message)
        throw new Error(response.data.message)
      }
      
    } catch (error) {
      console.error('❌ Ошибка поиска групп:', error.message)
      
      // Показываем более понятное сообщение об ошибке
      let userMessage = 'Не удалось найти группы'
      
      if (error.response?.status === 401) {
        userMessage = 'Требуется авторизация'
      } else if (error.response?.status === 500) {
        userMessage = 'Ошибка сервера при поиске групп'
      } else if (error.code === 'ECONNABORTED') {
        userMessage = 'Таймаут запроса. Попробуйте позже'
      } else if (error.message.includes('Network Error')) {
        userMessage = 'Проблемы с подключением к серверу'
      }
      
      throw new Error(userMessage)
    }
  }
}