<template>
  <main class="event-detail-page">
    <!-- Хлебные крошки и кнопка назад -->
    <header class="page-header">
      <button @click="goBack" class="back-button">
        ← К мероприятиям
      </button>
      <!-- 🔴 КНОПКИ ДЕЙСТВИЙ -->
        <div class="header-actions">
          <button @click="editEvent" class="action-btn edit-event-btn">
            ✏️ Редактировать
          </button>
          <button @click="deleteEvent" class="action-btn delete-event-btn">
            🗑️ Удалить
          </button>
        </div>
      <h1 class="event-name">{{ event?.name || 'Загрузка...' }}</h1>
      <div class="event-header-info">
        <time class="event-date">{{ formatDate(event?.date) }}</time>
        <span class="event-status" :class="getStatusClass(event?.status_id)">
          {{ event?.status?.name || '' }}
        </span>
      </div>
    </header>

    <!-- Основное содержимое -->
    <div class="event-content">
      <!-- Секция модулей -->
      <section class="modules-section">
        <header class="section-header">
          <h2>Модули</h2>
          <button class="add-button" @click="addModule">
            + Добавить модуль
          </button>
        </header>

        <section v-if="loadingModules" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка модулей...</p>
        </section>

        <section v-else-if="modulesError" class="error-state">
          <p>Ошибка: {{ modulesError }}</p>
        </section>

        <section v-else-if="modules.length === 0" class="empty-state">
          <p>Модулей пока нет</p>
        </section>

        <section v-else class="modules-grid">
          <article v-for="module in modules" :key="module.id" class="module-card">
            <header class="module-header">
              <h3>{{ module.name }}</h3>
              <span class="module-status" :class="getModuleStatusClass(module.status_id)">
                {{ module.status?.name || 'Неизвестно' }}
              </span>
            </header>
            
            <section class="module-info">
                <div class="module-type">
                    <span class="type-label">Тип:</span>
                    <span class="type-value">{{ module.type?.name || 'Не указан' }}</span>
                </div>
            </section>

            <footer class="module-actions">
              <button class="action-btn edit-btn" @click="editModule(module)">
                Редактировать
              </button>
              <button class="action-btn delete-btn" @click="deleteModule(module)">
                Удалить
              </button>
            </footer>
          </article>
        </section>
      </section>
      </div>

      <!-- Секция пользователей -->
      <section class="users-section">
      <header class="section-header">
        <h2>Пользователи</h2>
        <div class="users-header-controls">
          <!-- Кнопка добавления -->
          <button class="add-button" @click="addUser">
            + Добавить участника
          </button>
        </div>
      </header>

      <!-- Панель фильтров -->
      <section class="filters-panel">
        <form @submit.prevent="applyUserFilters" class="filters-form">
          <!-- Поиск по ФИО -->
          <fieldset class="filter-group">
            <label for="search">Поиск по ФИО:</label>
            <input
              id="search"
              type="text"
              v-model="userFilters.search"
              placeholder="Введите фамилию или имя..."
              @input="onSearchInput"
            />
          </fieldset>

          <!-- Фильтр по группе -->
          <fieldset class="filter-group">
            <label for="group">Группа:</label>
            <select 
              id="group" 
              v-model="userFilters.group"
              @change="applyUserFilters"
            >
              <option value="">Все группы</option>
              <option v-for="group in uniqueGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
          </fieldset>

          <!-- Фильтр по роли -->
          <fieldset class="filter-group">
            <label for="role">Роль:</label>
            <select 
              id="role" 
              v-model="userFilters.role"
              @change="applyUserFilters"
            >
              <option value="">Все роли</option>
              <option v-for="role in uniqueRoles" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
          </fieldset>

          <!-- Кнопки фильтров -->
          <fieldset class="filter-actions">
            <button type="button" @click="resetUserFilters" class="reset-btn">
              Сбросить
            </button>
            <button type="submit" class="apply-btn">
              Применить
            </button>
          </fieldset>
        </form>
      </section>

      <!-- Панель сортировки -->
      <section class="sort-panel">
        <span class="sort-label">Сортировка:</span>
        
        <button 
          @click="setSortBy('last_name')" 
          class="sort-btn"
          :class="{ active: usersSortBy === 'last_name' }"
        >
          По ФИО
          <span v-if="usersSortBy === 'last_name'" class="sort-icon">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        
        <button 
          @click="setSortBy('group')" 
          class="sort-btn"
          :class="{ active: usersSortBy === 'group' }"
        >
          По группе
          <span v-if="usersSortBy === 'group'" class="sort-icon">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        
        <button 
          @click="setSortBy('role')" 
          class="sort-btn"
          :class="{ active: usersSortBy === 'role' }"
        >
          По роли
          <span v-if="usersSortBy === 'role'" class="sort-icon">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
        
        <span class="sort-info">
          Найдено: {{ filteredUsers.length }} из {{ users.length }}
        </span>
      </section>

      <!-- Состояния загрузки -->
      <section v-if="loadingUsers" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка пользователей...</p>
      </section>

      <section v-else-if="usersError" class="error-state">
        <p>Ошибка: {{ usersError }}</p>
        <button @click="loadUsers" class="retry-btn">
          Попробовать снова
        </button>
      </section>

      <section v-else-if="filteredUsers.length === 0" class="empty-state">
        <p>Пользователей не найдено</p>
        <button @click="resetUserFilters" class="reset-btn">
          Сбросить фильтры
        </button>
      </section>

      <!-- Таблица пользователей -->
      <section v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th @click="setSortBy('last_name')" :class="{ 'sorted': usersSortBy === 'last_name' }">
                ФИО
                <span v-if="usersSortBy === 'last_name'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Логин</th>
              <th>Пароль</th>
              <th @click="setSortBy('group')" :class="{ 'sorted': usersSortBy === 'group' }">
                Группа
                <span v-if="usersSortBy === 'group'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="setSortBy('role')" :class="{ 'sorted': usersSortBy === 'role' }">
                Роль
                <span v-if="usersSortBy === 'role'" class="sort-indicator">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.id">
              <td>
                {{ user.last_name }} {{ user.first_name }} {{ user.middle_name || '' }}
              </td>
              <td>{{ getLoginForUser(user) }}</td>
              <td>{{ getPasswordForUser(user) }}</td>
              <td>{{ user.group?.number || '-' }}</td>
              <td>{{ user.role?.name || '-' }}</td>
              <td class="actions">
                <button class="action-btn edit-btn" @click="editUser(user)">
                  Редактировать
                </button>
                <button class="action-btn delete-btn" @click="deleteUser(user)">
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
    <Teleport to="body">
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal">
        <header class="modal-header">
            <h2>Редактировать мероприятие</h2>
            <button class="modal-close" @click="closeEditModal">×</button>
        </header>
        
        <form @submit.prevent="updateEvent" class="modal-form">
            <div class="form-group">
            <label for="edit-event-name">Название мероприятия *</label>
            <input
                id="edit-event-name"
                v-model="editEventData.name"
                type="text"
                placeholder="Введите название"
                required
                :disabled="updating"
            />
            </div>
            
            <div class="form-group">
            <label for="edit-event-date">Дата и время проведения *</label>
            <input
                id="edit-event-date"
                v-model="editEventData.date"
                type="datetime-local"
                required
                :disabled="updating"
            />
            </div>
            
            <div class="form-group">
            <label for="edit-event-status">Статус *</label>
            <select
                id="edit-event-status"
                v-model="editEventData.status_id"
                required
                :disabled="updating"
            >
                <option value="">Выберите статус</option>
                <option v-for="status in allStatuses" :key="status.id" :value="status.id">
                {{ status.name }}
                </option>
            </select>
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
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

