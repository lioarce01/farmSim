import express from 'express';
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                inventory: {
                    include: {
                        seeds: false,
                        waters: true,
                    }
                }
            }
        })

        const countingInventory = await Promise.all(users.map(async (user) => {
            const seedCount = await prisma.seed.count({
              where: {
                inventoryId: user.inventory?.id, // Contar las semillas de este inventario
              },
            });

            const waterCount = await prisma.water.count({
                where: {
                    inventoryId: user.inventory?.id,
                }
            })
            
            // Añadir el conteo de semillas al inventario
            return {
              ...user,
              inventory: {
                ...user.inventory,
                seedCount: seedCount, // Incluye el conteo de semillas
                waterCount: waterCount,
            },
            };
          }));

          res.json(countingInventory)

    } catch (e) {
        console.log(e)
        res.status(500).send({error: "Error al obtener usuarios"})
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params

    try {

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                }
            }
        })

        user ? res.status(200).send(user) : res.status(404).send("ERROR: User not found.")

    } catch (e) {
        console.error ("Error", e)
        res.status(500).json ({ message: "Error"})
    }
})

router.post('/', async (req, res) => {
    const { username } = req.body;

    try {
        const newUser = await prisma.user.create({
            data: {
                username: username,
                inventory: {
                    create: {
                        seeds: {},
                        waters: {},
                    }
                }
            },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                }
            }
        })

        res.status(201).json(newUser)

    } catch (e) {
        console.error ("Error al crear usuario:", e)
        res.status(500).json({ message: "Error al crear usuario"})
    }
})

//update tokens del usuario por body

router.post('/addTokens', async (req, res) => {
    const { userId, tokensToAdd } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                balanceToken: { increment: tokensToAdd }
            }
        })

        return res.status(200).json({ message: 'Tokens agregados con exito', newBalance: user.balanceToken + tokensToAdd })

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error al agregar tokens al usuario"})
    }
})

router.delete('/:id', async (req,res) => {
    const { id } = req.params;

    try {

        const deletedUser = await prisma.user.delete({
            where: {id}
        })

        deletedUser ? res.status(200).send("User deleted successfully") 
        : res.status(404).send("ID Could not be found")

    } catch (e) {
        res.status(400).send('ERROR: unexpected error')
        console.log(e)
    }
})


export default router;