const prisma = require("./src/lib/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  const newPassword = "password123";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const updatedUser = await prisma.user.update({
      where: { email: "sandesh@gmail.com" },
      data: { passwordHash }
  });
  console.log("Password reset successfully for:", updatedUser.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
