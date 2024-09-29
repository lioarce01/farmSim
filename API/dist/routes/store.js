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
const storeController_1 = require("../controllers/storeController");
const node_cron_1 = __importDefault(require("node-cron"));
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
let lastUpdateTime = null;
const updateInterval = 1 * 60 * 1000; // 1 minutos en milisegundos
// Configurar el cron job para que se ejecute cada 5 minutos
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, storeController_1.updateStoreWithNewSeeds)();
        lastUpdateTime = Date.now(); // Actualizar la hora de la última actualización
    }
    catch (error) {
        console.error("Error updating store:", error);
    }
}));
function formatTimeRemaining(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} minutos y ${seconds} segundos`;
}
router.get('/refreshStore', (req, res) => {
    const currentTime = Date.now();
    if (lastUpdateTime) {
        const timeSinceLastUpdate = currentTime - lastUpdateTime;
        const timeRemaining = updateInterval - timeSinceLastUpdate;
        if (timeRemaining > 0) {
            res.status(200).json({
                message: 'Tiempo hasta la próxima actualización',
                timeRemaining: formatTimeRemaining(timeRemaining),
                timeRemainingInMs: timeRemaining, // Incluye el tiempo en milisegundos
                canUpdate: false, // Indica que no se puede actualizar aún
            });
        }
        else {
            res.status(200).json({
                message: 'La tienda puede ser actualizada ahora.',
                timeRemaining: '0 minutos y 0 segundos',
                timeRemainingInMs: 0,
                canUpdate: true, // Indica que se puede actualizar
            });
        }
    }
    else {
        // Si no hay tiempo de actualización, devolver que puede actualizarse
        res.status(200).json({
            message: 'La tienda puede ser actualizada ahora.',
            timeRemaining: '0 minutos y 0 segundos',
            timeRemainingInMs: 0,
            canUpdate: true, // Indica que se puede actualizar
        });
    }
});
router.post('/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userSub, itemId, quantity, itemType } = req.body;
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
            where: { sub: userSub },
            include: { inventory: { include: { seeds: true, waters: true } } }
        });
        // Comprobar si el usuario existe
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Crear el inventario si no existe
        if (!user.inventory) {
            user = yield prisma.user.update({
                where: { sub: userSub },
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
            where: { sub: userSub },
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
                        inventoryId: user.inventory.id,
                        tokensGenerated: storeItem.tokensGenerated
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
