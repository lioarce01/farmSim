"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
//GET ALL MARKET LISTINGS
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const marketListings = yield prisma.marketListing.findMany();
        if (marketListings.length === 0) {
            return res
                .status(404)
                .json({ message: 'No se encontraron listados de mercado' });
        }
        res.status(200).json(marketListings);
    }
    catch (e) {
        console.error('Error al obtener listados de mercado:', e);
        res.status(500).json({
            message: 'Error al obtener listados de mercado',
            error: e instanceof Error ? e.message : String(e),
        });
    }
}));
//GET MARKET LISTINGS BY SELLER ID
router.get('/seller/:sellerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sellerId } = req.params;
    try {
        const marketListings = yield prisma.marketListing.findMany({
            where: { sellerId },
        });
        if (marketListings.length === 0) {
            res
                .status(404)
                .json({ message: 'No market listings found for this seller' });
        }
        else {
            res.status(200).json(marketListings);
        }
    }
    catch (e) {
        res
            .status(500)
            .json({ message: 'Error fetching market listings by seller' });
    }
}));
//CREATE MARKET LISTING
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { price, sellerId, seedId } = req.body;
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const userSeed = yield prisma.seed.findFirst({
                where: {
                    id: seedId,
                    inventory: {
                        userId: sellerId,
                    },
                },
            });
            if (!userSeed) {
                throw new Error('Semilla no encontrada en el inventario del usuario');
            }
            // Crear el listado en el mercado
            const newListing = yield prisma.marketListing.create({
                data: {
                    price,
                    seller: { connect: { id: sellerId } },
                    seed: { connect: { id: seedId } },
                    seedName: userSeed.name,
                    seedDescription: userSeed.description,
                    seedRarity: userSeed.rarity,
                    seedTokensGenerated: userSeed.tokensGenerated,
                    seedImg: userSeed.img,
                },
            });
            // Desconectar la semilla del inventario del usuario
            yield prisma.seed.update({
                where: { id: seedId },
                data: { inventoryId: null },
            });
            return newListing;
        }));
        res.status(201).json(result);
    }
    catch (e) {
        console.error('Error al crear el listado:', e);
        res.status(500).json({
            message: 'Error al crear el listado',
            error: e instanceof Error ? e.message : String(e),
        });
    }
}));
//DELETE MARKET LISTING
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const listing = yield prisma.marketListing.findUnique({
                where: { id },
                include: { seed: true, seller: { include: { inventory: true } } },
            });
            if (!listing) {
                throw new Error('Listado no encontrado');
            }
            // Eliminar el listado del mercado
            yield prisma.marketListing.delete({
                where: { id },
            });
            // Devolver la semilla al inventario del vendedor
            yield prisma.seed.create({
                data: {
                    name: listing.seedName,
                    description: listing.seedDescription,
                    rarity: listing.seedRarity,
                    tokensGenerated: listing.seedTokensGenerated,
                    img: listing.seedImg,
                    inventory: { connect: { id: listing.seller.inventory.id } },
                },
            });
            return { message: 'Listado eliminado y semilla devuelta al inventario' };
        }));
        res.status(200).json(result);
    }
    catch (e) {
        console.error('Error al eliminar el listado:', e);
        res.status(500).json({
            message: 'Error al eliminar el listado',
            error: e instanceof Error ? e.message : String(e),
        });
    }
}));
//BUY SEED FROM MARKET
router.post('/buy/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { buyerId } = req.body;
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const listing = yield prisma.marketListing.findUnique({
                where: { id },
                include: { seller: true },
            });
            if (!listing) {
                throw new Error('Listado no encontrado');
            }
            const buyer = yield prisma.user.findUnique({
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
            yield prisma.user.update({
                where: { id: buyerId },
                data: { balanceToken: { decrement: listing.price } },
            });
            yield prisma.user.update({
                where: { id: listing.sellerId },
                data: { balanceToken: { increment: listing.price } },
            });
            // Transferir la semilla al inventario del comprador
            yield prisma.seed.create({
                data: {
                    name: listing.seedName,
                    description: listing.seedDescription,
                    rarity: listing.seedRarity,
                    tokensGenerated: listing.seedTokensGenerated,
                    img: listing.seedImg,
                    inventory: { connect: { id: buyer.inventory.id } },
                },
            });
            // Eliminar el listado del mercado
            yield prisma.marketListing.delete({
                where: { id },
            });
            return { message: 'Compra realizada con éxito' };
        }));
        res.status(200).json(result);
    }
    catch (e) {
        console.error('Error al comprar la semilla:', e);
        res.status(500).json({
            message: 'Error al comprar la semilla',
            error: e instanceof Error ? e.message : String(e),
        });
    }
}));
exports.default = router;
