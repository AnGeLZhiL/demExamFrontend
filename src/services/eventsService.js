// Сервис для работы с мероприятиями
import apiClient from './api'

export const EventsService = {
  // Тестовый метод
  test() {
    console.log('✅ EventsService подключен!')
    return 'Сервис работает'
  },

  async getStatuses() {
    console.log('🏷️ Запрашиваем статусы...')
    
    try {
      const response = await apiClient.get('/statuses')
      console.log('✅ Статусы получены:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Ошибка получения статусов:', error)
      throw error
    }
  },
  
  // Получить мероприятия с возможностью фильтрации
  async getEvents(filters = {}) {
    console.log('='.repeat(40))
    console.log('🔄 [1] Начинаем получение мероприятий с фильтрами')
    
    // Проверяем токен
    const token = localStorage.getItem('auth_token')
    console.log('🔑 [2] Токен из localStorage:', token ? token.substring(0, 20) + '...' : 'НЕТ')
    
    // Собираем параметры запроса
    const params = {}
    
    if (filters.search) {
      params.search = filters.search
      console.log('🔍 [2.1] Параметр поиска:', filters.search)
    }
    
    if (filters.statusId) {
      params.status_id = filters.statusId
      console.log('🏷️ [2.2] Параметр статуса:', filters.statusId)
    }
    
    if (filters.dateFrom) {
      params.date_from = filters.dateFrom
      console.log('📅 [2.3] Дата от:', filters.dateFrom)
    }
    
    if (filters.dateTo) {
      params.date_to = filters.dateTo
      console.log('📅 [2.4] Дата до:', filters.dateTo)
    }
    
    console.log('📋 [2.5] Все параметры запроса:', params)
    
    try {
      console.log('📡 [3] Отправляем GET запрос на /events с параметрами')
      console.log('   URL:', '/events')
      console.log('   Параметры:', params)
      
      const response = await apiClient.get('/events', { params })
      
      console.log('✅ [4] УСПЕХ! Статус:', response.status)
      console.log('📊 [5] Получено мероприятий:', response.data?.length || 0)
      console.log('📋 [6] Данные:', response.data)
      
      return response.data
      
    } catch (error) {
      console.error('❌ [7] ОШИБКА получения мероприятий:')
      
      if (error.response) {
        console.error('   📡 Сервер ответил:')
        console.error('   Статус:', error.response.status)
        console.error('   URL запроса:', error.config?.url)
        console.error('   Параметры запроса:', error.config?.params)
        console.error('   Данные ошибки:', error.response.data)
        
        if (error.response.status === 401) {
          console.error('   ⚠️  ОШИБКА 401: Неавторизован!')
        }
      } else if (error.request) {
        console.error('   🌐 Нет ответа от сервера')
        console.error('   Проверьте:')
        console.error('   1. Запущен ли Laravel сервер?')
        console.error('   2. Правильный ли URL?')
      } else {
        console.error('   ⚙️ Ошибка настройки:', error.message)
      }
      
      throw error
    }
  },

  async getModuleTypes() {
    console.log('='.repeat(40))
    console.log('🔄 Запрашиваем типы модулей...')
    
    try {
        // Проверяем, есть ли endpoint для типов модулей
        const response = await apiClient.get('/module-types')
        console.log('✅ Типы модулей получены:', response.data)
        return response.data
        
    } catch (error) {
        console.warn('⚠️ Не удалось получить типы модулей, используем локальные:', error)
        
        // Локальная мапа типов модулей (можно настроить под вашу систему)
        const localTypes = [
        { id: 1, name: 'Тестовый' },
        { id: 2, name: 'Рабочий' },
        { id: 3, name: 'Резервный' },
        { id: 4, name: 'PostgreSQL' },
        { id: 5, name: 'MySQL' },
        { id: 6, name: 'GitLab' },
        // Добавьте другие типы по необходимости
        ]
        
        return localTypes
        }
    },

  // Получить одно мероприятие по ID
  async getEventById(id) {
    console.log('='.repeat(40))
    console.log(`🔄 Загружаем мероприятие ID: ${id}`)
    
    try {
      const response = await apiClient.get(`/events/${id}`)
      console.log(`✅ Мероприятие ${id} получено:`, response.data)
      return response.data
      
    } catch (error) {
      console.error(`❌ Ошибка получения мероприятия ${id}:`, error)
      
      if (error.response) {
        console.error('Статус:', error.response.status)
        console.error('Данные:', error.response.data)
      }
      
      throw error
    }
  },

  // Получить модули мероприятия
  async getEventModules(eventId) {
    console.log('='.repeat(40))
    console.log(`🔄 Загружаем модули мероприятия ID: ${eventId}`)
    
    try {
      const response = await apiClient.get(`/events/${eventId}/modules`)
      console.log(`✅ Модули мероприятия ${eventId} получены:`, response.data)
      return response.data
      
    } catch (error) {
      console.error(`❌ Ошибка получения модулей мероприятия ${eventId}:`, error)
      
      if (error.response) {
        console.error('Статус:', error.response.status)
        console.error('Данные:', error.response.data)
      }
      
      throw error
    }
  },

  // Получить пользователей мероприятия с фильтрацией
async getEventUsers(eventId, filters = {}) {
  console.log('='.repeat(40))
  console.log(`🔄 Загружаем пользователей мероприятия ID: ${eventId} с фильтрами`, filters)
  
  const params = {}
  
  if (filters.roles) {
    params.roles = Array.isArray(filters.roles) ? filters.roles.join(',') : filters.roles
  }
  
  if (filters.exclude_roles) {
    params.exclude_roles = Array.isArray(filters.exclude_roles) 
      ? filters.exclude_roles.join(',') 
      : filters.exclude_roles
  }
  
  try {
    const response = await apiClient.get(`/events/${eventId}/users`, { params })
    console.log(`✅ Пользователи мероприятия ${eventId} получены:`, response.data)
    return response.data
    
  } catch (error) {
    console.error(`❌ Ошибка получения пользователей мероприятия ${eventId}:`, error)
    
    if (error.response) {
      console.error('Статус:', error.response.status)
      console.error('Данные:', error.response.data)
    }
    
    throw error
  }
},

// Получить учетные записи мероприятия с фильтрацией
async getEventAccounts(eventId, filters = {}) {
  console.log('='.repeat(40))
  console.log(`🔄 Загружаем учетные записи мероприятия ID: ${eventId} с фильтрами`, filters)
  
  const params = {}
  
  if (filters.roles) {
    params.roles = Array.isArray(filters.roles) ? filters.roles.join(',') : filters.roles
  }
  
  if (filters.exclude_roles) {
    params.exclude_roles = Array.isArray(filters.exclude_roles) 
      ? filters.exclude_roles.join(',') 
      : filters.exclude_roles
  }
  
  try {
    const response = await apiClient.get(`/events/${eventId}/event-accounts`, { params })
    console.log(`✅ Учетные записи мероприятия ${eventId} получены:`, response.data)
    return response.data
    
  } catch (error) {
    console.error(`❌ Ошибка получения учетных записей мероприятия ${eventId}:`, error)
    
    if (error.response) {
      console.error('Статус:', error.response.status)
      console.error('Данные:', error.response.data)
    }
    
    throw error
  }
}
}