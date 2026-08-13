'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DatumSelect } from '@/components/ui/DatumSelect';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

type RoleOption = { id: string; name: string };

const fieldClass =
  'min-h-11 rounded-[var(--radius)] border border-[color:var(--rule)] bg-[color:var(--raised)] px-3 py-2 text-sm text-[color:var(--ink)]';

export function AddPersonForm({
  roleEntities,
  formId = 'add-person',
}: {
  roleEntities: RoleOption[];
  formId?: string;
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState({ name: '', email: '', entityId: '' });
  const createPerson = trpc.orgDesign.createPerson.useMutation({
    onSuccess: async () => {
      setDraft({ name: '', email: '', entityId: '' });
      await utils.orgDesign.graph.invalidate();
      await utils.orgDesign.engagementStructure.invalidate();
    },
  });

  return (
    <form
      id={formId}
      className="mb-4 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.name.trim()) return;
        createPerson.mutate({
          name: draft.name.trim(),
          email: draft.email || null,
          ...(draft.entityId ? { assignEntityId: draft.entityId } : {}),
        });
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
          {copy.people.name}
        </span>
        <input
          required
          className={fieldClass}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          aria-label={copy.people.name}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-data text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
          {copy.people.email}
        </span>
        <input
          className={fieldClass}
          type="email"
          value={draft.email}
          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          aria-label={copy.people.email}
        />
      </label>
      <DatumSelect
        name="new-person-role"
        label={copy.people.role}
        value={draft.entityId}
        disabled={roleEntities.length === 0}
        onChange={(entityId) => setDraft((d) => ({ ...d, entityId }))}
      >
        <option value="">{copy.people.assignRole}</option>
        {roleEntities.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </DatumSelect>
      <Button type="submit" size="sm" disabled={createPerson.isPending || !draft.name.trim()}>
        {copy.people.addPerson}
      </Button>
      {createPerson.error ? (
        <p className="w-full text-sm text-status-gap" role="alert">
          {copy.people.addFailed}
        </p>
      ) : null}
    </form>
  );
}

export function PersonRoleSelect({
  personId,
  personName,
  value,
  roleEntities,
  disabled,
  hideLabel,
}: {
  personId: string;
  personName: string;
  value: string;
  roleEntities: RoleOption[];
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const utils = trpc.useUtils();
  const [pending, setPending] = useState<string | null>(null);
  const setPersonRole = trpc.orgDesign.setPersonRole.useMutation({
    onSuccess: async () => {
      await utils.orgDesign.graph.invalidate();
      await utils.orgDesign.engagementStructure.invalidate();
      setPending(null);
    },
    onError: () => setPending(null),
  });

  return (
    <>
      <DatumSelect
        name={`person-role-${personId}`}
        label={hideLabel ? undefined : copy.people.role}
        ariaLabel={fillCopy(copy.people.roleForPerson, { name: personName })}
        value={pending ?? value}
        disabled={disabled || roleEntities.length === 0}
        onChange={(entityId) => {
          setPending(entityId);
          setPersonRole.mutate({ personId, entityId: entityId || null });
        }}
      >
        <option value="">{copy.people.assignRole}</option>
        {roleEntities.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </DatumSelect>
      {setPersonRole.error ? (
        <p className="mt-1 text-sm text-status-gap" role="alert">
          {copy.people.assignFailed}
        </p>
      ) : null}
    </>
  );
}
