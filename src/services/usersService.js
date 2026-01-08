import apiClient from './api'

export const UsersService = {
  async getAllUsers(searchQuery = '') {
    const response = await apiClient.get('/users', {
      params: { search: searchQuery }
    })
    return response.data
  },

  async createUser(userData) {
    const response = await apiClient.post('/users', userData)
    return response.data
  },

    async updateUser(id, data) {
    console.log('UsersService.updateUser called:', { id, data })
    const response = await apiClient.put(`/users/${id}`, data)
    console.log('UsersService.updateUser response:', response.data)
    return response.data
  },

  async getUserById(userId) {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  async deleteUser(userId) {
    console.log('UsersService.deleteUser called:', { userId })
    const response = await apiClient.delete(`/users/${userId}`)
    console.log('UsersService.deleteUser response:', response.data)
    return response.data
  },

  async getGroups() {
    console.log('='.repeat(40))
    console.log('🔄 Запрашиваем группы...')
    
    try {
      const response = await apiClient.get('/groups')
      console.log('✅ Группы получены:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка получения групп:', error)
      throw error
    }
  },

  // Получить пользователей по группе
  async getUsersByGroup(groupId) {
    console.log('='.repeat(40))
    console.log(`🔄 Запрашиваем пользователей группы ${groupId}...`)
    
    try {
      // Используем новый эндпоинт
      const response = await apiClient.get(`/users/by-group/${groupId}`)
      console.log(`✅ Пользователи группы ${groupId} получены:`, response.data.length)
      return response.data
      
    } catch (error) {
      console.error(`❌ Ошибка получения пользователей группы ${groupId}:`, error)
      
      // Fallback: пытаемся через параметр
      try {
        const response = await apiClient.get('/users/by-group', {
          params: { group_id: groupId }
        })
        return response.data
      } catch (secondError) {
        console.error('❌ Вторая попытка тоже не удалась:', secondError)
        return []
      }
    }
  },

  async getGroupsWithUsers() {
    console.log('='.repeat(40))
    console.log('🔄 Запрашиваем группы с пользователями...')
    
    try {
      const response = await apiClient.get('/groups-with-users')
      console.log('✅ Группы с пользователями получены:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Ошибка получения групп с пользователями:', error)
      
      // Fallback: получаем группы и пользователей отдельно
      try {
        const groups = await this.getGroups()
        const groupsWithUsers = []
        
        for (const group of groups) {
          const users = await this.getUsersByGroup(group.id)
          groupsWithUsers.push({
            ...group,
            users: users,
            users_count: users.length
          })
        }
        
        return groupsWithUsers
        
      } catch (fallbackError) {
        console.error('❌ Fallback тоже не сработал:', fallbackError)
        return []
      }
    }
  },

  // Альтернативный метод поиска пользователей с фильтром по группе
  async searchUsersWithGroup(groupId, searchQuery = '') {
    console.log('='.repeat(40))
    console.log(`🔄 Ищем пользователей группы ${groupId}...`)
    
    try {
      const params = {}
      
      if (groupId) {
        params.group_id = groupId
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      const response = await apiClient.get('/users', { params })
      console.log(`✅ Найдено пользователей:`, response.data.length)
      return response.data
      
    } catch (error) {
      console.error(`❌ Ошибка поиска пользователей группы ${groupId}:`, error)
      return []
    }
  }
}
