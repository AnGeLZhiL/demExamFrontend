//Сервис для работы с авторизацией

import apiClient from './api'

//объект с методами для авторизации
export const AuthService = {
  //метод для входа в систему
  async login(credentials) {
    try {
      const response = await apiClient.post('/login', credentials)    
      return response
    } catch (error) {
      console.error('AuthService login error:', error)
      throw error
    }
  },

  //метод для выхода
  logout() {
    // Очищаем localStorage
    this.clearAuthData()
    
    return apiClient.post('/logout')
  },

  //метод для получения данных пользователя
  getUser() {
    return apiClient.get('/user')  // 👈 GET запрос на /api/user
  },

  //проверка авторизован ли пользователь
  isAuthenticated() {
    //есть ли токен в localStorage
    return !!localStorage.getItem('auth_token')
  },

  //получение токена
  getToken() {
    return localStorage.getItem('auth_token')
  },

  //получение данных пользователя из localStorage
  getUserData() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // ⭐⭐⭐ НОВЫЙ МЕТОД: ПРОВЕРКА ЯВЛЯЕТСЯ ЛИ АДМИНОМ ⭐⭐⭐
  isAdmin() {
    const user = this.getUserData()
    return user?.system_role?.name === 'Администратор'
  },

  // ⭐⭐⭐ НОВЫЙ МЕТОД: ПРОВЕРКА СИСТЕМНОГО ПОЛЬЗОВАТЕЛЯ ⭐⭐⭐
  isSystemUser() {
    const user = this.getUserData()
    return user?.is_system_account === true
  },

  // ⭐⭐⭐ НОВЫЙ МЕТОД: ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ⭐⭐⭐
  getUserName() {
    const user = this.getUserData()
    if (!user) return ''
    return `${user.first_name} ${user.last_name}`
  },

  // ⭐⭐⭐ НОВЫЙ МЕТОД: ПОЛУЧЕНИЕ ID МЕРОПРИЯТИЯ (если есть) ⭐⭐⭐
  getEventId() {
    const user = this.getUserData()
    return user?.event_id
  },

  //получение данных учетной записи
  getEventAccountData() {
    const account = localStorage.getItem('event_account')
    return account ? JSON.parse(account) : null
  },

  //очистка данных авторизации
  clearAuthData() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('event_account')
  }
}