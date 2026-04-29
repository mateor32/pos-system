import api from './api'
import type { Customer } from '../types'

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data } = await api.get('/api/customers')
    return data
  },

  async search(name: string): Promise<Customer[]> {
    const { data } = await api.get(`/api/customers/search?name=${encodeURIComponent(name)}`)
    return data
  },

  async create(payload: Partial<Customer>): Promise<Customer> {
    const { data } = await api.post('/api/customers', payload)
    return data
  },

  async update(id: number, payload: Partial<Customer>): Promise<Customer> {
    const { data } = await api.put(`/api/customers/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/customers/${id}`)
  },
}
