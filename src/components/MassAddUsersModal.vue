<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal mass-add-modal">
      <header class="modal-header">
        <h2>Массовое добавление пользователей</h2>
        <button class="modal-close" @click="closeModal">×</button>
      </header>
      
      <div class="modal-content">
        <!-- Выбор группы -->
        <div class="form-group">
          <label for="group-select">Выберите группу:</label>
          <select 
            id="group-select" 
            v-model="selectedGroup" 
            @change="loadGroupUsers"
            :disabled="loading"
          >
            <option value="">Выберите группу</option>
            <option v-for="group in availableGroups" 
                    :key="group.id" 
                    :value="group.id">
              {{ group.number }} ({{ group.users_count || 0 }} пользователей)
            </option>
          </select>
        </div>

        <!-- Роль для добавляемых пользователей -->
        <div class="form-group">
          <label for="role-select">Роль в мероприятии:</label>
          <select 
            id="role-select" 
            v-model="selectedRole" 
            :disabled="loading || !selectedGroup"
          >
            <option value="">Выберите роль</option>
            <option v-for="role in availableRoles" 
                    :key="role.id" 
                    :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <!-- Список пользователей группы -->
        <div class="users-list-section" v-if="groupUsers.length > 0">
          <h3>Пользователи в группе:</h3>
          <div class="users-list-container">
            <div v-for="user in groupUsers" 
                 :key="user.id" 
                 class="user-item"
                 :class="{ 'already-added': isAlreadyAdded(user) }">
              <div class="user-info">
                <span class="user-name">
                  {{ user.last_name }} {{ user.first_name }} {{ user.middle_name || '' }}
                </span>
                <span class="user-login" v-if="user.login">
                  ({{ user.login }})
                </span>
              </div>
              <div class="user-status">
                <span v-if="isAlreadyAdded(user)" class="already-added-badge">
                  ✓ Уже добавлен
                </span>
                <span v-else class="available-badge">
                  Будет добавлен
                </span>
              </div>
            </div>
          </div>
          
          <!-- Статистика -->
          <div class="users-stats">
            <p>Всего в группе: {{ groupUsers.length }} пользователей</p>
            <p>Будет добавлено: {{ usersToAddCount }} пользователей</p>
            <p v-if="alreadyAddedCount > 0" class="warning">
              Уже добавлены: {{ alreadyAddedCount }} пользователей
            </p>
          </div>
        </div>

        <!-- Сообщения -->
        <div v-if="message" :class="['message', message.type]">
          {{ message.text }}
        </div>

        <!-- Ошибки -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <footer class="modal-footer">
        <button 
          type="button" 
          class="cancel-btn" 
          @click="closeModal"
          :disabled="loading"
        >
          Отмена
        </button>
        <button 
          type="button" 
          class="submit-btn"
          @click="addUsers"
          :disabled="loading || !canAddUsers"
        >
          <span v-if="loading">Добавление...</span>
          <span v-else>
            Добавить {{ usersToAddCount }} пользователей
          </span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { UsersService } from '@/services/usersService'
import { EventsService } from '@/services/eventsService'

const props = defineProps({
  show: Boolean,
  eventId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['close', 'users-added'])

// Данные
const selectedGroup = ref('')
const selectedRole = ref('')
const availableGroups = ref([])
const availableRoles = ref([])
const groupUsers = ref([])
const loading = ref(false)
const error = ref('')
const message = ref(null)

// Уже добавленные пользователи
const alreadyAddedUsers = ref([])

// Вычисляемые свойства
const canAddUsers = computed(() => {
  return selectedGroup.value && 
         selectedRole.value && 
         usersToAddCount.value > 0
})

const usersToAddCount = computed(() => {
  return groupUsers.value.filter(user => !isAlreadyAdded(user)).length
})

const alreadyAddedCount = computed(() => {
  return groupUsers.value.filter(user => isAlreadyAdded(user)).length
})

// Методы
const isAlreadyAdded = (user) => {
  return alreadyAddedUsers.value.some(added => added.id === user.id)
}

const loadAvailableGroups = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 🔴 ИСПОЛЬЗУЕМ НОВЫЙ МЕТОД
    const groups = await UsersService.getGroupsWithUsers()
    
    // Фильтруем группы без пользователей
    availableGroups.value = groups.filter(group => group.users_count > 0)
    
    console.log('✅ Группы загружены:', availableGroups.value)
    
  } catch (err) {
    console.error('Ошибка загрузки групп:', err)
    error.value = 'Не удалось загрузить группы'
  } finally {
    loading.value = false
  }
}

