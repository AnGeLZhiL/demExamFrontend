<template>
  <div class="users-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>Пользователи</h1>
      <div class="header-actions">
        <!-- Кнопка добавления (неактивная пока) -->
        <button @click="openAddModal" class="btn btn-primary">
          + Добавить пользователя
        </button>

        <button @click="openImportModal" class="btn btn-success">
          📥 Импорт групп
        </button>

        <button 
          v-if="selectedUsers.length > 0"
          @click="confirmBulkDelete"
          class="btn btn-danger"
          :disabled="isBulkDeleting"
        >
          <span v-if="isBulkDeleting">🔄 Удаление...</span>
          <span v-else>🗑️ Удалить выбранных ({{ selectedUsers.length }})</span>
        </button>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <!-- Поиск по ФИО -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по ФИО..."
          @input="handleSearch"
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <!-- Фильтр по группе -->
      <div class="filter-group">
        <label>Группа:</label>
        <select
          v-model="selectedFilterGroupId"
          @change="applyFilters"
          class="select-input"
        >
          <option value="">Все группы</option>
          <option
            v-for="group in groups"
            :key="group.id"
            :value="group.id"
          >
            {{ group.number }}
          </option>
        </select>
      </div>
      <!-- Фильтр по системной роли -->
      <div class="filter-group">
        <label>Фильтр по роли:</label>
        <select v-model="selectedStatus" class="select-input" @change="applyFilter">
          <option value="">Все</option>
          <option value="system">Системные</option>
          <option value="regular">Обычные</option>
        </select>
      </div>
      <!-- Кнопки управления выбором -->
      <div class="selection-controls">
        <button 
          @click="toggleSelectAll"
          class="btn btn-sm btn-secondary"
          :disabled="filteredUsers.length === 0"
        >
          {{ isAllSelected ? 'Снять выделение' : 'Выделить всех' }}
        </button>
        
        <button 
          @click="clearSelection"
          class="btn btn-sm btn-secondary"
          :disabled="selectedUsers.length === 0"
        >
          Очистить выбор
        </button>
      </div>
    </div>

    <!-- Таблица пользователей -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                :disabled="filteredUsers.length === 0"
              />
            </th>
            <th>№</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Группа</th>
            <th style="width: 120px;">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <!-- Обновите colspan с 6 на 7 -->
            <td colspan="8" class="loading">Загрузка...</td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <!-- Обновите colspan с 6 на 7 -->
            <td colspan="8" class="empty">Пользователи не найдены</td>
          </tr>
          <tr 
            v-else 
            v-for="(user, index) in filteredUsers" 
            :key="user.id"
            :class="{ 'selected-row': isUserSelected(user.id) }"
          >
            <!-- НОВАЯ колонка с чекбоксом -->
            <td>
              <input
                type="checkbox"
                :checked="isUserSelected(user.id)"
                @change="toggleUserSelection(user.id)"
                :disabled="isDeleteDisabled(user)"
              />
            </td>
            
            <td :class="{ 'fw-bold': user.is_system_account }">{{ index + 1 }}</td>
            <td :class="{ 'fw-bold': user.is_system_account }">{{ user.last_name }}</td>
            <td :class="{ 'fw-bold': user.is_system_account }">{{ user.first_name }}</td>
            <td :class="{ 'fw-bold': user.is_system_account }">{{ user.middle_name || '-' }}</td>
            <td :class="{ 'fw-bold': user.is_system_account }">
              {{ user.group ? user.group.number : '-' }}
            </td>
            <td class="actions">
              <!-- Кнопка «Обновить» -->
              <button
                @click="openEditModal(user)"
                class="btn btn-sm btn-primary"
                title="Редактировать пользователя"
              >
                ✏
              </button>
              <!-- Кнопка «Удалить» -->
              <button
                @click="confirmDeleteUser(user)"
                :disabled="isDeleteDisabled(user)"
                class="btn btn-sm btn-danger"
                title="Удалить пользователя"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация/инфо -->
    <div class="table-footer">
      <div class="selection-info" v-if="selectedUsers.length > 0">
        Выбрано: <strong>{{ selectedUsers.length }}</strong> из {{ filteredUsers.length }} 
        (всего: {{ users.length }})
      </div>
      
      <div class="users-count" v-else>
        Найдено: <strong>{{ filteredUsers.length }}</strong> из {{ users.length }}
      </div>
    </div>

    <!-- Модальное окно добавления пользователя -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>Добавить пользователя</h3>

        <form @submit.prevent="createUser" class="user-form">
          <!-- Фамилия, имя, отчество -->
          <div class="form-group">
            <label>Фамилия *</label>
            <input v-model="newUser.last_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Имя *</label>
            <input v-model="newUser.first_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Отчество</label>
            <input v-model="newUser.middle_name" type="text" />
          </div>

          <!-- Выбор группы -->
          <div class="form-group">
            <label>Группа</label>
            <div class="group-selector">
              <select
                v-model="selectedGroupId"
                @change="onGroupSelect"
                class="select-input"
              >
                <option value="">Выберите группу...</option>
                <option
                  v-for="group in groups"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.number }}
                </option>
              </select>
              <button
                type="button"
                @click="showCreateGroupForm = true"
                class="btn btn-small"
              >
                + Создать
              </button>
            </div>
          </div>

          <!-- Форма создания новой группы -->
          <div v-if="showCreateGroupForm" class="create-group-form">
            <h4>Создать новую группу</h4>
            <div class="form-group">
              <label>Номер группы *</label>
              <input
                v-model="newGroupNumber"
                type="text"
                placeholder="Например: 101А"
                required
              />
            </div>
            <div class="form-actions">
              <button
                type="button"
                @click="cancelCreateGroup"
                class="btn btn-secondary"
              >
                Отмена
              </button>
              <button
                type="button"
                @click="createGroup"
                :disabled="isCreatingGroup"
                class="btn btn-primary"
              >
                {{ isCreatingGroup ? 'Создание...' : 'Создать группу' }}
              </button>
            </div>
          </div>

          <!-- Системная роль -->
          <div class="form-group">
            <label>
              <input
                type="checkbox"
                v-model="isSystemUser"
                @change="handleSystemUserChange"
                class="checkbox-inline"
              />
              Системный пользователь?
            </label>

            <!-- Выбор роли - исправленная версия -->
            <div v-if="isSystemUser && systemRoles.length > 0" class="role-selector">
              <label>Роль *</label>
              <div
                v-for="role in systemRoles"
                :key="role.id"
                class="role-option"
              >
                <input
                  type="radio"
                  :id="'edit-role-' + role.id"
                  v-model="editingUser.system_role_id"
                  :value="Number(role.id)"
                  required
                />
                <label :for="'edit-role-' + role.id">{{ role.name }}</label>
              </div>
            </div>
            
            <!-- Сообщение если ролей нет -->
            <div v-else-if="isSystemUser && systemRoles.length === 0" class="text-warning">
              Нет доступных системных ролей
            </div>
          </div>

          <!-- Кнопки формы -->
          <div class="form-actions">
            <button type="button" @click="closeModal">Отмена</button>
            <button
              type="submit"
              :disabled="isSubmitting || (isSystemUser && !selectedRoleId)"
            >
              {{ isSubmitting ? 'Сохранение...' : 'Добавить' }}
            </button>
          </div>

          <!-- Ошибка -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
    <!-- Модальное окно редактирования пользователя -->
    <div v-if="showEditModal && editingUser.id" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <h3>Редактировать пользователя</h3>
        <form @submit.prevent="updateUser" class="user-form">
          <!-- Фамилия, имя, отчество -->
          <div class="form-group">
            <label>Фамилия *</label>
            <input v-model="editingUser.last_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Имя *</label>
            <input v-model="editingUser.first_name" type="text" required />
          </div>
          <div class="form-group">
            <label>Отчество</label>
            <input v-model="editingUser.middle_name" type="text" />
          </div>

          <!-- Выбор группы -->
          <div class="form-group">
            <label>Группа</label>
            <div class="group-selector">
              <select
                v-model="editingUser.group_id"
                class="select-input"
              >
                <option value="">Без группы</option>
                <option
                  v-for="group in groups"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.number }}
                </option>
              </select>
              <button
                type="button"
                @click="showCreateGroupForm = true"
                class="btn btn-small"
              >
                + Создать
              </button>
            </div>
          </div>

          <!-- Системная роль -->
          <div class="form-group">
            <label>
              <input
                type="checkbox"
                v-model="isSystemUser"
                class="checkbox-inline"
              />
              Системный пользователь?
            </label>

            <div v-if="isSystemUser && systemRoles.length > 0" class="role-selector">
              <label>Роль *</label>
              <div
                v-for="role in systemRoles"
                :key="role.id"
                class="role-option"
              >
                <input
                  type="radio"
                  :id="'edit-role-' + role.id"
                  v-model="editingUser.system_role_id"
                  :value="Number(role.id)"
                  required
                />
                <label :for="'edit-role-' + role.id">{{ role.name }}</label>
              </div>
            </div>
          </div>

          <!-- Кнопка генерации пароля -->
          <div v-if="isSystemUser && editingUser.id !== 1 && editingUser.id !== currentUserId" class="form-group">
            <label>Управление паролем системной учётной записи</label>
            <button 
              @click.prevent="generateSystemPassword"
              :disabled="isGeneratingPassword"
              class="btn btn-primary"
            >
              {{ isGeneratingPassword ? 'Генерация...' : 'Сгенерировать новый пароль' }}
            </button>
          </div>
          <!-- Форма создания новой группы (если открыта) -->
          <div v-if="showCreateGroupForm" class="create-group-form">
            <h4>Создать новую группу</h4>
            <div class="form-group">
              <label>Номер группы *</label>
              <input
                v-model="newGroupNumber"
                type="text"
                placeholder="Например: 101А"
                required
              />
            </div>
            <div class="form-actions">
              <button
                type="button"
                @click="cancelCreateGroup"
                class="btn btn-secondary"
              >
                Отмена
              </button>
              <button
                type="button"
                @click="createGroup"
                :disabled="isCreatingGroup"
                class="btn btn-primary"
              >
                {{ isCreatingGroup ? 'Создание...' : 'Создать группу' }}
              </button>
            </div>
          </div>

          <!-- Кнопки формы -->
          <div class="form-actions">
            <button type="button" @click="closeEditModal">Отмена</button>
            <button
              type="submit"
              :disabled="isSubmitting || (isSystemUser && !editingUser.system_role_id)"
            >
              {{ isSubmitting ? 'Сохранение...' : 'Сохранить изменения' }}
            </button>
          </div>

          <!-- Сообщение об ошибке -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
    <!-- Модальное окно импорта групп -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="modal-content modal-wide">
        <h3>📥 Импорт групп с портала НОВГУ</h3>
        
        <div class="import-container">
          <!-- Поиск групп -->
          <div class="search-section">
            <div class="form-group">
              <label>Номер группы для поиска (можно частично):</label>
              <div class="search-input-with-button">
                <input
                  v-model="importSearchTerm"
                  @input="handleImportSearch"
                  type="text"
                  placeholder="Например: 3999, 101, ИСП"
                  class="search-input-full"
                  :disabled="isSearchingGroups"
                />
                <button 
                  @click="searchGroupsFromUniversity"
                  class="btn btn-primary"
                  :disabled="isSearchingGroups || !importSearchTerm.trim()"
                >
                  <span v-if="isSearchingGroups">🔍 Поиск...</span>
                  <span v-else>Найти</span>
                </button>
              </div>
              <small class="hint">Поиск по порталу portal.novsu.ru</small>
            </div>
          </div>
          
          <!-- Результаты поиска -->
          <div v-if="foundGroups.length > 0" class="results-section">
            <h4>Найдено групп: {{ foundGroups.length }}</h4>
            
            <div class="groups-list">
              <div 
                v-for="group in foundGroups" 
                :key="group.id"
                class="group-item"
                :class="{ 'selected': selectedImportGroup?.number === group.number }"
                @click="selectImportGroup(group)"
              >
                <div class="group-header">
                  <div class="group-number">
                    <strong>{{ group.number }}</strong>
                    <span v-if="group.students_count" class="badge">
                      {{ group.students_count }} студентов
                    </span>
                  </div>
                  <div class="group-select-indicator">
                    <input 
                      type="radio" 
                      :checked="selectedImportGroup?.number === group.number"
                      @change="selectImportGroup(group)"
                    />
                  </div>
                </div>
                
                <div class="group-details">
                  <div v-if="group.direction" class="detail">
                    <strong>Направление:</strong> {{ group.direction }}
                  </div>
                  <div v-if="group.profile" class="detail">
                    <strong>Профиль:</strong> {{ group.profile }}
                  </div>
                  <div v-if="group.course" class="detail">
                    <strong>Курс:</strong> {{ group.course }}
                  </div>
                  <div v-if="group.institute" class="detail">
                    <strong>Институт:</strong> {{ group.institute }}
                  </div>
                  <div v-if="group.form" class="detail">
                    <strong>Форма:</strong> {{ group.form }}
                  </div>
                  <div v-if="group.admission_year" class="detail">
                    <strong>Год поступления:</strong> {{ group.admission_year }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Сообщение если ничего не найдено -->
          <div v-else-if="importSearchTerm.trim() && !isSearchingGroups" class="no-results">
            <p>Группы не найдены. Попробуйте другой номер.</p>
          </div>
          
          <!-- Выбранная группа -->
          <div v-if="selectedImportGroup" class="selected-group-info">
            <div class="alert alert-info">
              <strong>Выбрана группа:</strong> {{ selectedImportGroup.number }}
              <div v-if="selectedImportGroup.students_count">
                Будет импортировано {{ selectedImportGroup.students_count }} студентов
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            type="button" 
            @click="closeImportModal"
            class="btn btn-secondary"
          >
            Отмена
          </button>
          <button 
            type="button" 
            @click="importSelectedGroup"
            class="btn btn-success"
            :disabled="!selectedImportGroup || isSearchingGroups"
          >
            📥 Импортировать выбранную группу
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch  } from 'vue'
import { UsersService } from '@/services/usersService'
import { GroupsService } from '@/services/groupsService'
import { SystemRolesService } from '@/services/systemRolesService'
import { EventAccountsService } from '@/services/eventAccountsService'
import { AuthService } from '@/services/authService'
import { SystemAccountService } from '@/services/systemAccountService'
import { UniversityParserService } from '@/services/universityParserService'

