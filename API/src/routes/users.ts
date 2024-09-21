import express from 'express';
import { PrismaClient } from "@prisma/client";
import axios from 'axios';

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

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Llamada a la API de Auth0 para crear el usuario
        const response = await axios.post(`https://dev-i4w5z51mxsf01wcx.us.auth0.com/api/v2/users`, {
            email: email,
            password: password,
            connection: 'Username-Password-Authentication',
            username: username
        }, {
            headers: {
                Authorization: `Bearer ${process.env.AUTH0_API_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Obtener el ID del usuario creado en Auth0
        const auth0UserId = response.data.user_id;

        // Crear el usuario en la base de datos con Prisma
        const newUser = await prisma.user.create({
            data: {
                id: auth0UserId,  // Usa el ID de Auth0 como ID
                username: username,
                email: email,
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
        });

        res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });

    } catch (e) {
        console.error("Error al crear usuario:", e);
        res.status(500).json({ message: "Error al crear usuario" });
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