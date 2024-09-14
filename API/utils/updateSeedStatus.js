const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rarityHarvestTimes = {
  'COMMON': 24 * 60 * 60 * 1000, // 24 horas en milisegundos
  'UNCOMMON': 18 * 60 * 60 * 1000, // 18 horas
  'RARE': 12 * 60 * 60 * 1000, // 12 horas
  'EPIC': 6 * 60 * 60 * 1000, // 6 horas
  'LEGENDARY': 3 * 60 * 60 * 1000 // 3 horas
}

// Función para actualizar el estado de las seeds
async function updateSeedStatus() {
  const seeds = await prisma.seed.findMany({
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
        await prisma.seed.update({
          where: { id: seed.id },
          data: { status: 'WATER_NEEDED' }
        });
      }
    }

    if (seed.status === "WATER_NEEDED") {
      const sixHoursInMs = 6 * 60 * 60 * 1000 //limite de tiempo de 6hs para regar la seed
      const now = new Date()
      const timeSinceWaterNeeded = now - seed.lastWatered

      //primer comportamiento: chequea si paso mucho tiempo sin agua
      //y cambia el estado a marchita. ya no se puede regar ni cosechar
      if (timeSinceWaterNeeded >= sixHoursInMs) {
        await prisma.seed.update({
          where: { id: seed.id },
          data: { status: "WITHERED"}
        })
        console.log(`Seed with ID ${seed.id} has withered due to lack of water.`);
      } else {
        const inventory = await prisma.inventory.findUnique({
          where: { id: seed.inventoryId },
          select: { userId: true }
        })

        //segundo comportamiento: notifica al jugador que necesita regar
        await prisma.notification.create({
          data: {
            userId: seed.inventoryId.userId,
            message: `Your seed ${seed.name} needs water!`,
            createdAt: new Date(),
          }
        })
      }
    }

    //Revisar si la semilla estas lista para cosechar
    const harvestTime = rarityHarvestTimes[seed.rarity]

    if (timeElapsed >= harvestTime) {
      await prisma.seed.update({
        where: { id: seed.id },
        data: { status: 'READY_TO_HARVEST' }
      });
    }
  }
}

module.exports = {
    updateSeedStatus
}