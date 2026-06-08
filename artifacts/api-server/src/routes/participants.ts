import { Router } from "express";
import { and, ilike, or, sql, eq } from "drizzle-orm";
import { db, participantsTable } from "@workspace/db";
import {
  ListParticipantsQueryParams,
  CreateParticipantBody,
  GetParticipantParams,
  UpdateParticipantBody,
  UpdateParticipantParams,
  DeleteParticipantParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function toDateStr(d: Date | string): string {
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return String(d);
}

function computeStatus(endDate: string): "active" | "expired" {
  const today = new Date().toISOString().split("T")[0];
  return endDate < today ? "expired" : "active";
}

function formatParticipant(p: typeof participantsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    gradeLevel: p.gradeLevel,
    guardianName: p.guardianName,
    guardianPhone: p.guardianPhone,
    guardianPhoneAlt: p.guardianPhoneAlt ?? null,
    nationalId: p.nationalId,
    registrationDate: p.registrationDate,
    endDate: p.endDate,
    amountPaid: Number(p.amountPaid),
    amountRemaining: Number(p.amountRemaining),
    registrationDuration: p.registrationDuration,
    notes: p.notes ?? null,
    status: computeStatus(p.endDate),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/participants", requireAuth, async (req, res) => {
  const parsed = ListParticipantsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "معاملات غير صالحة" });
    return;
  }

  const { search, status } = parsed.data;
  const today = new Date().toISOString().split("T")[0];

  const conditions: ReturnType<typeof and>[] = [];

  if (search) {
    conditions.push(
      or(
        ilike(participantsTable.name, `%${search}%`),
        ilike(participantsTable.nationalId, `%${search}%`),
        ilike(participantsTable.guardianPhone, `%${search}%`)
      )!
    );
  }

  if (status === "active") {
    conditions.push(sql`${participantsTable.endDate} >= ${today}`);
  } else if (status === "expired") {
    conditions.push(sql`${participantsTable.endDate} < ${today}`);
  }

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(participantsTable)
          .where(and(...conditions))
          .orderBy(participantsTable.createdAt)
      : await db
          .select()
          .from(participantsTable)
          .orderBy(participantsTable.createdAt);

  res.json(rows.map(formatParticipant));
});

router.post("/participants", requireAuth, async (req, res) => {
  const parsed = CreateParticipantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const d = parsed.data;
  const [created] = await db
    .insert(participantsTable)
    .values({
      name: d.name,
      age: d.age,
      gradeLevel: d.gradeLevel,
      guardianName: d.guardianName,
      guardianPhone: d.guardianPhone,
      guardianPhoneAlt: d.guardianPhoneAlt ?? null,
      nationalId: d.nationalId,
      registrationDate: toDateStr(d.registrationDate as unknown as Date | string),
      endDate: toDateStr(d.endDate as unknown as Date | string),
      amountPaid: String(d.amountPaid),
      amountRemaining: String(d.amountRemaining),
      registrationDuration: d.registrationDuration,
      notes: d.notes ?? null,
    })
    .returning();

  res.status(201).json(formatParticipant(created));
});

router.get("/participants/:id", requireAuth, async (req, res) => {
  const parsed = GetParticipantParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "معرّف غير صالح" });
    return;
  }

  const [row] = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "المشترك غير موجود" });
    return;
  }

  res.json(formatParticipant(row));
});

router.patch("/participants/:id", requireAuth, async (req, res) => {
  const paramsParsed = UpdateParticipantParams.safeParse({
    id: Number(req.params.id),
  });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "معرّف غير صالح" });
    return;
  }

  const bodyParsed = UpdateParticipantBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "بيانات غير صالحة" });
    return;
  }

  const d = bodyParsed.data;
  const updateData: Record<string, unknown> = {};

  if (d.name !== undefined) updateData["name"] = d.name;
  if (d.age !== undefined) updateData["age"] = d.age;
  if (d.gradeLevel !== undefined) updateData["gradeLevel"] = d.gradeLevel;
  if (d.guardianName !== undefined) updateData["guardianName"] = d.guardianName;
  if (d.guardianPhone !== undefined) updateData["guardianPhone"] = d.guardianPhone;
  if (d.guardianPhoneAlt !== undefined) updateData["guardianPhoneAlt"] = d.guardianPhoneAlt;
  if (d.nationalId !== undefined) updateData["nationalId"] = d.nationalId;
  if (d.registrationDate !== undefined) updateData["registrationDate"] = toDateStr(d.registrationDate as unknown as Date | string);
  if (d.endDate !== undefined) updateData["endDate"] = toDateStr(d.endDate as unknown as Date | string);
  if (d.amountPaid !== undefined) updateData["amountPaid"] = String(d.amountPaid);
  if (d.amountRemaining !== undefined) updateData["amountRemaining"] = String(d.amountRemaining);
  if (d.registrationDuration !== undefined) updateData["registrationDuration"] = d.registrationDuration;
  if (d.notes !== undefined) updateData["notes"] = d.notes;

  const [updated] = await db
    .update(participantsTable)
    .set(updateData as Parameters<typeof db.update>[0] extends infer T ? never : never)
    .where(eq(participantsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "المشترك غير موجود" });
    return;
  }

  res.json(formatParticipant(updated));
});

router.delete("/participants/:id", requireAuth, async (req, res) => {
  const parsed = DeleteParticipantParams.safeParse({
    id: Number(req.params.id),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "معرّف غير صالح" });
    return;
  }

  const [deleted] = await db
    .delete(participantsTable)
    .where(eq(participantsTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "المشترك غير موجود" });
    return;
  }

  res.json({ message: "تم حذف المشترك بنجاح" });
});

export default router;