// Данные
const isSystemUser = ref(false)
const users = ref([])
const searchQuery = ref('')
const loading = ref(false)
const selectedFilterGroupId = ref('')
const currentUserId = ref(null)
const isLoadingAuth = ref(false)

// Состояние модального окна добавления
const showAddModal = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Состояние модального окна обновления
const showEditModal = ref(false)
const editingUser = reactive({
  id: null,
  last_name: '',
  first_name: '',
  middle_name: '',
  group_id: null,
  is_system_account: false,
  system_role_id: null
})

// Данные нового пользователя
const newUser = ref({
  last_name: '',
  first_name: '',
  middle_name: '',
  group_id: null,
  system_role_id: null
})

// Группы
const groups = ref([])
const selectedGroupId = ref('')

// Создание группы
const showCreateGroupForm = ref(false)
const newGroupNumber = ref('')
const isCreatingGroup = ref(false)

// Системные роли
const systemRoles = ref([])
const selectedRoleId = ref(null)
const selectedStatus = ref('');

// Состояние для генерации
const isGeneratingPassword = ref(false);
const generatedPassword = ref('');

// Данные для массового удаления
const selectedUsers = ref([]) // Массив ID выбранных пользователей
const isBulkDeleting = ref(false)

// Данные для импорта групп
const showImportModal = ref(false)
const importSearchTerm = ref('')
const foundGroups = ref([])
const isSearchingGroups = ref(false)
const selectedImportGroup = ref(null)

