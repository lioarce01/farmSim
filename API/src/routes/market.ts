import express from 'express';
import { PrismaClient, Rarity } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

//GET ALL MARKET LISTINGS
router.get('/', async (req, res) => {
  const { rarity, sortBy } = req.query;

  try {
    const filters: any = {};

    // Solo agregar el filtro de `seedRarity` si tiene un valor válido
    if (rarity && rarity !== 'null') {
      filters.seedRarity = rarity;
    }

    const orderBy: any = {};

    if (sortBy) {
      orderBy.price = sortBy === 'asc' ? 'asc' : 'desc';
    }

    const marketListings = await prisma.marketListing.findMany({
      where: filters,
      orderBy: sortBy
        ? { price: sortBy === 'asc' ? 'asc' : 'desc' }
        : undefined,
    });

    if (marketListings.length === 0) {
      return res.status(404).json({ message: 'No market listings found' });
    }

    res.status(200).json(marketListings);
  } catch (e) {
    console.error('Error getting filtered market listings:', e);
    res.status(500).json({ message: 'Error getting filtered market listings' });
  }
});

//GET MARKET LISTING BY ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const marketListing = await prisma.marketListing.findUnique({
      where: { id },
    });
    if (!marketListing) {
      return res.status(404).json({ message: 'Listado no encontrado' });
    }
    res.status(200).json(marketListing);
  } catch (e) {
    console.error('Error al obtener el listado de mercado:', e);
    res.status(500).json({
      message: 'Error al obtener el listado de mercado',
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

//GET MARKET LISTINGS BY SELLER ID
router.get('/seller/:sellerId', async (req, res) => {
  const { sellerId } = req.params;
  try {
    const marketListings = await prisma.marketListing.findMany({
      where: { sellerId },
    });

    if (marketListings.length === 0) {
      res
        .status(404)
        .json({ message: 'No market listings found for this seller' });
    } else {
      res.status(200).json(marketListings);
    }
  } catch (e) {
    res
      .status(500)
      .json({ message: 'Error fetching market listings by seller' });
  }
});

//CREATE MARKET LISTING
router.post('/', async (req, res) => {
  const { price, sellerId, seedId } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userSeed = await prisma.seed.findFirst({
        where: {
          id: seedId,
          inventory: {
            userId: sellerId,
          },
        },
        include: {
          inventory: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!userSeed) {
        throw new Error('Semilla no encontrada en el inventario del usuario');
      }

      // Crear el listado en el mercado
      const newListing = await prisma.marketListing.create({
        data: {
          price,
          seller: { connect: { id: sellerId } },
          seed: { connect: { id: seedId } },
          seedName: userSeed.name,
          seedDescription: userSeed.description,
          seedRarity: userSeed.rarity,
          seedTokensGenerated: userSeed.tokensGenerated,
          seedImg: userSeed.img,
          sellerSub: userSeed.inventory?.user.sub ?? '',
        },
      });

      await prisma.seed.update({
        where: { id: seedId },
        data: { inventoryId: null },
      });

      return newListing;
    });

    const io = req.app.locals.io;
    if (io) {
      io.emit('marketListingCreated', result);
    }

    res.status(201).json(result);
  } catch (e) {
    console.error('Error al crear el listado:', e);
    res.status(500).json({
      message: 'Error al crear el listado',
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

//DELETE MARKET LISTING
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const listing = await prisma.marketListing.findUnique({
        where: { id },
        include: { seed: true, seller: { include: { inventory: true } } },
      });

      if (!listing) {
        throw new Error('Listado no encontrado');
      }

      // Eliminar el listado del mercado
      await prisma.marketListing.delete({
        where: { id },
      });

      // Devolver la semilla al inventario del vendedor
      await prisma.seed.create({
        data: {
          name: listing.seedName!,
          description: listing.seedDescription!,
          rarity: listing.seedRarity!,
          tokensGenerated: listing.seedTokensGenerated,
          img: listing.seedImg,
          inventory: { connect: { id: listing.seller.inventory!.id } },
        },
      });

      return { message: 'Listado eliminado y semilla devuelta al inventario' };
    });

    const io = req.app.locals.io;
    if (io) {
      io.emit('marketListingDeleted', result);
    }

    res.status(200).json(result);
  } catch (e) {
    console.error('Error al eliminar el listado:', e);
    res.status(500).json({
      message: 'Error al eliminar el listado',
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

//BUY SEED FROM MARKET
router.post('/buy/:id', async (req, res) => {
  const { id } = req.params;
  const { buyerId } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const listing = await prisma.marketListing.findUnique({
        where: { id },
        include: { seller: true },
      });

      if (!listing) {
        throw new Error('Listado no encontrado');
      }

      const buyer = await prisma.user.findUnique({
        where: { id: buyerId },
        include: { inventory: true },
      });

      if (!buyer) {
        throw new Error('Comprador no encontrado');
      }

      if (buyer.balanceToken < listing.price) {
        throw new Error('Saldo insuficiente');
      }

      // Transferir tokens
      await prisma.user.update({
        where: { id: buyerId },
        data: { balanceToken: { decrement: listing.price } },
      });

      await prisma.user.update({
        where: { id: listing.sellerId },
        data: { balanceToken: { increment: listing.price } },
      });

      // Transferir la semilla al inventario del comprador
      await prisma.seed.create({
        data: {
          name: listing.seedName!,
          description: listing.seedDescription!,
          rarity: listing.seedRarity!,
          tokensGenerated: listing.seedTokensGenerated,
          img: listing.seedImg,
          inventory: { connect: { id: buyer.inventory!.id } },
        },
      });

      // Eliminar el listado del mercado
      await prisma.marketListing.delete({
        where: { id },
      });

      return { message: 'Compra realizada con éxito' };
    });

    const io = req.app.locals.io;
    if (io) {
      io.emit('marketListingBought', result);
    }

    res.status(200).json(result);
  } catch (e) {
    console.error('Error al comprar la semilla:', e);
    res.status(500).json({
      message: 'Error al comprar la semilla',
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

export default router;
