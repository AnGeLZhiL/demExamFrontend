<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ isEditing ? 'Редактировать модуль' : 'Создать модуль' }}</h2>
          <button class="modal-close" @click="close">×</button>
        </header>
        
        <form @submit.prevent="submit" class="modal-form">
          <div class="form-group">
            <label for="module-name">Название модуля *</label>
            <input
              id="module-name"
              v-model="form.name"
              type="text"
              placeholder="Введите название модуля"
              required
              :disabled="loading"
              class="input-field"
            />
          </div>
          
          <!-- <div class="form-group">
            <label for="module-type">Тип модуля *</label>
            <select
              id="module-type"
              v-model="form.type_id"
              required
              :disabled="loading || !moduleTypes.length"
              class="input-field"
            >
              <option value="">Выберите тип</option>
              <option 
                v-for="type in moduleTypes" 
                :key="type.id" 
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
            
            <div v-if="!moduleTypes.length && !loadingTypes" class="error-message">
              <small>Типы модулей не загружены. Проверьте настройки сервера.</small>
            </div>
          </div> -->
          
          <div class="form-group">
            <label for="module-status">Статус *</label>
            <select
              id="module-status"
              v-model="form.status_id"
              required
              :disabled="loading || !statuses.length"
              class="input-field"
            >
              <option value="">Выберите статус</option>
              <option 
                v-for="status in statuses" 
                :key="status.id" 
                :value="status.id"
              >
                {{ status.name }}
              </option>
            </select>
          </div>
          
          <!-- <div class="form-group">
            <label for="module-description">Описание (необязательно)</label>
            <textarea
              id="module-description"
              v-model="form.description"
              placeholder="Дополнительная информация о модуле..."
              :disabled="loading"
              class="input-field textarea"
              rows="3"
            ></textarea>
          </div> -->
          
          <div v-if="error" class="error-message">
            <strong>Ошибка:</strong> {{ error }}
          </div>
          
          <footer class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="close"
              :disabled="loading"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading || !isFormValid"
            >
              <template v-if="loading">
                <span class="spinner-btn"></span>
                {{ isEditing ? 'Сохранение...' : 'Создание...' }}
              </template>
              <template v-else>
                {{ isEditing ? 'Сохранить изменения' : 'Создать модуль' }}
              </template>
            </button>
          </footer>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { EventsService } from '@/services/eventsService'


const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  eventId: {
    type: [String, Number],
    required: true
  },
  module: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'created', 'updated'])

// Данные формы
const form = ref({
  name: '',
  type_id: '',
  status_id: '',
  description: ''
})

// Состояния
const loading = ref(false)
const loadingTypes = ref(false)
const loadingStatuses = ref(false)
const error = ref('')

// Данные для выпадающих списков
const moduleTypes = ref([])
const statuses = ref([])

const isEditing = computed(() => !!props.module)

// Проверка валидности формы
const isFormValid = computed(() => {
  return form.value.name.trim() !== '' &&
        //  form.value.type_id !== '' &&
         form.value.status_id !== ''
})

// Инициализация формы
const initForm = () => {
  if (props.module) {
    // Режим редактирования
    form.value = {
      name: props.module.name || '',
      type_id: props.module.type_id || '',
      status_id: props.module.status_id || '',
      description: props.module.description || ''
    }
  } else {
    // Режим создания
    form.value = {
      name: '',
      type_id: '',
      status_id: '',
      description: ''
    }
  }
  error.value = ''
}

// Загрузка типов модулей
// const loadModuleTypes = async () => {
//   try {
//     loadingTypes.value = true
//     moduleTypes.value = await EventsService.getModuleTypes()
//     console.log('✅ Типы модулей загружены:', moduleTypes.value)
//   } catch (error) {
//     console.error('❌ Ошибка загрузки типов модулей:', error)
//     moduleTypes.value = []
//   } finally {
//     loadingTypes.value = false
//   }
// }

let statusesLoaded = false // Флаг для отслеживания загрузки

const loadStatuses = async () => {
  try {
    loadingStatuses.value = true
    
    // Используем новый метод для статусов модулей
    if (EventsService.getModuleStatuses) {
      statuses.value = await EventsService.getModuleStatuses()
      console.log('✅ Статусы модулей загружены:', statuses.value)
    } else {
      // Fallback - фильтруем общие статусы
      const allStatuses = await EventsService.getStatuses()
      
      // Фильтруем только статусы для модулей (по контексту или имени)
      statuses.value = allStatuses.filter(status => {
        // Если есть context_id, фильтруем по нему
        if (status.context_id) {
          // Проверьте, какой context_id соответствует модулям
          // Например, context_id для модулей = 3
          return status.context_id === 3
        }
        
        // Или фильтруем по именам
        const moduleStatusNames = ['Запланирован', 'Активен', 'Завершён', 'Отменён']
        return moduleStatusNames.includes(status.name)
      })
      
      console.log('✅ Отфильтрованные статусы модулей:', statuses.value)
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки статусов:', error)
    statuses.value = [
      { id: 1, name: 'Запланирован' },
      { id: 2, name: 'Активен' },
      { id: 3, name: 'Завершён' },
      { id: 4, name: 'Отменён' }
    ]
  } finally {
    loadingStatuses.value = false
  }
}

// Отправка формы
const submit = async () => {
  if (!isFormValid.value) {
    error.value = 'Заполните все обязательные поля'
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    console.log('📤 Отправляем данные модуля:', form.value)
    
    if (isEditing.value) {
      // Редактирование существующего модуля
      const updatedModule = await EventsService.updateModule(props.module.id, form.value)
      console.log('✅ Модуль обновлен:', updatedModule)
      emit('updated', updatedModule)
    } else {
      // Создание нового модуля
      const newModule = await EventsService.createModule(props.eventId, form.value)
      console.log('✅ Модуль создан:', newModule)
      emit('created', newModule)
    }
    
    close()
    
  } catch (err) {
    console.error('❌ Ошибка при сохранении модуля:', err)
    
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      error.value = Object.values(errors).flat().join(', ')
    } else if (err.response?.status === 401) {
      error.value = 'Ошибка авторизации'
    } else {
      error.value = err.message || 'Не удалось сохранить модуль'
    }
  } finally {
    loading.value = false
  }
}

// Закрытие модального окна
const close = () => {
  if (!loading.value) {
    initForm()
    emit('close')
  }
}

// Наблюдаем за изменениями props
watch(() => props.show, async (newVal) => {
  if (newVal) {
    initForm()
    // if (!moduleTypes.value.length) {
    // //   loadModuleTypes()
    // }
    if (!statuses.value.length) {
      await loadStatuses()
    }
  }
})

// Инициализация при монтировании
// onMounted(() => {
// //   loadModuleTypes()
//   loadStatuses()
// })
</script>

<style scoped>
/* Стили такие же как в предыдущих модальных окнах */
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

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.input-field:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.error-message small {
  font-size: 0.85rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary {
  background: #2E80ED;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1E6FD9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-btn {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: button-spinner 0.8s linear infinite;
  margin-right: 0.5rem;
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