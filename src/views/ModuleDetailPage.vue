<template>
  <main class="module-detail-page">
    <!-- Хлебные крошки и навигация -->
    <header class="page-header">
      <nav class="breadcrumb">
        <button @click="goBack" class="breadcrumb-back">
          ← Назад
        </button>
        <span class="breadcrumb-separator">/</span>
        <router-link :to="`/events/${module?.event_id}`" class="breadcrumb-link">
          {{ module?.event?.name || 'Мероприятие' }}
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Модуль</span>
      </nav>
      
      <div class="header-main">
        <div class="header-left">
          <h1 class="module-title">{{ module?.name || 'Загрузка...' }}</h1>
          <div class="module-meta">
            <span class="module-id">ID: {{ moduleId }}</span>
            <span class="module-date">
              Создан: {{ formatDate(module?.created_at) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Информационная панель -->
      <div class="info-panel">
        <div class="info-card">
          <div class="info-label">Статус</div>
          <div class="info-value">
            <span class="status-badge" :class="getStatusClass(module?.status_id)">
              {{ module?.status?.name || '—' }}
            </span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-label">Мероприятие</div>
          <div class="info-value">
            <router-link 
              v-if="module?.event" 
              :to="`/events/${module.event_id}`"
              class="event-link"
            >
              {{ module.event.name }}
            </router-link>
            <span v-else>—</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-label">Обновлен</div>
          <div class="info-value">
            {{ formatDate(module?.updated_at) }}
          </div>
        </div>
      </div>
    </header>

    <!-- Контент модуля с табами -->
    <div class="module-content">
      <!-- Вкладки -->
      <div class="tabs">
        <button 
          @click="handleTabChange('overview')" 
          class="tab-btn" 
          :class="{ active: activeTab === 'overview' }"
        >
          📋 Обзор
        </button>
        <button 
        @click="handleTabChange('databases')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'databases' }"
      >
        🗄️ Базы данных
      </button>
        <button 
          @click="activeTab = 'repositories'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'repositories' }"
        >
          💾 Репозитории
        </button>
        <button 
          @click="activeTab = 'servers'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'servers' }"
        >
          🖥️ Серверы
        </button>
        <button 
          @click="activeTab = 'settings'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'settings' }"
        >
          ⚙️ Настройки
        </button>
      </div>

      <!-- Содержимое вкладок -->
      <div class="tab-content">
        <!-- Вкладка "Обзор" -->
        <div v-if="activeTab === 'overview'" class="overview-tab">
            <div class="overview-section">
            <h3>📊 Статистика модуля</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🗄️</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Базы данных</div>
                <button class="stat-action">Добавить</button>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💾</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Репозитории</div>
                <button class="stat-action">Добавить</button>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🖥️</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Серверы</div>
                <button class="stat-action">Добавить</button>
              </div>
              <!-- <div class="stat-card">
                <div class="stat-icon">🔧</div>
                <div class="stat-value">4</div>
                <div class="stat-label">Настроек</div>
                <button class="stat-action" @click="activeTab = 'settings'">Настроить</button>
              </div> -->
            </div>
          </div>

          <div class="overview-section">
            <h3>Активность модуля</h3>
            <div class="activity-timeline">
              <div class="activity-item" v-if="module?.created_at">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-time">{{ formatDateTime(module.created_at) }}</div>
                  <div class="activity-text">Модуль создан</div>
                </div>
              </div>
              <div class="activity-item" v-if="module?.updated_at && module.updated_at !== module.created_at">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-time">{{ formatDateTime(module.updated_at) }}</div>
                  <div class="activity-text">Модуль обновлен</div>
                </div>
              </div>
              <div class="activity-placeholder" v-if="!module?.created_at">
                <p>Нет данных об активности</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Вкладка "Базы данных" -->
  <div v-else-if="activeTab === 'databases'" class="databases-tab">
    <div class="section-header">
      <h3>🗄️ Базы данных PostgreSQL</h3>
      <div class="bulk-actions">
        <button 
          @click="loadDatabases" 
          class="action-btn"
          :disabled="loadingDatabases"
        >
          <span v-if="loadingDatabases" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>Обновить</span>
        </button>
        
        <button @click="testConnectionDirectly" class="action-btn test-btn">
          Тест подключения
        </button>
        
        <button 
          @click="createAllDatabases" 
          class="action-btn create-btn"
          :disabled="creatingDatabases"
        >
          <span v-if="creatingDatabases" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>Создать все базы</span>
        </button>
      </div>
    </div>

    <!-- Статус -->
    <div v-if="loadingDatabases" class="loading">
      <div class="empty-icon">🔄</div>
      <h3>Загрузка баз данных...</h3>
      <p>Пожалуйста, подождите</p>
    </div>

    <div v-else-if="databasesError" class="error">
      <div class="empty-icon">❌</div>
      <h3>Ошибка загрузки</h3>
      <p>{{ databasesError }}</p>
      <button @click="loadDatabases" class="retry-btn">
        Попробовать снова
      </button>
    </div>

    <div v-else-if="databases.length === 0" class="empty">
      <div class="empty-icon">🗄️</div>
      <h3>Базы данных не найдены</h3>
      <p>Создайте PostgreSQL базы данных для участников мероприятия</p>
      <button @click="createAllDatabases" class="primary-btn" :disabled="creatingDatabases">
        <span v-if="creatingDatabases" class="loading-dots">
          <span></span><span></span><span></span>
        </span>
        <span v-else>Создать все базы данных</span>
      </button>
    </div>

    <div v-else class="databases-list">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ databases.length }}</span>
          <span class="stat-label">Всего БД</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ activeDatabasesCount }}</span>
          <span class="stat-label">Активных</span>
        </div>
        <!-- <div class="stat-item">
          <span class="stat-value">{{ emptyDatabasesCount }}</span>
          <span class="stat-label">Пустых</span>
        </div> -->
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th>Название базы</th>
              <th>Пользователь</th>
              <th>Участник</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="db in databases" :key="db.id">
              <td class="id-cell">
                <span class="id-badge">#{{ db.id }}</span>
              </td>
              <td>
                <code class="code-highlight">{{ db.name }}</code>
              </td>
              <td>
                <code class="code-highlight">{{ db.username }}</code>
              </td>
              <td class="participant-info-cell">
                <div v-if="db.event_account?.user">
                  <div class="participant-name">{{ db.event_account.user.name }}</div>
                  <div v-if="db.event_account.seat_number" class="seat-badge">
                    Место {{ db.event_account.seat_number }}
                  </div>
                </div>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span class="status-badge" :class="db.is_active ? 'active' : 'inactive'">
                  {{ db.is_active ? '✅ Активна' : '❌ Отключена' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Подсказки -->
      <!-- <div class="table-footer" style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
        <p style="margin: 0.5rem 0; color: #0369a1; font-size: 0.9rem;">
         <strong>Реальные базы данных PostgreSQL:</strong> Каждый участник получает свою изолированную базу данных
        </p>
        <p style="margin: 0.5rem 0; color: #0369a1; font-size: 0.9rem;">
          Для подключения используйте: <code>psql -h localhost -p 5432 -U username -d dbname</code>
        </p>
      </div> -->
    </div>
  </div>

        <!-- Вкладка "Репозитории" -->
        <div v-else-if="activeTab === 'repositories'" class="repositories-tab">
  <div class="section-header">
    <h3>Репозитории Git участников</h3>
    <div class="bulk-actions">
      <button 
        @click="testGogsConnection" 
        class="action-btn test-btn"
        :disabled="testingConnection"
      >
        <span v-if="testingConnection">⏳ Проверка...</span>
        <span v-else>Проверить подключение</span>
      </button>
      
      <button 
        @click="createAllRepositories" 
        class="action-btn create-btn"
        :disabled="creatingRepositories || !gogsConnected"
      >
        <span v-if="creatingRepositories">⏳ Создание...</span>
        <span v-else>Создать все репозитории</span>
      </button>
    </div>
  </div>

  <!-- Статус подключения -->
  <div class="connection-status" :class="gogsStatusClass">
    <div class="status-info">
      <span class="status-icon">{{ gogsConnected ? '✅' : '❌' }}</span>
      <span class="status-text">
        {{ gogsConnected ? 'Gogs сервер подключен' : 'Gogs сервер не подключен' }}
      </span>
      <span v-if="gogsConnected" class="mock-badge" title="Режим демонстрации">
        Демо-режим
      </span>
    </div>
    <div v-if="gogsInfo" class="connection-details">
      <small>Версия: {{ gogsInfo.version }} | Статус: {{ gogsInfo.status }}</small>
    </div>
  </div>

  <!-- Таблица репозиториев -->
  <div v-if="loadingRepositories" class="loading-state">
    <div class="spinner"></div>
    <p>Загрузка репозиториев...</p>
  </div>

  <div v-else-if="repositoriesError" class="error-state">
    <p>❌ {{ repositoriesError }}</p>
    <button @click="loadRepositories" class="retry-btn">
      Попробовать снова
    </button>
  </div>

  <div v-else-if="repositories.length === 0" class="empty-state">
    <div class="empty-icon">💾</div>
    <h4>Репозитории не созданы</h4>
    <p>Создайте Git-репозитории для участников мероприятия</p>
    <div class="empty-actions">
      <button 
        @click="createAllRepositories" 
        class="primary-btn"
        :disabled="!gogsConnected"
      >
        🚀 Создать репозитории
      </button>
      <button @click="loadRepositories" class="secondary-btn">
        🔄 Обновить список
      </button>
    </div>
    <div class="empty-hint">
      <p>💡 На предзащите используется <strong>демо-режим</strong>. В реальной системе будут создаваться настоящие Git-репозитории.</p>
    </div>
  </div>

  <div v-else class="repositories-container">
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ repositories.length }}</span>
        <span class="stat-label">Всего</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ activeRepositoriesCount }}</span>
        <span class="stat-label">Активных</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ privateRepositoriesCount }}</span>
        <span class="stat-label">Приватных</span>
      </div>
    </div>

    <div class="repositories-table-container">
      <table class="repositories-table">
        <thead>
          <tr>
            <th class="participant-cell-enhanced">Участник</th>
            <th class="repo-name-cell">Репозиторий</th>
            <th class="repo-status">Статус</th>
            <th class="links-cell-enhanced">Ссылки</th>
            <th class="actions-cell-enhanced">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="repo in repositories" :key="repo.id">
            <td class="participant-cell-enhanced">
              <div class="participant-info">
                <div class="participant-name">{{ repo.participant?.name || 'Участник' }}</div>
                <div v-if="repo.participant?.seat_number" class="seat-badge">
                  Место {{ repo.participant.seat_number }}
                </div>
                <div class="participant-login">
                  {{ repo.participant?.login || '—' }}
                </div>
              </div>
            </td>
            <td class="repo-name-cell">
              <div class="repo-info">
                <strong class="repo-name">{{ repo.name }}</strong>
                <div v-if="repo.description" class="repo-description">
                  {{ repo.description }}
                </div>
                <div class="repo-meta">
                  <small>Создан: {{ formatDateTime(repo.created_at) }}</small>
                  <small v-if="repo.updated_at && repo.updated_at !== repo.created_at">
                    Обновлен: {{ formatDateTime(repo.updated_at) }}
                  </small>
                </div>
              </div>
            </td>
            <td class="repo-status">
              <span class="status-badge" :class="repo.status">
                {{ getStatusText(repo.status) }}
                <span v-if="!repo.is_active" class="inactive-indicator">⚠️</span>
              </span>
            </td>
            <td class="links-cell-enhanced">
              <div class="links-group-enhanced">
                <a 
                  :href="repo.url" 
                  target="_blank" 
                  class="link-btn-enhanced web-btn"
                  title="Открыть в браузере"
                >
                  🌐 Веб-интерфейс
                </a>
                <button 
                  v-if="repo.ssh_url"
                  @click="copyToClipboard(repo.ssh_url)"
                  class="link-btn-enhanced ssh-btn"
                  title="Скопировать SSH ссылку"
                >
                  🔗 SSH ссылка
                </button>
                <button 
                  @click="copyToClipboard(repo.clone_url || repo.url + '.git')"
                  class="link-btn-enhanced http-btn"
                  title="Скопировать HTTP ссылку"
                >
                  📋 HTTP ссылка
                </button>
              </div>
              <small class="links-hint" v-if="repo.mock">
                🎭 Демо-режим: ссылки не действительны
              </small>
            </td>
            <td class="actions-cell-enhanced">
              <div class="actions-group-enhanced">
                <button 
                  @click="toggleRepositoryAccess(repo)"
                  class="action-btn-enhanced"
                  :class="repo.is_active ? 'disable-btn' : 'enable-btn'"
                  :title="repo.is_active ? 'Заблокировать доступ' : 'Разблокировать доступ'"
                >
                  {{ repo.is_active ? '🔒' : '🔓' }}
                </button>
                <button 
                  @click="openRepository(repo)"
                  class="action-btn-enhanced open-btn"
                  title="Открыть репозиторий"
                >
                  📂
                </button>
                <button 
                  @click="deleteRepository(repo)"
                  class="action-btn-enhanced delete-btn"
                  title="Удалить репозиторий"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    
  </div>
