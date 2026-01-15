<template>
  <main class="event-detail-page">
    <!-- Хлебные крошки и кнопка назад -->
    <header class="page-header ">
      <button @click="goBack" class="back-button">
        ← К мероприятиям
      </button>
      <!-- 🔴 КНОПКИ ДЕЙСТВИЙ -->
        <div class="header-actions header-top">
          <button @click="editEvent" class="action-btn edit-event-btn">
            Редактировать
          </button>
          <button @click="deleteEvent" class="action-btn delete-event-btn">
            Удалить
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
            <article 
                v-for="module in modules" 
                :key="module.id" 
                class="module-card"
                @click="goToModule(module.id)"
                :title="`Кликните для перехода в модуль ${module.name}`"
            >
            <header class="module-header">
              <h3>{{ module.name }}</h3>
              <span class="module-status" :class="getModuleStatusClass(module)">
  {{ module.status?.name || 'Неизвестно' }}
</span>
            </header>
            <div class="module-hover-indicator">
                <span class="hover-text">Перейти в модуль →</span>
            </div>
          </article>
        </section>
      </section>


      <!-- Секция пользователей -->
      <section class="users-section">
      <header class="section-header">
        <h2>Пользователи</h2>
        <div class="users-header-controls">
          <!-- Кнопка добавления -->
          <button class="add-button" @click="addUser">
            + Добавить участника
          </button>
          <button class="add-group-button" @click="addGroupUsers">
            + Добавить группу
          </button>
          <!-- Кнопка генерации мест -->
            <div class="generate-seats-wrapper" v-if="hasParticipants">
            <button 
                class="generate-seats-btn"
                @click="generateSeats"
                :disabled="loadingUsers"
            >
                Назначить места
                <span class="participants-count">
                ({{ participantsCount }} уч.)
                </span>
            </button>
            <small class="hint">
                Участники получат номера 1-{{ participantsCount }}
            </small>
            </div>
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

      

      <div class="export-options">
        <button 
          @click="exportToWord"
          class="action-btn export-btn"
          :disabled="exporting"
          title="Экспорт всех участников в Word документ"
        >
          <span v-if="exporting">
            <span class="loading-dots">
              <span></span><span></span><span></span>
            </span>
            Создание документа...
          </span>
          <span v-else>
            📋 Экспорт в Word (.docx)
          </span>
        </button>
      </div>

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

        <button 
            @click="setSortBy('seat_number')" 
            class="sort-btn"
            :class="{ active: usersSortBy === 'seat_number' }"
            >
            По месту
            <span v-if="usersSortBy === 'seat_number'" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
        </button>
        
        <span class="sort-info">
          Найдено: {{ filteredUsers.length }} из {{ users.length }}
        </span>
      </section>

      <!-- 🔴 ДОБАВЬТЕ ЭТУ СЕКЦИЮ ДЛЯ КНОПКИ ПОКАЗА ПАРОЛЕЙ -->
        <section class="password-controls" v-if="hasAccounts">
            <button 
            @click="togglePasswords" 
            class="toggle-passwords-btn"
            :class="{ 'active': showPasswords }"
            type="button"
            >
            <span v-if="!showPasswords">Показать все пароли</span>
            <span v-else>Скрыть все пароли</span>
            <span class="password-hint" v-if="!showPasswords">
                (будут скрыты через 30 секунд)
            </span>
            </button>
            
            <div class="password-info" v-if="showPasswords">
            <span class="password-warning">Все пароли видны</span>
            <span class="password-timer" v-if="passwordTimer > 0">
                Автоматическое скрытие через: {{ passwordTimer }} сек.
            </span>
            </div>
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
              <th @click="setSortBy('seat_number')" :class="{ 'sorted': usersSortBy === 'seat_number' }">
                    Место
                    <span v-if="usersSortBy === 'seat_number'" class="sort-indicator">
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
              <td :class="['password-cell', getPasswordCellClass(user)]">
                    <template v-if="user.login">
                        <span class="password-value">
                        {{ getPasswordForUser(user) }}
                        </span>
                        <button 
                        v-if="!(showPasswords || visiblePasswords[user.id])"
                        class="show-one-btn"
                        @click.stop="showUserPassword(user.id)"
                        title="Показать пароль (будет скрыт через 30 секунд)"
                        >
                        👁️
                        </button>
                    </template>
                    <span v-else>—</span>
                </td>
              <td>{{ user.group?.number || '-' }}</td>
              <td>{{ user.role_in_event?.name || '-' }}</td>
              <td :class="{ 'sorted-cell': usersSortBy === 'seat_number' }">
                <!-- Место показываем только для участников -->
                <template v-if="isParticipant(user)">
                <span v-if="user.seat_number" class="seat-badge">
                    {{ user.seat_number }}
                </span>
                <span v-else class="no-seat">-</span>
                </template>
                <span v-else class="not-applicable">—</span>
            </td>
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
    </div>
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
    <SimpleAddUserModal
        :show="showAddUserModal"
        @close="showAddUserModal = false"
        :event-id="eventId"
        @user-added="handleUserAdded"
    />
    <MassAddUsersModal
      :show="showMassAddUsersModal"
      @close="showMassAddUsersModal = false"
      :event-id="eventId"
      @users-added="handleMassUsersAdded"
    />
    <EditUserModal
        v-if="selectedUser"
        :show="showEditUserModal"
        :user="selectedUser"
        :event-id="eventId"
        @close="showEditUserModal = false"
        @saved="handleUserSaved"
    />
    <CreateModuleModal
        :show="showCreateModuleModal"
        :event-id="eventId"
        :module="selectedModule"
        @close="handleModuleModalClose"
        @created="handleModuleCreated"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'
