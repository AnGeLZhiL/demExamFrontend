<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <header class="modal-header">
          <h2>Редактировать участника</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </header>
        
        <form @submit.prevent="handleSubmit" class="modal-form">
          <!-- Информация о пользователе -->
          <div class="user-info">
            <div class="user-name">
              <strong>{{ userData.last_name }} {{ userData.first_name }} {{ userData.middle_name || '' }}</strong>
            </div>
            <div class="user-details">
              <span v-if="userData.group">Группа: {{ userData.group.number }}</span>
              <span>Текущая роль: {{ userData.role_in_event?.name || 'Не назначена' }}</span>
            </div>
          </div>

          <!-- Поле для роли -->
          <div class="form-group">
            <label for="role">Роль в мероприятии *</label>
            <select
              id="role"
              v-model="formData.role_id"
              required
              :disabled="loading"
            >
              <option value="">Выберите роль</option>
              <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>

          <!-- Поле для места -->
          <div class="form-group">
            <label for="seat">Номер места</label>
            <input
              id="seat"
              v-model="formData.seat_number"
              type="text"
              placeholder="Например: A1, B12"
              :disabled="loading || !isParticipant"
              maxlength="10"
            />
            <small v-if="!isParticipant" class="hint">
              Место назначается только участникам
            </small>
          </div>

          <!-- Управление паролем -->
          <div class="form-group password-group">
            <label>Управление паролем</label>
            <div class="password-actions">
              <button 
                type="button" 
                class="btn-secondary"
                @click="generateNewPassword"
                :disabled="loading"
              >
                🔄 Сгенерировать новый пароль
              </button>
              <button 
                type="button" 
                class="btn-secondary"
                @click="showCurrentPassword"
                :disabled="loading || !userData.password"
              >
                👁️ Показать текущий пароль
              </button>
            </div>
            
            <!-- Поле для нового пароля (если генерируем) -->
            <div v-if="newPassword" class="new-password-info">
              <div class="alert alert-success">
                <strong>Новый пароль:</strong> {{ newPassword }}
              </div>
              <button 
                type="button" 
                class="btn-copy"
                @click="copyToClipboard(newPassword)"
              >
                📋 Скопировать
              </button>
            </div>
          </div>

          <!-- Сообщения об ошибках -->
          <div v-if="error" class="form-group error-message">
            <strong>Ошибка:</strong> {{ error }}
          </div>

          <!-- Футер модалки -->
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
              type="submit" 
              class="submit-btn"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading">Сохранение...</span>
              <span v-else>Сохранить изменения</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { EventsService } from '@/services/eventsService'

const props = defineProps({
  show: Boolean,
  user: Object,
  eventId: [String, Number]
})

const emit = defineEmits(['close', 'saved'])

// Данные формы
const formData = ref({
  role_id: '',
  seat_number: '',
  new_password: null
})

const newPassword = ref(null)
const loading = ref(false)
const error = ref('')
const availableRoles = ref([])

// Вычисляемые свойства
const userData = computed(() => props.user || {})
const isParticipant = computed(() => {
  const roleId = parseInt(formData.value.role_id)
  // Предположим, что роль участника имеет ID = 1
  // Нужно адаптировать под вашу систему
  return roleId === 3
})

const isFormValid = computed(() => {
  return formData.value.role_id !== ''
})

// Методы
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    role_id: '',
    seat_number: '',
    new_password: null
  }
  newPassword.value = null
  error.value = ''
}

