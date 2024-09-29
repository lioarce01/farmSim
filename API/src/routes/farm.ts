
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

router.post('/plantSeed', async (req, res) => {
    //logica para plantar una semilla
})

router.put('/waterSlot', async (req, res) => {
    //logica para regar un slot
})

router.post('/harvestSlot', async (req, res) => {
    //logica para cosechar un slot
})
  


export default router