// Загрузка пользователей
const loadUsers = async () => {
  try {
    loading.value = true
    users.value = await UsersService.getAllUsers()
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

// Метод: запросить новый пароль у API
const generateSystemPassword = async () => {
  if (!editingUser.id) return

  isGeneratingPassword.value = true
  generatedPassword.value = ''
  errorMessage.value = ''

  try {
    console.log('Генерация пароля для пользователя ID:', editingUser.id)
    const response = await SystemAccountService.generatePassword(editingUser.id)
    
    // Проверяем структуру ответа
    console.log('Ответ от API генерации пароля:', response)
    
    let newPassword = ''
    
    // В зависимости от структуры ответа
    if (response.data && response.data.password) {
      newPassword = response.data.password
    } else if (response.password) {
      newPassword = response.password
    } else {
      newPassword = response
    }
    
    // Показываем пароль в alert вместо отображения в форме
    showPasswordAlert(newPassword, editingUser.id)
    
  } catch (error) {
    console.error('Ошибка генерации пароля:', error)
    errorMessage.value = error.response?.data?.error || 'Не удалось сгенерировать пароль'
    alert(`Ошибка: ${errorMessage.value}`)
  } finally {
    isGeneratingPassword.value = false
  }
}

// Функция для отображения пароля в alert
const showPasswordAlert = (password, userId) => {
  const user = users.value.find(u => u.id === userId)
  const userName = user ? `${user.last_name} ${user.first_name}` : `ID: ${userId}`
  
  const message = `🔐 Сгенерирован новый пароль для пользователя ${userName}

Новый пароль: ${password}

⚠️ ВАЖНО:
1. Сохраните этот пароль
2. Пароль больше не будет показан
3. Передайте его пользователю

Пароль для копирования:
"${password}"`
  
  alert(message)
}



// Загрузка данных текущего авторизованного пользователя
const loadCurrentUser = async () => {
  try {
    isLoadingAuth.value = true;
    
    // Проверяем токен
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('Токен не найден');
      return;
    }
    
    const response = await AuthService.getUser();
    
    // В зависимости от структуры ответа
    if (response.data && response.data.id) {
      currentUserId.value = response.data.id;
    } else if (response.id) {
      currentUserId.value = response.id;
    }
    
    console.log('✅ Текущий пользователь ID:', currentUserId.value);
    
  } catch (error) {
    console.error('Не удалось загрузить данные текущего пользователя:', error);
    currentUserId.value = null;
  } finally {
    isLoadingAuth.value = false;
  }
};


// Функция загрузки групп
const loadGroups = async () => {
  try {
    console.log('🔄 Загружаем актуальный список групп...')
    groups.value = await GroupsService.getAllGroups()
    console.log('✅ Группы загружены:', groups.value.length)
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
    groups.value = []
  }
}

// Поиск с дебаунсом
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadUsers()
  }, 500)
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  } catch {
    return dateString
  }
}