const loadAvailableRoles = async () => {
  try {
    const roles = await EventsService.getAllRoles()
    // Фильтруем роли для мероприятий
    availableRoles.value = roles.filter(role => 
      !role.system_role && 
      role.name.toLowerCase().includes('участник') ||
      role.name.toLowerCase().includes('эксперт')
    )
    
    // Устанавливаем участника по умолчанию
    if (availableRoles.value.length > 0) {
      const participantRole = availableRoles.value.find(r => 
        r.name.toLowerCase().includes('участник')
      )
      if (participantRole) {
        selectedRole.value = participantRole.id
      }
    }
    
  } catch (err) {
    console.error('Ошибка загрузки ролей:', err)
    availableRoles.value = [
      { id: 2, name: 'Участник' },
      { id: 1, name: 'Эксперт' }
    ]
    selectedRole.value = 2 // Участник по умолчанию
  }
}

const loadAlreadyAddedUsers = async () => {
  try {
    const eventUsers = await EventsService.getEventUsers(props.eventId)
    alreadyAddedUsers.value = eventUsers
  } catch (err) {
    console.error('Ошибка загрузки добавленных пользователей:', err)
  }
}

const loadGroupUsers = async () => {
  if (!selectedGroup.value) {
    groupUsers.value = []
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    // 🔴 ИСПОЛЬЗУЕМ НОВЫЙ МЕТОД
    const users = await UsersService.getUsersByGroup(selectedGroup.value)
    groupUsers.value = users
    
    const group = availableGroups.value.find(g => g.id == selectedGroup.value)
    message.value = {
      type: 'info',
      text: `Найдено ${users.length} пользователей в группе ${group?.number || ''}`
    }
    
  } catch (err) {
    console.error('Ошибка загрузки пользователей группы:', err)
    error.value = 'Не удалось загрузить пользователей группы'
    groupUsers.value = []
  } finally {
    loading.value = false
  }
}

// 🔴 ОСТАЛЬНЫЕ МЕТОДЫ БЕЗ ИЗМЕНЕНИЙ...
const addUsers = async () => {
  if (!canAddUsers.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    // Фильтруем пользователей, которых еще нет в мероприятии
    const usersToAdd = groupUsers.value.filter(user => !isAlreadyAdded(user))
    
    if (usersToAdd.length === 0) {
      error.value = 'Нет пользователей для добавления'
      loading.value = false
      return
    }
    
    // Подтверждение
    const roleName = availableRoles.value.find(r => r.id == selectedRole.value)?.name || 'не выбрана'
    if (!confirm(`Добавить ${usersToAdd.length} пользователей из группы?\n\nРоль: ${roleName}`)) {
      loading.value = false
      return
    }
    
    // Добавляем каждого пользователя
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }
    
    const credentials = []
    
    for (const user of usersToAdd) {
      try {
        const result = await EventsService.addUserToEvent(
          props.eventId,
          user.id,
          null,
          selectedRole.value
        )
        
        results.success++
        
        if (result.credentials) {
          credentials.push({
            user: `${user.last_name} ${user.first_name}`,
            login: result.credentials.login,
            password: result.credentials.password
          })
        }
      } catch (err) {
        results.failed++
        results.errors.push({
          user: `${user.last_name} ${user.first_name}`,
          error: err.message
        })
        console.error(`Ошибка добавления ${user.last_name}:`, err)
      }
    }
    
    // Показываем результаты
    if (results.failed === 0) {
      message.value = {
        type: 'success',
        text: `✅ Успешно добавлено ${results.success} пользователей`
      }
      
      // Показываем учетные данные, если есть
      if (credentials.length > 0) {
        const credentialsText = credentials
          .map(c => `${c.user}: Логин - ${c.login}, Пароль - ${c.password}`)
          .join('\n')
        
        alert(`✅ Добавлено ${results.success} пользователей\n\nУчетные данные:\n${credentialsText}`)
      }
      
      // Обновляем список уже добавленных
      await loadAlreadyAddedUsers()
      
      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        emit('users-added', { count: results.success })
        closeModal()
      }, 2000)
      
    } else {
      message.value = {
        type: 'warning',
        text: `Добавлено ${results.success} из ${usersToAdd.length} пользователей`
      }
      
      if (results.errors.length > 0) {
        const errorList = results.errors.map(e => `${e.user}: ${e.error}`).join('\n')
        alert(`Ошибки при добавлении:\n${errorList}`)
      }
    }
    
  } catch (err) {
    console.error('Ошибка массового добавления:', err)
    error.value = 'Не удалось добавить пользователей: ' + err.message
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  // Сброс данных
  selectedGroup.value = ''
  selectedRole.value = ''
  groupUsers.value = []
  error.value = ''
  message.value = null
  
  emit('close')
}

