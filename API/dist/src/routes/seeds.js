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
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allSeeds = yield prisma.seed.findMany();
        allSeeds ? res.status(200).json(allSeeds) : res.status(404).json({ message: 'Seeds not found' });
    }
    catch (e) {
        console.log({ message: 'Error loading seeds', e });
        res.status(500).json({ message: 'Error loading seeds' });
    }
}));
router.post('/harvest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { seedId, userId } = req.body;
    try {
        const seed = yield prisma.seed.findUnique({ where: { id: seedId } });
        if (seed && seed.status === 'READY_TO_HARVEST') {
            const tokens = seed.tokensGenerated;
            // Añadir tokens al balance del usuario
            yield prisma.user.update({
                where: { id: userId },
                data: { balanceToken: { increment: tokens } }
            });
            // Cambiar el estado de la semilla a cosechada o eliminarla
            yield prisma.seed.update({
                where: { id: seedId },
                data: { status: 'HARVESTED' } // O cambiarlo como prefieras
            });
            res.send(`Harvested and received ${tokens} tokens.`);
        }
        else {
            res.status(400).send('Seed not ready to harvest.');
        }
    }
    catch (error) {
        res.status(500).send('Error harvesting seed.');
    }
}));
router.put('/plant-seed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { seedId, inventoryId } = req.body;
    try {
        // Encuentra la semilla por su ID y verifica que esté en el inventario correcto
        const seed = yield prisma.seed.findFirst({
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
        const updatedSeed = yield prisma.seed.update({
            where: { id: seedId },
            data: {
                status: 'GROWING',
                plantedTime: new Date()
            }
        });
        return res.status(200).json({ message: "Seed planted successfully.", seed: updatedSeed });
    }
    catch (e) {
        console.log("Error planting seed", e);
        res.status(500).json({ message: 'Error planting seed.' });
    }
}));
exports.default = router;
