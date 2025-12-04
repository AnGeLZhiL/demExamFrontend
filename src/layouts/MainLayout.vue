<template>
  <div class="main-layout">
    <!-- Боковая панель -->
    <aside class="sidebar">
      <header class="sidebar-header">
        <h1 class="app-title">ExamManage</h1>
      </header>
      
      <nav class="sidebar-nav">
        <ul>
          <li>
            <router-link to="/events" class="nav-link" active-class="active">
              <span class="nav-icon">📅</span>
              <span>Мероприятия</span>
            </router-link>
          </li>
          <li>
            <a href="#" class="nav-link disabled">
              <span class="nav-icon">👥</span>
              <span>Пользователи</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-link disabled">
              <span class="nav-icon">📖</span>
              <span>Журнал</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-link disabled">
              <span class="nav-icon">⚙️</span>
              <span>Настройки</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <footer class="sidebar-footer">
        <div class="city-info">
          <span class="city-icon">📍</span>
          <span class="city-name">Екатеринбург</span>
        </div>
        
        <button @click="logout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span>Выйти</span>
        </button>
      </footer>
    </aside>

    <!-- Основной контент -->
    <main class="main-content">
      <!-- Здесь будет отображаться EventsView -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
/* Сбрасываем все отступы и делаем на весь экран */
.main-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Боковая панель - темная */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: #2E80ED;
}

.nav-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled:hover {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Основной контент - светлый */
.main-content {
  flex: 1;
  padding: 2rem;
  min-width: 0; /* Для правильной работы flex */
  overflow-y: auto;
  background: #f8fafc;
}

/* Футер сайдбара */
.sidebar-footer {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.city-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.city-icon {
  font-size: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.logout-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}
</style>