import express from 'express';
import { PrismaClient, Rarity } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const storeItems = await prisma.storeItem.findMany();

    res.status(200).json(storeItems);
  } catch (e) {
    console.log(e, 'ERROR al obtener los items de la tienda'),
      res.status(500).json({
        message: 'Error al obtener los items de la tienda.',
      });
  }
});

router.get('/item/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Error retrieving item', error: e });
  }
});

router.post('/buy', async (req, res) => {
  const { userSub, itemId, quantity, itemType } = req.body;

  try {
    const storeItem = await prisma.storeItem.findUnique({
      where: { id: itemId },
    });

    if (!storeItem) {
      return res
        .status(404)
        .json({ message: 'El ítem no existe en la tienda' });
    }

    if (storeItem.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuficiente' });
    }

    let user = await prisma.user.findUnique({
      where: { sub: userSub },
      include: { inventory: { include: { seeds: true, waters: true } } },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.inventory) {
      user = await prisma.user.update({
        where: { sub: userSub },
        data: {
          inventory: {
            create: {},
          },
        },
        include: { inventory: { include: { seeds: true, waters: true } } },
      });
    }

    const totalPrice = storeItem.price * quantity;
    if (user.balanceToken < totalPrice) {
      return res.status(400).json({ message: 'Saldo insuficiente de tokens' });
    }

    await prisma.storeItem.update({
      where: { id: itemId },
      data: {
        stock: { decrement: quantity },
      },
    });

    await prisma.user.update({
      where: { sub: userSub },
      data: {
        balanceToken: { decrement: totalPrice },
      },
    });

    if (itemType === 'seed') {
      const existingSeed = await prisma.seed.findFirst({
        where: {
          inventoryId: user.inventory!.id,
          name: storeItem.name,
        },
      });

      if (existingSeed) {
        await prisma.seed.update({
          where: { id: existingSeed.id },
          data: {
            quantity: { increment: quantity },
          },
        });
      } else {
        await prisma.seed.create({
          data: {
            name: storeItem.name,
            description: storeItem.description,
            quantity: quantity,
            rarity: storeItem.rarity as Rarity,
            inventoryId: user.inventory!.id,
            tokensGenerated: storeItem.tokensGenerated,
            img: storeItem.img,
          },
        });
      }
    } else if (itemType === 'water') {
      const existingWater = await prisma.water.findFirst({
        where: {
          inventoryId: user.inventory!.id,
          name: storeItem.name,
        },
      });

      if (existingWater) {
        await prisma.water.update({
          where: { id: existingWater.id },
          data: {
            quantity: { increment: quantity },
          },
        });
      } else {
        await prisma.water.create({
          data: {
            name: storeItem.name,
            description: storeItem.description,
            quantity: quantity,
            inventoryId: user.inventory!.id,
          },
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
