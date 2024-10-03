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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para traer todas las farm
    try {
        const farm = yield prisma.farm.findMany({
            include: {
                slots: true,
            }
        });
        farm ? res.status(200).json(farm) : res.status(404).json({ message: 'Error: farms not found' });
    }
    catch (e) {
        res.status(500).json({ message: 'Error' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para traer farm por id
    const { id } = req.params;
    try {
        const farm = yield prisma.farm.findUnique({
            where: { id },
            include: {
                slots: true,
            }
        });
        farm ? res.status(200).json(farm) : res.status(404).json({ message: 'Error: farm not found' });
    }
    catch (e) {
        res.status(500).json({ message: 'Error' });
    }
}));
// Ruta para plantar semilla
router.post('/plant-seed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { farmId, slotId, seedId, sub } = req.body;
    if (!farmId || !slotId || !seedId || !sub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        const slot = yield prisma.slot.findUnique({ where: { id: slotId } });
        const seed = yield prisma.seed.findUnique({ where: { id: seedId } });
        if (!slot || !seed) {
            return res.status(404).json({ message: 'Slot o semilla no encontrada' });
        }
        const currentTime = new Date();
        const updatedSlot = yield prisma.slot.update({
            where: { id: slotId },
            data: {
                seedId: seedId,
                plantingTime: currentTime,
                growthStatus: 'GROWING',
                seedName: seed.name,
                seedDescription: seed.description,
                seedRarity: seed.rarity,
                seedTokensGenerated: seed.tokensGenerated,
            },
        });
        const userInventory = yield prisma.user.findUnique({
            where: { sub },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                    },
                },
            },
        });
        if (userInventory && userInventory.inventory) {
            const seedInInventory = userInventory.inventory.seeds.find(s => s.id === seedId);
            if (seedInInventory) {
                yield prisma.seed.delete({ where: { id: seedId } });
            }
            else {
                return res.status(404).json({ message: 'Semilla no encontrada en el inventario' });
            }
        }
        else {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }
        const io = req.app.locals.io;
        if (io) {
            io.emit('seed-planted', {
                farmId,
                slotId,
                updatedSlot,
            });
        }
        res.status(200).json({ message: 'Semilla plantada exitosamente', updatedSlot });
    }
    catch (error) {
        const e = error;
        console.error("Error al plantar la semilla:", error);
        res.status(500).json({ message: 'Error al plantar la semilla', error: e.message });
    }
}));
router.put('/water-plant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { farmId, slotId, waterId, userSub } = req.body;
    // Validación de entradas
    if (!farmId || !slotId || !waterId || !userSub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        // Verificar que el slot existe
        const slot = yield prisma.slot.findUnique({
            where: { id: slotId },
        });
        if (!slot) {
            return res.status(404).json({ message: 'Slot no encontrado' });
        }
        if (slot.growthStatus !== 'WATER_NEEDED') {
            return res.status(400).json({ message: 'La planta no necesita ser regada en este momento' });
        }
        const water = yield prisma.water.findUnique({
            where: { id: waterId },
        });
        if (!water || water.quantity === null) {
            return res.status(404).json({ message: 'Agua no encontrada o cantidad no disponible' });
        }
        const user = yield prisma.user.findUnique({
            where: { sub: userSub },
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userInventory = yield prisma.inventory.findUnique({
            where: { userId: user.id },
            include: { waters: true },
        });
        if (!userInventory || !userInventory.waters.some(w => w.id === waterId)) {
            return res.status(403).json({ message: 'Esta agua no pertenece a tu inventario' });
        }
        if (water.quantity < 1) {
            return res.status(400).json({ message: 'No tienes suficiente agua para regar' });
        }
        const updatedSlot = yield prisma.slot.update({
            where: { id: slotId },
            data: {
                growthStatus: 'GROWING',
                wateredCount: slot.wateredCount + 1,
                lastWatered: new Date(),
            },
        });
        const updatedWater = yield prisma.water.update({
            where: { id: waterId },
            data: {
                quantity: {
                    decrement: 1,
                },
            },
        });
        if (updatedWater.quantity === 0) {
            yield prisma.water.delete({
                where: { id: waterId },
            });
        }
        const io = req.app.locals.io;
        if (io) {
            io.emit('seed-watered', {
                farmId,
                slotId,
                updatedSlot,
            });
        }
        res.status(200).json({ message: 'Planta regada exitosamente', updatedSlot });
    }
    catch (error) {
        const e = error;
        console.error("Error al regar la planta:", e.message);
        res.status(500).json({ message: 'Error al regar la planta', error: e.message });
    }
}));
router.put('/harvest-plant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para cosechar una seed de un slot de la granja
    const { slotId, sub, farmId } = req.body;
    if (!farmId || !slotId || !sub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        const slot = yield prisma.slot.findUnique({
            where: { id: slotId }
        });
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        if (slot.farmId !== farmId) {
            return res.status(403).json({ message: 'You do not have permission to harvest from this farm.' });
        }
        const user = yield prisma.user.findUnique({
            where: { sub }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (slot.growthStatus !== 'READY_TO_HARVEST') {
            return res.status(400).json({ message: 'La planta no puede ser cosechada en este momento' });
        }
        if (slot.seedTokensGenerated) {
            yield prisma.user.update({
                where: { sub },
                data: {
                    balanceToken: {
                        increment: slot.seedTokensGenerated
                    }
                }
            });
        }
        const updatedSlot = yield prisma.slot.update({
            where: { id: slotId },
            data: {
                plantingTime: null,
                growthStatus: "NONE",
                wateredCount: 0,
                lastWatered: null,
                seedName: null,
                seedDescription: null,
                seedRarity: null,
                seedTokensGenerated: null
            }
        });
        const io = req.app.locals.io;
        if (io) {
            io.emit('seed-harvested', {
                slotId,
                updatedSlot,
                farmId
            });
        }
        return res.status(200).json({ message: 'Plant harvested successfully', updatedSlot });
    }
    catch (error) {
        console.error('Error harvesting plant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
