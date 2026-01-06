import apiClient from './api'

export const SystemRolesService = {
  async getAll() {
    const response = await apiClient.get('/roles?system_role=1')
    return response.data
  }
}
