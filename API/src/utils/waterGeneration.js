const { PrismaClient } = require('@prisma/client');
const cloudinary = require('./cloudinary.js'); // Importa la configuración de Cloudinary
const path = require('path'); // Para manejar rutas de archivos
const fs = require('fs'); // Para manejar archivos
const prisma = new PrismaClient();

const waterNames = ['Spring Water', 'Rainwater', 'Well Water', 'Mineral Water'];
const waterDescriptions = [
  'Fresh and clean spring water.',
  'Collected from the rain.',
  'Drawn from a traditional well.',
  'Pure mineral water with added nutrients.',
];

// Función para generar un precio aleatorio entre 10 y 20
function getRandomPrice() {
  return Math.floor(Math.random() * (20 - 10 + 1)) + 10;
}

// Función para generar un stock aleatorio entre 1 y 2
function getRandomStock() {
  return Math.floor(Math.random() * (2 - 1 + 1)) + 1;
}

// Función para generar una cantidad aleatoria entre 1 y 2
function getRandomQuantity() {
  return Math.floor(Math.random() * (2 - 1 + 1)) + 1;
}

function readUrlsFromFile() {
  const filePath = path.join(__dirname, 'imageUrls.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }
  return {};
}

const getImageForWater = () => {
  const existingUrls = readUrlsFromFile();
  const wateringCanUrl = existingUrls['WATERING_CAN'];
  if (!wateringCanUrl) {
    console.warn(
      'Watering can image URL not found in imageUrls.json. Using default.',
    );
    return '../public/assets/wateringCan.png'; // Imagen predeterminada
  }
  return wateringCanUrl;
};

// Función para generar aguas aleatorias y asegurarse de que los nombres sean únicos
async function seedStoreWithRandomWaters() {
  const watersToCreate = 2;
  const createdWaters = [];

  for (let i = 0; i < watersToCreate; i++) {
    let name;
    let unique = false;

    while (!unique) {
      name = `${waterNames[Math.floor(Math.random() * waterNames.length)]}-${Math.random().toString(36).substring(2, 9)}`;

      const existingItem = await prisma.storeItem.findUnique({
        where: { name: name },
      });

      if (!existingItem) {
        unique = true;
      }
    }

    const description =
      waterDescriptions[Math.floor(Math.random() * waterDescriptions.length)];
    const price = getRandomPrice();
    const stock = getRandomStock();
    const quantity = getRandomQuantity();
    const imageUrl = getImageForWater();

    const storeWater = await prisma.storeItem.create({
      data: {
        name: name,
        description: description,
        price: price,
        stock: stock,
        quantity: quantity,
        itemType: 'water',
        img: imageUrl,
      },
    });

    createdWaters.push(storeWater);
  }

  console.log(`Created ${createdWaters.length} random waters in the store.`);
}

module.exports = {
  seedStoreWithRandomWaters,
  getImageForWater,
};
