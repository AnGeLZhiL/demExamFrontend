<template>
  <div class="audit-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>Журнал изменений</h1>
      <div class="header-controls">
        <div class="controls">
          <div class="stats-summary">
            <span class="total-logs">{{ logs.length }} записей</span>
            <span class="last-update">Обновлено: {{ lastUpdateTime }}</span>
          </div>
          <div class="action-buttons">
            <button @click="refreshData" class="refresh-btn" :disabled="loading">
              {{ loading ? 'Загрузка...' : 'Обновить' }}
            </button>
            <label class="auto-refresh-toggle">
              <input type="checkbox" v-model="autoRefresh" />
              <span>Автообновление</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика по действиям -->
    <div class="action-stats" v-if="!loading && logs.length > 0">
      <div class="stat-badge created">
        <span class="stat-count">{{ getCountByAction('created') }}</span>
        <span class="stat-label">Создано</span>
      </div>
      <div class="stat-badge updated">
        <span class="stat-count">{{ getCountByAction('updated') }}</span>
        <span class="stat-label">Обновлено</span>
      </div>
      <div class="stat-badge total">
        <span class="stat-count">{{ logs.length }}</span>
        <span class="stat-label">Всего</span>
      </div>
    </div>

    <!-- Быстрые фильтры -->
    <div class="quick-filters" v-if="!loading && logs.length > 0">
      <div class="filter-tabs">
        <button 
          :class="['filter-tab', filterAction === 'all' ? 'active' : '']"
          @click="setFilterAction('all')"
        >
          Все действия
        </button>
        <button 
          :class="['filter-tab', filterAction === 'created' ? 'active' : '']"
          @click="setFilterAction('created')"
        >
          Только создание
        </button>
        <button 
          :class="['filter-tab', filterAction === 'updated' ? 'active' : '']"
          @click="setFilterAction('updated')"
        >
          Только обновление
        </button>
      </div>
      
      <div class="table-filter">
        <select v-model="filterTable" class="table-select">
          <option value="all">Все таблицы</option>
          <option value="users">Пользователи</option>
          <option value="events">Мероприятия</option>
          <option value="modules">Модули</option>
          <option value="groups">Группы</option>
          <option value="event_accounts">Учетные записи</option>
        </select>
        
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по описанию..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <!-- Основная таблица -->
    <div class="main-content">
      <div class="table-wrapper" v-if="!loading && filteredLogs.length > 0">
        <table class="audit-table">
          <thead>
            <tr>
              <th width="150">Дата и время</th>
              <th width="120">Таблица</th>
              <th width="120">Действие</th>
              <th>Описание</th>
              <th width="80">ID</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="log in filteredLogs" 
              :key="log.id" 
              :class="`log-row action-${log.action}`"
            >
              <td class="timestamp-cell">
                <div class="date">{{ formatDate(log.created_at) }}</div>
                <div class="time">{{ formatTime(log.created_at) }}</div>
              </td>
              <td>
                <span class="table-badge" :class="log.table_name">
                  {{ getTableName(log.table_name) }}
                </span>
              </td>
              <td>
                <span class="action-indicator" :class="log.action">
                  {{ getActionName(log.action) }}
                </span>
              </td>
              <td class="description-cell">
                {{ log.description }}
              </td>
              <td class="id-cell">
                <span class="record-id">#{{ log.record_id }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Индикатор количества -->
        <div class="table-footer">
          <div class="showing-count">
            Показано {{ filteredLogs.length }} из {{ logs.length }} записей
          </div>
        </div>
      </div>

      <!-- Состояния загрузки/пустоты -->
      <div v-if="loading" class="state-message loading">
        <div class="spinner"></div>
        <p>Загружаем журнал изменений...</p>
      </div>

      <div v-if="!loading && logs.length === 0" class="state-message empty">
        <p>📭 Журнал изменений пуст</p>
        <p class="hint">Создайте пользователя или мероприятие, чтобы увидеть записи здесь</p>
        <button @click="refreshData" class="action-btn">Обновить</button>
      </div>

      <div v-if="!loading && logs.length > 0 && filteredLogs.length === 0" class="state-message no-results">
        <p>🔍 Ничего не найдено</p>
        <p class="hint">Попробуйте изменить фильтры или поисковый запрос</p>
        <button @click="clearFilters" class="action-btn">Сбросить фильтры</button>
      </div>
    </div>

    <!-- Информационная панель -->
    <!-- <div class="info-panel" v-if="!loading && logs.length > 0">
      <div class="info-item">
        <div class="info-icon">📊</div>
        <div class="info-text">
          <strong>Как читать журнал:</strong>
          <p>Свежие записи всегда вверху. Синие - создание, оранжевые - обновление.</p>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon">⚡</div>
        <div class="info-text">
          <strong>Автообновление</strong>
          <p>Журнал обновляется автоматически каждые 30 секунд</p>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { AuditService } from '@/services/logsService'

const logs = ref([])
const loading = ref(false)
const filterTable = ref('all')
const filterAction = ref('all')
const searchQuery = ref('')
const autoRefresh = ref(true)
const lastUpdateTime = ref('')

