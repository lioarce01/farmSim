import express from 'express';
import { PrismaClient } from "@prisma/client";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                },
                farm: {  // Incluir la granja
                    include: {
                        slots: true, // Incluir los slots de la granja
                    }
                }
            }
        });

        res.json(users); // Devolver directamente la lista de usuarios con sus datos relacionados

    } catch (e) {
        console.log(e);
        res.status(500).send({ message: "Error al obtener usuarios" });
    }
});



router.get('/:sub', async (req, res) => {
    const { sub } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { sub },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                },
                farm: {  // Incluir la granja aquí correctamente
                    include: {
                        slots: true,
                    }
                }
            }
        });

        user ? res.status(200).send(user) : res.status(404).send({ message: "User not found." });
    } catch (e) {
        console.error("Error", e);
        res.status(500).json({ message: "Error" });
    }
});


router.post('/register', async (req, res) => {
    const { nickname, email, sub } = req.body;
  
    // Validación de entradas
    if (!email || !nickname) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
  
    try {
      // Verificar si el usuario ya existe por sub o email
      const existingUser = await prisma.user.findUnique({
        where: { sub },
      });
  
      if (existingUser) {
        return res.status(409).json({ message: 'Usuario ya existe' });
      }
  
      // También verificar por email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUserByEmail) {
        return res.status(409).json({ message: 'Email ya está registrado' });
      }
  
      // Crear el usuario en la base de datos junto con su granja y slots
      const newUser = await prisma.user.create({
        data: {
          nickname,
          email,
          sub,
          role: 'USER',
          inventory: {
            create: {
              seeds: {},
              waters: {},
            },
          },
          farm: {
            create: {
              slots: {
                create: Array(8).fill(null).map(() => ({
                  // Inicializa cada slot, ajusta los campos si es necesario
                  seedId: null,
                  plantingTime: null,
                  growthStatus: 'NONE', // o el valor por defecto que quieras
                })),
              },
            },
          },
        },
      });
  
      res.status(201).json({ message: 'Usuario creado exitosamente', newUser });
    } catch (error) {
      const e = error as Error;
      console.error("Error al crear usuario:", e.message);
      return res.status(500).json({ message: 'Error al crear usuario', error: e.message });
    }
  });
  

//update tokens del usuario por body
router.post('/addTokens', async (req, res) => {
    const { userSub, tokensToAdd } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { sub: userSub }
        })

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        await prisma.user.update({
            where: { sub: userSub },
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

router.put('/convert', authMiddleware, async (req, res) => {
    const { sub } = req.body;

    try {
        const convertedUser = await prisma.user.findUnique({
            where: { sub },
        });

        if (convertedUser?.role === 'USER') {
            await prisma.user.update({
                where: { sub },
                data: {
                    role: 'ADMIN',
                },
            });
            return res.status(200).json({ message: 'User successfully converted to ADMIN' });
        } else {
            await prisma.user.update({
                where: { sub },
                data: {
                    role: 'USER',
                },
            });
            return res.status(200).json({ message: 'User successfully converted to USER' });
        }
    } catch (e) {
        res.status(400).json({ message: 'Error: User cannot be converted.' });
    }
});


router.delete('/:sub', async (req,res) => {
    const { sub } = req.params;

    try {

        const deletedUser = await prisma.user.delete({
            where: {sub}
        })

        deletedUser ? res.status(200).send({ message: "User deleted successfully"}) 
        : res.status(404).send({message: "ID Could not be found"})

    } catch (e) {
        res.status(400).send({message: 'ERROR: unexpected error'})
        console.log(e)
    }
})


export default router;