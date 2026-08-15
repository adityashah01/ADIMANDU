const prisma = require("./src/lib/prisma");

async function main() {
  const updatedUser = await prisma.user.update({
      where: { email: "sandesh@gmail.com" },
      data: { role: "ADMIN" }
  });
  console.log("Updated user:", updatedUser);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
