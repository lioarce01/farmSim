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
const rarityHarvestTimes = {
  COMMON: 24 * 60 * 60 * 1000, // 24 horas
  UNCOMMON: 18 * 60 * 60 * 1000, // 18 horas
  RARE: 12 * 60 * 60 * 1000, // 12 horas
  EPIC: 6 * 60 * 60 * 1000, // 6 horas
  LEGENDARY: 3 * 60 * 60 * 1000, // 3 horas
};
function updateGrowthStatus() {
  return __awaiter(this, void 0, void 0, function* () {
    const slots = yield prisma.slot.findMany({
      where: {
        growthStatus: {
          in: ['GROWING', 'WATER_NEEDED'],
        },
        seedId: {
          not: null, // Solo actualizar slots con semilla plantada
        },
      },
    });
    const now = new Date();
    for (const slot of slots) {
      const timePlanted = new Date(slot.plantingTime).getTime();
      const timeElapsed = now.getTime() - timePlanted;
      // Manejar lastWatered, si es null, usar plantingTime
      const lastWateredTime = slot.lastWatered
        ? new Date(slot.lastWatered).getTime()
        : timePlanted;
      const timeSinceLastWatered = now.getTime() - lastWateredTime;
      // Si la planta está en estado GROWING, verificar si necesita agua después de 1 minuto
      if (
        slot.growthStatus === 'GROWING' &&
        timeSinceLastWatered >= 1 * 60 * 1000
      ) {
        yield prisma.slot.update({
          where: { id: slot.id },
          data: { growthStatus: 'WATER_NEEDED' },
        });
        console.log(`Plant in slot with ID ${slot.id} needs water.`);
      }
      // Si la planta está en estado WATER_NEEDED y ha pasado más de 6 horas sin agua, marchitarla
      if (
        slot.growthStatus === 'WATER_NEEDED' &&
        timeSinceLastWatered >= 6 * 60 * 60 * 1000
      ) {
        yield prisma.slot.update({
          where: { id: slot.id },
          data: { growthStatus: 'WITHERED' },
        });
        console.log(
          `Plant in slot with ID ${slot.id} has withered due to lack of water.`,
        );
      }
      // Notificar al usuario que la planta necesita agua
      if (
        slot.growthStatus === 'WATER_NEEDED' &&
        timeSinceLastWatered < 6 * 60 * 60 * 1000
      ) {
        const inventory = yield prisma.inventory.findUnique({
          where: { userId: slot.farmId.userId }, // Asegúrate de que farm tenga userId
          select: { userId: true },
        });
        yield prisma.notification.create({
          data: {
            userId: inventory.userId,
            message: `Your plant ${slot.seedName} in the farm needs water!`,
            createdAt: new Date(),
          },
        });
      }
      // Verificar si la planta está lista para cosechar según la rareza de la semilla
      const harvestTime = rarityHarvestTimes[slot.seedRarity]; // Usar seedRarity del slot
      if (timeElapsed >= harvestTime) {
        yield prisma.slot.update({
          where: { id: slot.id },
          data: { growthStatus: 'READY_TO_HARVEST' },
        });
        console.log(`Plant in slot with ID ${slot.id} is ready to harvest.`);
      }
    }
  });
}
module.exports = {
  updateGrowthStatus,
};
