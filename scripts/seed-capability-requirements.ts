import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Seed at least one capability requirement per GDS/Wales criterion (Phase 4.1 light). */
async function main() {
  const criteria = await prisma.criterion.findMany({
    include: { standardVersion: { include: { standard: true } } },
  });

  let created = 0;
  for (const c of criteria) {
    const existing = await prisma.capabilityRequirement.count({
      where: { criterionId: c.id },
    });
    if (existing > 0) continue;

    const archetype =
      /research|user/i.test(c.title)
        ? 'User researcher'
        : /accessib|everyone/i.test(c.title)
          ? 'Accessibility specialist'
          : /team|multidisciplinary/i.test(c.title)
            ? 'Delivery manager'
            : /agile|iterate/i.test(c.title)
              ? 'Delivery manager'
              : /security|privacy/i.test(c.title)
                ? 'Technical architect'
                : /performance|success/i.test(c.title)
                  ? 'Performance analyst'
                  : /code|open|technology|tools|standards/i.test(c.title)
                    ? 'Software developer'
                    : /content|welsh|english|joined/i.test(c.title)
                      ? 'Content designer'
                      : 'Product manager';

    await prisma.capabilityRequirement.create({
      data: {
        criterionId: c.id,
        description: `Capability to satisfy criterion ${c.ref}: ${c.title}`,
        roleArchetype: archetype,
        minFte: 60,
        skillTags: [],
        phasePersistent: c.phases.includes('live'),
      },
    });
    created += 1;
  }

  console.log(`Capability requirements seeded: ${created} new (${criteria.length} criteria)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