</div>

        <!-- Вкладка "Серверы" -->
        <div v-else-if="activeTab === 'servers'" class="resource-tab">
          <div class="section-header">
            <h3>Серверы модуля</h3>
            <button class="add-resource-btn" @click="addServer">
              + Добавить сервер
            </button>
          </div>
          <div class="empty-state">
            <div class="empty-icon">🖥️</div>
            <p>Серверы еще не добавлены</p>
            <p class="empty-hint">Настройте серверы для работы модуля</p>
            <button class="primary-btn" @click="addServer">
              Добавить сервер
            </button>
          </div>
        </div>

        <!-- Вкладка "Настройки" -->
        <div v-else-if="activeTab === 'settings'" class="settings-tab">
          <div class="settings-section">
            <h3>Основные настройки модуля</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Название модуля</label>
                <div class="readonly-field">{{ module?.name || '—' }}</div>
              </div>
              <div class="form-group">
                <label>Статус</label>
                <div class="readonly-field">
                  <span class="status-badge small" :class="getStatusClass(module?.status_id)">
                    {{ module?.status?.name || '—' }}
                  </span>
                </div>
              </div>
              
            </div>
            <button @click="editModule" class="edit-settings-btn">
              Редактировать настройки
            </button>
          </div>

          <div class="settings-section">
            <div class="danger-zone">
              <div class="danger-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <h4>Удаление модуля</h4>
                  <p>Это действие необратимо. Все связанные с модулем данные (базы данных, репозитории, серверы) будут удалены.</p>
                </div>
              </div>
              <button @click="deleteModule" class="danger-btn">
                Удалить модуль
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal">
          <header class="modal-header">
            <h2>Редактировать модуль</h2>
            <button class="modal-close" @click="closeEditModal">×</button>
          </header>
          
          <form @submit.prevent="updateModule" class="modal-form">
            <div class="form-group">
              <label for="edit-module-name">Название модуля *</label>
              <input
                id="edit-module-name"
                v-model="editModuleData.name"
                type="text"
                placeholder="Введите название модуля"
                required
                :disabled="updating"
              />
              <div class="form-hint">Максимум 100 символов</div>
            </div>
            
                       
            <div class="form-group">
              <label for="edit-module-status">Статус *</label>
              <select
                id="edit-module-status"
                v-model="editModuleData.status_id"
                required
                :disabled="updating"
              >
                <option value="">Выберите статус</option>
                <option v-for="status in moduleStatuses" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
              <div class="form-hint">Определяет доступность модуля</div>
            </div>
            
            <div class="form-group" v-if="editError">
              <div class="error-message">
                <strong>Ошибка:</strong> {{ editError }}
              </div>
            </div>
            
            <footer class="modal-footer">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="closeEditModal"
                :disabled="updating"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="updating || !isEditFormValid"
              >
                <span v-if="updating">Сохранение...</span>
                <span v-else>Сохранить изменения</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'
