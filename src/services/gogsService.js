import apiClient from './api'

export const RepositoryService = {
  // 1. Тест подключения к Gogs (обновленный URL)
  async testGogsConnection() {
    console.log('🔗 Тестируем подключение к Gogs...')
    try {
      const response = await apiClient.get('/gogs/test-connection') // Изменили на GET
      console.log('✅ Gogs статус:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка подключения к Gogs:', error)
      throw error
    }
  },

  // 2. Получить репозитории модуля
  async getModuleRepositories(moduleId) {
    console.log(`📋 Получаем репозитории модуля ${moduleId}`)
    try {
      const response = await apiClient.get(`/modules/${moduleId}/repositories`)
      console.log(`✅ Получено репозиториев:`, response.data.data?.length || 0)
      return response.data.data || []
    } catch (error) {
      console.error(`❌ Ошибка получения репозиториев модуля ${moduleId}:`, error)
      return []
    }
  },

  // 3. Создать репозитории для всех участников
  async createRepositoriesForModule(moduleId) {
    console.log(`🚀 Создаем репозитории для модуля ${moduleId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/repositories/create-all`)
      console.log('✅ Результат создания репозиториев:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка создания репозиториев:', error)
      throw error
    }
  },

  // 4. Обновить статус репозитория
  async updateRepositoryStatus(repositoryId, isActive) {
    console.log(`🔧 Обновляем статус репозитория ${repositoryId}: ${isActive ? 'активен' : 'неактивен'}`)
    try {
      const response = await apiClient.put(`/repositories/${repositoryId}`, {
        is_active: isActive,
        status: isActive ? 'active' : 'disabled'
      })
      return response.data
    } catch (error) {
      console.error(`❌ Ошибка обновления статуса репозитория ${repositoryId}:`, error)
      throw error
    }
  },

  // 5. Удалить репозиторий
  async deleteRepository(repositoryId) {
    console.log(`🗑️ Удаляем репозиторий ${repositoryId}`)
    try {
      const response = await apiClient.delete(`/repositories/${repositoryId}`)
      return response.data
    } catch (error) {
      console.error(`❌ Ошибка удаления репозитория ${repositoryId}:`, error)
      throw error
    }
  },

  // 6. Создать один репозиторий
  async createRepository(data) {
    console.log(`➕ Создаем репозиторий:`, data)
    try {
      const response = await apiClient.post('/repositories', data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка создания репозитория:', error)
      throw error
    }
  }
}