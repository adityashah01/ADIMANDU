const prisma = require("./src/lib/prisma");

async function main() {
  const apps = await prisma.providerApplication.findMany();
  console.log(JSON.stringify(apps, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
