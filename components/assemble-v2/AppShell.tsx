import { AssembleLockup, TurnerTownsendLogo } from './Logo';
import { SidebarNav } from './SidebarNav';
import { AskAssemble } from './AskAssemble';
import { Avatar } from './Avatar';

/**
 * Application shell: brand sidebar plus content area.
 * On small screens the sidebar stacks above the content (flex-wrap), it never overlays it.
 */
export function AppShell({ children, user = { name: 'Shane Powell', initials: 'SP', org: 'Turner & Townsend' } }: { children: React.ReactNode; user?: { name: string; initials: string; org: string } }) {
  return (
    <div className="asm-root flex min-h-screen flex-wrap bg-asm-canvas font-sans text-asm-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-asm focus:bg-asm-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <aside className="flex w-full flex-col gap-7 bg-asm-brand px-4 py-6 text-asm-on-brand md:sticky md:top-0 md:h-screen md:w-60 md:flex-none">
        <div className="px-2">
          <AssembleLockup />
        </div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-3">
          <TurnerTownsendLogo height={20} className="mx-2 mb-1" />
          <AskAssemble />
          <div className="flex items-center gap-2.5 p-2">
            <Avatar initials={user.initials} />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-asm-on-brand-3">{user.org}</span>
            </span>
          </div>
        </div>
      </aside>
      <main id="main" className="flex min-w-0 flex-[999_1_560px] flex-col gap-8 px-6 py-8 md:px-12 md:py-10">
        {children}
      </main>
    </div>
  );
}
