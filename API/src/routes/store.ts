import express from 'express';
import { PrismaClient, Rarity } from "@prisma/client";
import { updateStoreWithNewSeeds } from '../controllers/storeController';
import cron from 'node-cron'

const router = express.Router();
const prisma = new PrismaClient();


router.get("/", async (req, res) => {

  try {
    const storeItems = await prisma.storeItem.findMany()

    
    
    res.status(200).json(storeItems)

  } catch (e) {
    console.log(e, "ERROR al obtener los items de la tienda"),
    res.status(500).json({
      message: "Error al obtener los items de la tienda."
    })
  }
})

let lastUpdateTime: number | null = null;

// Configurar el cron job para que se ejecute cada 5 minutos
cron.schedule('* * * * *', async () => {
  await updateStoreWithNewSeeds();
  lastUpdateTime = Date.now();
});

function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes} minutos y ${seconds} segundos`;
}

router.get('/refreshStore', (req, res) => {
  const updateInterval = 1 * 60 * 1000; // 1 minutos en milisegundos
  const currentTime = Date.now();

  if (lastUpdateTime) {
    const timeSinceLastUpdate = currentTime - lastUpdateTime;
    const timeRemaining = updateInterval - timeSinceLastUpdate;

    if (timeRemaining > 0) {
      // Devuelve el tiempo restante en un formato legible
      res.status(200).json({
        message: 'Tiempo hasta la próxima actualización',
        timeRemaining: formatTimeRemaining(timeRemaining),
        timeRemainingInMs: timeRemaining, // Puedes incluir también el tiempo en milisegundos si es necesario
      });
    } else {
      // Si el tiempo restante es negativo, significa que se puede actualizar
      res.status(200).json({
        message: 'La tienda puede ser actualizada ahora.',
        timeRemaining: '0 minutos y 0 segundos',
        timeRemainingInMs: 0,
      });
    }
  } else {
    // Si no hay tiempo de actualización, devolver que puede actualizarse
    res.status(200).json({
      message: 'La tienda puede ser actualizada ahora.',
      timeRemaining: '0 minutos y 0 segundos',
      timeRemainingInMs: 0,
    });
  }
});

router.post('/buy', async (req, res) => {
  const { userId, itemId, quantity, itemType } = req.body;

  try {
    // Buscar el ítem en la tienda
    const storeItem = await prisma.storeItem.findUnique({
      where: { id: itemId }
    });

    if (!storeItem) {
      return res.status(404).json({ message: 'El ítem no existe en la tienda' });
    }

    // Verificar si hay suficiente stock disponible
    if (storeItem.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuficiente' });
    }

    // Buscar al usuario
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { inventory: { include: { seeds: true, waters: true } } }
    });

    // Comprobar si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear el inventario si no existe
    if (!user.inventory) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          inventory: {
            create: {}
          }
        },
        include: { inventory: { include: { seeds: true, waters: true } } }
      });
    }

    // Verificar si el usuario tiene suficientes tokens
    const totalPrice = storeItem.price * quantity;
    if (user.balanceToken < totalPrice) {
      return res.status(400).json({ message: 'Saldo insuficiente de tokens' });
    }

    // Reducir el stock en la tienda solo por la cantidad solicitada
    await prisma.storeItem.update({
      where: { id: itemId },
      data: {
        stock: { decrement: quantity }
      }
    });

    // Descontar los tokens del usuario por la cantidad de ítems comprados
    await prisma.user.update({
      where: { id: userId },
      data: {
        balanceToken: { decrement: totalPrice }
      }
    });

    // Verificar si el ítem es una semilla o agua
    if (itemType === 'seed') {
      // Verificar si la semilla ya está en el inventario del usuario
      const existingSeed = await prisma.seed.findFirst({
        where: {
          inventoryId: user.inventory!.id, // Non-null assertion here
          name: storeItem.name
        }
      });

      if (existingSeed) {
        // Si la semilla ya existe, incrementar la cantidad
        await prisma.seed.update({
          where: { id: existingSeed.id },
          data: {
            quantity: { increment: quantity }
          }
        });
      } else {
        // Si no existe, crear una nueva semilla en el inventario
        await prisma.seed.create({
          data: {
            name: storeItem.name,
            description: storeItem.description,
            quantity: quantity,
            rarity: storeItem.rarity as Rarity,
            status: "NONE",
            inventoryId: user.inventory!.id // Non-null assertion here
          }
        });
      }
    } else if (itemType === 'water') {
      // Verificar si el ítem de agua ya está en el inventario del usuario
      const existingWater = await prisma.water.findFirst({
        where: {
          inventoryId: user.inventory!.id, // Non-null assertion here
          name: storeItem.name
        }
      });

      if (existingWater) {
        // Si el ítem de agua ya existe, incrementar la cantidad
        await prisma.water.update({
          where: { id: existingWater.id },
          data: {
            quantity: { increment: quantity }
          }
        });
      } else {
        // Si no existe, crear un nuevo ítem de agua en el inventario
        await prisma.water.create({
          data: {
            name: storeItem.name,
            description: storeItem.description,
            quantity: quantity,
            inventoryId: user.inventory!.id // Non-null assertion here
          }
        });
      }
    } else {
      return res.status(400).json({ message: 'Tipo de ítem no válido' });
    }

    res.status(200).json({ message: 'Compra realizada con éxito' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al realizar la compra.' });
  }
});

export default router;