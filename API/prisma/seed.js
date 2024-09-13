const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Verificar si hay ítems en la tienda antes de agregar
  const itemCount = await prisma.storeItem.count();
  if (itemCount === 0) {
    // Insertar ítems predeterminados
    await prisma.storeItem.createMany({
      data: [
        {
          name: 'Semilla de Tomate',
          description: 'Semilla para cultivar tomates.',
          price: 10,
          itemType: 'SEED',
          stock: 10,
        },
        {
          name: 'Semilla de Zanahoria',
          description: 'Semilla para cultivar zanahorias.',
          price: 8,
          itemType: 'SEED',
          stock: 10,
        },
        {
          name: 'Botella de Agua',
          description: 'Botella de agua para regar las plantas.',
          price: 5,
          itemType: 'WATER',
          stock: 10,
        },
        // Agrega más ítems aquí si lo deseas
      ],
    });

    console.log('Ítems predeterminados agregados a la tienda.');
  } else {
    console.log('La tienda ya tiene ítems. No se agregaron ítems predeterminados.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });