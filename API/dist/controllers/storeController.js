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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreWithNewSeeds = updateStoreWithNewSeeds;
exports.seedStoreWithRandomSeeds = seedStoreWithRandomSeeds;
const client_1 = require("@prisma/client");
const waterGeneration_js_1 = require("../utils/waterGeneration.js");
const uploadImages_js_1 = require("../utils/uploadImages.js");
const prisma = new client_1.PrismaClient();
// Modificadores para los nombres de las semillas
const modifiers = [
    'Mystic',
    'Radiant',
    'Enchanted',
    'Glowing',
    'Ancient',
    'Vibrant',
    'Shadow',
    'Luminous',
    'Celestial',
    'Blazing',
    'Twilight',
    'Ethereal',
    'Crystalline',
    'Stormborn',
    'Frosted',
    'Shimmering',
    'Arcane',
    'Solar',
    'Moonlit',
    'Emerald',
    'Phantom',
    'Flourishing',
    'Infernal',
];
// Nombres base por rareza
const seedNamesByRarity = {
    COMMON: ['Sunflower', 'Daisy', 'Lily'],
    UNCOMMON: ['Rose', 'Orchid', 'Tulip'],
    RARE: ['Cactus', 'Bluebell', 'Lavender'],
    EPIC: ['Bonsai', 'Fern', 'Bamboo'],
    LEGENDARY: ['Dragon Tree', 'Phoenix Flower', 'Golden Rose'],
};
const priceRangesByRarity = {
    COMMON: [20, 30],
    UNCOMMON: [30, 50],
    RARE: [50, 100],
    EPIC: [100, 200],
    LEGENDARY: [200, 500],
};
// Probabilidades de aparición para cada rareza
const rarityProbabilities = {
    COMMON: 50,
    UNCOMMON: 40,
    RARE: 5,
    EPIC: 4,
    LEGENDARY: 1,
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
    return 'COMMON';
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
            let uniqueName = '';
            let isUnique = false;
            while (!isUnique) {
                uniqueName = createUniqueSeedName(rarity);
                const existingSeed = yield prisma.storeItem.findUnique({
                    where: { name: uniqueName },
                });
                if (!existingSeed) {
                    isUnique = true;
                }
            }
            const price = getPriceByRarity(rarity);
            const stock = getStockByRarity(rarity);
            const tokensGenerated = getTokensByRarity(rarity);
            const imageUrl = (0, uploadImages_js_1.getImageForRarity)(rarity);
            const wateringCanUrl = (0, waterGeneration_js_1.getImageForWater)();
            const storeSeed = yield prisma.storeItem.create({
                data: {
                    name: uniqueName,
                    description: `A ${rarity.toLowerCase()} seed of ${uniqueName}`,
                    price: price,
                    stock: stock,
                    itemType: 'seed',
                    rarity: rarity,
                    tokensGenerated: tokensGenerated,
                    img: rarity ? imageUrl : wateringCanUrl,
                },
            });
            createdSeeds.push(storeSeed);
        }
        console.log(`Created ${createdSeeds.length} random unique seeds in the store.`);
    });
}
//EL Stock de todas las rarezas siempre debe ser 1
function getStockByRarity(rarity) {
    return 1;
}
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
// Función para actualizar la tienda con nuevas semillas
function updateStoreWithNewSeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Updating store with new seeds...');
        // Elimina las semillas existentes
        const deleteResult = yield prisma.storeItem.deleteMany({
            where: { itemType: 'seed' },
        });
        console.log(`Deleted ${deleteResult.count} existing seeds.`);
        // Elimina las waters existentes
        const deleteWatersResult = yield prisma.storeItem.deleteMany({
            where: { itemType: 'water' },
        });
        console.log(`Deleted ${deleteWatersResult.count} existing waters.`);
        // Añade nuevas semillas
        yield seedStoreWithRandomSeeds();
        yield (0, waterGeneration_js_1.seedStoreWithRandomWaters)();
    });
}
