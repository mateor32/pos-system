import api from './api'
import type { Sale } from '../types'

interface CreateSalePayload {
  customerId?: number
  discount: number
  taxRate: number
  paymentMethod: string
  amountPaid: number
  notes?: string
  items: {
    productId: number
    quantity: number
    discount: number
  }[]
}

export const saleService = {
  async create(payload: CreateSalePayload): Promise<Sale> {
    const { data } = await api.post('/api/sales', payload)
    return data
  },

  async getAll(from?: string, to?: string): Promise<Sale[]> {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const { data } = await api.get(`/api/sales?${params}`)
    return data
  },

  async getById(id: number): Promise<Sale> {
    const { data } = await api.get(`/api/sales/${id}`)
    return data
  },

  async cancel(id: number): Promise<Sale> {
    const { data } = await api.put(`/api/sales/${id}/cancel`)
    return data
  },
}
