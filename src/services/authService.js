//Сервис для работы с авторизацией

import apiClient from './api'

//объект с методами для авторизации
export const AuthService = {
  //метод для входав систему
  login(credentials) {
    return apiClient.post('/login', credentials)
  },

  //метод для выхода
  logout() {
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