import SimpleAddUserModal from '@/components/SimpleAddUserModal.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import CreateModuleModal from '@/components/CreateModuleModal.vue'
import MassAddUsersModal from '@/components/MassAddUsersModal.vue'
import ModuleBulkService from '@/services/ModuleBulkService'
import WordExportService  from '@/services/wordExportService'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

const exporting = ref(false)

// Данные мероприятия
const event = ref(null)
const loadingEvent = ref(true)
const eventError = ref('')

//данные для модуля
const showCreateModuleModal = ref(false)
const selectedModule = ref(null)

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

const showEditUserModal = ref(false)
const selectedUser = ref(null)

const showMassAddUsersModal = ref(false)

const hasAccounts = computed(() => {
  return users.value.some(user => user.login)
})

const addGroupUsers = () => {
  console.log('🟢 Открываем модалку добавления группы')
  showMassAddUsersModal.value = true
}

const handleMassUsersAdded = async (result) => {
  console.log('✅ Пользователи добавлены массово:', result)
  
  // Перезагружаем пользователей
  await loadUsers()
  
  // Показываем уведомление
  alert(`✅ Успешно добавлено ${result.count} пользователей из группы!`)
}

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
    clearTimeout(searchTimeout)
    if (passwordTimerInterval) {
        clearInterval(passwordTimerInterval)
    }
})

const generateSeats = async () => {
  // Получаем только участников
  let participants = users.value
    .filter(user => {
      const roleName = user.role_in_event?.name?.toLowerCase() || ''
      return roleName.includes('участник') || roleName === 'участник'
    })
  
  if (participants.length === 0) {
    alert('❌ Нет участников для генерации мест')
    return
  }
  
  // Создаем массив мест
  const seatNumbers = Array.from({ length: participants.length }, (_, i) => (i + 1).toString())
  
  // Перемешиваем участников случайным образом
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  
  // Перемешиваем и участников, и места
  const shuffledParticipants = shuffleArray(participants)
  const shuffledSeats = shuffleArray(seatNumbers)
  
  // Подтверждение
  const message = `Назначить случайные места ${participants.length} участникам?\n\n` +
                 `Участники получат места от 1 до ${participants.length}\n` +
                 `в ПОЛНОСТЬЮ случайном порядке.\n` +
                 `Существующие места будут перезаписаны.`
  
  if (!confirm(message)) {
    return
  }
  
  try {
    console.log('Полностью случайное распределение:')
    console.log('Участники (перемешанные):', shuffledParticipants.map(p => p.last_name))
    console.log('Места (перемешанные):', shuffledSeats)
    
    // Создаем обновления - случайный участник получает случайное место
    const updates = shuffledParticipants.map((user, index) => ({
      userId: user.id,
      userName: `${user.last_name} ${user.first_name}`,
      currentSeat: user.seat_number || 'не назначено',
      newSeat: shuffledSeats[index]
    }))
    
    // Показываем превью
    const preview = updates
      .sort((a, b) => parseInt(a.newSeat) - parseInt(b.newSeat)) // сортируем по местам для удобства
      .map(u => `${u.newSeat}. ${u.userName} (было: ${u.currentSeat})`)
      .join('\n')
    
    if (!confirm(`Случайное распределение мест:\n\n${preview}\n\nПродолжить?`)) {
      return
    }
    
    // Выполняем обновления
    let successCount = 0
    let errorCount = 0
    
    for (const update of updates) {
      try {
        await EventsService.updateUserSeat(eventId, update.userId, update.newSeat)
        console.log(`✅ ${update.newSeat}. ${update.userName}`)
        successCount++
      } catch (error) {
        console.error(`Ошибка для ${update.userName}:`, error)
        errorCount++
      }
    }
    
    // Результат
    if (errorCount === 0) {
      alert(`✅ Успешно! Случайные места назначены ${successCount} участникам.`)
    } else {
      alert(`Назначены места для ${successCount} участников, ошибок: ${errorCount}`)
    }
    
    // Перезагружаем данные
    await loadUsers()
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error)
    alert('Не удалось сгенерировать места')
  }
}

