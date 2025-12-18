import apiClient from './api'

export const AuditService = {
  // Получить все данные для журнала
  async getAllAuditData() {
    try {
      // Загружаем все данные параллельно
      const [users, events, modules, eventAccounts] = await Promise.all([
        this.getUsers(),
        this.getEvents(),
        this.getModules(),
        this.getEventAccounts()
      ])
      
      // Объединяем все в один журнал
      return this.createAuditLog(users, events, modules, eventAccounts)
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      return []
    }
  },

  // Получить пользователей
  async getUsers() {
    try {
      const response = await apiClient.get('/users')
      console.log('👤 Пользователи загружены:', response.data.length)
      return response.data
    } catch (error) {
      console.warn('Не удалось загрузить пользователей:', error)
      return []
    }
  },

  // Получить мероприятия
  async getEvents() {
    try {
      const response = await apiClient.get('/events')
      console.log('📅 Мероприятия загружены:', response.data.length)
      return response.data
    } catch (error) {
      console.warn('Не удалось загрузить мероприятия:', error)
      return []
    }
  },

  // Получить модули
  async getModules() {
    try {
      // Пробуем разные возможные пути API
      const endpoints = ['/modules', '/exam-modules', '/module/list', '/exam/modules']
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint)
          console.log(`📚 Модули загружены из ${endpoint}:`, response.data.length || response.data.data?.length || 0)
          
          // Обрабатываем разные форматы ответа
          let modules = []
          if (Array.isArray(response.data)) {
            modules = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            modules = response.data.data
          } else if (response.data.modules && Array.isArray(response.data.modules)) {
            modules = response.data.modules
          }
          
          return modules.filter(m => m.id || m.module_id).map(module => ({
            id: module.id || module.module_id,
            name: module.name || module.title || 'Без названия',
            created_at: module.created_at,
            updated_at: module.updated_at
          }))
        } catch (e) {
          // Пробуем следующий endpoint
          continue
        }
      }
      
      console.log('ℹ️ API модулей не найдено')
      return []
    } catch (error) {
      console.warn('Не удалось загрузить модули:', error)
      return []
    }
  },

  // Получить учетные записи мероприятий
  async getEventAccounts() {
    try {
      const response = await apiClient.get('/event-accounts')
      console.log('🎫 Учетные записи загружены:', response.data.length)
      return response.data
    } catch (error) {
      // Если нет /event-accounts, пробуем другие варианты
      try {
        const response = await apiClient.get('/event_accounts')
        console.log('🎫 Учетные записи загружены из /event_accounts:', response.data.length)
        return response.data
      } catch (e) {
        console.warn('Не удалось загрузить учетные записи:', error)
        return []
      }
    }
  },

  // Создать журнал из данных
  createAuditLog(users, events, modules, eventAccounts) {
    const logs = []
    const now = new Date()
    
    console.log('🔄 Создание журнала из:', {
      users: users.length,
      events: events.length,
      modules: modules.length,
      eventAccounts: eventAccounts.length
    })
    
    // Обрабатываем пользователей
    users.forEach(user => {
      const createdAt = user.created_at || now.toISOString()
      const updatedAt = user.updated_at || createdAt
      
      logs.push({
        id: `user-${user.id}-created`,
        table_name: 'users',
        action: 'created',
        description: `Создан пользователь: ${user.last_name} ${user.first_name}`,
        record_id: user.id,
        created_at: createdAt,
        timestamp: new Date(createdAt).getTime()
      })
      
      if (updatedAt !== createdAt) {
        logs.push({
          id: `user-${user.id}-updated`,
          table_name: 'users',
          action: 'updated',
          description: `Обновлен пользователь: ${user.last_name} ${user.first_name}`,
          record_id: user.id,
          created_at: updatedAt,
          timestamp: new Date(updatedAt).getTime()
        })
      }
    })
    
    // Обрабатываем мероприятия
    events.forEach(event => {
      const eventTime = event.created_at || now.toISOString()
      const eventName = this.getEventTitle(event)
      
      logs.push({
        id: `event-${event.id}-created`,
        table_name: 'events',
        action: 'created',
        description: `Создано мероприятие: ${eventName}`,
        record_id: event.id,
        created_at: eventTime,
        timestamp: new Date(eventTime).getTime()
      })
      
      if (event.updated_at && event.updated_at !== eventTime) {
        logs.push({
          id: `event-${event.id}-updated`,
          table_name: 'events',
          action: 'updated',
          description: `Обновлено мероприятие: ${eventName}`,
          record_id: event.id,
          created_at: event.updated_at,
          timestamp: new Date(event.updated_at).getTime()
        })
      }
    })
    
    // Обрабатываем модули
    modules.forEach(module => {
      const moduleTime = module.created_at || now.toISOString()
      
      logs.push({
        id: `module-${module.id}-created`,
        table_name: 'modules',
        action: 'created',
        description: `Создан модуль: ${module.name}`,
        record_id: module.id,
        created_at: moduleTime,
        timestamp: new Date(moduleTime).getTime()
      })
      
      if (module.updated_at && module.updated_at !== moduleTime) {
        logs.push({
          id: `module-${module.id}-updated`,
          table_name: 'modules',
          action: 'updated',
          description: `Обновлен модуль: ${module.name}`,
          record_id: module.id,
          created_at: module.updated_at,
          timestamp: new Date(module.updated_at).getTime()
        })
      }
    })
    
    // Обрабатываем учетные записи
    eventAccounts.forEach(account => {
      const accountTime = account.created_at || now.toISOString()
      
      logs.push({
        id: `event-account-${account.id}-created`,
        table_name: 'event_accounts',
        action: 'created',
        description: `Создана учетная запись мероприятия`,
        record_id: account.id,
        created_at: accountTime,
        timestamp: new Date(accountTime).getTime()
      })
      
      if (account.updated_at && account.updated_at !== accountTime) {
        logs.push({
          id: `event-account-${account.id}-updated`,
          table_name: 'event_accounts',
          action: 'updated',
          description: `Обновлена учетная запись мероприятия`,
          record_id: account.id,
          created_at: account.updated_at,
          timestamp: new Date(account.updated_at).getTime()
        })
      }
    })
    
    // Сортируем по дате (сначала новые)
    return logs.sort((a, b) => b.timestamp - a.timestamp)
  },

  // Метод для получения названия мероприятия
  getEventTitle(event) {
    if (event.title && event.title.trim()) {
      return event.title.trim()
    }
    
    if (event.name && event.name.trim()) {
      return event.name.trim()
    }
    
    for (const [key, value] of Object.entries(event)) {
      if (typeof value === 'string' && value.trim() && 
          !key.includes('id') && !key.includes('date') && 
          !key.includes('created') && !key.includes('updated')) {
        const trimmed = value.trim()
        if (trimmed.length > 2 && trimmed.length < 100) {
          return trimmed
        }
      }
    }
    
    return `Мероприятие #${event.id}`
  }
}