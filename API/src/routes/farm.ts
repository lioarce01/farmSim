
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

router.post('/plant-seed', async (req, res) => {
    const { farmId, slotId, seedId, sub } = req.body;

    // Validación de entradas
    if (!farmId || !slotId || !seedId || !sub) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Verificar que el slot y la semilla existen
        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
        });

        const seed = await prisma.seed.findUnique({
            where: { id: seedId },
        });

        if (!slot) {
            return res.status(404).json({ message: 'Slot no encontrado' });
        }

        if (!seed) {
            return res.status(404).json({ message: 'Semilla no encontrada' });
        }

        // Actualizar el slot con la semilla y sus caracteristicas
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

        // Eliminar la semilla del inventario del usuario usando su sub
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
            const seedInInventory = userInventory.inventory.seeds.find(seed => seed.id === seedId);

            if (seedInInventory) {
                await prisma.seed.delete({
                    where: { id: seedId },
                });
            } else {
                return res.status(404).json({ message: 'La semilla no está en el inventario del usuario.' });
            }
        } else {
            return res.status(404).json({ message: 'Inventario no encontrado.' });
        }

        res.status(200).json({ message: 'Semilla plantada exitosamente', updatedSlot });
    } catch (error) {
        const e = error as Error;
        console.error("Error al plantar la semilla:", e.message);
        return res.status(500).json({ message: 'Error al plantar la semilla', error: e.message });
    }
});


router.put('/water-plant', async (req, res) => {
    //logica para regar una seed de un slot de la granja

})

router.post('/harvest-plant', async (req, res) => {
    //logica para cosechar una seed de un slot de la granja
})



export default router