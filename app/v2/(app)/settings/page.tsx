import { Button, Card, CardBody, CardHeader, Field, Input, PageHeader } from '@/components/assemble-v2';

export const metadata = { title: 'Settings' };

const RULES = [
  ['util', 'Planned utilisation (%)', '80'],
  ['tenure', 'Minimum tenure on a squad (months)', '3'],
  ['concurrent', 'Maximum concurrent engagements, delivery roles', '1'],
  ['sprint', 'Sprint length (weeks)', '2'],
  ['predict', 'Predictability target (%)', '80'],
  ['quality', 'Bug escape target (under %)', '1'],
  ['health', 'Team health target', '4.0'],
  ['client', 'Client satisfaction target', '4.0'],
  ['risklock', 'Risk lock window (hours)', '48'],
  ['threshold', 'Default change approval threshold (£)', '10000'],
];

/** Delivery rules from the handbook live in config, so changing the handbook never needs a code change. */
export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Organisation, members, delivery rules and integrations." />
      <Card aria-labelledby="rules-h">
        <CardHeader id="rules-h" title="Delivery rules" description="These come from your delivery handbook. Change them here when the handbook changes." action={<Button size="sm">Save changes</Button>} />
        <CardBody className="grid gap-5 md:grid-cols-2">
          {RULES.map(([id, label, v]) => (
            <Field key={id} id={id} label={label}><Input id={id} defaultValue={v} inputMode="decimal" /></Field>
          ))}
        </CardBody>
      </Card>
      <Card aria-labelledby="int-h">
        <CardHeader id="int-h" title="Integrations" description="Assemble reads from delivery tools. It does not replace them." />
        <ul>
          {[
            ['Jira', 'Sprint goals, stories and defects for Delivery Compass.'],
            ['Azure DevOps', 'Sprint goals, stories and defects for Delivery Compass.'],
            ['Microsoft 365 calendar', 'Ceremonies and steering committees.'],
            ['Microsoft Teams', 'Notifications for Needs attention.'],
            ['EmberNest', 'Bring code quality and AI delivery evidence into Delivery Compass.'],
          ].map(([n, d]) => (
            <li key={n} className="flex flex-wrap items-center justify-between gap-3 border-b border-asm-line-soft px-6 py-4 last:border-b-0">
              <span className="flex flex-col"><span className="font-semibold">{n}</span><span className="text-sm text-asm-ink-3">{d}</span></span>
              <Button size="sm" variant="secondary">Connect<span className="sr-only"> {n}</span></Button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
