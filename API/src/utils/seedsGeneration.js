const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
import { seedStoreWithRandomWaters } from './waterGeneration.js'

// Modificadores para los nombres de las semillas
const modifiers = [
  'Mystic', 'Radiant', 'Enchanted', 'Glowing', 'Ancient', 'Vibrant', 'Shadow', 'Luminous',
  'Celestial', 'Blazing', 'Twilight', 'Ethereal', 'Crystalline', 'Stormborn', 'Frosted', 'Shimmering',
  'Arcane', 'Solar', 'Moonlit', 'Emerald', 'Phantom', 'Flourishing', 'Infernal'
];

// Nombres base por rareza
const seedNamesByRarity = {
  COMMON: ['Sunflower', 'Daisy', 'Lily'],
  UNCOMMON: ['Rose', 'Orchid', 'Tulip'],
  RARE: ['Cactus', 'Bluebell', 'Lavender'],
  EPIC: ['Bonsai', 'Fern', 'Bamboo'],
  LEGENDARY: ['Dragon Tree', 'Phoenix Flower', 'Golden Rose']
};

// Definir los rangos de precios por rareza
const priceRangesByRarity = {
  COMMON: [20, 30],
  UNCOMMON: [30, 50],
  RARE: [50, 100],
  EPIC: [100, 200],
  LEGENDARY: [200, 500]
};

// Probabilidades de aparición para cada rareza
const rarityProbabilities = {
  COMMON: 50,   // 50% probabilidad
  UNCOMMON: 40, // 40% probabilidad
  RARE: 5,     // 5% probabilidad
  EPIC: 4,      // 4% probabilidad
  LEGENDARY: 1  // 1% probabilidad
};

// Función para obtener una rareza aleatoria con probabilidades ajustadas
function getRandomRarity() {
  const totalProbability = Object.values(rarityProbabilities).reduce((a, b) => a + b, 0);
  const random = Math.floor(Math.random() * totalProbability);
  let sum = 0;

  for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
    sum += probability;
    if (random < sum) return rarity;
  }
}

// Función para obtener un nombre base aleatorio según la rareza
function getRandomSeedName(rarity) {
  const names = seedNamesByRarity[rarity];
  return names[Math.floor(Math.random() * names.length)];
}

// Función para obtener un modificador aleatorio
function getRandomModifier() {
  return modifiers[Math.floor(Math.random() * modifiers.length)];
}

// Función para generar un precio aleatorio basado en la rareza
function getPriceByRarity(rarity) {
  const [minPrice, maxPrice] = priceRangesByRarity[rarity];
  return Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
}

// Función para generar un nombre único combinando el modificador con el nombre base
function createUniqueSeedName(rarity) {
  const baseName = getRandomSeedName(rarity);
  const modifier = getRandomModifier();
  return `${modifier} ${baseName}`;
}

// Función para poblar la tienda con semillas aleatorias
async function seedStoreWithRandomSeeds() {
  const seedsToCreate = 5; // Número de semillas a generar
  const createdSeeds = [];

  for (let i = 0; i < seedsToCreate; i++) {
    const rarity = getRandomRarity();
    let uniqueName;
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

    function getStockByRarity(rarity) {
      switch (rarity) {
        case 'COMMON':
        case 'UNCOMMON':
        case 'RARE':
          return Math.floor(Math.random() * 3) + 1; // Stock entre 1 y 3
        case 'EPIC':
          return Math.floor(Math.random() * 2) + 1; // Stock entre 1 y 2
        case 'LEGENDARY':
          return 1; // Stock fijo de 1
        default:
          return 1; // Valor predeterminado
      }
    }

    const stock = getStockByRarity(rarity)

    function getTokensByRarity(rarity) {
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

    const tokensGenerated = getTokensByRarity(rarity)

    const storeSeed = await prisma.storeItem.create({
      data: {
        name: uniqueName,
        description: `A ${rarity?.toLowerCase()} seed of ${uniqueName}`,
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

// Función para actualizar la tienda con nuevas semillas
export async function updateStoreWithNewSeeds() {
  console.log("Updating store with new seeds...");
  
  // Elimina las semillas existentes
  const deleteResult = await prisma.storeItem.deleteMany({ where: { itemType: 'SEED' } });
  console.log(`Deleted ${deleteResult.count} existing seeds.`);

  // Elimina las water existentes
  const deleteWatersResult = await prisma.storeItem.deleteMany({
    where: { itemType: 'WATER'}
  })
  console.log(`Deleted ${deleteWatersResult.count} existing waters.`);

  // Añade nuevas semillas
  await seedStoreWithRandomSeeds();
  await seedStoreWithRandomWaters();
}

module.exports = {
  updateStoreWithNewSeeds
}
