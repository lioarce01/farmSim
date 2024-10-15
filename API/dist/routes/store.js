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
router.get('/item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = req.params.id;
    try {
        const item = yield prisma.storeItem.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    }
    catch (e) {
        res.status(500).json({ message: 'Error retrieving item', error: e });
    }
}));
router.post('/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userSub, itemId, quantity, itemType } = req.body;
    if (!['seed', 'water'].includes(itemType)) {
        return res.status(400).json({ message: 'Tipo de ítem no válido' });
    }
    try {
        const result = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const storeItem = yield prisma.storeItem.findUnique({
                where: { id: itemId },
            });
            if (!storeItem) {
                throw new Error('El ítem no existe en la tienda');
            }
            if (storeItem.stock < quantity) {
                throw new Error('Stock insuficiente');
            }
            let user = yield prisma.user.findUnique({
                where: { sub: userSub },
                include: { inventory: true },
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            if (!user.inventory) {
                user = yield prisma.user.update({
                    where: { sub: userSub },
                    data: {
                        inventory: {
                            create: {},
                        },
                    },
                    include: { inventory: true },
                });
            }
            const totalPrice = storeItem.price * quantity;
            if (user.balanceToken < totalPrice) {
                throw new Error('Saldo insuficiente de tokens');
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
                const inventoryId = (_a = user.inventory) === null || _a === void 0 ? void 0 : _a.id;
                if (!inventoryId) {
                    throw new Error('ID de inventario no encontrado');
                }
                yield prisma.seed.create({
                    data: {
                        name: storeItem.name,
                        description: storeItem.description,
                        rarity: storeItem.rarity,
                        inventoryId,
                        tokensGenerated: (_b = storeItem.tokensGenerated) !== null && _b !== void 0 ? _b : 0,
                        img: (_c = storeItem.img) !== null && _c !== void 0 ? _c : '',
                    },
                });
            }
            else if (itemType === 'water') {
                const existingWater = yield prisma.water.findFirst({
                    where: {
                        inventoryId: (_d = user.inventory) === null || _d === void 0 ? void 0 : _d.id,
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
                    const inventoryId = (_e = user.inventory) === null || _e === void 0 ? void 0 : _e.id;
                    if (!inventoryId) {
                        throw new Error('ID de inventario no encontrado');
                    }
                    yield prisma.water.create({
                        data: {
                            name: storeItem.name,
                            description: storeItem.description,
                            quantity,
                            inventoryId,
                        },
                    });
                }
                return {
                    message: 'Compra realizada con éxito',
                    item: storeItem,
                    quantity,
                };
            }
            return {
                message: 'Compra realizada con éxito',
                item: storeItem,
                quantity,
            };
        }));
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Error al realizar la compra.',
        });
    }
}));
exports.default = router;
