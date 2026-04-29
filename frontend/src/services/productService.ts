import api from './api'
import type { Product } from '../types'

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get('/api/products')
    return data
  },

  async search(q: string): Promise<Product[]> {
    const { data } = await api.get(`/api/products/search?q=${encodeURIComponent(q)}`)
    return data
  },

  async getLowStock(): Promise<Product[]> {
    const { data } = await api.get('/api/products/low-stock')
    return data
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get(`/api/products/${id}`)
    return data
  },

  async create(payload: Partial<Product> & { categoryId?: number }): Promise<Product> {
    const { data } = await api.post('/api/products', payload)
    return data
  },

  async update(id: number, payload: Partial<Product> & { categoryId?: number }): Promise<Product> {
    const { data } = await api.put(`/api/products/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`)
  },

  async adjustStock(id: number, quantity: number, type: string, reason: string): Promise<Product> {
    const { data } = await api.post(`/api/products/${id}/stock`, { quantity, type, reason })
    return data
  },
}
