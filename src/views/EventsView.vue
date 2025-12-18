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
        <form @submit.prevent class="filters-form">
            <!-- Поле поиска -->
            <fieldset class="filter-group">
            <label for="search">Поиск по названию:</label>
            <input
                id="search"
                type="text"
                v-model="filters.search"
                placeholder="Введите название..."
                @input="applyFilters"
            />
            </fieldset>

            <!-- Фильтр по статусу -->
            <fieldset class="filter-group">
            <label for="status">Статус:</label>
            <select 
                id="status" 
                v-model="filters.statusId"
                @change="applyFilters">
                <option value="">Все статусы</option>
                <option v-for="status in statuses" :key="status.id" :value="status.id">
                    {{ status.name }}
                </option>
            </select>
            </fieldset>

            <!-- Кнопки действий -->
            <fieldset class="filter-actions">
            <button type="button" @click="resetFilters" class="reset-btn">
                Сбросить
            </button>
            </fieldset>
        </form>
    </section>

    <section v-if="!loading && !error && events.length > 0" class="sort-panel">
        <span class="sort-label">Сортировка:</span>
        
        <button 
            @click="sortBy('date')" 
            class="sort-btn"
            :class="{ active: sortField === 'date' }"
        >
            По дате
        </button>
        
        <button 
            @click="sortBy('name')" 
            class="sort-btn"
            :class="{ active: sortField === 'name' }"
        >
            По названию
        </button>
        
        <!--<button 
            @click="sortBy('status')" 
            class="sort-btn"
            :class="{ active: sortField === 'status' }"
        >
            По статусу
        </button>-->
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
            v-for="event in sortedEvents" 
            :key="event.id" 
            class="event-card"
            @click="goToEvent(event.id)"
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
      <button class="create-button" @click="showCreateModal = true">
        <span class="plus-icon">+</span> Создать мероприятие
      </button>
    </footer>
    <!-- 🔴 МОДАЛЬНОЕ ОКНО СОЗДАНИЯ МЕРОПРИЯТИЯ -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <h2>Создать новое мероприятие</h2>
            <button class="modal-close" @click="closeModal">×</button>
          </header>
          
          <form @submit.prevent="createEvent" class="modal-form">
            <div class="form-group">
              <label for="event-name">Название мероприятия *</label>
              <input
                id="event-name"
                v-model="newEvent.name"
                type="text"
                placeholder="Например: Демонстрационный экзамен группы 9901"
                required
                :disabled="creating"
              />
            </div>
            
            <div class="form-group">
              <label for="event-date">Дата и время проведения *</label>
              <input
                id="event-date"
                v-model="newEvent.date"
                type="datetime-local"
                required
                :disabled="creating"
              />
              <small class="form-hint">Укажите дату и время начала мероприятия</small>
            </div>
            
            <div class="form-group">
              <label for="event-status">Статус *</label>
              <select
                id="event-status"
                v-model="newEvent.status_id"
                required
                :disabled="creating"
              >
                <option value="">Выберите статус</option>
                <option v-for="status in statuses" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group" v-if="createError">
              <div class="error-message">
                <strong>Ошибка:</strong> {{ createError }}
              </div>
            </div>
            
            <footer class="modal-footer">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="closeModal"
                :disabled="creating"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="creating || !isFormValid"
              >
                <span v-if="creating">Создание...</span>
                <span v-else>Создать мероприятие</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'

const router = useRouter()
const events = ref([])
const statuses = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')

// Фильтры
const filters = ref({
  search: '',
  statusId: ''
})

// Сортировка
const sortField = ref('date') // 'date', 'name', 'status'
const sortDirection = ref('asc') // 'asc', 'desc'

// Дебаунс для поиска
let searchTimeout = null

// Вычисляемое свойство - отсортированные мероприятия
const sortedEvents = computed(() => {
  if (!events.value.length) return []
  
  return [...events.value].sort((a, b) => {
    let aValue, bValue
    
    // Выбираем поле для сортировки
    switch (sortField.value) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      /*case 'status':
        aValue = a.status.name.toLowerCase()
        bValue = b.status.name.toLowerCase()
        break*/
      default:
        return 0
    }
    
    // Сравниваем значения
    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })
})

const goToEvent = (eventId) => {
  console.log(`Переходим к мероприятию ${eventId}`)
  router.push(`/events/${eventId}`)
}

// Данные нового мероприятия
const newEvent = ref({
  name: '',
  date: '',
  status_id: '' // по умолчанию пустое
})

// Проверка валидности формы
const isFormValid = computed(() => {
  return newEvent.value.name.trim() !== '' &&
         newEvent.value.date !== '' &&
         newEvent.value.status_id !== ''
})

