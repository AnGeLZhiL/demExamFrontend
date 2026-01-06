import apiClient from './api'

export const GroupsService = {
  async getAllGroups() {
    const response = await apiClient.get('/groups')
    return response.data
  },

  async createGroup(groupData) {
    const response = await apiClient.post('/groups', groupData)
    return response.data
  }
}
