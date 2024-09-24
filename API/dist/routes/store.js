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
const seedsGeneration_1 = require("utils/seedsGeneration");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeItems = yield prisma.storeItem.findMany();
        res.status(200).json(storeItems);
    }
    catch (e) {
        console.log(e, "ERROR al obtener los items de la tienda"),
            res.status(500).json({
                message: "Error al obtener los items de la tienda."
            });
    }
}));
router.post('/refreshStore', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, seedsGeneration_1.updateStoreWithNewSeeds)(); // Llama al controlador para actualizar la tienda
        res.status(200).json({ message: 'Store refreshed successfully!' });
    }
    catch (error) {
        console.error('Error refreshing store:', error);
        res.status(500).json({ error: 'An error occurred while refreshing the store.' });
    }
}));
router.post('/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, itemId, quantity, itemType } = req.body;
    try {
        // Buscar el ítem en la tienda
        const storeItem = yield prisma.storeItem.findUnique({
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
        let user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { inventory: { include: { seeds: true, waters: true } } }
        });
        // Comprobar si el usuario existe
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Crear el inventario si no existe
        if (!user.inventory) {
            user = yield prisma.user.update({
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
        yield prisma.storeItem.update({
            where: { id: itemId },
            data: {
                stock: { decrement: quantity }
            }
        });
        // Descontar los tokens del usuario por la cantidad de ítems comprados
        yield prisma.user.update({
            where: { id: userId },
            data: {
                balanceToken: { decrement: totalPrice }
            }
        });
        // Verificar si el ítem es una semilla o agua
        if (itemType === 'seed') {
            // Verificar si la semilla ya está en el inventario del usuario
            const existingSeed = yield prisma.seed.findFirst({
                where: {
                    inventoryId: user.inventory.id, // Non-null assertion here
                    name: storeItem.name
                }
            });
            if (existingSeed) {
                // Si la semilla ya existe, incrementar la cantidad
                yield prisma.seed.update({
                    where: { id: existingSeed.id },
                    data: {
                        quantity: { increment: quantity }
                    }
                });
            }
            else {
                // Si no existe, crear una nueva semilla en el inventario
                yield prisma.seed.create({
                    data: {
                        name: storeItem.name,
                        description: storeItem.description,
                        quantity: quantity,
                        rarity: storeItem.rarity,
                        status: "NONE",
                        inventoryId: user.inventory.id // Non-null assertion here
                    }
                });
            }
        }
        else if (itemType === 'water') {
            // Verificar si el ítem de agua ya está en el inventario del usuario
            const existingWater = yield prisma.water.findFirst({
                where: {
                    inventoryId: user.inventory.id, // Non-null assertion here
                    name: storeItem.name
                }
            });
            if (existingWater) {
                // Si el ítem de agua ya existe, incrementar la cantidad
                yield prisma.water.update({
                    where: { id: existingWater.id },
                    data: {
                        quantity: { increment: quantity }
                    }
                });
            }
            else {
                // Si no existe, crear un nuevo ítem de agua en el inventario
                yield prisma.water.create({
                    data: {
                        name: storeItem.name,
                        description: storeItem.description,
                        quantity: quantity,
                        inventoryId: user.inventory.id // Non-null assertion here
                    }
                });
            }
        }
        else {
            return res.status(400).json({ message: 'Tipo de ítem no válido' });
        }
        res.status(200).json({ message: 'Compra realizada con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al realizar la compra.' });
    }
}));
exports.default = router;
