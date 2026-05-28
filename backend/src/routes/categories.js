import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/categorySchema.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { OR: [{ isDefault: true }, { userId: req.user.id }] },
      orderBy: { displayName: "asc" },
    });
    res.json(categories);
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: { ...data, userId: req.user.id },
    });
    res.status(201).json(category);
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(category);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { transactions: true } } },
    });
    if (!existing) return res.status(404).json({ error: "Categoria não encontrada" });
    if (existing.isDefault) {
      return res.status(400).json({ error: "Categorias padrão não podem ser excluídas" });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Sem permissão para excluir esta categoria" });
    }
    if (existing._count.transactions > 0) {
      return res.status(400).json({ error: `Esta categoria possui ${existing._count.transactions} transação(ões) vinculada(s) e não pode ser excluída` });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