// Загрузка системных ролей
const loadSystemRoles = async () => {
  try {
    console.log('Загрузка системных ролей...')
    const roles = await SystemRolesService.getAll()
    systemRoles.value = roles
    console.log('Системные роли загружены:', systemRoles.value)
  } catch (error) {
    console.error('Ошибка загрузки системных ролей:', error)
    systemRoles.value = []
  }
}

const handleSystemUserChange = (event) => {
  const isChecked = event.target.checked
  isSystemUser.value = isChecked
  
  // Если снимаем галочку "системный пользователь"
  if (!isChecked) {
    editingUser.system_role_id = null
  }
}

// Открытие модального окна
const openAddModal = async () => {
  showAddModal.value = true
  errorMessage.value = ''
  newUser.value = {
    last_name: '',
    first_name: '',
    middle_name: '',
    group_id: null,
    system_role_id: null
  }
  selectedGroupId.value = ''
  isSystemUser.value = false
  selectedRoleId.value = null
  showCreateGroupForm.value = false
  newGroupNumber.value = ''

  // Загружаем группы и роли при открытии модалки
  await Promise.all([
    loadGroups(),
    loadSystemRoles()
  ])
}

// Закрытие модального окна
const closeModal = () => {
  showAddModal.value = false
  isSubmitting.value = false
  errorMessage.value = ''
}

// Обработчик выбора группы
const onGroupSelect = () => {
  newUser.value.group_id = selectedGroupId.value
}

// Показ формы создания группы
const showCreateGroup = () => {
  showCreateGroupForm.value = true
}

// Отмена создания группы
const cancelCreateGroup = () => {
  showCreateGroupForm.value = false
  newGroupNumber.value = ''
}

// Создание новой группы
const createGroup = async () => {
  if (!newGroupNumber.value) {
    errorMessage.value = 'Введите номер группы'
    return
  }

  try {
    isCreatingGroup.value = true
    errorMessage.value = ''

    const createdGroup = await GroupsService.createGroup({
      number: newGroupNumber.value
    })

    // Добавляем в список групп
    groups.value.push(createdGroup)
    // Выбираем её
    selectedGroupId.value = createdGroup.id
    newUser.value.group_id = createdGroup.id


    // Скрываем форму
    showCreateGroupForm.value = false
    newGroupNumber.value = ''

    alert('Группа создана!')
  } catch (error) {
    console.error('Ошибка создания группы:', error)
    errorMessage.value =
      error.response?.data?.error || 'Не удалось создать группу'
  } finally {
    isCreatingGroup.value = false
  }
}

const createUser = async () => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''

    // Валидация обязательных полей
    if (!newUser.value.last_name || !newUser.value.first_name) {
      errorMessage.value = 'Заполните все обязательные поля (Фамилия, Имя)'
      return
    }

    if (isSystemUser.value && !selectedRoleId.value) {
      errorMessage.value = 'Выберите роль для системного пользователя'
      return
    }

    // Устанавливаем system_role_id, если пользователь системный
    if (isSystemUser.value) {
      newUser.value.system_role_id = selectedRoleId.value
    }

    let createdUser // Объявляем переменную заранее

    try {
      // Создаём пользователя
      createdUser = await UsersService.createUser(newUser.value)
      
      // 🔴 ДОБАВЛЯЕМ: Загружаем полные данные пользователя с сервера
      // чтобы получить связанную группу
      try {
        const fullUserData = await UsersService.getUserById(createdUser.id)
        createdUser = fullUserData.user || fullUserData
      } catch (loadError) {
        console.error('Не удалось загрузить полные данные пользователя:', loadError)
        // Если не удалось загрузить, добавляем группу вручную
        if (newUser.value.group_id) {
          const selectedGroup = groups.value.find(g => g.id === newUser.value.group_id)
          if (selectedGroup) {
            createdUser.group = selectedGroup
          }
        }
      }
      
    } catch (userError) {
      console.error('Ошибка создания пользователя:', userError)
      errorMessage.value = userError.response?.data?.error || 'Не удалось добавить пользователя'
      return // Прерываем выполнение, если пользователь не создан
    }

    // Если пользователь системный — создаём системную учётную запись
    if (isSystemUser.value && createdUser) {
      try {
        const systemAccountResponse = await EventAccountsService.createSystemAccount({
          user_id: createdUser.id,
          role_id: selectedRoleId.value,
          seat_number: newUser.value.seat_number || null
        })

        const { login, raw_password } = systemAccountResponse.credentials

        alert(`
          Системная учётная запись создана!
          Логин: ${login}
          Пароль: ${raw_password}

          Сохраните эти данные — пароль больше не будет показан!
        `)

      } catch (accError) {
        console.error('Ошибка создания системной учётной записи:', accError)

        // Опционально: удалить пользователя при ошибке
        try {
          await UsersService.deleteUser(createdUser.id)
        } catch (delError) {
          console.error('Не удалось удалить пользователя после ошибки:', delError)
        }

        errorMessage.value = accError.response?.data?.error
          || 'Не удалось создать системную учётную запись. Пользователь удалён.'
        return
      }
    }

    // Добавляем пользователя в список
    users.value.push(createdUser)
    
    // 🔴 ДОБАВЛЯЕМ: Перезагружаем список пользователей для синхронизации
    await loadUsers()
    
    closeModal()
    alert('Пользователь добавлен успешно!')

  } catch (error) {
    console.error('Неожиданная ошибка:', error)
    errorMessage.value = 'Произошла непредвиденная ошибка'
  } finally {
    isSubmitting.value = false
  }
}

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Фильтрация по ФИО
    const matchesSearch = !searchQuery.value ||
      user.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.value.toLowerCase());

    // Фильтрация по группе
    const matchesGroup = !selectedFilterGroupId.value ||
      (user.group && user.group.id === selectedFilterGroupId.value);

    // Фильтрация по статусу (системный/обычный)
    const matchesStatus = !selectedStatus.value || (
      (selectedStatus.value === 'system' && user.is_system_account) ||
      (selectedStatus.value === 'regular' && !user.is_system_account)
    );

    return matchesSearch && matchesGroup && matchesStatus;
  });
})

