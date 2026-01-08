// src/services/expertService.js
import apiClient from './api'

export const ExpertService  = {
  // 1. Получить экспертов модуля
  async getModuleExperts(moduleId) {
    console.log(`👨‍🏫 Получаем экспертов модуля ${moduleId}`)
    try {
      const response = await apiClient.get(`/modules/${moduleId}/experts`)
      console.log('✅ Получено экспертов:', response.data.data?.length || 0)
      return response.data.data || []
    } catch (error) {
      console.error(`❌ Ошибка получения экспертов модуля ${moduleId}:`, error)
      return []
    }
  },

  // 2. Создать учетные записи экспертов
  async createExpertAccounts(moduleId) {
    console.log(`👨‍🏫 Создаем учетные записи экспертов для модуля ${moduleId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/experts/create-accounts`)
      console.log('✅ Результат создания учетных записей:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка создания учетных записей экспертов:', error)
      throw error
    }
  },

  // 3. Создать публичный репозиторий
  async createPublicRepository(moduleId) {
      console.log(`🌐 Создаем публичный репозиторий для модуля ${moduleId}`)
      try {
        const response = await apiClient.post(`/modules/${moduleId}/public-repository`)
        console.log('✅ Результат создания публичного репозитория:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Ошибка создания публичного репозитория:', error)
        throw error
      }
  },

  // 4. Получить публичный репозиторий
  // expertService.js - обновленный метод с детальной отладкой
async getPublicRepository(moduleId) {
  console.log(`🌐 Получаем публичный репозиторий модуля ${moduleId}`)
  try {
    const response = await apiClient.get(`/modules/${moduleId}/public-repository`)
    console.log('✅ Полный ответ от сервера:', response)
    console.log('📊 Статус:', response.status)
    console.log('📊 Данные:', response.data)
    console.log('📊 Тип данных:', typeof response.data)
    console.log('📊 Ключи объекта:', Object.keys(response.data))
    
    // Если ответ - объект, выведем его структуру
    if (response.data && typeof response.data === 'object') {
      console.log('📋 Структура response.data:', JSON.stringify(response.data, null, 2))
    }
    
    // Проверяем различные форматы ответа
    if (response.data) {
      // Формат 1: { data: {...}, success: true }
      if (response.data.data && response.data.success === true) {
        console.log('✅ Найден формат с data внутри')
        return response.data.data
      }
      
      // Формат 2: { success: true, ...data }
      if (response.data.success === true) {
        console.log('✅ Найден формат success:true')
        // Если есть отдельное поле data
        if (response.data.data) {
          return response.data.data
        }
        // Удаляем success из объекта и возвращаем остальное
        const { success, message, ...repoData } = response.data
        return repoData
      }
      
      // Формат 3: { success: false, message: '...' }
      if (response.data.success === false) {
        console.log('❌ Сервер вернул success:false')
        throw new Error(response.data.message || 'Репозиторий не найден')
      }
      
      // Формат 4: Прямые данные репозитория
      if (response.data.name || response.data.url || response.data.id) {
        console.log('✅ Прямые данные репозитория')
        return response.data
      }
      
      // Формат 5: Пустой объект или массив
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log('ℹ️ Пустой массив')
        return null
      }
    }
    
    console.warn('⚠️ Неизвестный формат данных:', response.data)
    return null
    
  } catch (error) {
    console.error('❌ Ошибка получения публичного репозитория:', error)
    
    // Если репозиторий не найден (404)
    if (error.response?.status === 404) {
      console.log('ℹ️ Публичный репозиторий еще не создан (404)')
      return null
    }
    
    // Если ошибка 500
    if (error.response?.status === 500) {
      console.log('⚠️ Ошибка сервера 500')
      return null
    }
    
    throw error
  }
},

  // 5. Сгенерировать новый пароль для эксперта
  async regenerateExpertPassword(moduleId, expertId) {
    console.log(`🔑 Генерируем новый пароль для эксперта ${expertId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/experts/${expertId}/regenerate-password`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка генерации пароля:', error)
      throw error
    }
  },

  // 7. Пересоздать учетную запись эксперта
  async recreateExpertAccount(moduleId, expertId) {
    console.log(`🔄 Пересоздаем учетную запись эксперта ${expertId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/experts/${expertId}/recreate-account`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка пересоздания учетной записи:', error)
      throw error
    }
  },

  /**
   * Настроить доступ к публичному репозиторию
   */
  async setupPublicRepositoryAccess(moduleId) {
    console.log(`⚙️ Настраиваем доступ к публичному репозиторию модуля ${moduleId}`)
    try {
      const response = await apiClient.post(`/modules/${moduleId}/public-repository/setup-access`)
      console.log('✅ Результат настройки доступа:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка настройки доступа:', error)
      throw error
    }
  }
}