
import express from 'express';
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();


router.get('/', async (req, res) => {
    //logica para traer todas las farm
    try {
        const farm = await prisma.farm.findMany({
            include: {
                slots: true,
            }
        })

        farm ? res.status(200).json(farm) : res.status(404).json({message: 'Error: farms not found'})

    } catch(e) {
        res.status(500).json({message: 'Error'})
    }
})

router.get('/:id', async (req, res) => {
    //logica para traer farm por id
    const { id } = req.params
    try {
        const farm = await prisma.farm.findUnique({
            where: {id},
            include: {
                slots: true,
            }
        })

        farm ? res.status(200).json(farm) : res.status(404).json({message: 'Error: farm not found'})
    } catch(e) {
        res.status(500).json({message: 'Error'})
    }
})


// Ruta para plantar semilla
router.post('/plant-seed', async (req, res) => {
    const { farmId, slotId, seedId, sub } = req.body;

    if (!farmId || !slotId || !seedId || !sub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        const seed = await prisma.seed.findUnique({ where: { id: seedId } });

        if (!slot || !seed) {
            return res.status(404).json({ message: 'Slot o semilla no encontrada' });
        }

        const currentTime = new Date();
        const updatedSlot = await prisma.slot.update({
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

        const userInventory = await prisma.user.findUnique({
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
                await prisma.seed.delete({ where: { id: seedId } });
            } else {
                return res.status(404).json({ message: 'Semilla no encontrada en el inventario' });
            }
        } else {
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
    } catch (error) {
        const e = error as Error
        console.error("Error al plantar la semilla:", error);
        res.status(500).json({ message: 'Error al plantar la semilla', error: e.message });
    }
});

router.put('/water-plant', async (req, res) => {
    const { farmId, slotId, waterId, userSub } = req.body;

    // Validación de entradas
    if (!farmId || !slotId || !waterId || !userSub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Verificar que el slot existe
        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
        });

        if (!slot) {
            return res.status(404).json({ message: 'Slot no encontrado' });
        }

        if (slot.growthStatus !== 'WATER_NEEDED') {
            return res.status(400).json({ message: 'La planta no necesita ser regada en este momento' });
        }

        const water = await prisma.water.findUnique({
            where: { id: waterId },
        });

        if (!water || water.quantity === null) {
            return res.status(404).json({ message: 'Agua no encontrada o cantidad no disponible' });
        }

        const user = await prisma.user.findUnique({
            where: { sub: userSub },
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const userInventory = await prisma.inventory.findUnique({
            where: { userId: user.id }, 
            include: { waters: true },
        });

        if (!userInventory || !userInventory.waters.some(w => w.id === waterId)) {
            return res.status(403).json({ message: 'Esta agua no pertenece a tu inventario' });
        }

        if (water.quantity < 1) {
            return res.status(400).json({ message: 'No tienes suficiente agua para regar' });
        }

        const updatedSlot = await prisma.slot.update({
            where: { id: slotId },
            data: {
                growthStatus: 'GROWING',
                wateredCount: slot.wateredCount + 1,
                lastWatered: new Date(),
            },
        });

        const updatedWater = await prisma.water.update({
            where: { id: waterId },
            data: {
                quantity: {
                    decrement: 1,
                },
            },
        });

        if (updatedWater.quantity === 0) {
            await prisma.water.delete({
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

    } catch (error) {
        const e = error as Error;
        console.error("Error al regar la planta:", e.message);
        res.status(500).json({ message: 'Error al regar la planta', error: e.message });
    }
});



router.post('/harvest-plant', async (req, res) => {
    //logica para cosechar una seed de un slot de la granja
})



export default router