// Проверка, выделены ли все пользователи
const isAllSelected = computed(() => {
  if (filteredUsers.value.length === 0) return false
  // Проверяем, что все НЕзаблокированные пользователи выделены
  const selectableUsers = filteredUsers.value.filter(user => !isDeleteDisabled(user))
  return selectableUsers.length > 0 && 
         selectableUsers.every(user => selectedUsers.value.includes(user.id))
})

// Функция для применения фильтров (вызывается при изменении фильтра)
const applyFilters = () => {
  // Перезагрузка не нужна — computed автоматически обновит filteredUsers
}

const loadUserDetails = async (userId) => {
  try {
    const response = await UsersService.getUserById(userId); // Запрос к /api/users/{id}
    return response.data; // Предполагаем, что ответ содержит system_role
  } catch (error) {
    console.error('Ошибка загрузки деталей пользователя:', error);
    return null;
  }
};

// Открытие модального окна редактирования
const openEditModal = async (user) => {
  console.log('=== OPEN EDIT MODAL START ===')
  
  try {
    await loadGroups()

    // Загружаем системные роли если нужно
    if (systemRoles.value.length === 0) {
      await loadSystemRoles()
    }

    // Загружаем детали пользователя
    console.log('Загружаем детали пользователя ID:', user.id)
    const response = await UsersService.getUserById(user.id)
    console.log('Полный ответ от API:', response)
    
    // Извлекаем данные из ответа
    const apiData = response.data || response
    console.log('apiData:', apiData)
    
    // user находится в apiData.user
    const userData = apiData.user || user
    const systemRoleData = apiData.system_role
    
    console.log('userData:', userData)
    console.log('systemRoleData:', systemRoleData)
    
    // Обновляем editingUser с правильной структурой
    editingUser.id = userData.id
    editingUser.last_name = userData.last_name
    editingUser.first_name = userData.first_name
    editingUser.middle_name = userData.middle_name || ''
    editingUser.group_id = userData.group_id || userData.group?.id || null
    editingUser.is_system_account = Boolean(userData.is_system_account)
    
    // system_role_id берем из systemRoleData.id
    editingUser.system_role_id = systemRoleData?.id || null
    
    // Устанавливаем isSystemUser
    isSystemUser.value = Boolean(userData.is_system_account)
    
    console.log('editingUser после обновления:', {
      id: editingUser.id,
      last_name: editingUser.last_name,
      first_name: editingUser.first_name,
      is_system_account: editingUser.is_system_account,
      system_role_id: editingUser.system_role_id
    })
    
    showEditModal.value = true
    console.log('Модальное окно должно открыться!')
    
  } catch (error) {
    console.error('Ошибка в openEditModal:', error)
    showEditModal.value = false
  }
}


// Проверка, можно ли удалить пользователя
const isDeleteDisabled = (user) => {
  // 1. Нельзя удалить пользователя с id=1
  if (user.id === 1) {
    return true;
  }
  
  // 2. Нельзя удалить себя
  if (currentUserId.value && user.id === currentUserId.value) {
    return true;
  }
  
  return false;
}

// Подтверждение удаления
const confirmDeleteUser = (user) => {
  if (isDeleteDisabled(user)) {
    let message = 'Нельзя удалить этого пользователя!';
    
    if (user.id === 1) {
      message = 'Нельзя удалить системного администратора (ID=1)';
    } else if (currentUserId.value && user.id === currentUserId.value) {
      message = 'Вы не можете удалить свою собственную учётную запись';
    }
    
    alert(message);
    return;
  }

  const confirmed = confirm(
    `Вы уверены, что хотите удалить пользователя "${user.last_name} ${user.first_name}"?\n\n` +
    `⚠️ ВНИМАНИЕ: Будут также удалены:\n` +
    `• Все учётные записи этого пользователя в мероприятиях\n` +
    `• Все связанные системные аккаунты\n` +
    `• Все данные о ролях в мероприятиях`
  );
  
  if (confirmed) {
    deleteUser(user.id);
  }
}