// 🔴 ЗАГРУЗКА ВСЕХ СТАТУСОВ
const loadStatuses = async () => {
  try {
    const statuses = await EventsService.getStatuses({ context_id: 1 })
    // Удаляем дубликаты по id
    const uniqueStatuses = Array.from(
      new Map(statuses.map(s => [s.id, s])).values()
    )
    allStatuses.value = uniqueStatuses
    normalizeStatuses()
  } catch (error) {
    console.error('Ошибка загрузки статусов:', error)
    // Fallback
    allStatuses.value = [
      { id: 1, name: 'Запланирован', context_id: 1 },
      { id: 2, name: 'Активен', context_id: 1 },
      { id: 3, name: 'Завершен', context_id: 1 },
      { id: 4, name: 'Отменен', context_id: 1 }
    ].filter(s => 
      !allStatuses.value.some(existing => existing.id === s.id)
    )
  }
  normalizeStatuses()
}

// 🔴 ОТКРЫТИЕ МОДАЛЬНОГО ОКНА РЕДАКТИРОВАНИЯ
const openEditModal = () => {
  if (!event.value) return


  editEventData.value = {
    name: event.value.name,
    date: formatDateForEdit(event.value.date),
    status_id: String(event.value.status_id)
  }

  const currentStatus = allStatuses.value.find(
    s => String(s.id) === editEventData.value.status_id
  )

  // Добавляем статус в список, только если его context_id = 1
  if (
    !currentStatus && 
    event.value.status &&
    event.value.status.context_id === 1
  ) {
    allStatuses.value.push({
      id: event.value.status_id,
      name: event.value.status.name,
      context_id: 1
    })
    normalizeStatuses()
  }

  showEditModal.value = true
}


const normalizeStatuses = () => {
  console.log('🔁 Нормализуем статусы:', allStatuses.value)

  // Фильтруем только context_id = 1
  const filtered = allStatuses.value.filter(s => s.context_id === 1)

  // Удаляем дубли по id
  const unique = Array.from(
    new Map(filtered.map(s => [s.id, s])).values()
  )

  // Сортируем по id
  allStatuses.value = unique.sort((a, b) => a.id - b.id)

  console.log('✅ Нормализованные статусы:', allStatuses.value)
}


// 🔴 ФОРМАТИРОВАНИЕ ДАТЫ ДЛЯ ПОЛЯ datetime-local
const formatDateForEdit = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Проверка на валидность даты
  if (isNaN(date.getTime())) return ''
  
  // Более простой способ
  return date.toISOString().slice(0, 16)
}

// 🔴 ПРОВЕРКА ВАЛИДНОСТИ ФОРМЫ
const isEditFormValid = computed(() => {
  return editEventData.value.name.trim() !== '' &&
         editEventData.value.date !== '' &&
         editEventData.value.status_id !== ''
})

const validateEditForm = () => {
  const errors = []
  
  if (!editEventData.value.name.trim()) {
    errors.push('Название мероприятия обязательно')
  }
  
    if (!editEventData.value.status_id) {
    errors.push('Статус обязателен')
  }
  
  return errors
}

