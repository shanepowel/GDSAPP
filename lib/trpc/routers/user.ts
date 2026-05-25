import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { allowSelfRegistration, getPublicAuthConfig } from '@/lib/auth-config';
import { getDeploymentMode, getDeploymentFeatures } from '@/lib/deployment-mode';
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
  authConfig: publicProcedure.query(() => getPublicAuthConfig()),

  register: publicProcedure.input(registerInput).mutation(async ({ ctx, input }) => {
    if (!allowSelfRegistration()) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Self-registration is disabled. Sign in with your organisation Microsoft account.',
      });
    }
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
        data: {
          name: input.organisationName.trim(),
          deploymentMode: getDeploymentMode(),
        },
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
      include: { org: { select: { name: true, deploymentMode: true } } },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    const instanceMode = getDeploymentMode();
    const orgMode = user.org.deploymentMode === 'client' ? 'client' : 'internal';
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      organisationName: user.org.name,
      organisationDeploymentMode: orgMode,
      instanceDeploymentMode: instanceMode,
      tenantMatchesInstance: orgMode === instanceMode,
      deploymentFeatures: getDeploymentFeatures(),
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

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { orgId: ctx.orgId },
      select: { id: true, email: true, name: true, role: true },
      orderBy: { email: 'asc' },
    });
  }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8),
        role: z.enum(['admin', 'member']).default('member'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.userRole !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can invite members.' });
      }
      const email = input.email.trim().toLowerCase();
      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered.' });
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: {
          email,
          name: input.name.trim(),
          role: input.role,
          orgId: ctx.orgId,
          passwordHash,
        },
      });
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    }),
});