// 🔴 МЕТОД СОЗДАНИЯ МЕРОПРИЯТИЯ
const createEvent = async () => {
  if (!isFormValid.value) return
  
  try {
    creating.value = true
    createError.value = ''
    
    console.log('🔄 Начинаем создание мероприятия...')
    
    // Форматируем дату для API (если нужно)
    const eventData = {
      name: newEvent.value.name.trim(),
      date: formatDateForAPI(newEvent.value.date),
      status_id: parseInt(newEvent.value.status_id)
    }
    
    console.log('📤 Отправляем данные:', eventData)
    
    // Вызываем метод из EventsService
    const createdEvent = await EventsService.createEvent(eventData)
    console.log('✅ Мероприятие создано успешно:', createdEvent)
    
    // Закрываем модальное окно
    closeModal()
    
    // Обновляем список мероприятий
    await loadEvents()
    
    // Простое уведомление (можно заменить на красивый toast позже)
    alert(`✅ Мероприятие "${createdEvent.name}" успешно создано!`)
    
    // Опционально: автоматически переходим на созданное мероприятие
    // router.push(`/events/${createdEvent.id}`)
    
  } catch (error) {
    console.error('❌ Ошибка при создании мероприятия:', error)
    
    // Обработка разных типов ошибок
    if (error.response?.status === 422) {
      // Валидационные ошибки Laravel
      const errors = error.response.data.errors
      createError.value = Object.values(errors).flat().join(', ')
    } else if (error.response?.status === 401) {
      createError.value = 'Ошибка авторизации. Пожалуйста, войдите снова.'
    } else if (error.message === 'Network Error') {
      createError.value = 'Ошибка сети. Проверьте подключение к серверу.'
    } else {
      createError.value = error.message || 'Не удалось создать мероприятие'
    }
    
  } finally {
    creating.value = false
  }
}

// 🔴 ФОРМАТИРОВАНИЕ ДАТЫ ДЛЯ API
const formatDateForAPI = (dateString) => {
  if (!dateString) return ''
  
  // Просто возвращаем timestamp в миллисекундах
  const timestamp = new Date(dateString).getTime()
  console.log('📅 Timestamp:', timestamp)
  return timestamp
}

// 🔴 ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
const closeModal = () => {
  showCreateModal.value = false
  // Сбрасываем форму
  newEvent.value = {
    name: '',
    date: '',
    status_id: ''
  }
  createError.value = ''
  creating.value = false
}

// Загрузка статусов из API
const loadStatuses = async () => {
  try {
    console.log('🏷️ Загружаем статусы мероприятий...')
    // 🔴 ПЕРЕДАЕМ КОНТЕКСТ 'event' для фильтрации
    const data = await EventsService.getStatuses('event')
    statuses.value = data
    console.log('✅ Статусы мероприятий загружены:', data)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки статусов:', error)
    // Fallback если API не работает
    statuses.value = [
      { id: 1, name: 'Запланирован' },
      { id: 2, name: 'Активен' },
      { id: 3, name: 'Завершен' }
    ]
  }
}

// Методы для фильтров
const applyFilters = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    loadEvents()
  }, 500)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    statusId: ''
  }
  loadEvents()
}

// Функция сортировки
const sortBy = (field) => {
  if (sortField.value === field) {
    // Если уже сортируем по этому полю, меняем направление
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Если новое поле, сортируем по возрастанию
    sortField.value = field
    sortDirection.value = 'asc'
  }
  
  console.log(`📊 Сортировка по ${field} (${sortDirection.value})`)
}

// Получение читаемого названия сортировки
const getSortLabel = (field) => {
  const labels = {
    'date': 'дате',
    'name': 'названию', 
    'status': 'статусу'
  }
  return labels[field] || field
}

// Watcher для автоматического применения фильтров
watch(
  () => filters.value,
  (newFilters, oldFilters) => {
    const hasChanged = 
      newFilters.search !== oldFilters.search ||
      newFilters.statusId !== oldFilters.statusId
    
    if (hasChanged) {
      applyFilters()
    }
  },
  { deep: true }
)

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

// Классы для карточек статусов
const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',
    2: 'status-active',
    3: 'status-completed'
  }
  return classes[statusId] || 'status-unknown'
}

// Классы для бейджей статусов
const getStatusBadgeClass = (statusId) => {
  const classes = {
    1: 'badge-planned',
    2: 'badge-active',
    3: 'badge-completed'
  }
  return classes[statusId] || 'badge-unknown'
}

// Загрузка мероприятий
const loadEvents = async () => {
  console.log('🔄 Загружаем мероприятия...')
  
  try {
    loading.value = true
    error.value = ''
    
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
onMounted(async () => {
  await loadStatuses()
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #eef2f7;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #64748b;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fca5a5;
  font-size: 0.9rem;
}

.error-message strong {
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eef2f7;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  background: #2E80ED;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #1E6FD9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #94a3b8;
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

/* Панель сортировки */
.sort-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: #F8FAFC;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.sort-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4B5563;
  margin-right: 0.5rem;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #2E80ED;
  color: #2E80ED;
}

.sort-btn.active {
  background: #2E80ED;
  color: white;
  border-color: #2E80ED;
}

.sort-btn.active:hover {
  background: #1E6FD9;
}

.sort-icon {
  font-weight: bold;
  font-size: 1rem;
}

.sort-info {
  margin-left: auto;
  font-size: 0.85rem;
  color: #6B7280;
  font-style: italic;
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