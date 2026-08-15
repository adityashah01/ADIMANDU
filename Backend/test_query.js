const prisma = require("./src/lib/prisma");

async function main() {
  const applications = await prisma.providerApplication.findMany({
      where: {
          status: "PENDING",
      },
      include: {
          user: {
              select: {
                  id: true,
                  name: true,
                  email: true,
              },
          },
          category: true,
      },
      orderBy: {
          createdAt: "desc",
      },
  });
  console.log(JSON.stringify(applications, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
