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
    try {
        const storeItems = yield prisma.storeItem.findMany();
        res.status(200).json(storeItems);
    }
    catch (e) {
        console.log(e, 'ERROR al obtener los items de la tienda'),
            res.status(500).json({
                message: 'Error al obtener los items de la tienda.',
            });
    }
}));
// function formatTimeRemaining(ms: number): string {
//   const totalSeconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   return `${minutes} minutos y ${seconds} segundos`;
// }
// router.get('/refreshStore', (req, res) => {
//   const currentTime = Date.now();
//   if (lastUpdateTime) {
//     const timeSinceLastUpdate = currentTime - lastUpdateTime;
//     const timeRemaining = updateInterval - timeSinceLastUpdate;
//     if (timeRemaining > 0) {
//       res.status(200).json({
//         message: 'Tiempo hasta la próxima actualización',
//         timeRemaining: formatTimeRemaining(timeRemaining),
//         timeRemainingInMs: timeRemaining,
//         canUpdate: false,
//       });
//     } else {
//       res.status(200).json({
//         message: 'La tienda puede ser actualizada ahora.',
//         timeRemaining: '0 minutos y 0 segundos',
//         timeRemainingInMs: 0,
//         canUpdate: true,
//       });
//     }
//   } else {
//     res.status(200).json({
//       message: 'La tienda puede ser actualizada ahora.',
//       timeRemaining: '0 minutos y 0 segundos',
//       timeRemainingInMs: 0,
//       canUpdate: true,
//     });
//   }
// });
router.post('/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userSub, itemId, quantity, itemType } = req.body;
    try {
        const storeItem = yield prisma.storeItem.findUnique({
            where: { id: itemId },
        });
        if (!storeItem) {
            return res
                .status(404)
                .json({ message: 'El ítem no existe en la tienda' });
        }
        if (storeItem.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuficiente' });
        }
        let user = yield prisma.user.findUnique({
            where: { sub: userSub },
            include: { inventory: { include: { seeds: true, waters: true } } },
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (!user.inventory) {
            user = yield prisma.user.update({
                where: { sub: userSub },
                data: {
                    inventory: {
                        create: {},
                    },
                },
                include: { inventory: { include: { seeds: true, waters: true } } },
            });
        }
        const totalPrice = storeItem.price * quantity;
        if (user.balanceToken < totalPrice) {
            return res.status(400).json({ message: 'Saldo insuficiente de tokens' });
        }
        yield prisma.storeItem.update({
            where: { id: itemId },
            data: {
                stock: { decrement: quantity },
            },
        });
        yield prisma.user.update({
            where: { sub: userSub },
            data: {
                balanceToken: { decrement: totalPrice },
            },
        });
        if (itemType === 'seed') {
            const existingSeed = yield prisma.seed.findFirst({
                where: {
                    inventoryId: user.inventory.id,
                    name: storeItem.name,
                },
            });
            if (existingSeed) {
                yield prisma.seed.update({
                    where: { id: existingSeed.id },
                    data: {
                        quantity: { increment: quantity },
                    },
                });
            }
            else {
                yield prisma.seed.create({
                    data: {
                        name: storeItem.name,
                        description: storeItem.description,
                        quantity: quantity,
                        rarity: storeItem.rarity,
                        inventoryId: user.inventory.id,
                        tokensGenerated: storeItem.tokensGenerated,
                        img: storeItem.img,
                    },
                });
            }
        }
        else if (itemType === 'water') {
            const existingWater = yield prisma.water.findFirst({
                where: {
                    inventoryId: user.inventory.id,
                    name: storeItem.name,
                },
            });
            if (existingWater) {
                yield prisma.water.update({
                    where: { id: existingWater.id },
                    data: {
                        quantity: { increment: quantity },
                    },
                });
            }
            else {
                yield prisma.water.create({
                    data: {
                        name: storeItem.name,
                        description: storeItem.description,
                        quantity: quantity,
                        inventoryId: user.inventory.id,
                    },
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
