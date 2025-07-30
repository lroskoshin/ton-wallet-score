import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ton = await prisma.coin.create({
    data: {
      name: 'TON',
      decimals: 9,
    },
  });
  console.log({ ton });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
