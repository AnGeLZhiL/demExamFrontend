import apiClient from './api'

class DatabaseService {

  /**
   * Универсальный метод: создает/обновляет БД для всех участников
   */
  async syncDatabasesForModule(moduleId) {
    try {
    console.log('🔄 DatabaseService: Синхронизация БД для модуля', moduleId)
    
    // Используем существующий endpoint /create-for-participants
    // или новый /sync, если вы его настроили
    const response = await apiClient.post(
      `/modules/${moduleId}/databases/create-for-participants`, // или /sync
      {},
      { timeout: 60000 }
    )
    
    console.log('✅ DatabaseService: Результат синхронизации', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ DatabaseService: Ошибка синхронизации', error)
    throw new Error(error.response?.data?.message || 'Ошибка синхронизации БД')
  }
  }


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

  async createDatabaseForParticipant(moduleId, eventAccountId) {
  try {
    console.log('🔄 Создаем БД для участника:', { moduleId, eventAccountId })
    
    // Используем существующий маршрут recreate-for-participant
    const response = await apiClient.post(
      `/modules/${moduleId}/databases/recreate-for-participant`,
      { event_account_id: eventAccountId },
      { timeout: 30000 }
    )
    
    console.log('✅ БД создана:', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ Ошибка создания БД для участника:', error)
    
    // Улучшенная диагностика
    if (error.response?.status === 404) {
      console.error('❌ Маршрут не найден. Проверьте routes/api.php')
      throw new Error('Маршрут не найден. Проверьте backend маршруты.')
    }
    
    throw new Error(error.response?.data?.message || 'Ошибка создания БД')
  }
}

/**
 * Альтернативный метод: синхронизация БД для одного участника
 */
async syncSingleDatabase(moduleId, eventAccountId) {
  try {
    console.log('🔄 Синхронизация БД для одного участника:', { moduleId, eventAccountId })
    
    const response = await apiClient.post(
      `/modules/${moduleId}/databases/sync`,
      { 
        participant_ids: [eventAccountId],
        single_participant: true
      },
      { timeout: 30000 }
    )
    
    console.log('✅ БД синхронизирована:', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации БД:', error)
    throw new Error(error.response?.data?.message || 'Ошибка синхронизации БД')
  }
}

/**
 * Блокировка/разблокировка БД (только чтение)
 */
async toggleDatabaseLock(databaseId, action, reason = '') {
  try {
    console.log(`🔄 DatabaseService: ${action === 'lock' ? 'Блокировка' : 'Разблокировка'} БД`, {
      databaseId,
      action,
      reason
    })
    
    const response = await apiClient.post(
      `/databases/${databaseId}/toggle-lock`,
      {
        action: action, // 'lock' или 'unlock'
        reason: reason
      },
      { 
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    )
    
    console.log(`✅ DatabaseService: БД ${action === 'lock' ? 'заблокирована' : 'разблокирована'}`, response.data)
    return response.data
    
  } catch (error) {
    console.error(`❌ DatabaseService: Ошибка ${action === 'lock' ? 'блокировки' : 'разблокировки'} БД:`, error)
    throw new Error(error.response?.data?.message || `Ошибка ${action === 'lock' ? 'блокировки' : 'разблокировки'} БД`)
  }
}

/**
 * Удалить ВСЕ базы данных модуля
 */
async dropAllDatabases(moduleId) {
  try {
    console.log('🗑️ DatabaseService: Удаление ВСЕХ БД модуля', moduleId)
    
    const response = await apiClient.delete(
      `/modules/${moduleId}/databases/drop-all`,
      { 
        timeout: 60000, // Больше времени для массового удаления
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    )
    
    console.log('✅ Все БД удалены:', response.data)
    return response.data
    
  } catch (error) {
    console.error('❌ Ошибка массового удаления БД:', error)
    throw new Error(error.response?.data?.message || 'Ошибка удаления всех БД')
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

  /**
   * Пересоздать БД для участника (удалить старую и создать новую)
   */
  async recreateDatabaseForParticipant(moduleId, eventAccountId) {
    try {
      console.log('🔄 Пересоздаем БД для участника:', { moduleId, eventAccountId })
      
      const response = await apiClient.post(
        `/modules/${moduleId}/databases/recreate-for-participant`,
        { event_account_id: eventAccountId },
        { timeout: 30000 }
      )
      
      console.log('✅ БД пересоздана:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Ошибка пересоздания БД для участника:', error)
      throw new Error(error.response?.data?.message || 'Ошибка пересоздания БД')
    }
  }

  /**
   * Пересоздать БД для всех участников модуля
   */
  async recreateAllDatabases(moduleId) {
    try {
      console.log('🔄 Пересоздаем все БД для модуля:', moduleId)
      
      const response = await apiClient.post(
        `/modules/${moduleId}/databases/recreate-for-all`,
        {},
        { timeout: 60000 }// Больше таймаут для массовой операции
      )
      
      console.log('✅ Все БД пересозданы:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Ошибка массового пересоздания БД:', error)
      throw new Error(error.response?.data?.message || 'Ошибка пересоздания всех БД')
    }
  }

  /**
   * Удалить реальную БД (только удаление)
   */
  async dropDatabase(databaseId) {
    try {
      console.log('🗑️ Удаляем БД:', databaseId)
      
      const response = await apiClient.delete(
        `/databases/${databaseId}/drop`,
        { timeout: 15000 }
      )
      
      console.log('✅ БД удалена:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Ошибка удаления БД:', error)
      throw new Error(error.response?.data?.message || 'Ошибка удаления БД')
    }
  }

/**
 * Управление всем модулем (статус модуля + все ресурсы)
 */
async toggleAllModuleResources(moduleId, shouldBeActive) {
  try {
    console.log(`🔄 Управление всем модулем ${moduleId}:`, 
                shouldBeActive ? 'активация' : 'отключение');
    
    // Получаем БД модуля
    console.log('📋 Получаем список БД модуля...');
    const dbsResponse = await this.getModuleDatabases(moduleId);
    
    // Проверяем формат ответа
    let databases = [];
    if (Array.isArray(dbsResponse)) {
      databases = dbsResponse;
    } else if (dbsResponse && Array.isArray(dbsResponse.data)) {
      databases = dbsResponse.data;
    } else if (dbsResponse && dbsResponse.data) {
      databases = [dbsResponse.data];
    } else {
      databases = [];
    }
    
    console.log(`📊 Найдено БД: ${databases.length}`);
    
    // Если нужно заблокировать (отключить модуль)
    if (!shouldBeActive) {
      console.log('🔒 Начинаем блокировку модуля...');
      
      // 1. Блокируем все БД
      const lockPromises = [];
      let activeDbs = 0;
      
      databases.forEach(db => {
        // Проверяем, активна ли БД
        const isDbActive = db.is_active === true || db.is_active === 1 || db.is_active === '1';
        if (isDbActive) {
          activeDbs++;
          lockPromises.push(
            this.toggleDatabaseLock(db.id, 'lock', 'Отключение модуля')
          );
        }
      });
      
      console.log(`🔒 Будет заблокировано БД: ${activeDbs}`);
      
      // 2. Блокируем все репозитории
      console.log('🔒 Блокируем все репозитории...');
      const { RepositoryService } = await import('@/services/gogsService');
      let repoResult = { data: { updated: 0, failed: 0, total: 0 } };
      
      try {
        repoResult = await RepositoryService.bulkToggleRepositories(moduleId, false);
        console.log('✅ Репозитории заблокированы:', repoResult);
      } catch (repoError) {
        console.error('❌ Ошибка блокировки репозиториев:', repoError);
      }
      
      // 3. Блокируем БД (если есть активные)
      let dbResults = [];
      if (lockPromises.length > 0) {
        try {
          dbResults = await Promise.allSettled(lockPromises);
          console.log('✅ БД заблокированы:', dbResults);
        } catch (dbError) {
          console.error('❌ Ошибка блокировки БД:', dbError);
        }
      }
      
      // 4. Обновляем статус модуля
      console.log('📝 Обновляем статус модуля...');
      const { EventsService } = await import('@/services/eventsService');
      try {
        await EventsService.updateModule(moduleId, {
          status_id: 6 // ID статуса "Отключен" - замените на ваш
        });
        console.log('✅ Статус модуля обновлен');
      } catch (statusError) {
        console.error('❌ Ошибка обновления статуса модуля:', statusError);
      }
      
      return {
        success: true,
        message: 'Модуль отключен. Все ресурсы заблокированы.',
        data: {
          databases: {
            total: databases.length,
            active: activeDbs,
            locked: dbResults.filter(r => r.status === 'fulfilled' && r.value?.success).length,
            errors: dbResults.filter(r => r.status === 'rejected').length
          },
          repositories: repoResult.data || repoResult
        }
      };
    }
    // Если нужно разблокировать (активировать модуль)
    else {
      console.log('🔓 Начинаем активацию модуля...');
      
      // 1. Разблокируем все БД
      const unlockPromises = [];
      let inactiveDbs = 0;
      
      databases.forEach(db => {
        // Проверяем, неактивна ли БД
        const isDbInactive = db.is_active === false || db.is_active === 0 || db.is_active === '0';
        if (isDbInactive) {
          inactiveDbs++;
          unlockPromises.push(
            this.toggleDatabaseLock(db.id, 'unlock', 'Активация модуля')
          );
        }
      });
      
      console.log(`🔓 Будет разблокировано БД: ${inactiveDbs}`);
      
      // 2. Разблокируем все репозитории
      console.log('🔓 Разблокируем все репозитории...');
      const { RepositoryService } = await import('@/services/gogsService');
      let repoResult = { data: { updated: 0, failed: 0, total: 0 } };
      
      try {
        repoResult = await RepositoryService.bulkToggleRepositories(moduleId, true);
        console.log('✅ Репозитории разблокированы:', repoResult);
      } catch (repoError) {
        console.error('❌ Ошибка разблокировки репозиториев:', repoError);
      }
      
      // 3. Разблокируем БД (если есть неактивные)
      let dbResults = [];
      if (unlockPromises.length > 0) {
        try {
          dbResults = await Promise.allSettled(unlockPromises);
          console.log('✅ БД разблокированы:', dbResults);
        } catch (dbError) {
          console.error('❌ Ошибка разблокировки БД:', dbError);
        }
      }
      
      // 4. Обновляем статус модуля
      console.log('📝 Обновляем статус модуля...');
      const { EventsService } = await import('@/services/eventsService');
      try {
        await EventsService.updateModule(moduleId, {
          status_id: 2 // ID статуса "Активен" - замените на ваш
        });
        console.log('✅ Статус модуля обновлен');
      } catch (statusError) {
        console.error('❌ Ошибка обновления статуса модуля:', statusError);
      }
      
      return {
        success: true,
        message: 'Модуль активирован. Все ресурсы разблокированы.',
        data: {
          databases: {
            total: databases.length,
            inactive: inactiveDbs,
            unlocked: dbResults.filter(r => r.status === 'fulfilled' && r.value?.success).length,
            errors: dbResults.filter(r => r.status === 'rejected').length
          },
          repositories: repoResult.data || repoResult
        }
      };
    }
    
  } catch (error) {
    console.error('❌ Ошибка управления модулем:', error);
    throw new Error(error.response?.data?.message || 'Ошибка управления модулем');
  }
}
}

export default new DatabaseService()