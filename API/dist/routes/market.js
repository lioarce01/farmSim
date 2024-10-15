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
        console.log('Obteniendo listados de mercado...');
        const marketListings = yield prisma.marketListing.findMany({
            select: {
                id: true,
                price: true,
                sellerId: true,
                seedId: true,
                seedName: true,
                seedDescription: true,
                seedRarity: true,
                seedTokensGenerated: true,
                seedImg: true,
                listedAt: true,
            },
        });
        console.log(`Se encontraron ${marketListings.length} listados`);
        console.log('Listados:', JSON.stringify(marketListings, null, 2));
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
        if (!marketListings) {
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
                return res.status(404).json({
                    message: 'Semilla no encontrada en el inventario del usuario',
                });
            }
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
exports.default = router;
