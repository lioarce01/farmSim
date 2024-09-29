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
const rarityHarvestTimes = {
    'COMMON': 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    'UNCOMMON': 18 * 60 * 60 * 1000, // 18 horas
    'RARE': 12 * 60 * 60 * 1000, // 12 horas
    'EPIC': 6 * 60 * 60 * 1000, // 6 horas
    'LEGENDARY': 3 * 60 * 60 * 1000 // 3 horas
};
// Función para actualizar el estado de crecimiento de las plantas en los slots
function updateGrowthStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const slots = yield prisma.slot.findMany({
            where: {
                growthStatus: {
                    in: ['GROWING', 'WATER_NEEDED']
                },
                seedId: {
                    not: null // Solo actualizar slots que tengan una semilla plantada
                }
            },
            include: {
                seed: true, // Para obtener la información de la semilla relacionada
            }
        });
        const now = new Date();
        for (const slot of slots) {
            const timePlanted = new Date(slot.plantingTime).getTime();
            const timeElapsed = now.getTime() - timePlanted;
            if (slot.growthStatus === 'GROWING') {
                // Revisar si la planta necesita agua después de 2 horas
                if (timeElapsed >= 2 * 60 * 60 * 1000) { // 2 horas
                    yield prisma.slot.update({
                        where: { id: slot.id },
                        data: { growthStatus: 'WATER_NEEDED' }
                    });
                }
            }
            if (slot.growthStatus === "WATER_NEEDED") {
                const sixHoursInMs = 6 * 60 * 60 * 1000; // Límite de tiempo de 6 horas para regar
                const timeSinceWaterNeeded = now - slot.lastWatered;
                // Comportamiento 1: La planta se marchita si no se riega en 6 horas
                if (timeSinceWaterNeeded >= sixHoursInMs) {
                    yield prisma.slot.update({
                        where: { id: slot.id },
                        data: { growthStatus: "WITHERED" }
                    });
                    console.log(`Plant in slot with ID ${slot.id} has withered due to lack of water.`);
                }
                else {
                    const inventory = yield prisma.inventory.findUnique({
                        where: { id: slot.seed.inventoryId },
                        select: { userId: true }
                    });
                    // Comportamiento 2: Notificar al jugador que necesita regar la planta
                    yield prisma.notification.create({
                        data: {
                            userId: inventory.userId,
                            message: `Your plant ${slot.seed.name} in the farm needs water!`,
                            createdAt: new Date(),
                        }
                    });
                }
            }
            // Revisar si la planta está lista para cosechar según la rareza de la semilla
            const harvestTime = rarityHarvestTimes[slot.seed.rarity];
            if (timeElapsed >= harvestTime) {
                yield prisma.slot.update({
                    where: { id: slot.id },
                    data: { growthStatus: 'READY_TO_HARVEST' }
                });
            }
        }
    });
}
module.exports = {
    updateGrowthStatus
};
