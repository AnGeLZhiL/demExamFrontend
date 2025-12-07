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

  // Создать новое мероприятие
  async createEvent(eventData) {
    console.log('='.repeat(40))
    console.log('🔄 Создаем новое мероприятие...')
    console.log('📋 Данные для создания:', eventData)
    
    // Проверяем токен
    const token = localStorage.getItem('auth_token')
    console.log('🔑 Токен из localStorage:', token ? token.substring(0, 20) + '...' : 'НЕТ')
    
    try {
      console.log('📡 Отправляем POST запрос на /events')
      console.log('   URL:', '/events')
      console.log('   Данные:', eventData)
      
      const response = await apiClient.post('/events', eventData)
      
      console.log('✅ УСПЕХ! Статус:', response.status)
      console.log('📋 Созданное мероприятие:', response.data)
      
      return response.data
      
    } catch (error) {
      console.error('❌ ОШИБКА создания мероприятия:')
      
      if (error.response) {
        console.error('   📡 Сервер ответил:')
        console.error('   Статус:', error.response.status)
        console.error('   URL запроса:', error.config?.url)
        console.error('   Данные ошибки:', error.response.data)
        
        if (error.response.status === 401) {
          console.error('   ⚠️  ОШИБКА 401: Неавторизован!')
          console.error('   Проверьте:')
          console.error('   1. Войдите в систему')
          console.error('   2. Токен может быть просрочен')
        } else if (error.response.status === 422) {
          console.error('   ⚠️  ОШИБКА 422: Валидация не пройдена!')
          console.error('   Ошибки валидации:', error.response.data.errors)
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

  // Обновить мероприятие
    async updateEvent(id, eventData) {
        console.log('='.repeat(40))
        console.log(`🔄 Обновляем мероприятие ID: ${id}`)
        console.log('📋 Данные для обновления:', eventData)
        
        try {
            const response = await apiClient.put(`/events/${id}`, eventData)
            console.log(`✅ Мероприятие ${id} обновлено:`, response.data)
            return response.data
            
        } catch (error) {
            console.error(`❌ Ошибка обновления мероприятия ${id}:`, error)
            
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
},

// удалить мероприятие
  deleteEvent: async (id) => {
    try {
      console.log(`🗑️ Отправляем запрос на удаление мероприятия ${id}...`)
      const response = await apiClient.delete(`/events/${id}`)
      console.log('✅ Мероприятие удалено:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Ошибка удаления мероприятия ${id}:`, error)
      
      // Более информативная ошибка
      if (error.response?.status === 404) {
        throw new Error('Мероприятие не найдено')
      } else if (error.response?.status === 403) {
        throw new Error('Нет прав на удаление мероприятия')
      } else if (error.response?.status === 409) {
        throw new Error('Нельзя удалить мероприятие с активными модулями или пользователями')
      } else {
        throw error
      }
    }
  },

  // 1. Получить все роли (для выпадающего списка)
  getAllRoles: async () => {
    console.log('='.repeat(40))
    console.log('🔄 Запрашиваем роли с сервера...')
    
    try {
        const response = await apiClient.get('/roles')
        console.log('✅ Роли получены:', response.data)
        return response.data
        
    } catch (error) {
        console.error('❌ Ошибка загрузки ролей:', error)
        
        if (error.response) {
        console.error('Статус:', error.response.status)
        console.error('Данные:', error.response.data)
        }
        
        // Fallback
        return [
        { id: 1, name: 'Администратор' },
        { id: 2, name: 'Эксперт' },
        { id: 3, name: 'Участник' },
        { id: 4, name: 'Главный эксперт' },
        { id: 5, name: 'Технический эксперт' },
        { id: 6, name: 'Наблюдатель' }
        ]
    }
  },
  
  // 2. Поиск пользователей (для добавления в мероприятие)
  searchAvailableUsers: async (eventId, searchQuery = '') => {
    try {
      const params = {
        not_in_event: eventId
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      const response = await apiClient.get('/users', { params })
      return response.data
    } catch (error) {
      console.error('❌ Ошибка поиска пользователей:', error)
      return []
    }
  },
  // 3. Добавить пользователя в мероприятие (уже есть, но проверьте)
  addUserToEvent: async (eventId, userId, seatNumber = null, roleId = 1) => {
    try {
      const response = await apiClient.post('/event-accounts', {
        user_id: userId,
        event_id: eventId,
        role_id: roleId
      })
      return response.data
    } catch (error) {
      console.error('❌ Ошибка добавления пользователя:', error)
      throw error
    }
  },
  
  // 4. Обновить роль/место пользователя в мероприятии
  updateEventAccount: async (accountId, data) => {
    try {
      const response = await apiClient.put(`/event-accounts/${accountId}`, data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка обновления учетной записи:', error)
      throw error
    }
  },
  
  // 5. Удалить пользователя из мероприятия (уже есть, но проверьте)
  removeUserFromEvent: async (accountId) => {
    try {
      const response = await apiClient.delete(`/event-accounts/${accountId}`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка удаления учетной записи:', error)
      throw error
    }
  },

    // Получить ID учетной записи по ID пользователя и мероприятия
    async getAccountId(userId, eventId) {
        console.log('='.repeat(40))
        console.log(`🔍 Ищем accountId для user ${userId}, event ${eventId}`)
        
        try {
            const accounts = await this.getEventAccounts(eventId)
            const account = accounts.find(acc => 
            acc.user_id === parseInt(userId) || 
            (acc.user && acc.user.id === parseInt(userId))
            )
            
            if (!account) {
            throw new Error(`Учетная запись не найдена для user ${userId}`)
            }
            
            console.log(`✅ Найден accountId: ${account.id}`)
            return account.id
            
        } catch (error) {
            console.error(`❌ Ошибка поиска accountId:`, error)
            throw error
        }
    },
    // Обновление места участников (упрощенная версия)
    async updateUserSeat(eventId, userId, seatNumber) {
        console.log('='.repeat(40))
        console.log(`🎲 Обновляем место пользователя:`, { eventId, userId, seatNumber })
        
        try {
            // Получаем accountId
            const accountId = await this.getAccountId(userId, eventId)
            
            // Используем основной метод обновления
            return await this.updateEventAccount(accountId, {
            seat_number: seatNumber
            })
            
        } catch (error) {
            console.error(`❌ Ошибка обновления места:`, error)
            throw error
        }
    },

    // Сгенерировать новый пароль для пользователя
    async generateNewPassword(accountId) {
        console.log('='.repeat(40))
        console.log(`🔑 Генерируем новый пароль для account ${accountId}`)
        
        // Генерация случайного пароля
        const generatePassword = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
            let password = ''
            
            password += Math.floor(Math.random() * 10) // цифра
            password += String.fromCharCode(65 + Math.floor(Math.random() * 26)) // заглавная
            password += String.fromCharCode(97 + Math.floor(Math.random() * 26)) // строчная
            
            for (let i = 0; i < 8; i++) {
            password += chars[Math.floor(Math.random() * chars.length)]
            }
            
            return password.split('').sort(() => Math.random() - 0.5).join('')
        }
        
        const newPassword = generatePassword()
        
        try {
            const response = await this.updateEventAccount(accountId, {
            password_plain: newPassword
            // password (хэш) будет обновлен автоматически в контроллере
            })
            
            console.log(`✅ Новый пароль сгенерирован для account ${accountId}`)
            
            return {
            ...response,
            new_password: newPassword // возвращаем и сырой пароль для отображения
            }
            
        } catch (error) {
            console.error(`❌ Ошибка генерации пароля:`, error)
            throw error
        }
    },
    // Получить полную информацию об учетной записи
        async getEventAccountDetails(accountId) {
        console.log('='.repeat(40))
        console.log(`📋 Запрашиваем детали учетной записи ${accountId}`)
        
        try {
            const response = await apiClient.get(`/event-accounts/${accountId}`)
            console.log(`✅ Детали учетной записи получены:`, response.data)
            return response.data
            
        } catch (error) {
            console.error(`❌ Ошибка получения деталей учетной записи:`, error)
            throw error
        }
    },
}