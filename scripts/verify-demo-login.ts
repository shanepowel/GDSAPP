import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { DEMO_ACCOUNT } from '../lib/demo/demo-account';

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email: DEMO_ACCOUNT.email } });
  console.log('DATABASE_URL set:', Boolean(process.env.DATABASE_URL));
  console.log('User exists:', Boolean(user));
  console.log('Has passwordHash:', Boolean(user?.passwordHash));
  if (user?.passwordHash) {
    const ok = await bcrypt.compare(DEMO_ACCOUNT.password, user.passwordHash);
    console.log('Password matches demo-password:', ok);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
