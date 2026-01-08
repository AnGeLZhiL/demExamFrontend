// src/services/ModuleBulkService.js
import DatabaseService from './databaseService'
import { RepositoryService } from './gogsService'
import { EventsService } from './eventsService'
import apiClient from './api'

class ModuleBulkService {
  /**
   * Заблокировать все ресурсы всех модулей мероприятия
   */
  async blockAllEventModules(eventId) {
    try {
      console.log(`🔒 Начинаем блокировку всех модулей мероприятия ${eventId}`)
      
      // 1. Получаем все модули мероприятия
      const modules = await EventsService.getEventModules(eventId)
      console.log(`📋 Найдено модулей: ${modules.length}`)
      
      const results = {
        event_id: eventId,
        total_modules: modules.length,
        successful_modules: 0,
        failed_modules: 0,
        modules_details: []
      }
      
      // 2. Для каждого модуля блокируем все ресурсы
      for (const module of modules) {
        try {
          console.log(`🔄 Блокируем модуль ${module.id} (${module.name})`)
          
          const moduleResult = await this.blockSingleModule(module.id)
          
          results.successful_modules++
          results.modules_details.push({
            module_id: module.id,
            module_name: module.name,
            success: true,
            databases: moduleResult.databases,
            repositories: moduleResult.repositories,
            module_status_updated: true
          })
          
        } catch (moduleError) {
          results.failed_modules++
          results.modules_details.push({
            module_id: module.id,
            module_name: module.name,
            success: false,
            error: moduleError.message
          })
          
          console.error(`❌ Ошибка блокировки модуля ${module.id}:`, moduleError)
        }
      }
      
      console.log('✅ Блокировка всех модулей завершена:', results)
      return results
      
    } catch (error) {
      console.error('❌ Ошибка блокировки всех модулей мероприятия:', error)
      throw error
    }
  }
  
  /**
   * Разблокировать все ресурсы всех модулей мероприятия
   */
  async unblockAllEventModules(eventId) {
    try {
      console.log(`🔓 Начинаем разблокировку всех модулей мероприятия ${eventId}`)
      
      // 1. Получаем все модули мероприятия
      const modules = await EventsService.getEventModules(eventId)
      console.log(`📋 Найдено модулей: ${modules.length}`)
      
      const results = {
        event_id: eventId,
        total_modules: modules.length,
        successful_modules: 0,
        failed_modules: 0,
        modules_details: []
      }
      
      // 2. Для каждого модуля разблокируем все ресурсы
      for (const module of modules) {
        try {
          console.log(`🔄 Разблокируем модуль ${module.id} (${module.name})`)
          
          const moduleResult = await this.unblockSingleModule(module.id)
          
          results.successful_modules++
          results.modules_details.push({
            module_id: module.id,
            module_name: module.name,
            success: true,
            databases: moduleResult.databases,
            repositories: moduleResult.repositories,
            module_status_updated: true
          })
          
        } catch (moduleError) {
          results.failed_modules++
          results.modules_details.push({
            module_id: module.id,
            module_name: module.name,
            success: false,
            error: moduleError.message
          })
          
          console.error(`❌ Ошибка разблокировки модуля ${module.id}:`, moduleError)
        }
      }
      
      console.log('✅ Разблокировка всех модулей завершена:', results)
      return results
      
    } catch (error) {
      console.error('❌ Ошибка разблокировки всех модулей мероприятия:', error)
      throw error
    }
  }
  
  /**
   * Заблокировать все ресурсы одного модуля
   */
  async blockSingleModule(moduleId) {
    try {
      console.log(`🔒 Блокируем все ресурсы модуля ${moduleId}`)
      
      const results = {
        module_id: moduleId,
        databases: { total: 0, locked: 0, errors: 0 },
        repositories: { total: 0, locked: 0, errors: 0 }
      }
      
      // 1. Блокируем все БД модуля
      try {
        const databases = await DatabaseService.getModuleDatabases(moduleId)
        
        // Преобразуем ответ в массив
        let dbArray = []
        if (Array.isArray(databases)) {
          dbArray = databases
        } else if (databases?.data && Array.isArray(databases.data)) {
          dbArray = databases.data
        }
        
        results.databases.total = dbArray.length
        
        for (const db of dbArray) {
          try {
            if (db.is_active === true || db.is_active === 1 || db.is_active === '1') {
              await DatabaseService.toggleDatabaseLock(db.id, 'lock', 'Блокировка модуля мероприятия')
              results.databases.locked++
            }
          } catch (dbError) {
            console.error(`❌ Ошибка блокировки БД ${db.id}:`, dbError)
            results.databases.errors++
          }
        }
      } catch (dbError) {
        console.error('❌ Ошибка получения или блокировки БД:', dbError)
      }
      
      // 2. Блокируем все репозитории модуля
      try {
        const repoResult = await RepositoryService.bulkToggleRepositories(moduleId, false)
        results.repositories = {
          total: repoResult.data?.total || 0,
          locked: repoResult.data?.updated || 0,
          errors: repoResult.data?.failed || 0
        }
      } catch (repoError) {
        console.error('❌ Ошибка блокировки репозиториев:', repoError)
        results.repositories.errors++
      }
      
      // 3. Обновляем статус модуля на "Отключен" (id 6)
      try {
        await EventsService.updateModule(moduleId, {
          status_id: 6 // ID статуса "Отключен"
        })
        console.log(`✅ Статус модуля ${moduleId} обновлен на "Отключен"`)
      } catch (statusError) {
        console.error(`❌ Ошибка обновления статуса модуля ${moduleId}:`, statusError)
      }
      
      console.log(`✅ Модуль ${moduleId} заблокирован:`, results)
      return results
      
    } catch (error) {
      console.error(`❌ Ошибка блокировки модуля ${moduleId}:`, error)
      throw error
    }
  }
  
