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

  if (!['seed', 'water'].includes(itemType)) {
    return res.status(400).json({ message: 'Tipo de ítem no válido' });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const storeItem = await prisma.storeItem.findUnique({
        where: { id: itemId },
      });

      if (!storeItem) {
        throw new Error('El ítem no existe en la tienda');
      }

      if (storeItem.stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      let user = await prisma.user.findUnique({
        where: { sub: userSub },
        include: { inventory: true },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.inventory) {
        user = await prisma.user.update({
          where: { sub: userSub },
          data: {
            inventory: {
              create: {},
            },
          },
          include: { inventory: true },
        });
      }

      const totalPrice = storeItem.price * quantity;
      if (user.balanceToken < totalPrice) {
        throw new Error('Saldo insuficiente de tokens');
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
        const inventoryId = user.inventory?.id;
        if (!inventoryId) {
          throw new Error('ID de inventario no encontrado');
        }
        await prisma.seed.create({
          data: {
            name: storeItem.name,
            description: storeItem.description,
            rarity: storeItem.rarity as Rarity,
            inventoryId,
            tokensGenerated: storeItem.tokensGenerated ?? 0,
            img: storeItem.img ?? '',
          },
        });
      } else if (itemType === 'water') {
        const existingWater = await prisma.water.findFirst({
          where: {
            inventoryId: user.inventory?.id,
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
          const inventoryId = user.inventory?.id;
          if (!inventoryId) {
            throw new Error('ID de inventario no encontrado');
          }
          await prisma.water.create({
            data: {
              name: storeItem.name,
              description: storeItem.description,
              quantity,
              inventoryId,
            },
          });
        }

        return {
          message: 'Compra realizada con éxito',
          item: storeItem,
          quantity,
        };
      }

      return {
        message: 'Compra realizada con éxito',
        item: storeItem,
        quantity,
      };
    });

    const io = req.app.locals.io;
    if (io) {
      io.emit('storeItemBought', result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : 'Error al realizar la compra.',
    });
  }
});

export default router;
