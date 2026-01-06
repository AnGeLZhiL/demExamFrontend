import apiClient from './api'

export const UsersService = {
  async getAllUsers(searchQuery = '') {
    const response = await apiClient.get('/users', {
      params: { search: searchQuery }
    })
    return response.data
  },

  async createUser(userData) {
    const response = await apiClient.post('/users', userData)
    return response.data
  },

    async updateUser(id, data) {
    console.log('UsersService.updateUser called:', { id, data })
    const response = await apiClient.put(`/users/${id}`, data)
    console.log('UsersService.updateUser response:', response.data)
    return response.data
  },

  async getUserById(userId) {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  async deleteUser(userId) {
    console.log('UsersService.deleteUser called:', { userId })
    const response = await apiClient.delete(`/users/${userId}`)
    console.log('UsersService.deleteUser response:', response.data)
    return response.data
  }
}
