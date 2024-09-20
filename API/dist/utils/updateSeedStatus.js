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
// Función para actualizar el estado de las seeds
function updateSeedStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const seeds = yield prisma.seed.findMany({
            where: {
                status: {
                    in: ['GROWING', 'WATER_NEEDED']
                }
            }
        });
        for (const seed of seeds) {
            const timePlanted = new Date(seed.plantedTime).getTime();
            const timeElapsed = now.getTime() - timePlanted;
            if (seed.status === 'GROWING') {
                // Revisar si la semilla ha alcanzado el tiempo para cambiar a WATER_NEEDED
                if (timeElapsed >= 2 * 60 * 60 * 1000) { // 2 horas
                    yield prisma.seed.update({
                        where: { id: seed.id },
                        data: { status: 'WATER_NEEDED' }
                    });
                }
            }
            if (seed.status === "WATER_NEEDED") {
                const sixHoursInMs = 6 * 60 * 60 * 1000; //limite de tiempo de 6hs para regar la seed
                const now = new Date();
                const timeSinceWaterNeeded = now - seed.lastWatered;
                //primer comportamiento: chequea si paso mucho tiempo sin agua
                //y cambia el estado a marchita. ya no se puede regar ni cosechar
                if (timeSinceWaterNeeded >= sixHoursInMs) {
                    yield prisma.seed.update({
                        where: { id: seed.id },
                        data: { status: "WITHERED" }
                    });
                    console.log(`Seed with ID ${seed.id} has withered due to lack of water.`);
                }
                else {
                    const inventory = yield prisma.inventory.findUnique({
                        where: { id: seed.inventoryId },
                        select: { userId: true }
                    });
                    //segundo comportamiento: notifica al jugador que necesita regar
                    yield prisma.notification.create({
                        data: {
                            userId: seed.inventoryId.userId,
                            message: `Your seed ${seed.name} needs water!`,
                            createdAt: new Date(),
                        }
                    });
                }
            }
            //Revisar si la semilla estas lista para cosechar
            const harvestTime = rarityHarvestTimes[seed.rarity];
            if (timeElapsed >= harvestTime) {
                yield prisma.seed.update({
                    where: { id: seed.id },
                    data: { status: 'READY_TO_HARVEST' }
                });
            }
        }
    });
}
module.exports = {
    updateSeedStatus
};