import { RepositoryService } from '@/services/gogsService'
import DatabaseService from '@/services/databaseService'

const route = useRoute()
const router = useRouter()
const moduleId = route.params.id

// Данные модуля
const module = ref(null)
const loading = ref(true)
const error = ref('')

// Вкладки
const activeTab = ref('overview')
const gogsConnected = ref(false)
const gogsInfo = ref(null)
const testingConnection = ref(false)
const repositories = ref([])
const loadingRepositories = ref(false)
const repositoriesError = ref('')
const creatingRepositories = ref(false)

// Модальное окно редактирования
const showEditModal = ref(false)
const updating = ref(false)
const editError = ref('')
const moduleStatuses = ref([])
const editModuleData = ref({
  name: '',
  status_id: ''
})

//БД
const databases = ref([])
const loadingDatabases = ref(false)
const databasesError = ref('')
const creatingDatabases = ref(false) // ← ДОБАВЬТЕ ЭТО

const isEditFormValid = computed(() => {
  return editModuleData.value.name.trim() !== '' &&
         editModuleData.value.status_id !== ''
})

const handleTabChange = (tabName) => {
  activeTab.value = tabName
  
  // Автоматически загружаем данные при переходе на вкладку БД
  if (tabName === 'databases') {
    loadDatabases()
  }
  
  // Для репозиториев
  if (tabName === 'repositories') {
    loadRepositories()
  }
}

