<template>
  <div class="users-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>Пользователи</h1>
      <div class="header-actions">
        <!-- Кнопка добавления (неактивная пока) -->
        <button @click="showCreateHint" class="btn btn-primary" disabled>
          + Добавить пользователя
        </button>
      </div>
    </div>

    <!-- Поиск -->
    <div class="filters">
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
    </div>

    <!-- Таблица пользователей -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Группа</th>
            <th>Дата рождения</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="loading">Загрузка...</td>
          </tr>
          <tr v-else-if="users.length === 0 && searchQuery">
            <td colspan="6" class="empty">
              Пользователи не найдены по запросу "{{ searchQuery }}"
            </td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="6" class="empty">Нет пользователей</td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.middle_name || '-' }}</td>
            <td>{{ user.group ? user.group.number : '-' }}</td>
            <td>{{ user.birth_date ? formatDate(user.birth_date) : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Информация о функционале -->
    <div class="info-box">
      <p>📋 Всего пользователей: <strong>{{ users.length }}</strong></p>
      <p class="hint">
        Функции добавления, редактирования и удаления будут доступны позже.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UsersService } from '@/services/usersService'

// Данные
const users = ref([])
const searchQuery = ref('')
const loading = ref(false)

// Загрузка пользователей
const loadUsers = async () => {
  try {
    loading.value = true
    users.value = await UsersService.getAllUsers(searchQuery.value)
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
    // Для теста можно добавить тестовые данные
    users.value = []
  } finally {
    loading.value = false
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

// Подсказка о функционале
const showCreateHint = () => {
  alert('Функция добавления пользователей будет доступна в следующем обновлении.')
}

// Загрузка при монтировании
onMounted(() => {
  loadUsers()
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

.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.info-box p {
  margin: 0 0 0.5rem 0;
  color: #0369a1;
}

.info-box .hint {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.5rem;
}
</style>