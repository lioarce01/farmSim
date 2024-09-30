const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rarityHarvestTimes = {
  'COMMON': 24 * 60 * 60 * 1000, // 24 horas
  'UNCOMMON': 18 * 60 * 60 * 1000, // 18 horas
  'RARE': 12 * 60 * 60 * 1000, // 12 horas
  'EPIC': 6 * 60 * 60 * 1000, // 6 horas
  'LEGENDARY': 3 * 60 * 60 * 1000 // 3 horas
};

async function updateGrowthStatus() {
  const slots = await prisma.slot.findMany({
    where: {
      growthStatus: {
        in: ['GROWING', 'WATER_NEEDED']
      }
      // No es necesario filtrar por seedId aquí
    }
  });

  const now = new Date();

  for (const slot of slots) {
    const timePlanted = new Date(slot.plantingTime).getTime();
    const timeElapsed = now.getTime() - timePlanted;
    const lastWateredTime = new Date(slot.lastWatered || slot.plantingTime).getTime();
    const timeSinceLastWatered = now.getTime() - lastWateredTime;

    // Si la planta está en estado GROWING, verificar si necesita agua después de 2 HORAS.
    if (slot.growthStatus === 'GROWING' && timeSinceLastWatered >= 2 * 60 * 60 * 1000) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'WATER_NEEDED' }
      });
      console.log(`Plant in slot with ID ${slot.id} needs water.`);
    }

    // Si la planta está en estado WATER_NEEDED y ha pasado más de 6 horas sin agua, marchitarla
    if (slot.growthStatus === 'WATER_NEEDED' && timeSinceLastWatered >= 6 * 60 * 60 * 1000) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'WITHERED' }
      });
      console.log(`Plant in slot with ID ${slot.id} has withered due to lack of water.`);
    }

    // Notificar al usuario que la planta necesita agua
    if (slot.growthStatus === 'WATER_NEEDED' && timeSinceLastWatered < 6 * 60 * 60 * 1000) {
      const inventory = await prisma.inventory.findUnique({
        where: { userId: slot.farm.userId }, // Asegúrate de que farm tenga userId
        select: { userId: true }
      });

      await prisma.notification.create({
        data: {
          userId: inventory.userId,
          message: `Your plant ${slot.seedName} in the farm needs water!`,
          createdAt: new Date(),
        }
      });
    }

    // Verificar si la planta está lista para cosechar según la rareza de la semilla
    const harvestTime = rarityHarvestTimes[slot.seedRarity]; // Usar seedRarity del slot
    if (timeElapsed >= harvestTime) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'READY_TO_HARVEST' }
      });
      console.log(`Plant in slot with ID ${slot.id} is ready to harvest.`);
    }
  }
}

module.exports = {
  updateGrowthStatus
};
