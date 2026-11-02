import Link from 'next/link';
import { AssembleMark, ButtonLink, TurnerTownsendLogo } from '@/components/assemble-v2';

export const metadata = { title: 'Sign in' };

/**
 * v2 sign-in. Visual only: wire "Continue with Microsoft" to next-auth (Entra ID provider)
 * and "Use a demo account" to the existing /api/auth/demo route. See docs/redesign/WIRING.md.
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-wrap bg-asm-canvas">
      <section className="flex flex-[1_1_420px] flex-col justify-between gap-10 bg-asm-brand p-10 text-asm-on-brand md:p-14">
        <span className="flex items-center gap-2.5">
          <AssembleMark size={32} />
          <span className="text-xl font-bold">Assemble</span>
        </span>
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-4xl font-bold leading-tight">Set up, run and assure your delivery teams.</h1>
          <p className="text-lg text-asm-on-brand-2">From bid to aftercare, with the standards that govern you built in.</p>
        </div>
        <TurnerTownsendLogo height={26} />
      </section>
      <section className="flex flex-[1_1_420px] items-center justify-center p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[28px] font-bold text-asm-brand">Sign in to Assemble</h2>
            <p className="text-asm-ink-3">Use your work account.</p>
          </div>
          <ButtonLink href="/v2/welcome" size="lg">Continue with Microsoft</ButtonLink>
          <ButtonLink href="/v2/home" variant="secondary" size="lg">Use a demo account</ButtonLink>
          <p className="text-[13px] text-asm-ink-3">
            By signing in you agree to how we handle your data. <Link href="/accessibility" className="font-semibold text-asm-brand underline">Accessibility</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