// Инициализация
watch(() => props.show, async (newVal) => {
  if (newVal) {
    loading.value = true
    try {
      await Promise.all([
        loadAvailableGroups(),
        loadAvailableRoles(),
        loadAlreadyAddedUsers()
      ])
    } catch (err) {
      console.error('Ошибка инициализации:', err)
      error.value = 'Не удалось загрузить данные'
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.mass-add-modal {
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 30px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 15px;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: #f8f9fa;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s;
  color: #333;
}

.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Секция пользователей */
.users-list-section {
  margin-top: 30px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.users-list-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.users-list-container {
  max-height: 350px;
  overflow-y: auto;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin: 15px 0;
  background: white;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f0f0f0;
}

.users-list-container::-webkit-scrollbar {
  width: 8px;
}

.users-list-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.users-list-container::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.users-list-container::-webkit-scrollbar-thumb:hover {
  background: #5a67d8;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.user-item.already-added {
  background-color: #f0f9ff;
  opacity: 0.9;
}

.user-item.already-added:hover {
  background-color: #e6f7ff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.user-login {
  font-size: 0.85rem;
  color: #666;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.user-status {
  margin-left: 15px;
  flex-shrink: 0;
}

.already-added-badge {
  color: #0a8;
  background-color: rgba(0, 168, 136, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.already-added-badge::before {
  content: "✓";
  font-weight: bold;
}

.available-badge {
  color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Статистика */
.users-stats {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #dee2e6;
}

.users-stats p {
  margin: 8px 0;
  font-size: 0.95rem;
  color: #495057;
  display: flex;
  justify-content: space-between;
}

.users-stats p:first-child {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.warning {
  color: #856404;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #ffeaa7;
  margin-top: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* Сообщения */
.message {
  padding: 16px 20px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message::before {
  font-size: 1.2rem;
}

.message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.message.info::before {
  content: "ℹ️";
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.message.success::before {
  content: "✅";
}

.message.warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.message.warning::before {
  content: "⚠️";
}

.error-message {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  padding: 16px 20px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 0.95rem;
  border: 1px solid #f5c6cb;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Кнопки */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 24px 30px;
  border-top: 1px solid #e9ecef;
  background: white;
  border-radius: 0 0 12px 12px;
}

.cancel-btn {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 100px;
}

.cancel-btn:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.cancel-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.submit-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.submit-btn:focus:not(:active)::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(40, 40);
    opacity: 0;
  }
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .mass-add-modal {
    width: 95%;
    margin: 20px;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
    min-width: auto;
  }
  
  .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .user-status {
    margin-left: 0;
    align-self: flex-end;
  }
}

/* Загрузка */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 12px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>