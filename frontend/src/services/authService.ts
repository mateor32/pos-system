import api from './api'
import type { AuthUser } from '../types'

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    const { data } = await api.post('/api/auth/login', { username, password })
    return data
  },

  async register(payload: { username: string; password: string; fullName: string; email: string; role: string }): Promise<AuthUser> {
    const { data } = await api.post('/api/auth/register', payload)
    return data
  },
}