// Данные мероприятия
const event = ref(null)
const loadingEvent = ref(true)
const eventError = ref('')

// 🔴 ПЕРЕМЕННЫЕ ДЛЯ РЕДАКТИРОВАНИЯ
const showEditModal = ref(false)
const updating = ref(false)
const editError = ref('')
const editEventData = ref({
  name: '',
  date: '',
  status_id: ''
})
const allStatuses = ref([]) // список всех статусов для селекта

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showEditModal.value) {
        closeEditModal()
    }
    }

    onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

// 🔴 ЗАГРУЗКА ВСЕХ СТАТУСОВ
const loadStatuses = async () => {
  try {
    const statuses = await EventsService.getStatuses()
    allStatuses.value = statuses
  } catch (error) {
    console.error('Ошибка загрузки статусов:', error)
    // Fallback
    allStatuses.value = [
      { id: 1, name: 'Запланирован' },
      { id: 2, name: 'Активен' },
      { id: 3, name: 'Завершен' }
    ]
  }
}

// 🔴 ОТКРЫТИЕ МОДАЛЬНОГО ОКНА РЕДАКТИРОВАНИЯ
const openEditModal = () => {

    console.log('🟢 openEditModal вызвана!', event.value)  // Добавьте эту строку
  if (!event.value) {
    console.warn('⚠️ event.value пуст!')
    return
  }
  
  // Заполняем форму текущими данными
  editEventData.value = {
    name: event.value.name,
    date: formatDateForEdit(event.value.date), // форматируем для datetime-local
    status_id: event.value.status_id.toString()
  }
  
  showEditModal.value = true
}

