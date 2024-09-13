"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Modificadores para los nombres de las semillas
const modifiers = [
    'Golden', 'Mystic', 'Radiant', 'Enchanted', 'Glowing', 'Ancient', 'Vibrant', 'Shadow', 'Luminous',
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
    COMMON: 50, // 50% probabilidad
    UNCOMMON: 30, // 30% probabilidad
    RARE: 10, // 15% probabilidad
    EPIC: 7, // 4% probabilidad
    LEGENDARY: 3 // 1% probabilidad
};
// Función para obtener una rareza aleatoria con probabilidades ajustadas
function getRandomRarity() {
    const totalProbability = Object.values(rarityProbabilities).reduce((a, b) => a + b, 0);
    const random = Math.floor(Math.random() * totalProbability);
    let sum = 0;
    for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
        sum += probability;
        if (random < sum)
            return rarity;
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
function seedStoreWithRandomSeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        const seedsToCreate = 5; // Número de semillas a generar
        const createdSeeds = [];
        for (let i = 0; i < seedsToCreate; i++) {
            const rarity = getRandomRarity();
            let uniqueName;
            let isUnique = false;
            while (!isUnique) {
                uniqueName = createUniqueSeedName(rarity);
                const existingSeed = yield prisma.storeItem.findUnique({
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
            const stock = getStockByRarity(rarity);
            const storeSeed = yield prisma.storeItem.create({
                data: {
                    name: uniqueName,
                    description: `A ${rarity === null || rarity === void 0 ? void 0 : rarity.toLowerCase()} seed of ${uniqueName}`,
                    price: price,
                    stock: stock,
                    itemType: 'SEED',
                    rarity: rarity
                }
            });
            createdSeeds.push(storeSeed);
        }
        console.log(`Created ${createdSeeds.length} random unique seeds in the store.`);
    });
}
// Función para actualizar la tienda con nuevas semillas
function updateStoreWithNewSeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Updating store with new seeds...");
        // Elimina las semillas existentes
        const deleteResult = yield prisma.storeItem.deleteMany({ where: { itemType: 'SEED' } });
        console.log(`Deleted ${deleteResult.count} existing seeds.`);
        // Añade nuevas semillas
        yield seedStoreWithRandomSeeds();
    });
}
module.exports = {
    updateStoreWithNewSeeds
};
