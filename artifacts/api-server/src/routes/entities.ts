import { Router } from "express";
import { db, entitiesTable } from "@workspace/db";
import { eq, and, desc, asc, sql, isNull, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// All entity routes require authentication
router.use(requireAuth);

/**
 * Models that are truly shared/public — any authenticated user may read them.
 * Only admin-level writes are safe here; regular users get read-only access.
 */
const PUBLIC_READ_MODELS = new Set([
  "HumanCompanion",
  "CompanionConfig",
]);

function buildJsonbFilters(query: Record<string, string>) {
  const conds: ReturnType<typeof sql>[] = [];
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith("filter_")) {
      const field = key.slice(7).replace(/[^a-zA-Z0-9_]/g, "");
      if (field) conds.push(sql`${entitiesTable.data}->>${sql.raw(`'${field}'`)} = ${value}`);
    }
  });
  return conds;
}

function getOrderExpr(sortStr: string | undefined) {
  if (!sortStr) return desc(entitiesTable.createdDate);
  const isDesc = sortStr.startsWith("-");
  const field = sortStr.replace(/^-/, "");
  if (field === "created_date") return isDesc ? desc(entitiesTable.createdDate) : asc(entitiesTable.createdDate);
  if (field === "updated_date") return isDesc ? desc(entitiesTable.updatedDate) : asc(entitiesTable.updatedDate);
  const safeField = field.replace(/[^a-zA-Z0-9_]/g, "");
  return isDesc
    ? sql`(${entitiesTable.data}->>${sql.raw(`'${safeField}'`)}) DESC NULLS LAST`
    : sql`(${entitiesTable.data}->>${sql.raw(`'${safeField}'`)}) ASC NULLS LAST`;
}

function entityToRecord(e: typeof entitiesTable.$inferSelect) {
  return { id: e.id, ...(e.data as object), created_date: e.createdDate, updated_date: e.updatedDate };
}

/** Ownership predicate: user's own records OR shared (null userId) records for public models */
function ownerCond(model: string, userId: string) {
  if (PUBLIC_READ_MODELS.has(model)) {
    return or(eq(entitiesTable.userId, userId), isNull(entitiesTable.userId));
  }
  return eq(entitiesTable.userId, userId);
}

// GET /api/entities/:model
router.get("/:model", async (req, res) => {
  const { model } = req.params;
  const userId = (req.session as any).userId as string;
  const { sort, limit = "200", ...rest } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit) || 200, 1000);
  const filterConds = buildJsonbFilters(rest);
  try {
    const rows = await db.select().from(entitiesTable).where(
      and(eq(entitiesTable.model, model), ownerCond(model, userId), ...filterConds)
    ).orderBy(getOrderExpr(sort)).limit(lim);
    return res.json(rows.map(entityToRecord));
  } catch (err) {
    req.log.error({ err }, "entities list error");
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/entities/:model/:id
router.get("/:model/:id", async (req, res) => {
  const { model, id } = req.params;
  const userId = (req.session as any).userId as string;
  try {
    const [row] = await db.select().from(entitiesTable).where(
      and(eq(entitiesTable.model, model), eq(entitiesTable.id, id), ownerCond(model, userId))
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(entityToRecord(row));
  } catch (err) {
    req.log.error({ err }, "entities get error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/entities/:model
router.post("/:model", async (req, res) => {
  const { model } = req.params;
  const userId = (req.session as any).userId as string;
  const data = req.body || {};
  try {
    const [row] = await db.insert(entitiesTable).values({ model, userId, data }).returning();
    return res.status(201).json(entityToRecord(row));
  } catch (err) {
    req.log.error({ err }, "entities create error");
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/entities/:model/:id
router.put("/:model/:id", async (req, res) => {
  const { model, id } = req.params;
  const userId = (req.session as any).userId as string;
  const updates = req.body || {};
  try {
    const [existing] = await db.select().from(entitiesTable).where(
      and(eq(entitiesTable.model, model), eq(entitiesTable.id, id), eq(entitiesTable.userId, userId))
    );
    if (!existing) return res.status(404).json({ error: "Not found" });
    const merged = { ...(existing.data as object), ...updates };
    const [row] = await db.update(entitiesTable)
      .set({ data: merged, updatedDate: new Date() })
      .where(and(eq(entitiesTable.model, model), eq(entitiesTable.id, id), eq(entitiesTable.userId, userId)))
      .returning();
    return res.json(entityToRecord(row));
  } catch (err) {
    req.log.error({ err }, "entities update error");
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/entities/:model/:id
router.delete("/:model/:id", async (req, res) => {
  const { model, id } = req.params;
  const userId = (req.session as any).userId as string;
  try {
    const result = await db.delete(entitiesTable).where(
      and(eq(entitiesTable.model, model), eq(entitiesTable.id, id), eq(entitiesTable.userId, userId))
    ).returning({ id: entitiesTable.id });
    if (result.length === 0) return res.status(404).json({ error: "Not found or not owned by you" });
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "entities delete error");
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/entities/:model/delete-many
router.post("/:model/delete-many", async (req, res) => {
  const { model } = req.params;
  const userId = (req.session as any).userId as string;
  const { filters = {} } = req.body || {};
  const filterConds = Object.entries(filters as Record<string, string>).map(([field, value]) => {
    const safeField = field.replace(/[^a-zA-Z0-9_]/g, "");
    return sql`${entitiesTable.data}->>${sql.raw(`'${safeField}'`)} = ${value}`;
  });
  try {
    await db.delete(entitiesTable).where(
      and(eq(entitiesTable.model, model), eq(entitiesTable.userId, userId), ...filterConds)
    );
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "entities delete-many error");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
