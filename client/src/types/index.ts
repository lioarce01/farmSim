export interface Seed {
  id: string;
  name: string;
  description: string;
  plantedTime?: Date; 
  wateredCount: number;
  lastWatered?: Date;
  quantity: number;
  rarity: Rarity;
  status: SeedStatus; 
  tokensGenerated?: number; 
}

export interface Water {
  id: string;
  name: string;
  description: string;
  quantity?: number;
}

export interface Inventory {
  id: string;
  userId: string; 
  seeds: Seed[];
  waters: Water[];
}

export interface PurchaseData {
  userSub: string;
  itemId: string;
  quantity: number;
  itemType: ItemType
}

export interface Slot {
  id: string;
  farmId: string;
  seedId: string | null;
  plantingTime: string | null;
  growthStatus: string;
  wateredCount: number;
  lastWatered: string | null;
  seedName: string | null;
  seedDescription: string | null;
  seedRarity: string | null;
  seedTokensGenerated: number | null;
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
  itemType: ItemType; 
  rarity?: Rarity; 
  stock: number;
  tokensGenerated?: number; 
  quantity?: number;
}

export interface User {
  id: string;
  sub: string;
  nickname: string;
  role?: Role;
  email: string; 
  balanceToken?: number;
  inventory?: Inventory; 
  refetch: () => void;
  farm: Farm
 }

 export interface Farm {
  id: string;
  userId: string;
  slots: Slot[]
 }

export interface RemainingTimeData {
  timeRemaining: string;
  timeRemainingInMs: number;
  canUpdate: boolean;
}

export enum Role {
  admin = 'ADMIN',
  user = 'USER'
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