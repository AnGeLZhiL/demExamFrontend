//Базовые настройки подключения к Laravel API

import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

//экземпляр axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,                    
  headers: {
    'Content-Type': 'application/json',     
    'Accept': 'application/json'            
  }
})

//перехватчик для добавления токена к каждому запросу
apiClient.interceptors.request.use((config) => {
  // Получаем токен из localStorage
  const token = localStorage.getItem('auth_token')
  // Если токен есть - добавляем в заголовки
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // 👈 Формат для Laravel Sanctum
  }
  return config
})

// перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    //Если ответ успешный, то он просто возвращается
    return response
  },
  (error) => {
    // Если ошибка 401 и знаичт что пользователь неавторизован
    if (error.response?.status === 401) {
      // Удаляет данные из localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('event_account')
      
      // Перенаправляет на страницу входа
      window.location.href = '/login'
    }
    // Пробрасывает ошибку дальше
    return Promise.reject(error)
  }
)

// для экспорта настроенного клиента
export default apiClient