// Удаление пользователя
const deleteUser = async (userId) => {
  try {
    loading.value = true;
    
    // Показываем подтверждение
    const user = users.value.find(u => u.id === userId);
    if (!user) {
      alert('Пользователь не найден!');
      loading.value = false;
      return;
    }
    
    const confirmed = confirm(
      `Удалить пользователя "${user.last_name} ${user.first_name}"?\n\n` +
      `⚠️ ВНИМАНИЕ: Будут также удалены все учётные записи этого пользователя в мероприятиях.`
    );
    
    if (!confirmed) {
      loading.value = false;
      return;
    }
    
    console.log('🗑️ Удаляем пользователя ID:', userId);
  
    await UsersService.deleteUser(userId);
    
    setTimeout(async () => {
      await loadGroups()
    }, 500)
    
    // Удаляем из списка
    users.value = users.value.filter(u => u.id !== userId);
    
    alert('✅ Пользователь успешно удален!');
    
  } catch (error) {
    console.error('❌ Ошибка при удалении пользователя:', error);
    loading.value = false;
    
    let errorMessage = 'Не удалось удалить пользователя';
    
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные ошибки:', error.response.data);
      
      if (error.response.status === 403) {
        errorMessage = error.response.data?.error || 'Нет прав на удаление';
      } else if (error.response.status === 404) {
        errorMessage = 'Пользователь не найден';
      } else if (error.response.status === 422) {
        errorMessage = 'Ошибка валидации';
      } else if (error.response.status === 500) {
        errorMessage = 'Ошибка сервера';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(`❌ ${errorMessage}`);
  }
};

// Сохранение изменений при редактировании
const updateUser = async () => {
  try {
    if (!editingUser.id) {
      throw new Error('Нет ID пользователя')
    }

    isSubmitting.value = true
    errorMessage.value = ''

    // Проверка валидации
    if (!editingUser.last_name || !editingUser.first_name) {
      errorMessage.value = 'Заполните обязательные поля (Фамилия и Имя)'
      isSubmitting.value = false
      return
    }

    if (isSystemUser.value && !editingUser.system_role_id) {
      errorMessage.value = 'Для системного пользователя необходимо выбрать роль'
      isSubmitting.value = false
      return
    }

    console.log('=== ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ===')
    console.log('ID:', editingUser.id)
    console.log('isSystemUser:', isSystemUser.value)
    console.log('system_role_id:', editingUser.system_role_id)

    // 1. Обновляем основные данные пользователя
    const userUpdateData = {
      last_name: editingUser.last_name,
      first_name: editingUser.first_name,
      middle_name: editingUser.middle_name,
      group_id: editingUser.group_id
    }

    console.log('Обновляем пользователя:', userUpdateData)
    const userResponse = await UsersService.updateUser(editingUser.id, userUpdateData)
    console.log('Пользователь обновлен:', userResponse)

    // 2. Управление системным аккаунтом
    if (isSystemUser.value && editingUser.system_role_id) {
      console.log('Назначаем системную роль ID:', editingUser.system_role_id)
      
      try {
        // Пытаемся обновить существующий системный аккаунт
        const systemAccountResponse = await SystemAccountService.updateSystemAccount(
          editingUser.id,
          { role_id: editingUser.system_role_id }
        )
        console.log('Ответ от updateSystemAccount:', systemAccountResponse)
        
        // ВАЖНО: Проверяем статус код и наличие credentials
        if (systemAccountResponse.credentials) {
          // Показываем логин и пароль
          showCredentialsModal(systemAccountResponse.credentials, editingUser.system_role_id)
        } else {
          // Если credentials нет, просто сообщаем об успехе
          const roleName = systemRoles.value.find(r => r.id === editingUser.system_role_id)?.name || 'системная'
          alert(`Системная роль "${roleName}" назначена пользователю`)
        }
        
      } catch (accountError) {
        console.error('Ошибка при обновлении системного аккаунта:', accountError)
        
        // Если аккаунт не найден (404) - создаем новый системный аккаунт
        // Но ваш метод updateSystemAccount уже создает аккаунт при 404,
        // поэтому эта ошибка не должна возникать
        
        // Если другая ошибка - пробрасываем
        throw accountError
      }
    } else if (!isSystemUser.value) {
      // 3. Если сняли галочку "системный пользователь"
      console.log('Удаляем системный аккаунт (если есть)...')
      try {
        await SystemAccountService.deleteSystemAccounts(editingUser.id)
        console.log('Системный аккаунт удален (или не было)')
      } catch (deleteError) {
        // Если нет аккаунта для удаления - это нормально
        if (deleteError.response?.status !== 404) {
          console.error('Ошибка при удалении:', deleteError)
          throw deleteError
        }
        console.log('Системного аккаунта не было')
      }
    }

    // 4. Перезагружаем данные
    console.log('Загружаем обновленные данные...')
    await loadUsers()

    closeEditModal()
    
  } catch (error) {
    console.error('ОШИБКА при обновлении пользователя:', error)
    console.error('Детали:', error.response?.data)
    
    let userErrorMessage = 'Не удалось обновить пользователя.'
    
    if (error.response) {
      const errorData = error.response.data
      userErrorMessage = errorData?.message || 
                        errorData?.error || 
                        `Ошибка ${error.response.status}: ${error.response.statusText}`
    }
    
    errorMessage.value = userErrorMessage
    alert(`Ошибка: ${userErrorMessage}`)
    
  } finally {
    isSubmitting.value = false
  }
}

// Функция для отображения модального окна с credentials
const showCredentialsModal = (credentials, roleId) => {
  const roleName = systemRoles.value.find(r => r.id === roleId)?.name || 'системная'
  
  const message = `✅ Создана новая системная учётная запись!

📋 Роль: ${roleName}
🔑 Логин: ${credentials.login}
🔒 Пароль: ${credentials.raw_password}

⚠️ ВАЖНО:
1. Сохраните эти данные
2. Пароль больше не будет показан
3. Передайте их пользователю

Пароль для копирования:
"${credentials.raw_password}"`
  
  alert(message)
}

// Очищаем пароль при закрытии модалки
const closeEditModal = () => {
  showEditModal.value = false
  isSubmitting.value = false
  errorMessage.value = ''
  
  // Сбрасываем данные
  editingUser.id = null
  editingUser.last_name = ''
  editingUser.first_name = ''
  editingUser.middle_name = ''
  editingUser.group_id = null
  editingUser.is_system_account = false
  editingUser.system_role_id = null
  
  isSystemUser.value = false
}

// Создаёт системный аккаунт
const createSystemAccount = async (userId) => {
  try {
    const response = await SystemAccountService.createSystemAccount({
      user_id: userId,
      role_id: editingUser.value.system_role_id,
      seat_number: editingUser.value.seat_number
    })
    console.log('Системный аккаунт создан:', response)
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('У пользователя уже есть системный аккаунт для этой роли')
    }
    console.error('Не удалось создать системный аккаунт:', error)
    throw error
  }
}

// Удаляет все системные аккаунты пользователя
const deleteSystemAccounts = async (userId) => {
  try {
    await SystemAccountService.deleteSystemAccounts(userId)
    console.log('Системные аккаунты удалены')
  } catch (error) {
    console.error('Не удалось удалить системные аккаунты:', error)
    // Не блокируем сохранение, если удаление не критично
  }
}

// Проверка выбран ли пользователь
const isUserSelected = (userId) => {
  return selectedUsers.value.includes(userId)
}

// Переключение выбора пользователя
const toggleUserSelection = (userId) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index === -1) {
    selectedUsers.value.push(userId)
  } else {
    selectedUsers.value.splice(index, 1)
  }
}

