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
router.post('/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, itemId, quantity, itemType } = req.body;
    try {
        // Buscar el ítem en la tienda
        const storeItem = yield prisma.storeItem.findUnique({
            where: { id: itemId }
        });
        if (!storeItem || storeItem.stock < quantity) {
            return res.status(400).json({ message: 'El ítem no está disponible o no hay suficiente stock' });
        }
        // Buscar al usuario y su inventario
        const user = yield prisma.user.findUnique({
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
            const seedItem = yield prisma.seed.findFirst({
                where: { inventoryId, name: storeItem.name }
            });
            if (seedItem) {
                // Si ya existe, solo actualiza la cantidad
                yield prisma.seed.update({
                    where: { id: seedItem.id },
                    data: {
                        quantity: { increment: quantity }
                    }
                });
            }
            else {
                // Si no existe, crea una nueva semilla en el inventario
                yield prisma.seed.create({
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
        }
        else if (itemType === 'water') {
            // Verificar si el ítem de agua ya está en el inventario
            const waterItem = yield prisma.water.findFirst({
                where: { inventoryId, name: storeItem.name }
            });
            if (waterItem) {
                // Si ya existe, solo actualiza la cantidad
                yield prisma.water.update({
                    where: { id: waterItem.id },
                    data: {
                        quantity: { increment: quantity }
                    }
                });
            }
            else {
                // Si no existe, crea un nuevo ítem de agua en el inventario
                yield prisma.water.create({
                    data: {
                        name: storeItem.name,
                        description: "",
                        quantity: quantity,
                        inventoryId: inventoryId
                    }
                });
            }
        }
        else {
            return res.status(400).json({ message: 'Tipo de ítem no válido' });
        }
        // Actualizar el saldo del usuario y reducir el stock del ítem en la tienda
        yield prisma.user.update({
            where: { id: userId },
            data: {
                balanceToken: { decrement: storeItem.price * quantity }
            }
        });
        yield prisma.storeItem.update({
            where: { id: itemId },
            data: {
                stock: { decrement: quantity }
            }
        });
        res.status(200).json({ message: 'Compra realizada con éxito' });
    }
    catch (e) {
        console.error('Error:', e);
        res.status(500).json({ message: "Error al realizar la compra." });
    }
}));
exports.default = router;
//# sourceMappingURL=store.js.map