// Таймер для автообновления
let refreshInterval = null

// Загрузка данных
const loadData = async () => {
  try {
    loading.value = true
    logs.value = await AuditService.getAllAuditData()
    lastUpdateTime.value = getCurrentTime()
    console.log('✅ Журнал обновлен:', logs.value.length, 'записей')
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
  } finally {
    loading.value = false
  }
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Обновление данных
const refreshData = () => {
  console.log('🔄 Принудительное обновление журнала')
  loadData()
}

// Запуск автообновления
const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  refreshInterval = setInterval(() => {
    if (!loading.value) {
      console.log('⏰ Автообновление журнала')
      loadData()
    }
  }, 30000) // 30 секунд
}

// Остановка автообновления
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Следим за изменением autoRefresh
watch(autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// Фильтрованные логи
const filteredLogs = computed(() => {
  let filtered = [...logs.value]
  
  if (filterTable.value !== 'all') {
    filtered = filtered.filter(log => log.table_name === filterTable.value)
  }
  
  if (filterAction.value !== 'all') {
    filtered = filtered.filter(log => log.action === filterAction.value)
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.description.toLowerCase().includes(query)
    )
  }
  
  // Уже отсортированы в сервисе, но на всякий случай
  return filtered.sort((a, b) => b.timestamp - a.timestamp)
})

// Быстрые фильтры
const setFilterAction = (action) => {
  filterAction.value = action
}

// Статистика
const getCountByAction = (action) => {
  return logs.value.filter(log => log.action === action).length
}

// Форматирование дат
const formatDate = (dateString) => {
  if (!dateString) return 'Сегодня'
  try {
    const date = new Date(dateString)
    const today = new Date()
    
    // Если сегодня - показываем "Сегодня"
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    }
    
    // Если вчера - показываем "Вчера"
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    }
    
    // Иначе - дату
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    })
  } catch {
    return 'Сегодня'
  }
}

const formatTime = (dateString) => {
  if (!dateString) return 'сейчас'
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'сейчас'
  }
}

// Названия таблиц и действий
const getTableName = (table) => {
  const names = {
    users: 'Пользователи',
    events: 'Мероприятия',
    modules: 'Модули',
    groups: 'Группы',
    event_accounts: 'Учетные записи'
  }
  return names[table] || table
}

const getActionName = (action) => {
  const names = {
    created: 'Создание',
    updated: 'Обновление',
    deleted: 'Удаление' // На случай если добавим
  }
  return names[action] || action
}

// Очистка фильтров
const clearFilters = () => {
  filterTable.value = 'all'
  filterAction.value = 'all'
  searchQuery.value = ''
}

// Загрузка при монтировании
onMounted(() => {
  loadData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.audit-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Заголовок */
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.header-controls {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.stats-summary {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.table-badge.modules {
  background: #f3e8ff;
  color: #7c3aed;
}

.table-badge.groups {
  background: #f0f9ff;
  color: #0c4a6e;
}

.table-badge.event_accounts {
  background: #fef7cd;
  color: #854d0e;
}

.total-logs {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.last-update {
  font-size: 0.85rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
}

.auto-refresh-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Статистика действий */
.action-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-badge.created {
  border-top: 4px solid #3b82f6;
}

.stat-badge.updated {
  border-top: 4px solid #f59e0b;
}

.stat-badge.total {
  border-top: 4px solid #10b981;
}

.stat-count {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-badge.created .stat-count {
  color: #3b82f6;
}

.stat-badge.updated .stat-count {
  color: #f59e0b;
}

.stat-badge.total .stat-count {
  color: #10b981;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

/* Быстрые фильтры */
.quick-filters {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f1f5f9;
}

.filter-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.table-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.table-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  min-width: 150px;
  font-size: 0.9rem;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* Основная таблица */
.main-content {
  min-height: 400px;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.9rem;
}

.audit-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.9rem;
}

.audit-table tbody tr:hover {
  background: #f8fafc;
}

/* Стили для строк */
.log-row.action-created {
  background: rgba(59, 130, 246, 0.03);
}

.log-row.action-updated {
  background: rgba(245, 158, 11, 0.03);
}

/* Ячейки таблицы */
.timestamp-cell {
  white-space: nowrap;
}

.date {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.time {
  font-size: 0.85rem;
  color: #64748b;
}

.table-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.table-badge.users {
  background: #dbeafe;
  color: #1e40af;
}

.table-badge.events {
  background: #e0e7ff;
  color: #3730a3;
}

.action-indicator {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.action-indicator.created {
  background: #dbeafe;
  color: #1e40af;
}

.action-indicator.updated {
  background: #fef3c7;
  color: #92400e;
}

.description-cell {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.id-cell {
  text-align: center;
}

.record-id {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  color: #475569;
}

/* Футер таблицы */
.table-footer {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.showing-count {
  font-size: 0.85rem;
  color: #64748b;
}

/* Состояния */
.state-message {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.state-message p {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.state-message .hint {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.action-btn {
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #2563eb;
}

/* Информационная панель */
.info-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  align-items: flex-start;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-text strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.info-text p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>