// 🔴 ФОРМАТИРОВАНИЕ ДАТЫ ДЛЯ ПОЛЯ datetime-local
const formatDateForEdit = (dateString) => {
  if (!dateString) return ''
  
  // Преобразуем из "YYYY-MM-DD HH:MM:SS" в "YYYY-MM-DDTHH:MM"
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 🔴 ПРОВЕРКА ВАЛИДНОСТИ ФОРМЫ
const isEditFormValid = computed(() => {
  return editEventData.value.name.trim() !== '' &&
         editEventData.value.date !== '' &&
         editEventData.value.status_id !== ''
})

const formatDateForAPI = (dateString) => {
  if (!dateString) return ''
  
  // Преобразуем из "YYYY-MM-DDTHH:MM" в "YYYY-MM-DD HH:MM:SS"
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:00`
}

const validateEditForm = () => {
  const errors = []
  
  if (!editEventData.value.name.trim()) {
    errors.push('Название мероприятия обязательно')
  }
  
  if (!editEventData.value.date) {
    errors.push('Дата проведения обязательна')
  } else {
    const selectedDate = new Date(editEventData.value.date)
    if (selectedDate < new Date()) {
      errors.push('Дата проведения не может быть в прошлом')
    }
  }
  
  if (!editEventData.value.status_id) {
    errors.push('Статус обязателен')
  }
  
  return errors
}


// 🔴 ОБНОВЛЕНИЕ МЕРОПРИЯТИЯ
const updateEvent = async () => {
    const validationErrors = validateEditForm()
    if (validationErrors.length > 0) {
        editError.value = validationErrors.join(', ')
        return
    }

    if (!isEditFormValid.value) return
    
    try {
        updating.value = true
        editError.value = ''
        
        // Форматируем данные для API
        const updateData = {
        name: editEventData.value.name.trim(),
        date: formatDateForAPI(editEventData.value.date), // тот же метод что и для создания
        status_id: parseInt(editEventData.value.status_id)
        }
        
        console.log('🔄 Обновляем мероприятие:', updateData)
        
        const updatedEvent = await EventsService.updateEvent(eventId, updateData)
        console.log('✅ Мероприятие обновлено:', updatedEvent)
        
        // Обновляем данные на странице
        event.value = updatedEvent
        
        // Закрываем модальное окно
        closeEditModal()
        
        // Уведомление
        alert('✅ Изменения сохранены!')
        
    } catch (error) {
        console.error('❌ Ошибка обновления мероприятия:', error)
        
        if (error.response?.status === 422) {
        editError.value = 'Проверьте правильность заполнения полей'
        } else if (error.response?.status === 401) {
        editError.value = 'Ошибка авторизации'
        } else {
        editError.value = error.message || 'Не удалось обновить мероприятие'
        }
        
    } finally {
        updating.value = false
    }
}

// 🔴 ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
const closeEditModal = () => {
  showEditModal.value = false
  editEventData.value = {
    name: '',
    date: '',
    status_id: ''
  }
  editError.value = ''
  updating.value = false
}

// Данные модулей
const modules = ref([])
const loadingModules = ref(false)
const modulesError = ref('')

// Данные пользователей
const users = ref([])
const eventAccounts = ref([])
const loadingUsers = ref(false)
const usersError = ref('')
const usersSortBy = ref('last_name')
const sortDirection = ref('asc')

// Фильтры пользователей
const userFilters = ref({
  search: '',
  group: '',
  role: ''
})

// Дебаунс для поиска
let searchTimeout = null

// Вычисляемые свойства
const uniqueGroups = computed(() => {
  const groups = users.value
    .map(user => user.group?.number)
    .filter(Boolean)
  return [...new Set(groups)].sort()
})

const uniqueRoles = computed(() => {
  const roles = users.value
    .map(user => user.role?.name)
    .filter(Boolean)
  return [...new Set(roles)].sort()
})

// 🔴 МЕТОД РЕДАКТИРОВАНИЯ МЕРОПРИЯТИЯ
const editEvent = () => {
  console.log('🟡 editEvent вызван, event:', event.value)
  
  if (!event.value) {
    console.warn('❌ event.value пуст, данные не загружены')
    alert('Данные мероприятия еще не загружены. Пожалуйста, подождите.')
    return
  }
  
  openEditModal()
}

// 🔴 МЕТОД УДАЛЕНИЯ МЕРОПРИЯТИЯ
const deleteEvent = async () => {
  if (!event.value) {
    console.error('❌ event.value пуст')
    return
  }
  
  const eventName = event.value.name || 'это мероприятие'
  
  if (!confirm(`Вы уверены, что хотите удалить мероприятие "${eventName}"?`)) {
    return
  }
  
  try {
    console.log(`🗑️ Удаляем мероприятие ${eventId}...`)
    
    // ✅ eventId, а не eventId.value (если eventId уже строка)
    await EventsService.deleteEvent(eventId)
    
    alert(`✅ Мероприятие "${eventName}" успешно удалено`)
    
    // Перенаправляем на страницу мероприятий
    router.push('/events')
    
  } catch (error) {
    console.error('❌ Ошибка удаления мероприятия:', error)
    
    // Более информативное сообщение об ошибке
    let errorMessage = 'Не удалось удалить мероприятие.'
    
    if (error.message.includes('не найдено')) {
      errorMessage = 'Мероприятие не найдено. Возможно, оно уже было удалено.'
    } else if (error.message.includes('прав')) {
      errorMessage = 'У вас нет прав на удаление этого мероприятия.'
    } else if (error.message.includes('активными')) {
      errorMessage = 'Нельзя удалить мероприятие, к которому привязаны модули или пользователи.'
    }
    
    alert(`❌ ${errorMessage}\n\nДетали: ${error.message}`)
  }
}


// Отфильтрованные пользователи (клиентская фильтрация)
const filteredUsers = computed(() => {
  if (!users.value.length) return []
  
  return users.value.filter(user => {
    // Фильтр по поиску (ФИО)
    if (userFilters.value.search) {
      const searchTerm = userFilters.value.search.toLowerCase()
      const fullName = `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.toLowerCase()
      if (!fullName.includes(searchTerm)) return false
    }
    
    // Фильтр по группе
    if (userFilters.value.group && user.group?.number !== userFilters.value.group) {
      return false
    }
    
    // Фильтр по роли
    if (userFilters.value.role && user.role?.name !== userFilters.value.role) {
      return false
    }
    
    return true
  })
})

