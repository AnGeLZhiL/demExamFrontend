import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { AuthService } from '@/services/authService'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Для отладки
console.log('🚀 Vue приложение запущено')

// Проверяем авторизацию
if (AuthService.isAuthenticated()) {
  const user = AuthService.getUserData()
  console.log('👤 Авторизован:', AuthService.getUserName())
  console.log('🎭 Роль:', user?.system_role?.name)
  console.log('🔐 Токен есть:', !!AuthService.getToken())
} else {
  console.log('🔓 Не авторизован')
}