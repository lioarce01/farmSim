import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

const rarityHarvestTimes: Record<Rarity, number> = {
  [Rarity.COMMON]: 24 * 60 * 60 * 1000,
  [Rarity.UNCOMMON]: 18 * 60 * 60 * 1000,
  [Rarity.RARE]: 12 * 60 * 60 * 1000,
  [Rarity.EPIC]: 6 * 60 * 60 * 1000,
  [Rarity.LEGENDARY]: 3 * 60 * 60 * 1000,
};

export async function updateGrowthStatus(io: any) {
  const slots = await prisma.slot.findMany({
    where: {
      growthStatus: {
        in: ['GROWING', 'WATER_NEEDED']
      }
    }
  });

  const now = new Date().getTime();

  for (const slot of slots) {
    // Para el caso de plantingTime, si es null significa que no hay planta
    const timePlanted = slot.plantingTime ? new Date(slot.plantingTime).getTime() : now;

    // Para lastWatered, si es null, significa que nunca se ha regado
    const lastWateredTime = slot.lastWatered 
      ? new Date(slot.lastWatered).getTime() 
      : (slot.plantingTime ? new Date(slot.plantingTime).getTime() : now);

    // Cálculo del tiempo transcurrido y el tiempo desde el último riego
    const timeElapsed = now - timePlanted;
    const timeSinceLastWatered = now - lastWateredTime;

    // Si la planta está en estado GROWING, verificar si necesita agua después de 2 HORAS.
    if (slot.growthStatus === 'GROWING' && timeSinceLastWatered >= 2 * 60 * 60 * 1000) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'WATER_NEEDED' }
      });
      console.log(`Plant in slot with ID ${slot.id} needs water.`);

      // Emitir evento de Socket.IO para notificar al cliente
      io.emit('actualizacion-planta', {
        slotId: slot.id,
        status: 'WATER_NEEDED'
      });
    }

    // Si la planta está en estado WATER_NEEDED y ha pasado más de 6 horas sin agua, marchitarla
    if (slot.growthStatus === 'WATER_NEEDED' && timeSinceLastWatered >= 6 * 60 * 60 * 1000) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'WITHERED' }
      });
      console.log(`Plant in slot with ID ${slot.id} has withered due to lack of water.`);

      // Emitir evento de Socket.IO para notificar al cliente
      io.emit('actualizacion-planta', {
        slotId: slot.id,
        status: 'WITHERED'
      });
    }

    // Verificar si la planta está lista para cosechar según la rareza de la semilla
    let harvestTime: number;

    if (slot.seedRarity && Object.values(Rarity).includes(slot.seedRarity as Rarity)) {
      harvestTime = rarityHarvestTimes[slot.seedRarity as Rarity];
    } else {
      // Manejo del caso cuando seedRarity es null o inválido
      console.log(`Slot with ID ${slot.id} has null or invalid seedRarity: ${slot.seedRarity}.`);
      harvestTime = 0; // o algún valor por defecto
    }

    if (timeElapsed >= harvestTime) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { growthStatus: 'READY_TO_HARVEST' }
      });
      console.log(`Plant in slot with ID ${slot.id} is ready to harvest.`);

      // Emitir evento de Socket.IO para notificar al cliente
      io.emit('actualizacion-planta', {
        slotId: slot.id,
        status: 'READY_TO_HARVEST'
      });
    }
  }
}
