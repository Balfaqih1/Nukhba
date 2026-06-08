import { Router } from "express";
import { db, participantsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const [row] = await db
    .select({
      totalParticipants: sql<number>`count(*)::int`,
      totalAmountPaid: sql<number>`coalesce(sum(${participantsTable.amountPaid}::numeric), 0)`,
      totalAmountRemaining: sql<number>`coalesce(sum(${participantsTable.amountRemaining}::numeric), 0)`,
      activeCount: sql<number>`count(*) filter (where ${participantsTable.endDate} >= ${today})::int`,
      expiredCount: sql<number>`count(*) filter (where ${participantsTable.endDate} < ${today})::int`,
    })
    .from(participantsTable);

  res.json({
    totalParticipants: Number(row.totalParticipants),
    totalAmountPaid: Number(row.totalAmountPaid),
    totalAmountRemaining: Number(row.totalAmountRemaining),
    activeCount: Number(row.activeCount),
    expiredCount: Number(row.expiredCount),
  });
});

export default router;
