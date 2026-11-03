'use client';

import { PageHeader } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

const CROSSWALK = [
  ['GDS Service Standard', 'Digital services on the GDS Service Standard'],
  ['Wales Digital Service Standard', 'Services delivered for Welsh public bodies'],
  ['Technology Code of Practice', 'Technology spend and design choices'],
  ['NISTA gateway reviews', 'Major programme gates'],
  ['ISO 19650', 'Information management for capital delivery'],
  ['Construction Playbook', 'How capital work is bought and run'],
  ['Building Safety Act golden thread', 'The information a building has to keep'],
] as const;

export default function StandardsPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);

  return (
    <>
      <PageHeader
        eyebrow={copy.shell.standards}
        title={copy.practice.crosswalkTitle}
        lede={copy.practice.crosswalkLede}
      />
      <div className="sheet w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>{copy.context.standards}</th>
              <th>{copy.practice.produces}</th>
            </tr>
          </thead>
          <tbody>
            {CROSSWALK.map(([name, covers]) => (
              <tr key={name}>
                <td className="font-semibold">{name}</td>
                <td>{covers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
