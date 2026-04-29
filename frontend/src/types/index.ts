// Auth
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER'

export interface AuthUser {
  id: number
  username: string
  fullName: string
  email: string
  role: UserRole
  token: string
}

// Category
export interface Category {
  id: number
  name: string
  color: string
  icon: string
}

// Product
export interface Product {
  id: number
  name: string
  barcode?: string
  description?: string
  costPrice: number
  salePrice: number
  stock: number
  minStock: number
  imageUrl?: string
  active: boolean
  categoryId?: number
  categoryName?: string
  categoryColor?: string
  categoryIcon?: string
  createdAt?: string
  updatedAt?: string
}

// Customer
export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  creditBalance: number
  active: boolean
  createdAt?: string
}

// Sale
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED'
export type SaleStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export interface SaleItem {
  id?: number
  productId?: number
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  subtotal: number
}

export interface Sale {
  id: number
  invoiceNumber: string
  customerId?: number
  customerName?: string
  userId?: number
  userName?: string
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  paymentMethod: PaymentMethod
  amountPaid: number
  change: number
  status: SaleStatus
  notes?: string
  items: SaleItem[]
  createdAt: string
}

// Cart
export interface CartItem {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  discount: number
  imageUrl?: string
  icon?: string
}

// Expense
export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'PAYROLL' | 'SUPPLIES' | 'MAINTENANCE' | 'MARKETING' | 'TAXES' | 'PURCHASES' | 'OTHER'

export interface Expense {
  id: number
  description: string
  amount: number
  category: ExpenseCategory
  notes?: string
  createdAt: string
  user?: {
    id: number
    fullName: string
  }
}

// Dashboard
export interface DashboardStats {
  salesToday: number
  transactionsToday: number
  avgTicket: number
  profitToday: number
  last7Days: { date: string; total: number }[]
  topProducts: { productId: number; productName: string; quantitySold: number; totalRevenue: number }[]
  paymentStats: { method: string; count: number; total: number }[]
  lowStockCount: number
}

export interface CashFlow {
  income: number
  expenses: number
  balance: number
  date: string
}

// API generic
export interface ApiError {
  error: string
  message: string
  status: number
}
