import apiClient from './api'

class DatabaseService {
  /**
   * Создать базы данных PostgreSQL для всех участников модуля
   */
  async createDatabasesForModule(moduleId) {
    try {
      console.log('🔄 DatabaseService: создаем БД для модуля', moduleId)
      
      // Добавим логирование перед запросом
      console.log('📤 Отправляем POST запрос...')
      
      const response = await apiClient.post(
      `/modules/${moduleId}/databases/create-for-participants`,
      {},
      {
        timeout: 30000
      }
    )
      
      console.log('✅ DatabaseService: успешный ответ', response)
      console.log('📦 Данные ответа:', response.data)
      
      return response.data
      
    } catch (error) {
      console.error('❌ DatabaseService: ошибка создания БД')
      console.error('📛 Код ошибки:', error.code)
      console.error('📛 Сообщение:', error.message)
      console.error('📛 Ответ сервера:', error.response)
      console.error('📛 Данные ошибки:', error.response?.data)
      
      // Детализированная обработка ошибок
      if (error.code === 'ECONNABORTED') {
        throw new Error('Таймаут запроса. Операция заняла слишком много времени.')
      }
      
      if (error.response) {
        // Сервер ответил с ошибкой
        const status = error.response.status
        const message = error.response.data?.message || error.response.statusText
        
        switch (status) {
          case 400:
            throw new Error(`Некорректный запрос: ${message}`)
          case 401:
            throw new Error('Требуется авторизация')
          case 403:
            throw new Error('Доступ запрещен')
          case 404:
            throw new Error('Модуль не найден')
          case 422:
            throw new Error(`Ошибка валидации: ${message}`)
          case 500:
            throw new Error(`Ошибка сервера: ${message}`)
          default:
            throw new Error(`Ошибка ${status}: ${message}`)
        }
      } else if (error.request) {
        // Запрос был сделан, но ответа нет
        throw new Error('Нет ответа от сервера. Проверьте подключение к сети и убедитесь, что сервер запущен.')
      } else {
        // Ошибка в настройке запроса
        throw new Error(`Ошибка при отправке запроса: ${error.message}`)
      }
    }
  }


  /**
   * Получить все базы данных модуля
   */
  async getModuleDatabases(moduleId) {
    try {
      console.log('🔄 DatabaseService: получаем БД модуля', moduleId)
      
      const response = await apiClient.get(`/modules/${moduleId}/databases`)
      
      console.log('✅ DatabaseService: загружены БД', response.data)
      
      return response.data
      
    } catch (error) {
      console.error('❌ DatabaseService: ошибка загрузки БД:', error)
      
      if (error.response?.status === 404) {
        // Возвращаем пустой массив, если модуль не имеет БД
        return []
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка загрузки баз данных')
    }
  }

  /**
   * Получить конкретную базу данных по ID
   */
  async getDatabase(databaseId) {
    try {
      const response = await apiClient.get(`/databases/${databaseId}`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка загрузки базы данных:', error)
      throw error
    }
  }

  /**
   * Проверить подключение к PostgreSQL серверу
   */
  async testPostgresConnection() {
    try {
      const response = await apiClient.get('/databases/test-connection')
      return response.data
    } catch (error) {
      console.error('❌ Ошибка проверки подключения:', error)
      throw error
    }
  }

  /**
   * Удалить базу данных
   */
  async deleteDatabase(databaseId) {
    try {
      const response = await apiClient.delete(`/databases/${databaseId}`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка удаления базы данных:', error)
      throw error
    }
  }

  /**
   * Проверить статус конкретной базы данных
   */
  async checkDatabaseStatus(databaseId) {
    try {
      const response = await apiClient.get(`/databases/${databaseId}/status`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка проверки статуса:', error)
      throw error
    }
  }
}

export default new DatabaseService()