  /**
   * Разблокировать все ресурсы одного модуля
   */
  async unblockSingleModule(moduleId) {
    try {
      console.log(`🔓 Разблокируем все ресурсы модуля ${moduleId}`)
      
      const results = {
        module_id: moduleId,
        databases: { total: 0, unlocked: 0, errors: 0 },
        repositories: { total: 0, unlocked: 0, errors: 0 }
      }
      
      // 1. Разблокируем все БД модуля
      try {
        const databases = await DatabaseService.getModuleDatabases(moduleId)
        
        // Преобразуем ответ в массив
        let dbArray = []
        if (Array.isArray(databases)) {
          dbArray = databases
        } else if (databases?.data && Array.isArray(databases.data)) {
          dbArray = databases.data
        }
        
        results.databases.total = dbArray.length
        
        for (const db of dbArray) {
          try {
            if (db.is_active === false || db.is_active === 0 || db.is_active === '0') {
              await DatabaseService.toggleDatabaseLock(db.id, 'unlock', 'Разблокировка модуля мероприятия')
              results.databases.unlocked++
            }
          } catch (dbError) {
            console.error(`❌ Ошибка разблокировки БД ${db.id}:`, dbError)
            results.databases.errors++
          }
        }
      } catch (dbError) {
        console.error('❌ Ошибка получения или разблокировки БД:', dbError)
      }
      
      // 2. Разблокируем все репозитории модуля
      try {
        const repoResult = await RepositoryService.bulkToggleRepositories(moduleId, true)
        results.repositories = {
          total: repoResult.data?.total || 0,
          unlocked: repoResult.data?.updated || 0,
          errors: repoResult.data?.failed || 0
        }
      } catch (repoError) {
        console.error('❌ Ошибка разблокировки репозиториев:', repoError)
        results.repositories.errors++
      }
      
      // 3. Обновляем статус модуля на "Активен" (id 2)
      try {
        await EventsService.updateModule(moduleId, {
          status_id: 2 // ID статуса "Активен"
        })
        console.log(`✅ Статус модуля ${moduleId} обновлен на "Активен"`)
      } catch (statusError) {
        console.error(`❌ Ошибка обновления статуса модуля ${moduleId}:`, statusError)
      }
      
      console.log(`✅ Модуль ${moduleId} разблокирован:`, results)
      return results
      
    } catch (error) {
      console.error(`❌ Ошибка разблокировки модуля ${moduleId}:`, error)
      throw error
    }
  }
  
  /**
   * Проверить и синхронизировать статусы модулей мероприятия
   * (если мероприятие не активно - все модули должны быть отключены)
   */
  async syncEventModulesStatus(eventId, eventStatusId) {
    try {
      console.log(`🔄 Синхронизация статусов модулей мероприятия ${eventId} (статус мероприятия: ${eventStatusId})`)
      
      const modules = await EventsService.getEventModules(eventId)
      console.log(`📋 Модулей для синхронизации: ${modules.length}`)
      
      // Если мероприятие не активно (id ≠ 2)
      if (eventStatusId !== 2) {
        console.log('⚠️ Мероприятие не активно, блокируем все модули')
        
        // Проверяем каждый модуль
        for (const module of modules) {
          if (module.status_id !== 6) { // Если модуль не отключен
            console.log(`🔒 Модуль ${module.id} активен, требуется блокировка`)
            
            // Показываем предупреждение (опционально)
            if (confirm(`Мероприятие не активно, но модуль "${module.name}" активен.\nЗаблокировать все ресурсы модуля?`)) {
              await this.blockSingleModule(module.id)
            }
          }
        }
      } else {
        console.log('✅ Мероприятие активно')
      }
      
      return {
        event_id: eventId,
        event_status_id: eventStatusId,
        total_modules: modules.length,
        checked_modules: modules.length
      }
      
    } catch (error) {
      console.error('❌ Ошибка синхронизации статусов модулей:', error)
      throw error
    }
  }
}

export default new ModuleBulkService()