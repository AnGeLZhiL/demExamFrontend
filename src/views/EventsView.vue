<template>
  <main class="events-page">
    <!-- Заголовок страницы -->
    <header class="page-header">
      <h1 class="page-title">Активные мероприятия</h1>
      <p class="page-subtitle" v-if="!loading && events.length > 0">
        Найдено мероприятий: {{ events.length }}
      </p>
    </header>

    <section class="filters-panel">
        <form @submit.prevent="applyFilters" class="filters-form">
            <!-- Поле поиска -->
            <fieldset class="filter-group">
            <label for="search">Поиск по названию:</label>
            <input
                id="search"
                type="text"
                v-model="filters.search"
                placeholder="Введите название..."
            />
            </fieldset>

            <!-- Фильтр по статусу -->
            <fieldset class="filter-group">
            <label for="status">Статус:</label>
            <select id="status" v-model="filters.statusId">
                <option value="">Все статусы</option>
                <option value="1">Запланирован</option>
                <option value="2">Активен</option>
                <option value="3">Завершен</option>
            </select>
            </fieldset>

            <!-- Кнопки действий -->
            <fieldset class="filter-actions">
            <button type="submit" class="apply-btn">
                Применить
            </button>
            <button type="button" @click="resetFilters" class="reset-btn">
                Сбросить
            </button>
            </fieldset>
        </form>
    </section>

    <!-- Контент страницы -->
    <section class="page-content">
      <!-- Состояние загрузки -->
      <section v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка мероприятий...</p>
      </section>

      <!-- Если ошибка -->
      <section v-else-if="error" class="error-state">
        <p class="error-message">⚠️ {{ error }}</p>
        <button @click="loadEvents" class="retry-btn">
          Попробовать снова
        </button>
      </section>

      <!-- Если список пуст -->
      <section v-else-if="events.length === 0" class="empty-state">
        <p>Нет активных мероприятий</p>
        <button @click="loadEvents" class="reload-btn">
          Обновить список
        </button>
      </section>

      <!-- Список мероприятий -->
      <section v-else class="events-list">
        <article 
          v-for="event in events" 
          :key="event.id" 
          class="event-card"
          :class="getStatusClass(event.status.id)"
        >
          <header class="event-header">
            <h2 class="event-title">{{ event.name }}</h2>
            <span class="event-status" :class="getStatusBadgeClass(event.status.id)">
              {{ event.status.name }}
            </span>
          </header>
          
          <section class="event-details">
            <time class="event-date">{{ formatDate(event.date) }}</time>
          </section>
        </article>
      </section>
    </section>

    <!-- Кнопка создания -->
    <footer class="page-footer">
      <hr class="divider" />
      <button class="create-button">
        <span class="plus-icon">+</span> Создать мероприятие
      </button>
    </footer>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { EventsService } from '@/services/eventsService'

const events = ref([])
const loading = ref(false)
const error = ref('')

// Фильтры
const filters = ref({
  search: '',
  statusId: ''
})

// Методы для фильтров
const applyFilters = () => {
  loadEvents()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    statusId: ''
  }
  loadEvents()
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Дата не указана'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// Классы для статусов
const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',    // Запланирован
    2: 'status-active',     // Активен
    3: 'status-completed'   // Завершен
  }
  return classes[statusId] || 'status-unknown'
}

const getStatusBadgeClass = (statusId) => {
  const classes = {
    1: 'badge-planned',    // Запланирован
    2: 'badge-active',     // Активен  
    3: 'badge-completed'   // Завершен
  }
  return classes[statusId] || 'badge-unknown'
}

// Обновляем loadEvents для поддержки фильтров
const loadEvents = async () => {
  console.log('🔄 Загружаем мероприятия...')
  
  try {
    loading.value = true
    error.value = ''
    
    // Передаем фильтры в сервис
    const data = await EventsService.getEvents({
      search: filters.value.search || undefined,
      statusId: filters.value.statusId || undefined
    })
    
    if (data && Array.isArray(data)) {
      events.value = data
      console.log(`✅ Загружено ${data.length} мероприятий`)
    } else {
      error.value = 'Получены некорректные данные'
    }
    
  } catch (err) {
    console.error('❌ Ошибка загрузки:', err)
    
    // Определяем тип ошибки
    if (err.response?.status === 401) {
      error.value = 'Ошибка авторизации. Пожалуйста, войдите снова.'
    } else if (err.response?.status === 404) {
      error.value = 'Сервер не найден. Проверьте подключение.'
    } else if (err.message === 'Network Error') {
      error.value = 'Ошибка сети. Проверьте подключение к интернету.'
    } else {
      error.value = `Ошибка: ${err.message || 'Неизвестная ошибка'}`
    }
    
  } finally {
    loading.value = false
  }
}

// Автоматическая загрузка при входе
onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
/* Страница мероприятий */
.events-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Заголовок страницы */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
}

/* Основной контент */
.page-content {
  margin-bottom: 2rem;
  min-height: 300px; /* Чтобы не прыгало при загрузке */
}

/* Состояние загрузки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2E80ED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Состояние ошибки */
.error-state {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.error-message {
  color: #DC2626;
  font-weight: 500;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #B91C1C;
}

/* Пустое состояние */
.empty-state {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #64748B;
}

.reload-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.reload-btn:hover {
  background: #1E6FD9;
}

/* Сетка мероприятий */
.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Карточка мероприятия */
.event-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f7;
  border-left: 4px solid #eef2f7;
}

.event-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

/* Классы статусов для карточек */
.status-planned {
  border-left-color: #3B82F6; /* Синий */
}

.status-active {
  border-left-color: #10B981; /* Зеленый */
}

.status-completed {
  border-left-color: #6B7280; /* Серый */
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

/* Бейджи статусов */
.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.badge-planned {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.badge-active {
  background-color: #D1FAE5;
  color: #065F46;
}

.badge-completed {
  background-color: #F3F4F6;
  color: #374151;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-date {
  font-size: 1rem;
  color: #666;
  font-weight: 400;
}

/* Футер страницы */
.page-footer {
  margin-top: 3rem;
  padding-top: 2rem;
}

.divider {
  border: none;
  border-top: 1px solid #e0e6ed;
  margin: 0 0 2rem 0;
}

/* Кнопка создания */
.create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #2E80ED 0%, #1E6FD9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46, 128, 237, 0.2);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 128, 237, 0.3);
}

.plus-icon {
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 300;
}

/* Стили для фильтров */
.filters-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef2f7;
}

.filters-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4B5563;
}

.filter-group input,
.filter-group select {
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.filter-actions {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 0.5rem;
  align-self: flex-end;
}

.apply-btn,
.reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn {
  background: #2E80ED;
  color: white;
}

.apply-btn:hover {
  background: #1E6FD9;
}

.reset-btn {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.reset-btn:hover {
  background: #E5E7EB;
}
</style>