const loadModule = async () => {
  try {
    loading.value = true
    module.value = await EventsService.getModuleById(moduleId)
    console.log('✅ Модуль загружен:', module.value)
  } catch (err) {
    console.error('❌ Ошибка загрузки модуля:', err)
    error.value = err.message || 'Ошибка загрузки модуля'
  } finally {
    loading.value = false
  }
}

const loadModuleStatuses = async () => {
  try {
    moduleStatuses.value = await EventsService.getModuleStatuses()
  } catch (err) {
    console.error('Ошибка загрузки статусов модулей:', err)
    moduleStatuses.value = [
      { id: 1, name: 'Запланирован' },
      { id: 2, name: 'Активен' },
      { id: 3, name: 'Завершён' },
      { id: 4, name: 'Отменён' }
    ]
  }
}

const goBack = () => {
  if (module.value?.event_id) {
    router.push(`/events/${module.value.event_id}`)
  } else {
    router.push('/events')
  }
}

// Функция загрузки
const loadDatabases = async () => {
  try {
    loadingDatabases.value = true
    databasesError.value = ''
    
    console.log('🔄 Загружаем БД для модуля', moduleId)
    const data = await DatabaseService.getModuleDatabases(moduleId)
    
    // Проверяем структуру ответа
    console.log('📦 Полученные данные:', data)
    
    // Если ответ - массив
    if (Array.isArray(data)) {
      databases.value = data
    } 
    // Если ответ - объект с данными
    else if (data && data.data) {
      databases.value = data.data
    }
    // Если другой формат
    else {
      databases.value = [data]
    }
    
    console.log(`✅ Загружено ${databases.value.length} БД`)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error)
    databasesError.value = error.message || 'Ошибка загрузки баз данных'
  } finally {
    loadingDatabases.value = false
  }
}

