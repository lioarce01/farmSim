import { ClimateEvent, ClimateEventType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const applyClimateEffectToAllFarms = async (event: ClimateEvent) => {
  const farms = await prisma.farm.findMany({
    include: {
      slots: true,
    },
  });

  for (const farm of farms) {
    for (const slot of farm.slots) {
      let newClimateEffect = slot.climateEffect ?? 0;

      let newTokensGenerated = slot.seedTokensGenerated ?? 0;

      switch (event.type) {
        case ClimateEventType.DROUGHT:
          newClimateEffect -= event.intensity;
          if (newClimateEffect < 0) newClimateEffect = 0;
          newTokensGenerated -= event.intensity;
          if (newTokensGenerated < 0) newTokensGenerated = 0;
          break;
        case ClimateEventType.RAIN:
          newClimateEffect += event.intensity;
          if (newClimateEffect > 100) newClimateEffect = 100;
          newTokensGenerated += event.intensity;
          break;
        case ClimateEventType.SNOW:
          // Lógica para la nieve
          break;
        case ClimateEventType.SUNNY:
          // Lógica para clima soleado
          break;
      }

      // Actualiza el slot en la base de datos
      await prisma.slot.update({
        where: { id: slot.id },
        data: {
          climateEffect: newClimateEffect,
          seedTokensGenerated: newTokensGenerated,
        },
      });
    }
  }
};
