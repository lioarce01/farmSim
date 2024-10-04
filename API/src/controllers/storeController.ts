import { PrismaClient } from '@prisma/client';
import { seedStoreWithRandomWaters } from '../utils/waterGeneration.js';


const prisma = new PrismaClient();

// Definir el tipo Rarity
type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// Modificadores para los nombres de las semillas
const modifiers = [
  'Mystic', 'Radiant', 'Enchanted', 'Glowing', 'Ancient', 'Vibrant', 'Shadow', 'Luminous',
  'Celestial', 'Blazing', 'Twilight', 'Ethereal', 'Crystalline', 'Stormborn', 'Frosted', 'Shimmering',
  'Arcane', 'Solar', 'Moonlit', 'Emerald', 'Phantom', 'Flourishing', 'Infernal'
];

// Nombres base por rareza
const seedNamesByRarity: Record<Rarity, string[]> = {
  COMMON: ['Sunflower', 'Daisy', 'Lily'],
  UNCOMMON: ['Rose', 'Orchid', 'Tulip'],
  RARE: ['Cactus', 'Bluebell', 'Lavender'],
  EPIC: ['Bonsai', 'Fern', 'Bamboo'],
  LEGENDARY: ['Dragon Tree', 'Phoenix Flower', 'Golden Rose']
};

const priceRangesByRarity: Record<Rarity, number[]> = {
  COMMON: [20, 30],
  UNCOMMON: [30, 50],
  RARE: [50, 100],
  EPIC: [100, 200],
  LEGENDARY: [200, 500]
};

// Probabilidades de aparición para cada rareza
const rarityProbabilities: Record<Rarity, number> = {
  COMMON: 50,
  UNCOMMON: 40,
  RARE: 5,
  EPIC: 4,
  LEGENDARY: 1
};

// Función para obtener una rareza aleatoria con probabilidades ajustadas
function getRandomRarity(): Rarity {
  const totalProbability = Object.values(rarityProbabilities).reduce((a, b) => a + b, 0);
  const random = Math.floor(Math.random() * totalProbability);
  let sum = 0;

  for (const [rarity, probability] of Object.entries(rarityProbabilities) as [Rarity, number][]) {
    sum += probability;
    if (random < sum) return rarity;
  }

  return 'COMMON'; 
}

// Función para obtener un nombre base aleatorio según la rareza
function getRandomSeedName(rarity: Rarity): string {
  const names = seedNamesByRarity[rarity];
  return names[Math.floor(Math.random() * names.length)];
}

// Función para obtener un modificador aleatorio
function getRandomModifier(): string {
  return modifiers[Math.floor(Math.random() * modifiers.length)];
}

// Función para generar un precio aleatorio basado en la rareza
function getPriceByRarity(rarity: Rarity): number {
  const [minPrice, maxPrice] = priceRangesByRarity[rarity];
  return Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
}

// Función para generar un nombre único combinando el modificador con el nombre base
function createUniqueSeedName(rarity: Rarity): string {
  const baseName = getRandomSeedName(rarity);
  const modifier = getRandomModifier();
  return `${modifier} ${baseName}`;
}

// Función para poblar la tienda con semillas aleatorias
async function seedStoreWithRandomSeeds() {
  const seedsToCreate = 5; // Número de semillas a generar
  const createdSeeds: any[] = [];

  for (let i = 0; i < seedsToCreate; i++) {
    const rarity = getRandomRarity();
    let uniqueName: string = ''; 
    let isUnique = false;

    while (!isUnique) {
      uniqueName = createUniqueSeedName(rarity);

      const existingSeed = await prisma.storeItem.findUnique({
        where: { name: uniqueName }
      });

      if (!existingSeed) {
        isUnique = true;
      }
    }

    const price = getPriceByRarity(rarity);

    const stock = getStockByRarity(rarity);
    const tokensGenerated = getTokensByRarity(rarity);

    const storeSeed = await prisma.storeItem.create({
      data: {
        name: uniqueName,
        description: `A ${rarity.toLowerCase()} seed of ${uniqueName}`,
        price: price,
        stock: stock,
        itemType: 'seed',
        rarity: rarity,
        tokensGenerated: tokensGenerated
      }
    });

    createdSeeds.push(storeSeed);
  }

  console.log(`Created ${createdSeeds.length} random unique seeds in the store.`);
}

// Funciones auxiliares para obtener stock y tokens según rareza
function getStockByRarity(rarity: Rarity): number {
  switch (rarity) {
    case 'COMMON':
    case 'UNCOMMON':
    case 'RARE':
      return Math.floor(Math.random() * 3) + 1; 
    case 'EPIC':
      return Math.floor(Math.random() * 2) + 1; 
    case 'LEGENDARY':
      return 1; // Stock fijo de 1
    default:
      return 1; // Valor predeterminado
  }
}

function getTokensByRarity(rarity: Rarity): number {
  switch (rarity) {
    case 'COMMON':
      return Math.floor(Math.random() * 10) + 1; // Entre 1 y 10 tokens
    case 'UNCOMMON':
      return Math.floor(Math.random() * 20) + 10; // Entre 10 y 20 tokens
    case 'RARE':
      return Math.floor(Math.random() * 50) + 20; // Entre 20 y 50 tokens
    case 'EPIC':
      return Math.floor(Math.random() * 100) + 50; // Entre 50 y 100 tokens
    case 'LEGENDARY':
      return Math.floor(Math.random() * 200) + 100; // Entre 100 y 200 tokens
    default:
      return 0;
  }
}

// Función para actualizar la tienda con nuevas semillas
export async function updateStoreWithNewSeeds() {
  console.log("Updating store with new seeds...");

  // Elimina las semillas existentes
  const deleteResult = await prisma.storeItem.deleteMany({ where: { itemType: 'seed' } });
  console.log(`Deleted ${deleteResult.count} existing seeds.`);

  // Elimina las waters existentes
  const deleteWatersResult = await prisma.storeItem.deleteMany({
    where: { itemType: 'water' }
  });
  console.log(`Deleted ${deleteWatersResult.count} existing waters.`);

  // Añade nuevas semillas
  await seedStoreWithRandomSeeds();
  await seedStoreWithRandomWaters();
}

export { seedStoreWithRandomSeeds };