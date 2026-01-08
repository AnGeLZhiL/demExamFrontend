import apiClient from './api'

export const RepositoryService = {
  // 1. Тест подключения к Gogs (обновленный URL)
  async testGogsConnection() {
    console.log('🔗 Тестируем подключение к Gogs...')
    try {
      // Теперь этот маршрут будет работать!
      const response = await apiClient.get('/modules/gogs/test-connection')
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
  },

  // 7. УМНОЕ создание/пересоздание репозиториев
  async smartRepositoriesAction(moduleId, recreate = false) {
    console.log(`🎯 Умное действие для модуля ${moduleId}:`, recreate ? 'пересоздать' : 'создать')
    try {
      const response = await apiClient.post(`/modules/${moduleId}/repositories/smart-action`, {
        recreate: recreate
      })
      console.log('✅ Результат:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка умного действия:', error)
      throw error
    }
  },

  // 9. Создать/пересоздать один репозиторий для участника
  async createOrRecreateSingleRepository(moduleId, eventAccountId, recreate = false) {
    console.log(`🎯 Создание/пересоздание репозитория для участника ${eventAccountId}:`, recreate ? 'пересоздать' : 'создать')
    try {
      const response = await apiClient.post(`/modules/${moduleId}/repositories/single`, {
        event_account_id: eventAccountId,
        recreate: recreate
      })
      console.log('✅ Результат:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка:', error)
      throw error
    }
  },

  // 10. Удалить ВСЕ репозитории модуля
  async deleteAllRepositories(moduleId) {
    console.log(`🗑️ Удаляем ВСЕ репозитории модуля ${moduleId}`)
    try {
      const response = await apiClient.delete(`/modules/${moduleId}/repositories/delete-all`)
      console.log('✅ Результат удаления:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка удаления:', error)
      throw error
    }
  },

  // 11. Удалить один репозиторий
  async deleteSingleRepository(moduleId, repositoryId, eventAccountId) {
    console.log(`🗑️ Удаляем репозиторий ${repositoryId} для участника ${eventAccountId}`)
    try {
      const response = await apiClient.delete(`/modules/${moduleId}/repositories/${repositoryId}/delete`, {
        data: { event_account_id: eventAccountId }
      })
      console.log('✅ Результат удаления:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка удаления:', error)
      throw error
    }
  },

  async createPublicRepository(moduleId) {
      console.log(`🌐 Создаем публичный репозиторий для модуля ${moduleId}`)
      try {
          const response = await apiClient.post(`/modules/${moduleId}/public-repository`)
          console.log('✅ Результат создания публичного репозитория:', response.data)
          
          // Показать информацию о настройке доступа
          if (response.data.data?.access_configured) {
              const accessInfo = response.data.data.access_results
              console.log(`👥 Доступ настроен для ${accessInfo.total_users} пользователей`)
              
              // Показать распределение по ролям
              if (accessInfo.by_role) {
                  Object.entries(accessInfo.by_role).forEach(([roleId, roleData]) => {
                      console.log(`   • ${roleData.role_name}: ${roleData.successful}/${roleData.total}`)
                  })
              }
          }
          
          return response.data
      } catch (error) {
          console.error('❌ Ошибка создания публичного репозитория:', error)
          throw error
      }
  },

  /**
   * Настроить гранулярный доступ к публичному репозиторию
   */
  async setupGranularAccess(moduleId) {
    console.log(`⚙️ Настраиваем гранулярный доступ для модуля ${moduleId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/public-repository/setup-granular-access`)
      console.log('✅ Результат настройки доступа:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка настройки доступа:', error)
      throw error
    }
  },
  
  /**
   * Проверить текущие права доступа
   */
  async checkAccess(moduleId) {
    console.log(`👁️ Проверяем права доступа для модуля ${moduleId}`)
    try {
      const response = await apiClient.get(`/modules/${moduleId}/public-repository/check-access`)
      console.log('✅ Результат проверки доступа:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка проверки доступа:', error)
      throw error
    }
  },

  /**
   * Блокировать/разблокировать все репозитории модуля
   */
  async bulkToggleRepositories(moduleId, isActive) {
    console.log(`${isActive ? '🔓' : '🔒'} ${isActive ? 'Разблокировать' : 'Заблокировать'} ВСЕ репозитории модуля ${moduleId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/repositories/bulk-toggle`, {
        is_active: isActive
      })
      console.log('✅ Результат массовой операции:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка массовой операции:', error)
      throw error
    }
  },
  
  /**
   * Переключить активность одного репозитория
   */
  async toggleRepository(repositoryId, isActive) {
    console.log(`${isActive ? '🔓' : '🔒'} ${isActive ? 'Разблокировать' : 'Заблокировать'} репозиторий ${repositoryId}`)
    try {
      const response = await apiClient.post(`/repositories/${repositoryId}/toggle`, {
        is_active: isActive
      })
      console.log('✅ Результат переключения:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка переключения:', error)
      throw error
    }
  }
}