// Выделить/снять выделение всех
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedUsers.value = []
  } else {
    const selectableUsers = filteredUsers.value // должно быть .value
      .filter(user => !isDeleteDisabled(user))
      .map(user => user.id)
    selectedUsers.value = [...new Set([...selectedUsers.value, ...selectableUsers])]
  }
}

// Очистить выбор
const clearSelection = () => {
  selectedUsers.value = []
}

// Подтверждение массового удаления
const confirmBulkDelete = () => {
  if (selectedUsers.value.length === 0) {
    alert('Нет выбранных пользователей для удаления')
    return
  }
  
  // Проверяем, нет ли среди выбранных защищенных пользователей
  const protectedUsers = selectedUsers.value.filter(userId => {
    const user = getUserById(userId)
    return user && isDeleteDisabled(user)
  })
  
  if (protectedUsers.length > 0) {
    const protectedNames = protectedUsers
      .map(id => getUserById(id))
      .filter(user => user)
      .map(user => `${user.last_name} ${user.first_name}`)
      .join(', ')
    
    alert(`❌ Невозможно удалить некоторых пользователей:\n${protectedNames}\n\n` +
          `Они защищены от удаления (ID=1 или это ваша учётная запись).\n\n` +
          `Удалим остальных выбранных пользователей?`)
    
    // Убираем защищенных пользователей из выбранных
    selectedUsers.value = selectedUsers.value.filter(id => !protectedUsers.includes(id))
    
    if (selectedUsers.value.length === 0) {
      return
    }
  }
  
  // Получаем имена выбранных пользователей
  const userNames = selectedUsers.value
    .map(id => getUserById(id))
    .filter(user => user)
    .map(user => `• ${user.last_name} ${user.first_name}`)
    .join('\n')
  
  const confirmed = confirm(
    `🗑️ УДАЛЕНИЕ ${selectedUsers.value.length} ПОЛЬЗОВАТЕЛЕЙ\n\n` +
    `Список для удаления:\n${userNames}\n\n` +
    `⚠️ ВНИМАНИЕ:\n` +
    `• Будут удалены все учётные записи этих пользователей в мероприятиях\n` +
    `• Будут удалены все связанные системные аккаунты\n` +
    `• Действие нельзя отменить\n\n` +
    `Продолжить удаление?`
  )
  
  if (confirmed) {
    executeBulkDelete()
  }
}

// Выполнить массовое удаление
const executeBulkDelete = async () => {
  if (selectedUsers.value.length === 0) return
  
  try {
    isBulkDeleting.value = true
    
    const total = selectedUsers.value.length
    let deleted = 0
    let errors = []
    
    // Создаем копию массива для удаления
    const usersToDelete = [...selectedUsers.value]
    
    for (const userId of usersToDelete) {
      try {
        const user = getUserById(userId)
        if (!user) {
          errors.push({ userId, error: 'Пользователь не найден в списке' })
          continue
        }
        
        // Пропускаем защищенных пользователей (на всякий случай)
        if (isDeleteDisabled(user)) {
          console.log(`Пропускаем защищенного пользователя: ${user.last_name} ${user.first_name}`)
          errors.push({ userId, error: 'Защищенный пользователь' })
          continue
        }
        
        console.log(`🗑️ Удаляем пользователя: ${user.last_name} ${user.first_name}`)
        await UsersService.deleteUser(userId)
        deleted++
        
        // Удаляем из общего списка
        const index = users.value.findIndex(u => u.id === userId)
        if (index > -1) {
          users.value.splice(index, 1)
        }
        
      } catch (error) {
        console.error(`❌ Ошибка удаления пользователя ${userId}:`, error)
        
        const user = getUserById(userId)
        const userName = user ? `${user.last_name} ${user.first_name}` : `ID: ${userId}`
        
        let errorMsg = 'Неизвестная ошибка'
        if (error.response?.data?.error) {
          errorMsg = error.response.data.error
        } else if (error.message) {
          errorMsg = error.message
        }
        
        errors.push({
          userId,
          userName,
          error: errorMsg
        })
      }
    }

    // 🔴 ДОБАВЛЯЕМ: Обновляем группы после массового удаления
    setTimeout(async () => {
      await loadGroups()
    }, 500)
    
    // Очищаем выбор
    selectedUsers.value = []
    
    // Показываем результат
    let resultMessage = ''
    
    if (deleted > 0) {
      resultMessage += `✅ Успешно удалено: ${deleted} пользователей\n\n`
    }
    
    if (errors.length > 0) {
      resultMessage += `❌ Ошибки (${errors.length}):\n`
      
      const errorDetails = errors
        .map(e => {
          const name = e.userName || `ID: ${e.userId}`
          return `• ${name}: ${e.error}`
        })
        .join('\n')
      
      resultMessage += errorDetails
    } else if (deleted === total) {
      resultMessage = `✅ Все ${deleted} пользователей успешно удалены!`
    }
    
    alert(resultMessage)
    
  } catch (error) {
    console.error('❌ Критическая ошибка массового удаления:', error)
    alert(`❌ Ошибка массового удаления: ${error.message}`)
  } finally {
    isBulkDeleting.value = false
  }
}

// Получить пользователя по ID
const getUserById = (userId) => {
  return users.value.find(user => user.id === userId)
}

// Открыть модалку импорта
const openImportModal = async () => {
  showImportModal.value = true
  importSearchTerm.value = ''
  foundGroups.value = []
  selectedImportGroup.value = null
  
  // Автоматически ищем группы при открытии
  await searchGroupsFromUniversity()
}

// Закрыть модалку импорта
const closeImportModal = () => {
  showImportModal.value = false
}

// Поиск групп на портале университета
// Поиск групп на портале университета
const searchGroupsFromUniversity = async () => {
  if (!importSearchTerm.value.trim()) {
    foundGroups.value = []
    return
  }
  
  try {
    isSearchingGroups.value = true
    foundGroups.value = []
    
    console.log(`🔍 Ищем группы: "${importSearchTerm.value}"`)
    const groups = await UniversityParserService.searchGroups(importSearchTerm.value)
    
    foundGroups.value = groups
    
    if (groups.length === 0) {
      console.log('ℹ️ Группы не найдены')
    }
    
  } catch (error) {
    console.error('❌ Ошибка поиска групп:', error)
    
    // Показываем пользователю ошибку
    alert(`Не удалось найти группы: ${error.message}`)
    
    foundGroups.value = []
  } finally {
    isSearchingGroups.value = false
  }
}

