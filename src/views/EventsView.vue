<template>
  <div class="events-page">
    <!-- Заголовок страницы -->
    <header class="page-header">
      <h1 class="page-title">Активные мероприятия</h1>
    </header>

    <!-- Контент страницы -->
    <div class="page-content">
      <!-- Список мероприятий -->
      <div class="events-list">
        <article class="event-card">
          <div class="event-content">
            <h2 class="event-title">Демонстрационный экзамен группа 3094</h2>
            <time class="event-date">11 июня 2024, 10:00</time>
          </div>
        </article>
        
        <article class="event-card">
          <div class="event-content">
            <h2 class="event-title">Демонстрационный экзамен группа 3092</h2>
            <time class="event-date">12 июня 2024, 10:00</time>
          </div>
        </article>
        
        <!-- Добавьте еще мероприятий для демонстрации -->
        <article class="event-card">
          <div class="event-content">
            <h2 class="event-title">Итоговая аттестация группа 3093</h2>
            <time class="event-date">13 июня 2024, 14:00</time>
          </div>
        </article>
        
        <article class="event-card">
          <div class="event-content">
            <h2 class="event-title">Практический экзамен группа 3091</h2>
            <time class="event-date">14 июня 2024, 09:00</time>
          </div>
        </article>
      </div>
    </div>

    <!-- Кнопка создания -->
    <footer class="page-footer">
      <hr class="divider" />
      <button class="create-button" @click="createEvent">
        <span class="plus-icon">+</span> Создать мероприятие
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const createEvent = () => {
  console.log('Создание нового мероприятия')
  // Позже добавим страницу создания
}
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
  margin: 0;
}

/* Основной контент */
.page-content {
  margin-bottom: 2rem;
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
}

.event-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #dbe4f3;
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
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
  max-width: 800px;
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
</style>