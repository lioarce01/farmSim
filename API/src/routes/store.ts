import express from 'express';
import { PrismaClient } from "@prisma/client";

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

router.post('/buy', async (req, res) => {
  const { userId, itemId, quantity, itemType } = req.body;

  try {
    // Buscar el ítem en la tienda
    const storeItem = await prisma.storeItem.findUnique({
      where: { id: itemId }
    });

    if (!storeItem || storeItem.stock < quantity) {
      return res.status(400).json({ message: 'El ítem no está disponible o no hay suficiente stock' });
    }

    // Buscar al usuario y su inventario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { inventory: { include: { seeds: true, waters: true } } }
    });

    // Verificar si el usuario tiene un inventario
    if (!user || !user.inventory) {
      return res.status(400).json({ message: 'Usuario no encontrado o no tiene inventario' });
    }

    if (user.balanceToken < storeItem.price * quantity) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    const inventoryId = user.inventory.id; // Asegúrate de que el inventario existe

    // Verificar si es seed o water
    if (itemType === 'seed') {
      // Verificar si la semilla ya está en el inventario
      const seedItem = await prisma.seed.findFirst({
        where: { inventoryId, name: storeItem.name }
      });

      if (seedItem) {
        // Si ya existe, solo actualiza la cantidad
        await prisma.seed.update({
          where: { id: seedItem.id },
          data: {
            quantity: { increment: quantity }
          }
        });
      } else {
        // Si no existe, crea una nueva semilla en el inventario
        await prisma.seed.create({
          data: {
            name: storeItem.name,
            description: "desc", 
            quantity: quantity,
            rarity: "COMMON",
            status: "GROWING",
            inventoryId: inventoryId,
          }
        });
      }
    } else if (itemType === 'water') {
      // Verificar si el ítem de agua ya está en el inventario
      const waterItem = await prisma.water.findFirst({
        where: { inventoryId, name: storeItem.name }
      });

      if (waterItem) {
        // Si ya existe, solo actualiza la cantidad
        await prisma.water.update({
          where: { id: waterItem.id },
          data: {
            quantity: { increment: quantity }
          }
        });
      } else {
        // Si no existe, crea un nuevo ítem de agua en el inventario
        await prisma.water.create({
          data: {
            name: storeItem.name,
            description: "",
            quantity: quantity,
            inventoryId: inventoryId
          }
        });
      }
    } else {
      return res.status(400).json({ message: 'Tipo de ítem no válido' });
    }

    // Actualizar el saldo del usuario y reducir el stock del ítem en la tienda
    await prisma.user.update({
      where: { id: userId },
      data: {
        balanceToken: { decrement: storeItem.price * quantity }
      }
    });

    await prisma.storeItem.update({
      where: { id: itemId },
      data: {
        stock: { decrement: quantity }
      }
    });

    res.status(200).json({ message: 'Compra realizada con éxito' });
    
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ message: "Error al realizar la compra."})
  }
});

export default router;