// Функция создания БД
const createAllDatabases = async () => {
  // Более информативное подтверждение
  const confirmationMessage = `
Создать PostgreSQL базы данных для всех участников?

ВНИМАНИЕ:
1. Все существующие базы данных участников будут УДАЛЕНЫ
2. Будут созданы новые чистые базы данных
3. Процесс может занять несколько минут

Продолжить?
`
  
  if (!confirm(confirmationMessage)) {
    return
  }
  
  try {
    creatingDatabases.value = true
    databasesError.value = ''
    
    console.log('🚀 Компонент: начинаем создание БД для модуля', moduleId)
    
    // Показываем уведомление о начале процесса
    alert('Процесс может занять некоторое время\nПожалуйста, не закрывайте страницу.')
    
    const result = await DatabaseService.createDatabasesForModule(moduleId)
    
    console.log('✅ Компонент: результат создания', result)
    
    // Обрабатываем разные форматы ответа
    let message = 'Базы данных успешно созданы'
    let successful = 0
    let failed = 0
    
    if (typeof result === 'object') {
      if (result.message) {
        message = result.message
      }
      if (result.success !== undefined) {
        if (!result.success) {
          throw new Error(result.message || 'Не удалось создать базы данных')
        }
      }
      if (result.summary) {
        successful = result.summary.successful || 0
        failed = result.summary.failed || 0
      } else if (result.results) {
        successful = result.results.filter(r => r.success).length
        failed = result.results.filter(r => !r.success).length
      }
    }
    
    // Формируем детальный отчет
    let report = `${message}\n\n`
    report += `Итоги:\n`
    report += `   • Успешно создано: ${successful}\n`
    report += `   • Ошибок: ${failed}\n\n`
    
    // Добавляем детали по ошибкам, если они есть
    if (result.results && failed > 0) {
      report += `📛 Ошибки:\n`
      result.results.forEach(r => {
        if (!r.success) {
          report += `   • ${r.participant_login || 'Участник'}: ${r.error}\n`
        }
      })
    }
    
    // Добавляем информацию о подключении
    if (result.results && successful > 0) {
      report += `\n🔗 Пример подключения:\n`
      const firstSuccess = result.results.find(r => r.success)
      if (firstSuccess) {
        report += `   psql -h localhost -p 5432 -U ${firstSuccess.username} -d ${firstSuccess.database_name}\n`
        report += `   Пароль: ${firstSuccess.password || '*****'}`
      }
    }
    
    alert(report)
    
    // Перезагружаем список БД
    await loadDatabases()
    
  } catch (error) {
    console.error('❌ Компонент: ошибка при создании БД', error)
    
    // Показываем понятное сообщение об ошибке
    let errorMessage = error.message || 'Неизвестная ошибка'
    
    // Дополнительная информация для отладки
    if (errorMessage.includes('Network Error') || errorMessage.includes('Нет ответа')) {
      errorMessage += '\n\nПроверьте:\n1. Запущен ли сервер Laravel\n2. Доступен ли PostgreSQL сервер\n3. Подключение к сети'
    }
    
    databasesError.value = errorMessage
    alert(`❌ ${errorMessage}`)
    
  } finally {
    creatingDatabases.value = false
  }
}

