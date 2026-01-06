<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <!-- Заголовок -->
        <header class="modal-header">
          <h2>Добавить участника</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </header>
        
        <!-- Поиск -->
        <div class="form-group">
          <label>Поиск:</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Фамилия или имя..."
            @input="handleSearch"
            :disabled="loading || addingUser"
          />
        </div>
        
        <!-- Список пользователей -->
        <div v-if="availableUsers.length" class="users-list">
          <div 
            v-for="user in availableUsers" 
            :key="user.id"
            class="user-item"
            :class="{ selected: selectedUser?.id === user.id }"
            @click="selectUser(user)"
          >
            {{ user.last_name }} {{ user.first_name }}
            <small v-if="user.group">({{ user.group.number }})</small>
          </div>
        </div>
        
        <div v-else-if="searchQuery && !loading" class="empty-state">
          Не найдено
        </div>
        
        <!-- Выбор роли -->
        <div v-if="selectedUser" class="form-group">
          <label>Роль:</label>
          <select v-model="selectedRoleId" :disabled="addingUser">
            <option value="">-- Выберите роль --</option>
            <option v-for="role in roles" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
        
        <!-- Ошибка -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Кнопки -->
        <footer class="modal-footer">
          <button @click="closeModal" :disabled="addingUser" class="cancel-btn">
            Отмена
          </button>
          <button 
            @click="addUser" 
            :disabled="!canAdd || addingUser" 
            class="submit-btn"
          >
            {{ addingUser ? 'Добавление...' : 'Добавить' }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { EventsService } from '@/services/eventsService'

const props = defineProps({
  show: Boolean,
  eventId: [String, Number]
})

const emit = defineEmits(['close', 'user-added'])

// Состояния
const searchQuery = ref('')
const availableUsers = ref([])
const selectedUser = ref(null)
const selectedRoleId = ref('')
const roles = ref([])
const loading = ref(false)
const addingUser = ref(false)
const error = ref('')

// Дебаунс функция
const createDebounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Функция поиска
const performSearch = async (query) => {
  if (!query.trim()) {
    availableUsers.value = []
    loading.value = false
    return
  }
  
  try {
    console.log('🔍 Выполняем поиск:', query)
    loading.value = true
    error.value = ''
    
    const users = await EventsService.searchAvailableUsers(
      props.eventId,
      query
    )
    
    console.log('✅ Найдены пользователей:', users.length)
    availableUsers.value = users
    
  } catch (err) {
    console.error('❌ Ошибка поиска:', err)
    error.value = 'Ошибка поиска'
    availableUsers.value = []
  } finally {
    loading.value = false
  }
}

// Создаем дебаунсированную версию
const debouncedSearch = createDebounce(performSearch, 500)

// Обработчик ввода
const handleSearch = () => {
  debouncedSearch(searchQuery.value.trim())
}

// Вычисляемые свойства
const canAdd = computed(() => {
  // Требуется только пользователь и роль
  return selectedUser.value && selectedRoleId.value
})

// Watch для смены роли
watch(selectedRoleId, () => {
  // Ничего не делаем
})

// Загрузка ролей
const loadRoles = async () => {
  try {
    console.log('🔄 Загружаем роли...')
    roles.value = await EventsService.getAllRoles()
    console.log('✅ Роли загружены:', roles.value)
  } catch (err) {
    console.error('❌ Ошибка загрузки ролей:', err)
    // Fallback
    roles.value = [
      { id: 1, name: 'Эксперт' },
      { id: 2, name: 'Участник' },
      { id: 3, name: 'Главный эксперт' },
      { id: 4, name: 'Технический эксперт' },
    ]
  }
}

// Выбор пользователя
const selectUser = (user) => {
  selectedUser.value = user
  selectedRoleId.value = ''
}

// Добавление пользователя
const addUser = async () => {
  try {
    addingUser.value = true
    error.value = ''
    
    const result = await EventsService.addUserToEvent(
      props.eventId,
      selectedUser.value.id,
      null, // Место не передаем - будет генерироваться отдельно
      selectedRoleId.value
    )
    
    emit('user-added', result)
    closeModal()
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка'
  } finally {
    addingUser.value = false
  }
}

// Закрытие модалки
const closeModal = () => {
  searchQuery.value = ''
  availableUsers.value = []
  selectedUser.value = null
  selectedRoleId.value = ''
  loading.value = false
  addingUser.value = false
  error.value = ''
  
  emit('close')
}

// При открытии модалки
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadRoles()
  }
})

// Обработчик клавиши ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Используем те же стили что в EventDetail.vue */
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.required {
  color: #dc2626;
  font-weight: bold;
}

.field-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.form-group {
  padding: 0 1.5rem 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.users-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 0 1.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.user-item {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  color: #374151; /* Основной цвет текста */
  font-weight: 500;
  transition: all 0.2s;
}

.user-item:hover {
  background-color: #f9fafb;
}

.user-item.selected {
  background-color: #e0f2fe;
  border-left: 3px solid #2E80ED;
  color: #1e40af; /* Более темный синий для выделенного */
  font-weight: 600;
}

.user-item small {
  color: #6b7280; /* Цвет для группы */
  font-weight: normal;
  margin-left: 0.5rem;
}

.user-item.selected small {
  color: #3b82f6; /* Синий цвет для группы в выделенном элементе */
}

.empty-state {
  padding: 1rem 1.5rem;
  color: #6b7280;
  text-align: center;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  margin: 0 1.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 100px;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.submit-btn {
  background: #2E80ED;
  color: white;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>