// Отсортированные пользователи (после фильтрации)
const sortedUsers = computed(() => {
  if (!filteredUsers.value.length) return []
  
  return [...filteredUsers.value].sort((a, b) => {
    let aValue, bValue
    
    // Выбираем поле для сортировки
    switch (usersSortBy.value) {
      case 'last_name':
        aValue = `${a.last_name} ${a.first_name}`.toLowerCase()
        bValue = `${b.last_name} ${b.first_name}`.toLowerCase()
        break
        
      case 'group':
        aValue = a.group?.number || ''
        bValue = b.group?.number || ''
        break
        
      case 'role':
        aValue = a.role?.name || ''
        bValue = b.role?.name || ''
        break
        
      default:
        return 0
    }
    
    // Приводим к строке для сравнения
    aValue = String(aValue).toLowerCase()
    bValue = String(bValue).toLowerCase()
    
    // Сравниваем значения с учетом направления сортировки
    let comparison = 0
    
    if (aValue < bValue) {
      comparison = -1
    } else if (aValue > bValue) {
      comparison = 1
    }
    
    // Если сортируем по убыванию, инвертируем результат
    return sortDirection.value === 'desc' ? -comparison : comparison
  })
})

// Загрузка данных мероприятия
const loadEvent = async () => {
  try {
    loadingEvent.value = true
    event.value = await EventsService.getEventById(eventId)
    console.log('✅ Мероприятие загружено:', event.value)
  } catch (error) {
    console.error('❌ Ошибка загрузки мероприятия:', error)
    eventError.value = error.message || 'Не удалось загрузить мероприятие'
  } finally {
    loadingEvent.value = false
  }
}

