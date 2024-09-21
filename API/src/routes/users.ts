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
    const { nickname, email } = req.body;
    console.log('data:', req.body)
  
    // Validación de entradas
    if (!email || !nickname) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Usuario ya existe' });
      }
  
      // Crear el usuario en la base de datos
      const newUser = await prisma.user.create({
        data: {
            nickname,
            email,
            inventory: {
                create: {
                seeds: {},
                waters: {},
                },
            },
        },
      });
  
      res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (error) {
        const e = error as Error
      console.error("Error al crear usuario:", e.message);
      return res.status(500).json({ message: 'error al crear usuario', error: e.message });
    }
  });

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