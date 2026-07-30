import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_DIR = path.join(process.cwd(), 'data/standards/seed');

type TranslationSeed = {
  title: string;
  statement: string;
  reviewStatus: 'human' | 'machine';
};

type CriterionSeed = {
  ref: string;
  title: string;
  statement: string;
  phases: string[];
  statutory: boolean;
  weight: number;
  sortOrder: number;
  guidanceUrl: string | null;
  translations: Record<string, TranslationSeed>;
};

type StandardSeed = {
  code: string;
  name: string;
  publisher: string;
  licence: string;
  attribution: string;
  sourceUrl: string | null;
  version: string;
  effectiveFrom: string;
  criteria: CriterionSeed[];
};

async function upsertStandard(seed: StandardSeed) {
  const standard = await prisma.catalogStandard.upsert({
    where: { code: seed.code },
    create: {
      code: seed.code,
      name: seed.name,
      publisher: seed.publisher,
      licence: seed.licence,
      attribution: seed.attribution,
      sourceUrl: seed.sourceUrl,
    },
    update: {
      name: seed.name,
      publisher: seed.publisher,
      licence: seed.licence,
      attribution: seed.attribution,
      sourceUrl: seed.sourceUrl,
    },
  });

  const version = await prisma.catalogStandardVersion.upsert({
    where: {
      standardId_version: { standardId: standard.id, version: seed.version },
    },
    create: {
      standardId: standard.id,
      version: seed.version,
      effectiveFrom: new Date(seed.effectiveFrom),
      status: 'current',
    },
    update: {
      effectiveFrom: new Date(seed.effectiveFrom),
      status: 'current',
    },
  });

  for (const c of seed.criteria) {
    const criterion = await prisma.criterion.upsert({
      where: {
        standardVersionId_ref: { standardVersionId: version.id, ref: c.ref },
      },
      create: {
        standardVersionId: version.id,
        ref: c.ref,
        title: c.title,
        statement: c.statement,
        guidanceUrl: c.guidanceUrl,
        phases: c.phases,
        statutory: c.statutory,
        weight: c.weight,
        sortOrder: c.sortOrder,
      },
      update: {
        title: c.title,
        statement: c.statement,
        guidanceUrl: c.guidanceUrl,
        phases: c.phases,
        statutory: c.statutory,
        weight: c.weight,
        sortOrder: c.sortOrder,
      },
    });

    for (const [locale, t] of Object.entries(c.translations)) {
      await prisma.criterionTranslation.upsert({
        where: {
          criterionId_locale: { criterionId: criterion.id, locale },
        },
        create: {
          criterionId: criterion.id,
          locale,
          title: t.title,
          statement: t.statement,
          reviewStatus: t.reviewStatus,
        },
        update: {
          title: t.title,
          statement: t.statement,
          reviewStatus: t.reviewStatus,
        },
      });
    }
  }

  return { code: seed.code, version: seed.version, criteria: seed.criteria.length };
}

async function main() {
  const files = readdirSync(SEED_DIR).filter((f) => f.endsWith('.json')).sort();
  if (!files.length) {
    throw new Error(`No seed JSON found in ${SEED_DIR}`);
  }

  const results = [];
  for (const file of files) {
    const seed = JSON.parse(readFileSync(path.join(SEED_DIR, file), 'utf8')) as StandardSeed;
    results.push(await upsertStandard(seed));
  }

  console.log('Catalog standards seeded:', JSON.stringify(results, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