// Загрузка модулей мероприятия
const loadModules = async () => {
  try {
    loadingModules.value = true
    modules.value = await EventsService.getEventModules(eventId)
    console.log('✅ Модули загружены:', modules.value)
  } catch (error) {
    console.error('❌ Ошибка загрузки модулей:', error)
    modulesError.value = error.message || 'Не удалось загрузить модули'
  } finally {
    loadingModules.value = false
  }
}

// Загрузка пользователей и их учетных записей
const loadUsers = async () => {
  try {
    loadingUsers.value = true
    
    // Подготавливаем фильтры для API
    const apiFilters = {}
    
    // Если нужно фильтровать по ролям на сервере
    if (userFilters.value.role) {
      apiFilters.roles = userFilters.value.role
    }
    
    // Загружаем пользователей с фильтрами
    const usersData = await EventsService.getEventUsers(eventId, apiFilters)
    users.value = usersData
    console.log('✅ Пользователи загружены:', users.value)
    
    // Загружаем учетные записи
    try {
      const accountsData = await EventsService.getEventAccounts(eventId, apiFilters)
      eventAccounts.value = accountsData
      console.log('✅ Учетные записи загружены:', eventAccounts.value)
    } catch (accountsError) {
      console.warn('⚠️ Не удалось загрузить учетные записи:', accountsError)
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки пользователей:', error)
    usersError.value = error.message || 'Не удалось загрузить пользователей'
  } finally {
    loadingUsers.value = false
  }
}

// Методы для фильтрации
const applyUserFilters = () => {
  console.log('Применяем фильтры:', userFilters.value)
  // Для простоты используем клиентскую фильтрацию
  // Если нужно серверную - вызываем loadUsers()
}

const resetUserFilters = () => {
  userFilters.value = {
    search: '',
    group: '',
    role: ''
  }
  console.log('Фильтры сброшены')
}

const onSearchInput = () => {
  // Дебаунс для поиска
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    applyUserFilters()
  }, 500)
}

// Поиск логина для пользователя
const getLoginForUser = (user) => {
  const account = eventAccounts.value.find(acc => acc.user_id === user.id)
  return account?.login || '—'
}

// Поиск пароля для пользователя
const getPasswordForUser = (user) => {
  const account = eventAccounts.value.find(acc => acc.user_id === user.id)
  return account?.password ? '••••••••' : '—'
}

// Методы для сортировки
const setSortBy = (field) => {
  if (usersSortBy.value === field) {
    // Если уже сортируем по этому полю, меняем направление
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Если новое поле, сортируем по возрастанию
    usersSortBy.value = field
    sortDirection.value = 'asc'
  }
  
  console.log(`📊 Сортировка по ${field} (${sortDirection.value})`)
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  console.log(`🔄 Направление сортировки: ${sortDirection.value}`)
}

// Вспомогательные функции
const formatDate = (dateString) => {
  if (!dateString) return ''
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

const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',
    2: 'status-active',
    3: 'status-completed'
  }
  return classes[statusId] || 'status-unknown'
}

const getModuleStatusClass = (statusId) => {
  const classes = {
    1: 'module-status-planned',
    2: 'module-status-active',
    3: 'module-status-completed'
  }
  return classes[statusId] || 'module-status-unknown'
}

// Обработчики действий
const goBack = () => {
  router.push('/events')
}

const addModule = () => {
  console.log('Добавить модуль')
  alert('Функция добавления модуля в разработке')
}

