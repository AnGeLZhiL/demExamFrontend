<template>
  <main class="module-detail-page">
    <header class="page-header">
      <button @click="goBack" class="back-button">
        ← Назад к мероприятию
      </button>
      
      <div class="header-actions">
        <button @click="editModule" class="action-btn edit-btn">
          ✏️ Редактировать модуль
        </button>
        <button @click="deleteModule" class="action-btn delete-btn">
          🗑️ Удалить модуль
        </button>
      </div>
      
      <h1>{{ module?.name || 'Загрузка...' }}</h1>
      
      <div class="module-header-info">
        <span class="module-type">Тип: {{ module?.type?.name }}</span>
        <span class="module-status" :class="getStatusClass(module?.status_id)">
          {{ module?.status?.name }}
        </span>
      </div>
      
      <div v-if="module?.description" class="module-description">
        <p>{{ module.description }}</p>
      </div>
    </header>

    <!-- Здесь позже добавим вкладки для БД, репозиториев и т.д. -->
    <div class="module-content">
      <p>Контент модуля будет здесь...</p>
      <!-- Будет навигация между разделами модуля -->
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'

const route = useRoute()
const router = useRouter()
const moduleId = route.params.id

const module = ref(null)
const loading = ref(true)
const error = ref('')

const loadModule = async () => {
  try {
    loading.value = true
    module.value = await EventsService.getModuleById(moduleId)
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки модуля'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (module.value?.event_id) {
    router.push(`/events/${module.value.event_id}`)
  } else {
    router.push('/events')
  }
}

const editModule = () => {
  // Здесь позже откроем модальное окно редактирования
  alert('Редактирование модуля будет доступно позже')
}

const deleteModule = async () => {
  if (!confirm(`Удалить модуль "${module.value?.name}"? Это действие нельзя отменить.`)) {
    return
  }
  
  try {
    await EventsService.deleteModule(moduleId)
    alert('✅ Модуль удален')
    goBack()
  } catch (err) {
    alert(`❌ Ошибка удаления: ${err.message}`)
  }
}

const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',
    2: 'status-active', 
    3: 'status-completed',
    4: 'status-cancelled'
  }
  return classes[statusId] || 'status-unknown'
}

onMounted(() => {
  loadModule()
})
</script>

<style scoped>
.module-detail-page {
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
}

.back-button:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.edit-btn {
  background: #f3f4f6;
  color: #374151;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.module-header-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
}

.module-type {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.module-status {
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

.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.module-description {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #2E80ED;
}

.module-description p {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}
</style>