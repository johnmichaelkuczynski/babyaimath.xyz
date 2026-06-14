import { sql } from "drizzle-orm";
import {
  db,
  diagnosticAssessmentsTable,
  diagnosticItemsTable,
} from "@workspace/db";
import { logger } from "./logger";
import { DIAGNOSTIC_SEED } from "./diagnosticContent";

// Rotate an options array by a random offset so the (originally-first) correct
// option lands at a random index, returning the new array plus the new correct
// index. This keeps authoring simple (write the correct option first) while
// avoiding both an "always A" pattern and any deterministic coupling between an
// item's public `position` and its hidden correct index.
function rotateOptions(options: string[]): {
  options: string[];
  correctIndex: number;
} {
  const n = options.length;
  const off = Math.floor(Math.random() * n);
  const rotated = new Array<string>(n);
  for (let k = 0; k < n; k++) {
    rotated[(k + off) % n] = options[k]!;
  }
  return { options: rotated, correctIndex: off };
}

// Signature of the seed structure currently expected. Used to detect whether an
// already-populated database holds the CURRENT structure or an older one.
function expectedSignature(): string {
  return DIAGNOSTIC_SEED.map(
    (a) => `${a.instrument}:${a.phase}:${a.format}:${a.title}`,
  )
    .sort()
    .join("|");
}

async function actualSignature(): Promise<string> {
  const rows = await db
    .select({
      instrument: diagnosticAssessmentsTable.instrument,
      phase: diagnosticAssessmentsTable.phase,
      format: diagnosticAssessmentsTable.format,
      title: diagnosticAssessmentsTable.title,
    })
    .from(diagnosticAssessmentsTable);
  return rows
    .map((r) => `${r.instrument}:${r.phase}:${r.format}:${r.title}`)
    .sort()
    .join("|");
}

async function insertSeed(): Promise<void> {
  let itemTotal = 0;
  for (let i = 0; i < DIAGNOSTIC_SEED.length; i++) {
    const a = DIAGNOSTIC_SEED[i]!;
    const [inserted] = await db
      .insert(diagnosticAssessmentsTable)
      .values({
        instrument: a.instrument,
        phase: a.phase,
        format: a.format,
        title: a.title,
        subtitle: a.subtitle,
        instructions: a.instructions,
        position: i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert assessment ${a.title}`);

    let pos = 0;
    for (const item of a.items) {
      const { options, correctIndex } = rotateOptions(item.options);
      await db.insert(diagnosticItemsTable).values({
        assessmentId: inserted.id,
        position: pos,
        // Every diagnostic item is option-based with one keyed-correct answer;
        // the assessment's `format` decides how it is presented and answered.
        type: "mcq",
        prompt: item.prompt,
        payload: { options },
        scoring: {
          correctIndex,
          modelAnswer: item.modelAnswer,
          ...(item.skillArea ? { skillArea: item.skillArea } : {}),
        },
      });
      pos += 1;
      itemTotal += 1;
    }
  }
  logger.info(
    { assessments: DIAGNOSTIC_SEED.length, items: itemTotal },
    "Diagnostic seed complete",
  );
}

// Seed (or re-seed) the diagnostic assessments. Self-healing: if the database
// already holds assessments whose structure does not match the current seed
// (e.g. an older single-format layout, or a content change), all diagnostic
// data is replaced in a transaction so existing and production databases pick
// up the new structure rather than stranding stale content. A pure "seed if
// empty" check would never update an already-populated database.
export async function seedDiagnosticsIfEmpty(): Promise<void> {
  const existing = await db.execute(
    sql`select count(*)::int as n from diagnostic_assessments`,
  );
  const row = (existing.rows[0] ?? {}) as { n?: number };

  if ((row.n ?? 0) > 0) {
    const want = expectedSignature();
    const have = await actualSignature();
    if (want === have) {
      logger.info("Diagnostic seed: current structure present, skipping");
      return;
    }
    logger.info(
      "Diagnostic seed: structure changed, replacing diagnostic data",
    );
    await db.transaction(async (tx) => {
      // Cascades to items, attempts, and responses.
      await tx.delete(diagnosticAssessmentsTable);
    });
  } else {
    logger.info("Diagnostic seed: populating reasoning assessments");
  }

  await insertSeed();
}
