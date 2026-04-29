import { create } from 'zustand'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  discount: number
  taxRate: number
  customerId: number | null
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  setDiscount: (discount: number) => void
  setTaxRate: (taxRate: number) => void
  setCustomerId: (id: number | null) => void
  clearCart: () => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0,
  customerId: null,

  addItem: (newItem) => set((state) => {
    const existing = state.items.find(i => i.productId === newItem.productId)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
    }
    return { items: [...state.items, newItem] }
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.productId !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(i => i.productId !== productId) }
    }
    return {
      items: state.items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      )
    }
  }),

  setDiscount: (discount) => set({ discount }),
  setTaxRate: (taxRate) => set({ taxRate }),
  setCustomerId: (id) => set({ customerId: id }),

  clearCart: () => set({ items: [], discount: 0, taxRate: 0, customerId: null }),

  getSubtotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity - item.discount, 0)
  },

  getTaxAmount: () => {
    const { taxRate } = get()
    const subtotal = get().getSubtotal()
    const discount = get().discount
    return ((subtotal - discount) * taxRate) / 100
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const discount = get().discount
    const taxAmount = get().getTaxAmount()
    return subtotal - discount + taxAmount
  },
}))