const testConnectionDirectly = async () => {
  try {
    console.log('🔍 Тестируем прямое подключение...')
    
    // 1. Проверяем токен
    const token = localStorage.getItem('auth_token')
    console.log('Токен в localStorage:', token ? '✅ есть' : '❌ нет')
    
    // 2. Делаем простой GET запрос на рабочий endpoint
    const testUrl = 'http://localhost:8000/api/databases/test-connection'
    
    console.log('🔄 Отправляем запрос на:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
    
    console.log('📊 Статус ответа:', response.status)
    console.log('📊 Статус текст:', response.statusText)
    
    const text = await response.text()
    console.log('📦 Текст ответа:', text)
    
    try {
      const data = JSON.parse(text)
      console.log('✅ JSON ответ:', data)
      alert(`✅ Сервер отвечает!\n${JSON.stringify(data, null, 2)}`)
    } catch {
      console.log('❌ Ответ не JSON:', text)
      alert(`❌ Ответ не JSON:\n${text}`)
    }
    
  } catch (error) {
    console.error('🔥 Критическая ошибка:', error)
    alert(`🔥 Ошибка подключения:\n${error.message}\n\nПроверьте:\n1. Сервер Laravel запущен\n2. Адрес правильный\n3. Нет блокировки брандмауэром`)
  }
}

const activeDatabasesCount = computed(() => {
  return databases.value.filter(db => db.is_active).length
})

const emptyDatabasesCount = computed(() => {
  return databases.value.filter(db => db.is_empty).length
})

// Вычисляемые свойства
const activeRepositoriesCount = computed(() => {
  return repositories.value.filter(r => r.is_active).length
})

const privateRepositoriesCount = computed(() => {
  return repositories.value.filter(r => r.is_private).length
})

const gogsStatusClass = computed(() => {
  return gogsConnected.value ? 'connected' : 'disconnected'
})

// Методы
const testGogsConnection = async () => {
  try {
    testingConnection.value = true
    const result = await RepositoryService.testGogsConnection()
    gogsConnected.value = result.status === 'connected'
    gogsInfo.value = result
    alert(`✅ ${result.message}`)
  } catch (error) {
    gogsConnected.value = false
    alert('❌ Не удалось подключиться к Gogs')
  } finally {
    testingConnection.value = false
  }
}

const loadRepositories = async () => {
  try {
    loadingRepositories.value = true
    repositoriesError.value = ''
    repositories.value = await RepositoryService.getModuleRepositories(moduleId)
  } catch (error) {
    repositoriesError.value = error.message || 'Ошибка загрузки репозиториев'
  } finally {
    loadingRepositories.value = false
  }
}

const createAllRepositories = async () => {
  if (!confirm('Создать Git-репозитории для всех участников мероприятия?\n\nНа предзащите: создаются демо-записи\nВ реальной системе: создаются настоящие Git-репозитории')) {
    return
  }
  
  try {
    creatingRepositories.value = true
    const result = await RepositoryService.createRepositoriesForModule(moduleId)
    
    alert(`✅ ${result.message}\n\nУспешно: ${result.data.successful}\nОшибок: ${result.data.failed}`)
    
    // Перезагружаем список
    await loadRepositories()
    
  } catch (error) {
    alert(`❌ Ошибка: ${error.message || 'Не удалось создать репозитории'}`)
  } finally {
    creatingRepositories.value = false
  }
}


const toggleRepositoryAccess = async (repo) => {
  const action = repo.is_active ? 'заблокировать' : 'разблокировать'
  
  if (!confirm(`${action} доступ к репозиторию "${repo.name}"?`)) {
    return
  }
  
  try {
    await RepositoryService.updateRepositoryStatus(repo.id, !repo.is_active)
    repo.is_active = !repo.is_active
    repo.status = repo.is_active ? 'active' : 'disabled'
    alert(`✅ Доступ ${action}`)
  } catch (error) {
    alert(`❌ ${error.message}`)
  }
}

const deleteRepository = async (repo) => {
  if (!confirm(`Удалить репозиторий "${repo.name}"?\n\nЭто действие нельзя отменить.`)) {
    return
  }
  
  try {
    await RepositoryService.deleteRepository(repo.id)
    repositories.value = repositories.value.filter(r => r.id !== repo.id)
    alert('✅ Репозиторий удален')
  } catch (error) {
    alert(`❌ ${error.message}`)
  }
}

const openRepository = (repo) => {
  window.open(repo.url, '_blank')
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('✅ Ссылка скопирована в буфер обмена'))
    .catch(() => alert('❌ Не удалось скопировать'))
}

const getStatusText = (status) => {
  const statusMap = {
    'active': '✅ Активен',
    'disabled': '❌ Заблокирован', 
    'pending': '⏳ Ожидает',
    'error': '⚠️ Ошибка'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// При загрузке страницы
onMounted(async () => {
  // Автоматически проверяем подключение
  await testGogsConnection()
  // Загружаем репозитории
  await loadRepositories()
})

// Методы для кнопок добавления (заглушки)
const addDatabase = () => {
  alert('Функция добавления базы данных в разработке')
}

const addRepository = () => {
  alert('Функция добавления репозитория в разработке')
}

const addServer = () => {
  alert('Функция добавления сервера в разработке')
}

const openEditModal = () => {
  if (!module.value) return
  
  editModuleData.value = {
    name: module.value.name || '',
    status_id: module.value.status_id?.toString() || ''
  }
  
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editModuleData.value = {
    name: '',
    description: '',
    status_id: ''
  }
  editError.value = ''
  updating.value = false
}

const updateModule = async () => {
  if (!isEditFormValid.value) return
  
  try {
    updating.value = true
    editError.value = ''
    
    const updateData = {
      name: editModuleData.value.name.trim(),
      status_id: parseInt(editModuleData.value.status_id)
    }
    
    console.log('🔄 Обновляем модуль:', updateData)
    
    const updatedModule = await EventsService.updateModule(moduleId, updateData)
    console.log('✅ Модуль обновлен:', updatedModule)
    
    // Обновляем данные
    module.value = updatedModule
    
    closeEditModal()
    alert('✅ Изменения сохранены!')
    
  } catch (err) {
    console.error('❌ Ошибка обновления модуля:', err)
    
    if (err.response?.status === 422) {
      editError.value = 'Проверьте правильность заполнения полей'
    } else {
      editError.value = err.message || 'Не удалось обновить модуль'
    }
  } finally {
    updating.value = false
  }
}

const editModule = () => {
  if (!module.value) {
    alert('Данные модуля еще не загружены')
    return
  }
  openEditModal()
}

const deleteModule = async () => {
  if (!module.value) return
  
  const moduleName = module.value.name || 'этот модуль'
  
  if (!confirm(`Вы уверены, что хотите удалить модуль "${moduleName}"?\n\nЭто действие нельзя отменить.`)) {
    return
  }
  
  try {
    console.log(`🗑️ Удаляем модуль ${moduleId}...`)
    await EventsService.deleteModule(moduleId)
    
    alert(`✅ Модуль "${moduleName}" успешно удален`)
    
    // Возвращаемся к мероприятию
    if (module.value?.event_id) {
      router.push(`/events/${module.value.event_id}`)
    } else {
      router.push('/events')
    }
    
  } catch (err) {
    console.error('❌ Ошибка удаления модуля:', err)
    
    let message = 'Не удалось удалить модуль'
    if (err.message.includes('не найден')) {
      message = 'Модуль не найден'
    } else if (err.message.includes('прав')) {
      message = 'У вас нет прав на удаление'
    } else if (err.message.includes('активные данные')) {
      message = 'Нельзя удалить модуль с активными данными'
    }
    
    alert(`❌ ${message}\n\n${err.message}`)
  }
}

const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',
    2: 'status-active', 
    3: 'status-completed',
    4: 'status-cancelled'
  }
  return classes[statusId] || 'status-unknown'
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

onMounted(async () => {
  await Promise.all([
    loadModule(),
    loadModuleStatuses()
  ])
})
</script>

<style scoped>
.module-detail-page {
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8fafc;
}

/* Хлебные крошки */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.breadcrumb-back {
  background: none;
  border: none;
  color: #2E80ED;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.breadcrumb-back:hover {
  background: #e0f2fe;
}

.breadcrumb-link {
  color: #2E80ED;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.breadcrumb-link:hover {
  background: #e0f2fe;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #475569;
  font-weight: 500;
}

/* ===== Стили для вкладки БАЗ ДАННЫХ ===== */
.databases-tab {
  padding: 1.5rem;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.loading, .error, .empty {
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 12px;
  margin: 1rem 0;
}

/* ===== Стили для ID ячейки ===== */
.id-cell {
  width: 70px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

.id-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #3b82f6;
  border: 2px solid #dbeafe;
  min-width: 40px;
  text-align: center;
}

/* ===== Улучшенные стили для ячеек таблицы БД ===== */
td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
}

td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Стили для ячеек с участниками в таблице БД */
.participant-info-cell {
  min-width: 200px;
}

.participant-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.seat-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.loading {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px dashed #7dd3fc;
}

.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  color: #dc2626;
}

