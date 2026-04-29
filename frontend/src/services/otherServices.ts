import api from './api'
import type { Category, Expense, DashboardStats, CashFlow } from '../types'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/api/categories')
    return data
  },
  async create(payload: Partial<Category>): Promise<Category> {
    const { data } = await api.post('/api/categories', payload)
    return data
  },
  async update(id: number, payload: Partial<Category>): Promise<Category> {
    const { data } = await api.put(`/api/categories/${id}`, payload)
    return data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/api/categories/${id}`)
  },
}

export const expenseService = {
  async getAll(from?: string, to?: string): Promise<Expense[]> {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const { data } = await api.get(`/api/expenses?${params}`)
    return data
  },
  async create(payload: Partial<Expense>): Promise<Expense> {
    const { data } = await api.post('/api/expenses', payload)
    return data
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/api/expenses/${id}`)
  },
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get('/api/dashboard/stats')
    return data
  },
  async getCashFlow(): Promise<CashFlow> {
    const { data } = await api.get('/api/dashboard/cash-flow')
    return data
  },
}
