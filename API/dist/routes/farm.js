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
router.post('/plant-seed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { farmId, slotId, seedId, sub } = req.body;
    // Validación de entradas
    if (!farmId || !slotId || !seedId || !sub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        // Verificar que el slot y la semilla existen
        const slot = yield prisma.slot.findUnique({
            where: { id: slotId },
        });
        const seed = yield prisma.seed.findUnique({
            where: { id: seedId },
        });
        if (!slot) {
            return res.status(404).json({ message: 'Slot no encontrado' });
        }
        if (!seed) {
            return res.status(404).json({ message: 'Semilla no encontrada' });
        }
        // Actualizar el slot con la semilla y sus características
        const currentTime = new Date();
        const updatedSlot = yield prisma.slot.update({
            where: { id: slotId },
            data: {
                seedId: seedId,
                plantingTime: currentTime,
                growthStatus: 'GROWING',
                seedName: seed.name, // Asegúrate de que seed.name esté disponible
                seedDescription: seed.description, // Asegúrate de que seed.description esté disponible
                seedRarity: seed.rarity, // Asegúrate de que seed.rarity esté disponible
                seedTokensGenerated: seed.tokensGenerated, // Asegúrate de que seed.tokensGenerated esté disponible
            },
        });
        // Eliminar la semilla del inventario del usuario usando su sub
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
            const seedInInventory = userInventory.inventory.seeds.find(seed => seed.id === seedId);
            if (seedInInventory) {
                yield prisma.seed.delete({
                    where: { id: seedId },
                });
            }
            else {
                return res.status(404).json({ message: 'La semilla no está en el inventario del usuario.' });
            }
        }
        else {
            return res.status(404).json({ message: 'Inventario no encontrado.' });
        }
        res.status(200).json({ message: 'Semilla plantada exitosamente', updatedSlot });
    }
    catch (error) {
        const e = error; // Aserción de tipo
        console.error("Error al plantar la semilla:", e.message);
        return res.status(500).json({ message: 'Error al plantar la semilla', error: e.message });
    }
}));
router.put('/water-plant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para regar una seed de un slot de la granja
}));
router.post('/harvest-plant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para cosechar una seed de un slot de la granja
}));
exports.default = router;
