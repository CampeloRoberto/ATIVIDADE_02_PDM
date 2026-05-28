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
  // Categorias padrão
  for (const c of defaultCategories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  // Buscar IDs das categorias padrão
  const [income, food, house, education, travel] = await Promise.all([
    prisma.category.findUnique({ where: { name: "income" } }),
    prisma.category.findUnique({ where: { name: "food" } }),
    prisma.category.findUnique({ where: { name: "house" } }),
    prisma.category.findUnique({ where: { name: "education" } }),
    prisma.category.findUnique({ where: { name: "travel" } }),
  ]);

  // Usuário admin
  const adminEmail = "admin@gmail.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash("password", 10),
      },
    });
    console.log("Usuário admin criado.");
  }

  // ─── Usuário de teste ───────────────────────────────────────────────────────
  const testEmail = "test@gmail.com";
  const existingTest = await prisma.user.findUnique({ where: { email: testEmail } });

  if (!existingTest) {
    const testUser = await prisma.user.create({
      data: {
        name: "Usuário Teste",
        email: testEmail,
        password: await bcrypt.hash("teste", 10),
      },
    });

    const uid = testUser.id;

    /*
     * Transações distribuídas ao longo de 2026:
     *
     *  Jan → POSITIVO  (+1 650,00)
     *  Fev → POSITIVO  (+2 100,00)
     *  Mar → NEGATIVO  (-1 600,00)
     *  Abr → POSITIVO  (+1 550,00)
     *  Mai → NEGATIVO  (- 500,00)
     */
    const txs = [
      // ── Janeiro 2026 (POSITIVO) ─────────────────────────────────────
      { description: "Salário Janeiro",          value: 3000, date: new Date("2026-01-05"), categoryId: income.id },
      { description: "Mercado",                  value:  600, date: new Date("2026-01-10"), categoryId: food.id },
      { description: "Aluguel",                  value:  750, date: new Date("2026-01-15"), categoryId: house.id },

      // ── Fevereiro 2026 (POSITIVO) ────────────────────────────────────
      { description: "Salário Fevereiro",        value: 3200, date: new Date("2026-02-05"), categoryId: income.id },
      { description: "Restaurante",              value:  700, date: new Date("2026-02-12"), categoryId: food.id },
      { description: "Curso online",             value:  400, date: new Date("2026-02-20"), categoryId: education.id },

      // ── Março 2026 (NEGATIVO) ────────────────────────────────────────
      { description: "Salário Março",            value: 1500, date: new Date("2026-03-05"), categoryId: income.id },
      { description: "Supermercado",             value: 1200, date: new Date("2026-03-08"), categoryId: food.id },
      { description: "Aluguel + condomínio",     value: 1000, date: new Date("2026-03-15"), categoryId: house.id },
      { description: "Passagem viagem",          value:  900, date: new Date("2026-03-22"), categoryId: travel.id },

      // ── Abril 2026 (POSITIVO) ────────────────────────────────────────
      { description: "Salário Abril",            value: 3000, date: new Date("2026-04-05"), categoryId: income.id },
      { description: "Ifood",                    value:  650, date: new Date("2026-04-14"), categoryId: food.id },
      { description: "Aluguel",                  value:  800, date: new Date("2026-04-15"), categoryId: house.id },

      // ── Maio 2026 (NEGATIVO) ─────────────────────────────────────────
      { description: "Salário Maio",             value: 2000, date: new Date("2026-05-05"), categoryId: income.id },
      { description: "Mercado semanal",          value:  900, date: new Date("2026-05-07"), categoryId: food.id },
      { description: "Aluguel",                  value:  800, date: new Date("2026-05-15"), categoryId: house.id },
      { description: "Faculdade",                value:  600, date: new Date("2026-05-18"), categoryId: education.id },
      { description: "Hotel viagem",             value:  200, date: new Date("2026-05-19"), categoryId: travel.id },
    ];

    for (const tx of txs) {
      await prisma.transaction.create({ data: { ...tx, userId: uid } });
    }

    console.log("Usuário teste criado com transações de Jan–Mai 2026.");
  } else {
    console.log("Usuário teste já existe, seed ignorado.");
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
