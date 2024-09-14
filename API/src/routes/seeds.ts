import express from 'express';
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const allSeeds = await prisma.seed.findMany()

    allSeeds ? res.status(200).json(allSeeds) : res.status(404).json({message: 'Seeds not found'})
    
  } catch (e) {
    console.log({message: 'Error loading seeds', e})
    res.status(500).json({message: 'Error loading seeds'})
  }
})

router.post('/harvest', async (req, res) => {
  const { seedId, userId } = req.body;

  try {
    // Buscar la semilla
    const seed = await prisma.seed.findUnique({ where: { id: seedId } });

    // Verificar que la semilla existe y está lista para cosechar
    if (seed && seed.status === 'READY_TO_HARVEST') {
      // Obtener tokens generados
      const tokens = seed.tokensGenerated ?? 0; // Usa 0 si tokensGenerated es null

      // Añadir tokens al balance del usuario
      await prisma.user.update({
        where: { id: userId },
        data: { balanceToken: { increment: tokens } }
      });

      // Cambiar el estado de la semilla a cosechada
      await prisma.seed.update({
        where: { id: seedId },
        data: { status: 'HARVESTED' } // Puedes ajustar este estado si es necesario
      });

      res.status(200).send(`Harvested and received ${tokens} tokens.`);
    } else {
      res.status(400).send('Seed not ready to harvest or not found.');
    }
  } catch (error) {
    console.error('Error harvesting seed:', error);
    res.status(500).send('Error harvesting seed.');
  }
});


  router.put('/plant-seed', async (req, res) => {
    const { seedId, inventoryId } = req.body;
    
    try {
      // Encuentra la semilla por su ID y verifica que esté en el inventario correcto
      const seed = await prisma.seed.findFirst({
        where: {
          id: seedId,
          inventory: { id: inventoryId }
        }
      });
  
      if (!seed) {
        return res.status(404).json({ message: 'Seed not found or does not belong to the inventory.' });
      }
  
      if (seed.status !== 'NONE') {
        return res.status(400).json({ message: 'Seed is already planted' });
      }
  
      // Actualiza el estado de la semilla y registra el tiempo de plantación
      const updatedSeed = await prisma.seed.update({
        where: { id: seedId },
        data: {
          status: 'GROWING',
          plantedTime: new Date()
        }
      });
  
      return res.status(200).json({ message: "Seed planted successfully.", seed: updatedSeed });
  
    } catch (e) {
      console.log("Error planting seed", e);
      res.status(500).json({ message: 'Error planting seed.' });
    }
  });

  router.post('/water-seed', async (req, res) => {
    const { seedId, userId, waterId } = req.body

    try {
      const seed = await prisma.seed.findFirst({
        where: {
          id: seedId,
          inventory: { userId },
          status: "WATER_NEEDED"
        }
      })

      if (!seed) {
        return res.status(404).json({ message: 'Seed not found or does not need water.'})
      }

      //Encontrar el inventario del usuario para obtener agua
      const userInventory = await prisma.inventory.findUnique({
        where: { userId },
        include: { waters: true }
      })

      if (!userInventory) {
        return res.status(404).json({ message: 'Inventory not found' })
      }

      const waterItem = userInventory.waters.find(water => water.id === waterId)

      if (!waterItem || waterItem.quantity === null || waterItem.quantity <= 0) {
        return res.status(400).json({ message: 'Not enough water available.' })
      } 

      //actualizar el estado a growing despues de aplicar agua
      const updatedSeed = await prisma.seed.update({
        where: { id: seedId },  // Aquí seedId debe ser una string válida
        data: { 
          status: "GROWING",
          lastWatered: new Date() // Se actualiza la última vez regada
        },
      });
      
      return res.status(200).json({ message: 'Seed watered successfully', seed: updatedSeed})
      
    } catch (e) {
      console.log('Error watering seed', e)
      res.status(500).json({ message: 'Error watering seed.'})
    }
  })

export default router;