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
      const seed = await prisma.seed.findUnique({ where: { id: seedId } });
  
      if (seed && seed.status === 'READY_TO_HARVEST') {
        const tokens = seed.tokensGenerated;
  
        // Añadir tokens al balance del usuario
        await prisma.user.update({
          where: { id: userId },
          data: { balanceToken: { increment: tokens } }
        });
  
        // Cambiar el estado de la semilla a cosechada o eliminarla
        await prisma.seed.update({
          where: { id: seedId },
          data: { status: 'HARVESTED' } // O cambiarlo como prefieras
        });
  
        res.send(`Harvested and received ${tokens} tokens.`);
      } else {
        res.status(400).send('Seed not ready to harvest.');
      }
    } catch (error) {
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

export default router;