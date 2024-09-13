const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Modificadores para los nombres de las semillas
const modifiers = [
  'Golden', 'Mystic', 'Radiant', 'Enchanted', 'Glowing', 'Ancient', 'Vibrant', 'Shadow', 'Luminous'
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

// Función para obtener una rareza aleatoria
function getRandomRarity() {
  const rarities = Object.keys(seedNamesByRarity);
  return rarities[Math.floor(Math.random() * rarities.length)];
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
  const seedsToCreate = 10; // Número de semillas a generar
  const createdSeeds = [];

  for (let i = 0; i < seedsToCreate; i++) {
    // Generar rareza y nombre único
    const rarity = getRandomRarity();
    let uniqueName;
    let isUnique = false;

    // Asegurarse de que el nombre es único
    while (!isUnique) {
      uniqueName = createUniqueSeedName(rarity);

      const existingSeed = await prisma.storeItem.findUnique({
        where: { name: uniqueName }
      });

      if (!existingSeed) {
        isUnique = true;
      }
    }

    // Obtener el precio basado en la rareza
    const price = getPriceByRarity(rarity);

    // Crear el ítem en la tienda con el precio generado y un stock aleatorio
    const storeSeed = await prisma.storeItem.create({
      data: {
        name: uniqueName,
        description: `A ${rarity.toLowerCase()} seed of ${uniqueName}`,
        price: price,                  // Asignar precio acorde a la rareza
        stock: Math.floor(Math.random() * 16) + 5,  // Stock aleatorio entre 5 y 20 unidades
        itemType: 'SEED',              // Definir tipo de ítem como 'seed'
        rarity: rarity                 // Asignar rareza
      }
    });

    createdSeeds.push(storeSeed);
  }

  console.log(`Created ${createdSeeds.length} random unique seeds in the store.`);
}

// Ejecutar el seeding
async function main() {
  console.log("Seeding the store with random seeds...");

  try {
    await seedStoreWithRandomSeeds();
  } catch (error) {
    console.error("Error seeding the store:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();