.empty {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.databases-list {
  margin-top: 1.5rem;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

thead {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
}

tr:hover td {
  background: #f8fafc;
}

.code-highlight {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #1e293b;
  border: 1px solid #cbd5e1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.status-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-badge.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ===== Анимации ===== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-dots {
  display: inline-flex;
  gap: 0.25rem;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* ===== Адаптивность ===== */
@media (max-width: 768px) {
  .databases-tab {
    padding: 1rem;
  }
  
  .bulk-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .table-container {
    overflow-x: auto;
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  
  th, td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}

.loading, .error, .empty {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.databases-list {
  margin-top: 1rem;
}

.stats {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Основной заголовок */
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  word-wrap: break-word;
}

.module-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.module-id {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;
  font-size: 0.95rem;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.edit-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #9ca3af;
}

.delete-btn {
  background: white;
  color: #dc2626;
  border-color: #fecaca;
}

.delete-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
}

.btn-icon {
  font-size: 1rem;
}

/* Информационная панель */
.info-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.status-planned {
  background: #dbeafe;
  color: #1e40af;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-completed {
  background: #f3f4f6;
  color: #374151;
}

.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.event-link {
  color: #2E80ED;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.event-link:hover {
  color: #1E6FD9;
  text-decoration: underline;
}

/* Вкладки */
.tabs {
  display: flex;
  gap: 0.25rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  background: #2E80ED;
  color: white;
  box-shadow: 0 2px 4px rgba(46, 128, 237, 0.2);
}

/* Контент вкладок */
.tab-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-height: 400px;
}

/* Вкладка Обзор */
.overview-section {
  margin-bottom: 2.5rem;
}

.overview-section:last-child {
  margin-bottom: 0;
}

.overview-section h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1.25rem 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2E80ED;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.stat-action {
  background: #2E80ED;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.stat-action:hover {
  background: #1E6FD9;
}

/* История активности */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-dot {
  width: 12px;
  height: 12px;
  background: #2E80ED;
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-time {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-text {
  color: #475569;
  font-weight: 500;
}

.activity-placeholder {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

/* Ресурсные вкладки */
.resource-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
}

.add-resource-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-resource-btn:hover {
  background: #1E6FD9;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.empty-hint {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #1E6FD9;
}

/* Стили для вкладки Репозитории */
.repositories-tab {
  padding: 1rem;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.test-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.test-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.repositories-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.repositories-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.repositories-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.repositories-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
  transition: background 0.2s;
}

.repositories-table tr:hover td {
  background: #f8fafc;
}

/* Стили для ячейки участника */
.participant-cell-enhanced {
  min-width: 200px;
  max-width: 250px;
}

.participant-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.participant-login {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #475569;
  display: inline-block;
  margin-top: 0.25rem;
}

/* Стили для названия репозитория */
.repo-name-cell {
  min-width: 250px;
}

.repo-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  display: block;
}

.repo-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.repo-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Стили для статуса репозитория */
.repo-status {
  min-width: 120px;
}

/* Стили для ссылок */
.links-cell-enhanced {
  min-width: 180px;
}

.links-group-enhanced {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-btn-enhanced {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: 1px solid;
  width: 100%;
  justify-content: center;
}

.web-btn {
  border-color: #7dd3fc;
  background: #f0f9ff;
  color: #0369a1;
}

.web-btn:hover {
  background: #e0f2fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(7, 89, 133, 0.1);
}

.ssh-btn {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.ssh-btn:hover {
  background: #dcfce7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.1);
}

.http-btn {
  border-color: #fcd34d;
  background: #fefce8;
  color: #92400e;
}

.http-btn:hover {
  background: #fef3c7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(146, 64, 14, 0.1);
}

.links-hint {
  display: block;
  margin-top: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
  text-align: center;
}

/* Стили для действий */
.actions-cell-enhanced {
  min-width: 140px;
}

.actions-group-enhanced {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn-enhanced {
  padding: 0.6rem;
  width: 40px;
  height: 40px;
  justify-content: center;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.access-btn {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
}

.access-btn:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  transform: translateY(-2px);
}

.enable-btn {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.enable-btn:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #86efac 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.disable-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.disable-btn:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.open-btn {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.open-btn:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.delete-btn {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

/* Статус подключения */
.connection-status {
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.connection-status.connected {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.connection-status.disconnected {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.status-icon {
  font-size: 1.2rem;
}

.mock-badge {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  margin-left: auto;
}

.connection-details {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

/* Таблица */
.repositories-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.repositories-table table {
  width: 100%;
  border-collapse: collapse;
}

.repositories-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
}

.repositories-table td {
  padding: 1rem;
  border-bottom: 1px solid #eef2f7;
  vertical-align: top;
}

.participant-cell {
  min-width: 180px;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.seat-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
  width: fit-content;
}

.login-display {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
}

.repo-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.repo-name {
  color: #1e293b;
  word-break: break-all;
}

.repo-description {
  color: #64748b;
  font-size: 0.9rem;
}

.repo-meta {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Статус баджи */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.disabled {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.error {
  background: #fef2f2;
  color: #991b1b;
}

/* Ссылки */
.links-cell {
  min-width: 180px;
}

.links-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.link-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.link-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.web-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
}

.ssh-btn:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.http-btn:hover {
  background: #fef3c7;
  border-color: #fcd34d;
}

.links-hint {
  display: block;
  margin-top: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Действия */
.actions-cell {
  min-width: 140px;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
}

.actions-group .action-btn {
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  justify-content: center;
  border-radius: 6px;
}

.access-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.access-btn:hover {
  background: #e5e7eb;
}

.enable-btn {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.enable-btn:hover {
  background: #a7f3d0;
}

.disable-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.disable-btn:hover {
  background: #fecaca;
}

.open-btn {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.open-btn:hover {
  background: #bfdbfe;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover {
  background: #fecaca;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
  margin: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.primary-btn, .secondary-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background: #2E80ED;
  color: white;
}

.primary-btn:hover {
  background: #1E6FD9;
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

.empty-hint {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #bae6fd;
  color: #0369a1;
  text-align: left;
}

.empty-hint p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

/* Статистика */
.stats-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.table-footer {
  margin-top: 2rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.footer-info p {
  margin: 0.5rem 0;
  color: #0369a1;
  font-size: 0.9rem;
}

/* Состояния загрузки */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
  border-radius: 8px;
  margin: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2E80ED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Вкладка настроек */
.settings-section {
  margin-bottom: 2.5rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.danger-title {
  color: #dc2626;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
}

.readonly-field {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 1rem;
}

.description-field {
  white-space: pre-wrap;
  line-height: 1.6;
}

.edit-settings-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-settings-btn:hover {
  background: #1E6FD9;
}

.danger-zone {
  background: #fef2f2;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  max-width: 600px;
}

.danger-warning {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-content h4 {
  color: #dc2626;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.warning-content p {
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

.danger-btn {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.danger-btn:hover {
  background: #b91c1c;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
}

.modal-close:hover {
  color: #374151;
  background: #f3f4f6;
}

.modal-form {
  padding: 1.5rem;
}

.modal-form .form-group {
  margin-bottom: 1.5rem;
}

.modal-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.modal-form input,
.modal-form textarea,
.modal-form select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.modal-form input:focus,
.modal-form textarea:focus,
.modal-form select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.modal-form input:disabled,
.modal-form textarea:disabled,
.modal-form select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.submit-btn {
  background: #2E80ED;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #1E6FD9;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.error-message strong {
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .module-detail-page {
    padding: 1rem;
  }
  
  .header-main {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .info-panel {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    overflow-x: auto;
    padding: 0.25rem;
  }
  
  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .tab-content {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .module-title {
    font-size: 1.5rem;
  }
  
  .module-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .breadcrumb {
    font-size: 0.8rem;
  }
}
</style>