const formatDateForAPI = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:00`
  } catch {
    return ''
  }
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
        
        // Получаем старый статус мероприятия
        const oldStatusId = event.value.status_id
        const newStatusId = parseInt(editEventData.value.status_id)
        
        // Форматируем данные для API
        const updateData = {
        name: editEventData.value.name.trim(),
        date: formatDateForAPI(editEventData.value.date),
        status_id: newStatusId
        }
        
        console.log('🔄 Обновляем мероприятие:', updateData)
        console.log('📊 Статус:', { old: oldStatusId, new: newStatusId })
        
        // 1. Обновляем мероприятие
        const updatedEvent = await EventsService.updateEvent(eventId, updateData)
        console.log('✅ Мероприятие обновлено:', updatedEvent)
        
        // 2. Если статус изменился с "Активен" на другой
        if (oldStatusId === 2 && newStatusId !== 2) {
          // Мероприятие стало неактивным - блокируем все модули
          console.log('⚠️ Мероприятие стало неактивным, блокируем все модули...')
          
          const confirmMessage = `Мероприятие стало неактивным.\n\nБудут заблокированы ВСЕ ресурсы всех модулей:\n• Все базы данных (только чтение)\n• Все репозитории (только чтение)\n• Все модули будут отключены\n\nПродолжить?`
          
          if (confirm(confirmMessage)) {
            alert('🔄 Начинаем блокировку всех модулей мероприятия...')
            
            const blockResult = await ModuleBulkService.blockAllEventModules(eventId)
            
            let resultMessage = `✅ Мероприятие и все его модули отключены!\n\n`
            resultMessage += `📊 Результаты блокировки:\n`
            resultMessage += `• Модулей обработано: ${blockResult.total_modules}\n`
            resultMessage += `• Успешно: ${blockResult.successful_modules}\n`
            resultMessage += `• Ошибок: ${blockResult.failed_modules}\n`
            resultMessage += `• Статус мероприятия: ${updatedEvent.status?.name || 'Отключен'}\n`
            
            alert(resultMessage)
          }
        }
        // 3. Если статус изменился на "Активен"
        else if (oldStatusId !== 2 && newStatusId === 2) {
          // Мероприятие стало активным - разблокируем все модули
          console.log('✅ Мероприятие стало активным, разблокируем все модули...')
          
          const confirmMessage = `Мероприятие стало активным.\n\nБудут разблокированы ВСЕ ресурсы всех модулей:\n• Все базы данных (полный доступ)\n• Все репозитории (запись и чтение)\n• Все модули будут активированы\n\nПродолжить?`
          
          if (confirm(confirmMessage)) {
            alert('🔄 Начинаем разблокировку всех модулей мероприятия...')
            
            const unblockResult = await ModuleBulkService.unblockAllEventModules(eventId)
            
            let resultMessage = `✅ Мероприятие и все его модули активированы!\n\n`
            resultMessage += `📊 Результаты разблокировки:\n`
            resultMessage += `• Модулей обработано: ${unblockResult.total_modules}\n`
            resultMessage += `• Успешно: ${unblockResult.successful_modules}\n`
            resultMessage += `• Ошибок: ${unblockResult.failed_modules}\n`
            resultMessage += `• Статус мероприятия: ${updatedEvent.status?.name || 'Активен'}\n`
            
            alert(resultMessage)
          }
        }
        
        // 4. Обновляем данные на странице
        event.value = updatedEvent

        if (!event.value.status && event.value.status_id) {
          event.value.status = allStatuses.value.find(
            s => String(s.id) === String(event.value.status_id)
          );
        }
        
        // 5. Перезагружаем модули (чтобы видеть обновленные статусы)
        await loadModules()
        
        // 6. Закрываем модальное окно
        closeEditModal()
        
        // Уведомление
        alert('Изменения сохранены!')
        
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

// Состояния для паролей
const showPasswords = ref(false)
const visiblePasswords = ref({}) // { userId: true }
const passwordTimer = ref(0)
let passwordTimerInterval = null

// Переключить все пароли
const togglePasswords = () => {
  if (!showPasswords.value) {
    if (!confirm('Внимание!\n\nПоказать пароли всех пользователей?\n\nПароли будут видны в течение 30 секунд.\n\nЭто действие может быть небезопасным.\n\nПродолжить?')) {
      return
    }
    
    showPasswords.value = true
    passwordTimer.value = 30
    
    // Запускаем таймер
    passwordTimerInterval = setInterval(() => {
      if (passwordTimer.value > 0) {
        passwordTimer.value--
      } else {
        clearInterval(passwordTimerInterval)
        showPasswords.value = false
        visiblePasswords.value = {}
        alert('Пароли автоматически скрыты для безопасности.')
      }
    }, 1000)
    
  } else {
    showPasswords.value = false
    visiblePasswords.value = {}
    clearInterval(passwordTimerInterval)
    passwordTimer.value = 0
  }
}

// Показать пароль конкретного пользователя
const showUserPassword = (userId) => {
  if (confirm('Показать пароль для этого пользователя?')) {
    visiblePasswords.value[userId] = true
    
    // Автоматически скрыть через 30 секунд
    setTimeout(() => {
      visiblePasswords.value[userId] = false
    }, 30000)
  }
}

// Получить пароль для отображения
const getPasswordForUser = (user) => {
  console.log('getPasswordForUser вызывается для:', {
    userId: user.id,
    userName: `${user.last_name} ${user.first_name}`,
    login: user.login,
    hasLogin: !!user.login,
    password: user.password,
    hasPassword: !!user.password,
    account_data: user.account_data
  })
  
  if (!user.login) {
    console.log('   ❌ Нет логина, возвращаем —')
    return '—'
  }
  
  const shouldShow = showPasswords.value || visiblePasswords.value[user.id]
  console.log('   shouldShow:', shouldShow)
  
  if (shouldShow) {
    // Теперь password должен содержать сырой пароль
    const password = user.password || user.plain_password || user.credentials?.password || '—'
    console.log('   ✅ Показываем пароль:', password)
    return password
  } else {
    console.log('   🔒 Скрываем пароль')
    return '••••••••'
  }
}

// Получить класс для ячейки пароля
const getPasswordCellClass = (user) => {
  if (!user.login) return ''
  
  const shouldShow = showPasswords.value || visiblePasswords.value[user.id]
  return shouldShow ? 'password-visible' : 'password-hidden'
}

// Фильтры пользователей
const userFilters = ref({
  search: '',
  group: '',
  role: ''
})

//  состояние для модалки:
const showAddUserModal = ref(false)
const allRoles = ref([]) // для хранения списка ролей

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
    .map(user => user.role_in_event?.name || user.role?.name)
    .filter(Boolean)
  return [...new Set(roles)].sort()
})

// Количество участников
const participantsCount = computed(() => {
  return users.value.filter(isParticipant).length
})

// Есть ли участники
const hasParticipants = computed(() => {
  return participantsCount.value > 0
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
    
    // 🔴 ФИЛЬТР ПО РОЛИ (теперь role_in_event)
    if (userFilters.value.role && user.role_in_event?.name !== userFilters.value.role) {
      return false
    }
    
    return true
  })
})

// Отсортированные пользователи (после фильтрации)
const sortedUsers = computed(() => {
  if (!filteredUsers.value.length) return []
  
  return [...filteredUsers.value].sort((a, b) => {
    // Определяем значения для сортировки
    let aValue, bValue
    let isNumeric = false
    
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
        aValue = a.role_in_event?.name || ''
        bValue = b.role_in_event?.name || ''
        break
        
      case 'seat_number':
        // Специальная логика для сортировки по месту
        return sortBySeatNumber(a, b, sortDirection.value)
        
      default:
        return 0
    }
    
    // Стандартная текстовая сортировка
    return sortTextValues(aValue, bValue, sortDirection.value)
  })
})

// Вспомогательные функции
const sortBySeatNumber = (a, b, direction) => {
  const aIsParticipant = isParticipant(a)
  const bIsParticipant = isParticipant(b)
  
  // Участники всегда выше не-участников
  if (aIsParticipant && !bIsParticipant) return -1
  if (!aIsParticipant && bIsParticipant) return 1
  
  // Если оба участники
  if (aIsParticipant && bIsParticipant) {
    const aSeat = a.seat_number ? parseInt(a.seat_number) : 99999
    const bSeat = parseInt(b.seat_number) || 99999
    
    // Числовая сортировка
    if (direction === 'asc') {
      return aSeat - bSeat
    } else {
      return bSeat - aSeat
    }
  }
  
  // Если оба не участники - сохраняем порядок
  return 0
}

const sortTextValues = (a, b, direction) => {
  a = String(a).toLowerCase()
  b = String(b).toLowerCase()
  
  if (a < b) return direction === 'asc' ? -1 : 1
  if (a > b) return direction === 'asc' ? 1 : -1
  return 0
}

// Загрузка данных мероприятия
const loadEvent = async () => {
  try {
    loadingEvent.value = true
    eventError.value = '' // сбрасываем ошибку
    event.value = await EventsService.getEventById(eventId)
    console.log('✅ Мероприятие загружено:', event.value)
  } catch (error) {
    console.error('❌ Ошибка загрузки мероприятия:', error)
    eventError.value = error.message || 'Не удалось загрузить мероприятие'
    
    // Показываем сообщение пользователю
    if (error.response?.status === 404) {
      eventError.value = 'Мероприятие не найдено'
      // Редирект на страницу мероприятий через 3 секунды
      setTimeout(() => {
        router.push('/events')
      }, 3000)
    }
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
    modulesError.value = error.message
  } finally {
    loadingModules.value = false
  }
}

// Загрузка пользователей и их учетных записей
const loadUsers = async () => {
  try {
    loadingUsers.value = true
    usersError.value = ''
    
    console.log('='.repeat(40))
    console.log('🔄 Начинаем загрузку пользователей...')
    
    // 1. Подготавливаем фильтры для API
    const apiFilters = {}
    
    // Если нужно фильтровать по ролям на сервере
    if (userFilters.value.role) {
      apiFilters.roles = userFilters.value.role
    }
    
    console.log('📋 Используем API фильтры:', apiFilters)
    
    // 2. Загружаем пользователей с фильтрами
    console.log(`📡 Запрашиваем пользователей мероприятия ${eventId}...`)
    const usersData = await EventsService.getEventUsers(eventId, apiFilters)
    console.log(`✅ Пользователи мероприятия ${eventId} получены:`, usersData)
    console.log(`   Количество: ${usersData.length}`)
    
    // 3. Загружаем учетные записи с паролями
    console.log(`📡 Запрашиваем учетные записи мероприятия ${eventId}...`)
    const accountsData = await EventsService.getEventAccounts(eventId, apiFilters)
    console.log(`✅ Учетные записи мероприятия ${eventId} получены:`, accountsData)
    console.log(`   Количество: ${accountsData.length}`)
    
    // 4. 🔴 ВАЖНО: Объединяем данные
    console.log('🤝 Начинаем объединение данных...')
    
    const mergedUsers = usersData.map(user => {
      // Ищем соответствующую учетную запись
      const account = accountsData.find(acc => {
        const matches = acc.user_id === user.id || 
                       (acc.user && acc.user.id === user.id)
        
        if (matches) {
          console.log(`   ✅ Найдена учетная запись для ${user.last_name} ${user.first_name}`)
        }
        
        return matches
      })
      
      // Создаем объединенного пользователя
      const mergedUser = {
        ...user,
        login: account?.login || null,
        password: account?.password || null, // 🔴 СЫРОЙ ПАРОЛЬ ИЗ password_plain
        plain_password: account?.password_plain || null,
        seat_number: account?.seat_number || null,
        role_in_event: account?.role || user.role_in_event,
        account_data: account
      }
      
      console.log(`   📋 ${user.last_name}:`, {
        login: mergedUser.login,
        hasPassword: !!mergedUser.password,
        passwordLength: mergedUser.password?.length || 0
      })
      
      return mergedUser
    })
    
    // 5. Сохраняем данные
    users.value = mergedUsers
    eventAccounts.value = accountsData
    
    console.log('✅ Все данные загружены и объединены')
    console.log(`   Итог: ${users.value.length} пользователей с учетными записями`)
    
    // 6. Проверяем первый пользователя для отладки
    if (users.value.length > 0) {
      const firstUser = users.value[0]
      console.log('🔍 Первый пользователь в итоговом списке:', {
        name: `${firstUser.last_name} ${firstUser.first_name}`,
        login: firstUser.login,
        password: firstUser.password,
        passwordType: typeof firstUser.password
      })
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
  return user.login || '—'
}

// Поиск пароля для пользователя
// const getPasswordForUser = (user) => {
//   return user.login ? '••••••••' : '—'
// }

const isParticipant = (user) => {
  const roleName = user.role_in_event?.name?.toLowerCase() || ''
  return roleName.includes('участник') || roleName === 'участник'
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

const getModuleStatusClass = (module) => {
  if (!module.status) return 'module-status-unknown'
  
  const statusName = module.status.name.toLowerCase()
  
  if (statusName.includes('планир') || statusName === 'запланирован') {
    return 'module-status-planned'
  } else if (statusName.includes('актив') || statusName === 'активен') {
    return 'module-status-active'
  } else if (statusName.includes('заверш') || statusName === 'завершён') {
    return 'module-status-completed'
  } else if (statusName.includes('отмен') || statusName === 'отменён') {
    return 'module-status-cancelled'
  }
  
  return 'module-status-unknown'
}

// Обработчики действий
const goBack = () => {
  router.push('/events')
}

const goToModule = (moduleId) => {
  console.log(`➡️ Переходим в модуль ID: ${moduleId}`)
  router.push(`/modules/${moduleId}`)
}

const addModule = () => {
  console.log('➕ Добавить модуль')
  selectedModule.value = null
  showCreateModuleModal.value = true
  
  // Добавьте для отладки:
  console.log('showCreateModuleModal установлен в:', showCreateModuleModal.value)
}

// Обработчики событий от модального окна модуля
const handleModuleModalClose = () => {
  console.log('📌 Модальное окно модуля закрыто')
  showCreateModuleModal.value = false
  selectedModule.value = null
}

const handleModuleCreated = (newModule) => {
  console.log('✅ Модуль создан:', newModule)
  
  // Перезагружаем модули
  loadModules()
  
  alert(`✅ Модуль "${newModule.name}" успешно создан`)
}

const addUser = () => {
  console.log('🟢 addUser вызван, showAddUserModal до:', showAddUserModal.value)
  showAddUserModal.value = true
  console.log('🟢 showAddUserModal после:', showAddUserModal.value)
}


// Обработчик добавления пользователя
const handleUserAdded = async (userData) => {
  console.log('✅ Пользователь добавлен:', userData)
  
  // Перезагружаем данные
  await loadUsers()
  
  // Показываем логин/пароль
  if (userData.credentials) {
    alert(`Участник добавлен!\n\nЛогин: ${userData.credentials.login}\nПароль:
         ${userData.credentials.password}\n\n Сохраните эти данные для выдачи.`)
  }
}

const editUser = (user) => {
  console.log(' Редактировать пользователя:', user)
  selectedUser.value = user
  showEditUserModal.value = true
}

const deleteUser = async (user) => {
  console.log('Удалить пользователя:', user)
  
  const userName = `${user.last_name} ${user.first_name}`
  const roleName = user.role_in_event?.name?.toLowerCase() || 'пользователя'
  
  if (!confirm(`Вы уверены, что хотите удалить ${roleName} "${userName}" из мероприятия?\n\nЭто действие нельзя отменить.`)) {
    return
  }
  
  try {
    // 1. Находим account_id
    let accountId = user.account_data?.id
    
    if (!accountId) {
      console.error('❌ Не найден account_id для удаления')
      console.log('Пользователь:', user)
      console.log('account_data:', user.account_data)
      
      // Попробуем найти вручную
      const foundAccount = eventAccounts.value.find(acc => 
        acc.user_id === user.id || (acc.user && acc.user.id === user.id)
      )
      
      if (foundAccount) {
        accountId = foundAccount.id
        console.log('✅ Найден account_id вручную:', accountId)
      } else {
        throw new Error('Не найдена учетная запись пользователя')
      }
    }
    
    console.log(`🗑️ Удаляем учетную запись ${accountId}...`)
    
    // 2. Вызываем API
    await EventsService.removeUserFromEvent(accountId)
    
    // 3. Показываем успех
    alert(`✅ ${roleName.charAt(0).toUpperCase() + roleName.slice(1)} "${userName}" успешно удален из мероприятия`)
    
    // 4. Перезагружаем данные
    await loadUsers()
    
  } catch (error) {
    console.error('❌ Ошибка удаления:', error)
    
    let message = 'Не удалось удалить пользователя'
    
    if (error.message.includes('не найден') || error.response?.status === 404) {
      message = 'Учетная запись не найдена'
    } else if (error.response?.status === 403) {
      message = 'У вас нет прав на удаление'
    } else if (error.response?.status === 409) {
      message = 'Нельзя удалить пользователя, у которого есть активные модули'
    }
    
    alert(`❌ ${message}\n\n${error.message}`)
  }
}

const handleUserSaved = (updatedUser) => {
  console.log('✅ Пользователь обновлен:', updatedUser)
  
  // Обновляем пользователя в списке
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      ...updatedUser
    }
  }
  
  alert('✅ Изменения сохранены!')
}

const checkAndSyncModules = async () => {
  try {
    if (event.value) {
      console.log('🔍 Проверяем синхронизацию модулей мероприятия...')
      
      // Если мероприятие не активно
      if (event.value.status_id !== 2) {
        console.log('⚠️ Мероприятие не активно, проверяем модули...')
        
        const modules = await EventsService.getEventModules(eventId)
        
        // Ищем активные модули
        const activeModules = modules.filter(m => m.status_id === 2) // ID статуса "Активен"
        
        if (activeModules.length > 0) {
          const moduleNames = activeModules.map(m => `• "${m.name}"`).join('\n')
          
          const warningMessage = `⚠️ ВНИМАНИЕ! ⚠️\n\nМероприятие "${event.value.name}" не активно,\nно найдены активные модули:\n\n${moduleNames}\n\nХотите автоматически заблокировать все ресурсы этих модулей?\n\nЭто переведет их в режим "только чтение".`
          
          if (confirm(warningMessage)) {
            alert('🔄 Начинаем блокировку активных модулей...')
            
            for (const module of activeModules) {
              try {
                await ModuleBulkService.blockSingleModule(module.id)
                console.log(`✅ Модуль ${module.name} заблокирован`)
              } catch (error) {
                console.error(`❌ Ошибка блокировки модуля ${module.id}:`, error)
              }
            }
            
            alert('✅ Все активные модули заблокированы!')
            
            // Перезагружаем модули
            await loadModules()
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка проверки синхронизации:', error)
  }
}

// Метод экспорта всех участников
const exportToWord = async () => {
  if (participantsCount.value === 0) {
    alert('❌ Нет участников для экспорта')
    return
  }
  
  const confirmMessage = `Экспортировать данные ${participantsCount.value} участников в Word документ?\n\nДокумент будет содержать:\n• Данные для входа каждого участника\n• Реквизиты для подключения к БД\n• Инструкции по использованию\n\nДокумент можно распечатать и раздать участникам.`
  
  if (!confirm(confirmMessage)) return
  
  try {
    exporting.value = true
    
    // Импортируем сервис
    const wordExportService = await import('@/services/wordExportService')
    
    const currentEvent = event.value
    
    if (!currentEvent) {
      throw new Error('Мероприятие не найдено')
    }
    
    // Используем методы экземпляра класса
    const participants = wordExportService.default.prepareParticipantsData(
      users.value, 
      eventAccounts.value
    )
    
    console.log('📊 Подготовлены участники для экспорта:', participants)
    
    const { blob, fileName } = await wordExportService.default.createParticipantsDocument(
      currentEvent, 
      participants
    )
    
    // Сохраняем файл
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert(`✅ Документ создан успешно!\n\nФайл: ${fileName}\nУчастников: ${participants.length}\n\nФайл загружен.`)
    
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error)
    alert(`❌ Ошибка создания документа: ${error.message || 'Не удалось экспортировать данные'}`)
  } finally {
    exporting.value = false
  }
}

// Загрузка всех данных
const loadAllData = async () => {
  await Promise.all([
    loadEvent(),
    loadModules(),
    loadUsers(),
    loadStatuses()
  ])
}

onMounted(async () => {
  console.log('Загружаем страницу мероприятия')
  await loadAllData()
  
  // Проверяем синхронизацию модулей
  await checkAndSyncModules()
  
  // Отладка статусов модулей
  if (modules.value.length > 0) {
    console.log('🔍 Анализ статусов модулей:')
    modules.value.forEach((module, index) => {
      console.log(`Модуль ${index + 1}:`, {
        name: module.name,
        status_id: module.status_id,
        status: module.status,
        statusName: module.status?.name
      })
    })
  }
  normalizeStatuses()
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

.seat-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 40px;
  text-align: center;
}

.no-seat {
  color: #dc2626;
  font-style: italic;
  font-size: 0.9rem;
}

.not-applicable {
  color: #9ca3af;
  font-style: italic;
}

/* Улучшенная кнопка генерации */
.generate-seats-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.generate-seats-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.generate-seats-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.generate-seats-btn .badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  margin-left: 0.25rem;
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

/* Стили для секции управления паролями */
.password-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.toggle-passwords-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.toggle-passwords-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.toggle-passwords-btn.active {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
  font-weight: 600;
}

.toggle-passwords-btn.active:hover {
  background: #bfdbfe;
  border-color: #2563eb;
}

.password-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin-left: 0.5rem;
  font-style: italic;
}

.password-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.password-warning {
  color: #dc2626;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: #fef2f2;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.password-timer {
  color: #059669;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: #d1fae5;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
}

/* Обновите стили для ячеек с паролями */
.password-cell.password-visible {
  background-color: #fef3c7 !important;
  position: relative;
}

.password-cell.password-visible::before {
  content: '⚠️';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  opacity: 0.7;
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

/* Стили для паролей */
.password-cell {
  position: relative;
  min-width: 120px;
}

.password-hidden .password-value {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.password-visible .password-value {
  background: #fef3c7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #92400e;
  font-weight: 500;
  font-family: 'Courier New', monospace;
  display: inline-block;
  border: 1px solid #fbbf24;
}

.show-one-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.show-one-btn:hover {
  background: #f3f4f6;
  color: #374151;
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

/* Стиль для выделенной ячейки при сортировке */
.users-table td.sorted-cell {
  background-color: #f0f9ff;
  font-weight: 600;
}

.users-table td.sorted-cell .seat-badge {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
  transition: all 0.2s;
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
  background: #D1FAE5;  /* светло-зеленый */
  color: #065F46;       /* темно-зеленый */
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.module-status-planned {
  background: #DBEAFE;
  color: #1E40AF;
}

.module-status-completed {
  background: #F3F4F6;
  color: #374151;
}

.module-status-cancelled {
  background: #FEE2E2;
  color: #991B1B;
}

.module-status-unknown {
  background: #F3F4F6;
  color: #6B7280;
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

/* Стили для кликабельной карточки модуля */
.module-card {
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  border-color: #2E80ED;
  background-color: #f8fafc;
}

.module-hover-indicator {
  opacity: 0;
  transition: opacity 0.2s ease;
  text-align: right;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e5e7eb;
}

.module-card:hover .module-hover-indicator {
  opacity: 1;
}

.hover-text {
  font-size: 0.85rem;
  color: #2E80ED;
  font-weight: 500;
}

/* Можно также добавить стрелку при наведении */
.module-header h3::after {
  content: " →";
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #2E80ED;
}

.module-card:hover .module-header h3::after {
  opacity: 1;
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

.add-group-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.add-group-button:hover {
  background-color: #45a049;
}

.add-group-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Можно добавить иконку для кнопки */
.add-group-button::before {
  content: "👥 ";
}

/* Для лучшего визуального разделения кнопок */
.users-header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.export-section {
  margin: 30px 0;
  padding: 25px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px solid #dee2e6;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.export-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #495057;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.export-options {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.export-btn {
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  width: 100%;
  margin-bottom: 20px;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.export-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.export-info p {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-weight: 500;
}

.export-info p:first-child {
  font-weight: 600;
  color: #3498db;
}

.export-info small {
  color: #7f8c8d;
  font-size: 13px;
}

.loading-dots {
  display: inline-flex;
  gap: 5px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1.4s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
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