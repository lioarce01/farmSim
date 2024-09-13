const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const waterNames = ['Spring Water', 'Rainwater', 'Well Water', 'Mineral Water'];
const waterDescriptions = [
  'Fresh and clean spring water.',
  'Collected from the rain.',
  'Drawn from a traditional well.',
  'Pure mineral water with added nutrients.'
];

// Función para generar un precio aleatorio entre 10 y 20
function getRandomPrice() {
  return Math.floor(Math.random() * (20 - 10 + 1)) + 10;
}

// Función para generar un stock aleatorio entre 1 y 2
function getRandomStock() {
  return Math.floor(Math.random() * (2 - 1 + 1)) + 1;
}

// Función para generar una quantity aleatoria entre 1 y 2
function getRandomQuantity() {
  return Math.floor(Math.random() * (2 - 1 + 1)) + 1;
}

// Función para generar waters aleatorios y asegurarse de que los nombres sean únicos
async function seedStoreWithRandomWaters() {
  const watersToCreate = 2; // Número de waters a generar
  const createdWaters = [];

  for (let i = 0; i < watersToCreate; i++) {
    let name;
    let unique = false;

    // Generar un nombre único
    while (!unique) {
      name = `${waterNames[Math.floor(Math.random() * waterNames.length)]}-${Date.now()}`;
      
      const existingItem = await prisma.storeItem.findUnique({
        where: { name: name }
      });

      if (!existingItem) {
        unique = true;
      }
    }

    const description = waterDescriptions[Math.floor(Math.random() * waterDescriptions.length)];
    const price = getRandomPrice();
    const stock = getRandomStock();
    const quantity = getRandomQuantity();

    const storeWater = await prisma.storeItem.create({
      data: {
        name: name,
        description: description,
        price: price,
        stock: stock,
        quantity: quantity,
        itemType: 'WATER'
      }
    });

    createdWaters.push(storeWater);
  }

  console.log(`Created ${createdWaters.length} random waters in the store.`);
}

module.exports = {
  seedStoreWithRandomWaters
}