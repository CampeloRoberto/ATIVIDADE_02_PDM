import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "income",    displayName: "Renda",       icon: "work",       background: "#DE9AC3", isIncome: true,  isDefault: true },
  { name: "food",      displayName: "Alimentação", icon: "fastfood",   background: "#DEA17B", isIncome: false, isDefault: true },
  { name: "house",     displayName: "Casa",        icon: "home",       background: "#E6E088", isIncome: false, isDefault: true },
  { name: "education", displayName: "Educação",    icon: "school",     background: "#AB8FBE", isIncome: false, isDefault: true },
  { name: "travel",    displayName: "Viagens",     icon: "flight",     background: "#82C9DE", isIncome: false, isDefault: true },
];

async function main() {
  for (const c of defaultCategories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  const adminEmail = "admin@gmail.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash("password", 10),
      },
    });
    console.log("Usuário admin criado.");
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