const loadRoles = async () => {
  try {
    console.log('🔄 Загружаем роли...')
    
    // 🔴 Пробуем получить роли разными способами
    const roles = await EventsService.getAllRoles()
    
    console.log('✅ Роли получены от сервера:', roles)
    
    if (!roles || roles.length === 0) {
      console.warn('⚠️ Сервер вернул пустой список ролей, используем fallback')
      throw new Error('Пустой список ролей')
    }
    
    availableRoles.value = roles
    
  } catch (err) {
    console.error('❌ Ошибка загрузки ролей:', err)
    console.log('📋 Подробности ошибки:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    
    // Fallback роли
    availableRoles.value = [
      { id: 1, name: 'Администратор' },
      { id: 2, name: 'Эксперт' },
      { id: 3, name: 'Участник' },
      { id: 4, name: 'Главный эксперт' },
      { id: 5, name: 'Технический эксперт' },
      { id: 6, name: 'Наблюдатель' }
    ]
    
    console.log('🔄 Используем fallback роли:', availableRoles.value)
  }
}

const generateNewPassword = async () => { 
  try {
    const accountId = userData.value.account_id || 
                     userData.value.account_data?.id
    
    if (!accountId) {
      throw new Error('Не найден ID учетной записи')
    }
    
    const result = await EventsService.generateNewPassword(accountId)
    newPassword.value = result.new_password || result.password_plain
    formData.value.new_password = newPassword.value
    
    alert(`✅ Сгенерирован новый пароль: ${newPassword.value}`)
    
  } catch (error) {
    console.error('Ошибка генерации пароля:', error)
    error.value = 'Не удалось сгенерировать пароль'
  }
}

const showCurrentPassword = () => {
  if (userData.value.password) {
    alert(`Текущий пароль: ${userData.value.password}`)
  } else {
    alert('Пароль не найден')
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Скопировано в буфер обмена!')
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Заполните обязательные поля'
    return
  }

  try {
    loading.value = true
    error.value = ''

    // Подготовка данных для отправки
    const updateData = {
      role_id: parseInt(formData.value.role_id),
      seat_number: formData.value.seat_number || null
    }

    // Если есть новый пароль
    if (formData.value.new_password) {
      updateData.password_plain = formData.value.new_password
    }

    console.log('🔄 Обновляем пользователя:', {
      userId: userData.value.id,
      accountId: userData.value.account_data?.id, // ← СМОТРИМ ЗДЕСЬ
      eventId: props.eventId,
      data: updateData
    })

    // 🔴 НАХОДИМ account_id
    const accountId = userData.value.account_data?.id
    
    if (!accountId) {
      throw new Error('Не найден ID учетной записи. Проверьте поле account_data у пользователя.')
    }

    // 🔴 ВЫЗЫВАЕМ РЕАЛЬНЫЙ API
    console.log(`📡 Отправляем PUT запрос на /event-accounts/${accountId}`)
    const result = await EventsService.updateEventAccount(accountId, updateData)
    
    console.log('✅ Пользователь обновлен:', result)
    
    // Подготавливаем обновленные данные для родительского компонента
    const updatedUser = {
      ...userData.value,
      role_in_event: result.role || { 
        id: updateData.role_id, 
        name: availableRoles.value.find(r => r.id === updateData.role_id)?.name || '' 
      },
      seat_number: result.seat_number || updateData.seat_number,
      password: result.password || result.password_plain || formData.value.new_password || userData.value.password,
      account_data: result // обновляем account_data
    }
    
    // Закрываем модалку и отправляем обновленные данные
    emit('saved', updatedUser)
    
    closeModal()
    
  } catch (err) {
    console.error('❌ Ошибка обновления:', err)
    
    // Детальные сообщения об ошибках
    if (err.response?.status === 404) {
      error.value = 'Учетная запись не найдена на сервере'
    } else if (err.response?.status === 403) {
      error.value = 'У вас нет прав на редактирование'
    } else if (err.response?.status === 422) {
      error.value = 'Ошибка валидации данных: ' + 
        (err.response.data.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Проверьте введенные данные')
    } else if (err.message.includes('account_data')) {
      error.value = 'Ошибка: не найдена учетная запись пользователя. Попробуйте перезагрузить страницу.'
    } else {
      error.value = err.message || 'Не удалось обновить данные пользователя'
    }
  } finally {
    loading.value = false
  }
}

// Наблюдатели
watch(() => props.show, (isVisible) => {
  if (isVisible && props.user) {
    console.log('👁️ Модалка открывается для пользователя:', {
      user: props.user,
      role_in_event: props.user.role_in_event,
      role_id: props.user.role_in_event?.id,
      role_name: props.user.role_in_event?.name
    })
    
    // Заполняем форму данными пользователя
    formData.value.role_id = props.user.role_in_event?.id?.toString() || ''
    formData.value.seat_number = props.user.seat_number || ''
    
    console.log('📝 Заполнена форма:', {
      role_id: formData.value.role_id,
      seat_number: formData.value.seat_number
    })
    
    // Загружаем роли
    loadRoles()
  }
})

watch(() => formData.value.role_id, (newRoleId) => {
  console.log('🎭 Изменена роль:', {
    newRoleId,
    isParticipant: parseInt(newRoleId) === 3
  })
  
  // Если пользователь не участник - очищаем поле места
  // 🔴 ИСПРАВЬТЕ: было !== 1, должно быть !== 3
  if (parseInt(newRoleId) !== 3) {
    console.log('🧹 Очищаем поле места (роль не участник)')
    formData.value.seat_number = ''
  }
})
</script>

<style scoped>
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
  z-index: 1001;
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
  background-color: #f3f4f6;
}

.modal-form {
  padding: 1.5rem;
}

.user-info {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.user-name {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #6b7280;
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

.hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-style: italic;
}

.password-group {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.password-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-secondary {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.new-password-info {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
}

.alert {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: #2563eb;
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

.cancel-btn:disabled,
.submit-btn:disabled {
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@keyframes button-spinner {
  to { transform: rotate(360deg); }
}
</style>