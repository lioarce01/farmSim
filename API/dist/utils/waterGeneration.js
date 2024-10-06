'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const { PrismaClient } = require('@prisma/client');
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
// Función para generar aguas aleatorias y asegurarse de que los nombres sean únicos
function seedStoreWithRandomWaters() {
  return __awaiter(this, void 0, void 0, function* () {
    const watersToCreate = 2;
    const createdWaters = [];
    for (let i = 0; i < watersToCreate; i++) {
      let name;
      let unique = false;
      while (!unique) {
        name = `${waterNames[Math.floor(Math.random() * waterNames.length)]}-${Date.now()}`;
        const existingItem = yield prisma.storeItem.findUnique({
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
      const storeWater = yield prisma.storeItem.create({
        data: {
          name: name,
          description: description,
          price: price,
          stock: stock,
          quantity: quantity,
          itemType: 'water',
        },
      });
      createdWaters.push(storeWater);
    }
    console.log(`Created ${createdWaters.length} random waters in the store.`);
  });
}
module.exports = {
  seedStoreWithRandomWaters,
};
