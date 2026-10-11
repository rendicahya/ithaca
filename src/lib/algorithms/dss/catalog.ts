/**
 * A small desktop-PC catalog modeled on the price-comparison site in the
 * Expert System lecture. One configuration per product keeps the numbers
 * readable on a projector.
 */
export type FormFactor = 'aio' | 'tower'

export interface Product {
  id: string
  name: string
  formFactor: FormFactor
  cpu: string
  /** Relative CPU performance tier, 1 (entry) … 4 (high end). */
  cpuTier: number
  ramGB: number
  /** Price in Rupiah. */
  price: number
  /** Average star rating, or null when the product has no reviews yet. */
  rating: number | null
}

export const catalog: Product[] = [
  { id: 'asus', name: 'ASUS Vivo AiO V200IB', formFactor: 'aio', cpu: 'Celeron Dual Core', cpuTier: 1, ramGB: 4, price: 4_799_000, rating: 4.5 },
  { id: 'acer', name: 'Acer Aspire M3970', formFactor: 'tower', cpu: 'Core i3', cpuTier: 2, ramGB: 4, price: 1_500_000, rating: 4.1 },
  { id: 'ideacentre', name: 'Lenovo IdeaCentre AIO 520', formFactor: 'aio', cpu: 'Core i3', cpuTier: 2, ramGB: 8, price: 6_799_000, rating: null },
  { id: 'optiplex', name: 'Dell OptiPlex 7010', formFactor: 'tower', cpu: 'Core i7', cpuTier: 4, ramGB: 8, price: 3_800_000, rating: 4.0 },
  { id: 's200z', name: 'Lenovo S200z All in One', formFactor: 'aio', cpu: 'Pentium Quad Core', cpuTier: 1, ramGB: 2, price: 4_100_000, rating: 4.0 },
  { id: 'hp20', name: 'HP 20-c036l', formFactor: 'aio', cpu: 'Core i5', cpuTier: 3, ramGB: 4, price: 8_248_000, rating: null },
]

export type Criterion = 'price' | 'cpu' | 'ram' | 'rating'

export const criteria: Criterion[] = ['price', 'cpu', 'ram', 'rating']

/** Price is a cost criterion (lower is better); the rest are benefits. */
export const costCriteria: Criterion[] = ['price']

export function criterionValue(product: Product, criterion: Criterion): number {
  switch (criterion) {
    case 'price':
      return product.price
    case 'cpu':
      return product.cpuTier
    case 'ram':
      return product.ramGB
    case 'rating':
      // An unreviewed product earns nothing on this criterion.
      return product.rating ?? 0
  }
}

export type Priority = 'balanced' | 'budget' | 'performance'

export const priorities: Priority[] = ['balanced', 'budget', 'performance']

export const priorityWeights: Record<Priority, Record<Criterion, number>> = {
  balanced: { price: 0.3, cpu: 0.3, ram: 0.2, rating: 0.2 },
  budget: { price: 0.5, cpu: 0.2, ram: 0.1, rating: 0.2 },
  performance: { price: 0.1, cpu: 0.45, ram: 0.3, rating: 0.15 },
}

export interface Preferences {
  /** Maximum price in Rupiah, or null for no limit. */
  maxBudget: number | null
  /** Minimum RAM in GB, or null for no minimum. */
  minRam: number | null
  formFactor: FormFactor | null
  priority: Priority
}

export const budgetOptions: (number | null)[] = [null, 4_000_000, 5_000_000, 7_000_000]
export const ramOptions: (number | null)[] = [null, 4, 8]
export const formFactorOptions: (FormFactor | null)[] = [null, 'aio', 'tower']

export const defaultPreferences: Preferences = {
  maxBudget: 5_000_000,
  minRam: 4,
  formFactor: null,
  priority: 'balanced',
}

export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}