const editModule = (module) => {
  console.log('Редактировать модуль:', module)
  alert('Функция редактирования модуля в разработке')
}

const deleteModule = (module) => {
  console.log('Удалить модуль:', module)
  if (confirm(`Удалить модуль "${module.name}"?`)) {
    alert('Функция удаления модуля в разработке')
  }
}

const addUser = () => {
  console.log('Добавить пользователя')
  alert('Функция добавления пользователя в разработке')
}

const editUser = (user) => {
  console.log('Редактировать пользователя:', user)
  alert('Функция редактирования пользователя в разработке')
}

const deleteUser = (user) => {
  console.log('Удалить пользователя:', user)
  if (confirm(`Удалить пользователя ${user.last_name} ${user.first_name}?`)) {
    alert('Функция удаления пользователя в разработке')
  }
}

// Загрузка всех данных
const loadAllData = async () => {
  await Promise.all([
    loadEvent(),
    loadModules(),
    loadUsers()
  ])
}

onMounted(async () => {
  console.log(`🚀 Загружаем детальную страницу мероприятия ID: ${eventId}`)
  await loadStatuses() // загружаем статусы
  await loadAllData()
})
</script>

<style scoped>
/* Основные стили страницы */
.event-detail-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 3rem;
}

.back-button {
  background: none;
  border: none;
  color: #2E80ED;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  text-decoration: underline;
}

.event-name {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.event-header-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.event-date {
  color: #666;
  font-size: 1rem;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-planned {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-active {
  background: #D1FAE5;
  color: #065F46;
}

.status-completed {
  background: #F3F4F6;
  color: #374151;
}

/* 🔴 СТИЛИ ДЛЯ КНОПОК В ЗАГОЛОВКЕ */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-event-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.edit-event-btn:hover {
  background: #e5e7eb;
}

.delete-event-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.delete-event-btn:hover {
  background: #fee2e2;
}

/* Секции */
.event-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.users-header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-control label {
  font-size: 0.9rem;
  color: #666;
}

.sort-control select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.sort-control select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

/* Кнопки */
.add-button {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.add-button:hover {
  background: #1E6FD9;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.edit-btn {
  background: #f3f4f6;
  color: #374151;
}

.edit-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

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

/* Модули */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.module-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.module-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  flex: 1;
}

.module-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.module-status-active {
  background: #D1FAE5;
  color: #065F46;
}

.module-status-planned {
  background: #DBEAFE;
  color: #1E40AF;
}

.module-status-completed {
  background: #F3F4F6;
  color: #374151;
}

.module-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Стили для информации о типе модуля */
.module-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.module-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
}

.type-value {
  color: #2c3e50;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* Стили для сортировки */
.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-direction-btn {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  min-width: 36px;
  transition: all 0.2s;
}

.sort-direction-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Стили для заголовков таблицы с сортировкой */
.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.users-table th:hover {
  background-color: #f1f5f9;
}

.users-table th.sorted {
  background-color: #e0f2fe;
  color: #0369a1;
}

.sort-indicator {
  margin-left: 0.25rem;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Подсветка активного поля сортировки в select */
.sort-control select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

/* Пользователи */
.users-table-container {
  background: white;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.users-table tbody tr {
  border-bottom: 1px solid #eef2f7;
  transition: background 0.2s;
}

.users-table tbody tr:hover {
  background: #f8fafc;
}

.users-table td {
  padding: 1rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.users-table td.actions {
  white-space: nowrap;
  display: flex;
  gap: 0.5rem;
}

/* Состояния загрузки и ошибок */
.loading-state,
.error-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  color: #6b7280;
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
  border-color: #fca5a5;
  color: #dc2626;
}

.empty-state {
  background: #f8fafc;
  border-color: #d1d5db;
  color: #6b7280;
}

/* 🔴 СТИЛИ МОДАЛЬНОГО ОКНА */
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
  position: relative;
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
  background-color: #f3f4f6;
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
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
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

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:disabled {
    position: relative;
    color: transparent;
}

.submit-btn:disabled::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: button-spinner 0.8s linear infinite;
}

@keyframes button-spinner {
  to { transform: rotate(360deg); }
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>