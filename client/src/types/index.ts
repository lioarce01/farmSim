export interface Seed {
  id: string;
  name: string;
  description: string;
  plantedTime?: Date; // puede ser opcional
  wateredCount: number;
  lastWatered?: Date; // puede ser opcional
  quantity: number;
  rarity: Rarity; // Enum que puedes definir
  status: SeedStatus; // Enum que puedes definir
  tokensGenerated?: number; // puede ser opcional
}

export interface Water {
  id: string;
  name: string;
  description: string;
  quantity?: number; // puede ser opcional
}

export interface Inventory {
  id: string;
  userId: string; // ID del usuario propietario
  seeds: Seed[];
  waters: Water[];
}

export interface PurchaseData {
  userSub: string;
  itemId: string;
  quantity: number;
  itemType: ItemType
}

export interface PurchaseButtonProps {
  userSub: string;
  itemId: string;
  quantity: number;
  itemType: ItemType
  stock: number;
  price: number;
  refetchStoreItems: () => void;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  itemType: ItemType; // Enum que puedes definir
  rarity?: Rarity; // Opcional, ya que no todos los items tienen rareza
  stock: number;
  tokensGenerated?: number; // puede ser opcional
  quantity?: number; // puede ser opcional
}

export interface User {
  id: string;
  sub: string;
  nickname: string;
  email: string; // Agregado ya que está en tu modelo
  balanceToken?: number; // Cambiado de Int a number
  inventory?: Inventory; // Puede ser opcional si el usuario no tiene inventario
  refetch: () => void;
 }

export interface RemainingTimeData {
  timeRemaining: string;
  timeRemainingInMs: number;
  canUpdate: boolean;
}

// Enum para Rarity
export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export enum ItemType {
  seed = "seed",
  water = "water"
}

// Enum para SeedStatus
export enum SeedStatus {
  NONE = 'NONE',
  GROWING = 'GROWING',
  READY_TO_HARVEST = 'READY_TO_HARVEST',
  HARVESTED = 'HARVESTED',
  WITHERED = 'WITHERED',
  INFECTED = 'INFECTED',
  WATER_NEEDED = 'WATER_NEEDED',
}