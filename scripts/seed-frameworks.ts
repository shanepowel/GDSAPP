/**
 * Seed assurance frameworks, pack items, and reviewed crosswalk mappings.
 * Idempotent: upserts by code / unique keys.
 *
 * Usage: npm run seed:frameworks
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedFile = {
  frameworks: Array<{
    code: string;
    name: string;
    publisher: string;
    version: string | null;
    licence: string | null;
    attribution: string | null;
    items: Array<{
      ref: string;
      title: string;
      question: string | null;
      parentRef: string | null;
      packRef: string | null;
      sortOrder: number;
    }>;
  }>;
  mappings: Array<{
    standardCode: string;
    criterionRef: string;
    frameworkCode: string;
    itemRef: string;
    relation: "satisfies" | "partially" | "informs";
    note: string;
  }>;
  authoredBy: string;
  reviewedBy: string;
  reviewedAt: string;
};

async function main() {
  const path = join(process.cwd(), "data/frameworks/seed/frameworks.json");
  const data = JSON.parse(readFileSync(path, "utf8")) as SeedFile;

  const standards = await prisma.catalogStandard.findMany({
    include: {
      versions: {
        where: { status: "current" },
        include: { criteria: { select: { id: true, ref: true } } },
      },
    },
  });

  const criterionByKey = new Map<string, string>();
  for (const s of standards) {
    for (const v of s.versions) {
      for (const c of v.criteria) {
        criterionByKey.set(`${s.code}::${c.ref}`, c.id);
      }
    }
  }

  if (criterionByKey.size === 0) {
    throw new Error("No criteria found. Run npm run seed:catalog first.");
  }

  let frameworks = 0;
  let items = 0;
  let mappings = 0;
  let skippedMappings = 0;

  for (const fw of data.frameworks) {
    const row = await prisma.assuranceFramework.upsert({
      where: { code: fw.code },
      create: {
        code: fw.code,
        name: fw.name,
        publisher: fw.publisher,
        version: fw.version,
        licence: fw.licence,
        attribution: fw.attribution,
      },
      update: {
        name: fw.name,
        publisher: fw.publisher,
        version: fw.version,
        licence: fw.licence,
        attribution: fw.attribution,
      },
    });
    frameworks += 1;

    for (const item of fw.items) {
      await prisma.assuranceFrameworkItem.upsert({
        where: {
          frameworkId_ref: { frameworkId: row.id, ref: item.ref },
        },
        create: {
          frameworkId: row.id,
          ref: item.ref,
          title: item.title,
          question: item.question,
          parentRef: item.parentRef,
          packRef: item.packRef,
          sortOrder: item.sortOrder,
        },
        update: {
          title: item.title,
          question: item.question,
          parentRef: item.parentRef,
          packRef: item.packRef,
          sortOrder: item.sortOrder,
        },
      });
      items += 1;
    }
  }

  const allItems = await prisma.assuranceFrameworkItem.findMany({
    include: { framework: { select: { code: true } } },
  });
  const itemKey = (fwCode: string, itemRef: string) => `${fwCode}::${itemRef}`;
  const itemByKey = new Map(
    allItems.map((i) => [itemKey(i.framework.code, i.ref), i.id]),
  );

  const reviewedAt = new Date(data.reviewedAt);
  if (data.authoredBy === data.reviewedBy) {
    throw new Error("Crosswalk mappings require a distinct author and reviewer.");
  }

  for (const m of data.mappings) {
    const criterionId = criterionByKey.get(`${m.standardCode}::${m.criterionRef}`);
    const frameworkItemId = itemByKey.get(itemKey(m.frameworkCode, m.itemRef));
    if (!criterionId || !frameworkItemId) {
      skippedMappings += 1;
      continue;
    }

    await prisma.crosswalkMapping.upsert({
      where: {
        criterionId_frameworkItemId: { criterionId, frameworkItemId },
      },
      create: {
        frameworkItemId,
        criterionId,
        relation: m.relation,
        note: m.note,
        authoredBy: data.authoredBy,
        reviewedBy: data.reviewedBy,
        reviewedAt,
      },
      update: {
        relation: m.relation,
        note: m.note,
        authoredBy: data.authoredBy,
        reviewedBy: data.reviewedBy,
        reviewedAt,
      },
    });
    mappings += 1;
  }

  console.log(
    `Frameworks seed complete: ${frameworks} frameworks, ${items} items, ${mappings} mappings` +
      (skippedMappings ? ` (${skippedMappings} mappings skipped — missing criterion/item)` : ""),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