// Выбрать группу для импорта
const selectImportGroup = (group) => {
  selectedImportGroup.value = group
}

// Импортировать выбранную группу
const importSelectedGroup = async () => {
  if (!selectedImportGroup.value) {
    alert('Выберите группу для импорта')
    return
  }
  
  try {
    // Создаем группу в нашей системе
    const groupData = {
      number: selectedImportGroup.value.number,
      description: `Импортировано с портала НОВГУ. ${selectedImportGroup.value.direction} (${selectedImportGroup.value.profile}), ${selectedImportGroup.value.course} курс, ${selectedImportGroup.value.institute}, ${selectedImportGroup.value.form}`
    }
    
    const createdGroup = await GroupsService.createGroup(groupData)
    
    // Добавляем группу в список
    groups.value.push(createdGroup)
    
    // Создаем студентов из группы (опционально)
    if (selectedImportGroup.value.students && selectedImportGroup.value.students.length > 0) {
      await createStudentsFromGroup(selectedImportGroup.value.students, createdGroup.id)
    }
    
    alert(`✅ Группа "${createdGroup.number}" успешно импортирована!`)
    closeImportModal()
    
  } catch (error) {
    console.error('Ошибка импорта группы:', error)
    alert(`❌ Ошибка импорта: ${error.message}`)
  }
}

// Создать студентов из импортированной группы
const createStudentsFromGroup = async (students, groupId) => {
  const createdUsers = []
  
  for (const student of students) {
    try {
      // Разделяем ФИО на части
      const nameParts = student.full_name.split(' ')
      const lastName = nameParts[0] || ''
      const firstName = nameParts[1] || ''
      const middleName = nameParts[2] || ''
      
      const userData = {
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName,
        group_id: groupId
      }
      
      const createdUser = await UsersService.createUser(userData)
      createdUsers.push(createdUser)
      
    } catch (error) {
      console.error(`Ошибка создания пользователя ${student.full_name}:`, error)
    }
  }
  
  // Перезагружаем пользователей
  if (createdUsers.length > 0) {
    await loadUsers()
  }
  
  return createdUsers
}

watch([searchQuery, selectedFilterGroupId, selectedStatus], () => {
  // Очищаем выбор, если пользователей больше нет в отфильтрованном списке
  selectedUsers.value = selectedUsers.value.filter(userId => 
    filteredUsers.value.some(user => user.id === userId)
  )
})

// Загрузка при монтировании
onMounted(() => {
  loadCurrentUser()
  loadUsers()
  loadGroups()
})
</script>

<style scoped>
.users-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  pointer-events: auto;
}

.btn-primary {
  background: #2E80ED;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d6fd8;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.filters {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1.5rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.users-table tbody tr:hover {
  background: #f8fafc;
}

.loading, .empty {
  text-align: center;
  padding: 3rem !important;
  color: #64748b;
  font-style: italic;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.text-warning {
  color: #f59e0b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.d-block {
  display: block;
}

.mt-2 {
  margin-top: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.bg-light {
  background-color: #f9fafb;
}

.border {
  border: 1px solid #e5e7eb;
}

.text-muted {
  color: #6b7280;
  font-size: 0.75rem;
}

/* Форма пользователя */
.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #444;
}

.form-group input[type="text"],
.select-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.select-input:focus {
  outline: none;
  border-color: #007bff;
}

/* Селектор групп */
.group-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s, opacity 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-small {
  padding: 6px 10px;
  font-size: 12px;
}

/* Форма создания группы */
.create-group-form {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 10px;
}

.create-group-form h4 {
  margin: 0 0 12px 0;
  color: #555;
}

/* Выбор роли */
.role-selector {
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 10px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}

.role-option input[type="radio"] {
  margin: 0;
}

.role-option label {
  cursor: pointer;
  color: #444;
}

/* Чекбокс системного пользователя */
.checkbox-inline {
  margin-right: 8px;
}

/* Действия формы */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* Сообщения об ошибках */
.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px;
  background: #f8d7da;
  border-left: 3px solid #dc3545;
  border-radius: 4px;
}

/* Фильтры */
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #444;
}

.select-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.select-input:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  line-height: 1;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.fw-bold {
  font-weight: 700 !important;
}

.selected-row {
  background-color: #f0f9ff;
}

.selected-row:hover {
  background-color: #e0f2fe;
}

.selection-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-footer {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.selection-info {
  color: #374151;
  font-size: 0.9rem;
}

.users-count {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Стили для чекбоксов */
.users-table th input[type="checkbox"],
.users-table td input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.users-table th input[type="checkbox"]:disabled,
.users-table td input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Стили для импорта групп */
.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.modal-wide {
  width: 700px;
  max-width: 95vw;
}

.import-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.search-input-with-button {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.search-input-full {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.hint {
  color: #666;
  font-size: 0.85rem;
  display: block;
  margin-top: 5px;
}

.groups-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 15px 0;
}

.group-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.group-item:hover {
  background-color: #f8f9fa;
}

.group-item.selected {
  background-color: #e8f5e8;
  border-left: 3px solid #28a745;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.group-number {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-number strong {
  font-size: 1.1rem;
  color: #333;
}

.badge {
  background-color: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.group-select-indicator input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.group-details {
  font-size: 0.9rem;
  color: #555;
}

.group-details .detail {
  margin-bottom: 4px;
}

.group-details strong {
  color: #444;
  min-width: 120px;
  display: inline-block;
}

.no-results {
  text-align: center;
  padding: 30px;
  color: #666;
  font-style: italic;
}

.selected-group-info {
  margin: 15px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.alert-info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.alert-info strong {
  color: #0c5460;
}

/* Адаптивность */
@media (max-width: 600px) {
  .modal-content {
    width: 95vw;
    padding: 15px;
  }

  .group-selector,
  .form-actions {
    flex-direction: column;
  }
}
</style>