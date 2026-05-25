import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '@/lib/trpc/trpc';

const registerInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  organisationName: z.string().min(1).max(200),
});

const updateProfileInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export const userRouter = router({
  register: publicProcedure.input(registerInput).mutation(async ({ ctx, input }) => {
    const email = input.email.trim().toLowerCase();
    const existing = await ctx.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await ctx.prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: { name: input.organisationName.trim() },
      });
      return tx.user.create({
        data: {
          email,
          name: input.name.trim(),
          role: 'admin',
          orgId: org.id,
          passwordHash,
        },
        include: { org: true },
      });
    });

    return {
      ok: true,
      email: user.email,
      organisationName: user.org.name,
    };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.userId, orgId: ctx.orgId },
      include: { org: true },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      organisationName: user.org.name,
    };
  }),

  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.userId, orgId: ctx.orgId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const email = input.email.trim().toLowerCase();
      if (email !== user.email) {
        const taken = await ctx.prisma.user.findUnique({ where: { email } });
        if (taken) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'That email is already in use.',
          });
        }
      }

      let passwordHash = user.passwordHash;
      if (input.newPassword) {
        if (!user.passwordHash || !input.currentPassword) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Enter your current password to set a new one.',
          });
        }
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect.',
          });
        }
        passwordHash = await bcrypt.hash(input.newPassword, 10);
      }

      const updated = await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          name: input.name.trim(),
          email,
          passwordHash,
        },
        include: { org: true },
      });

      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        organisationName: updated.org.name,
      };
    }),
});
