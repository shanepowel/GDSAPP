'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/library/Button';
import { Field, TextInput } from '@/components/library/Field';
import { Cluster, Grid, Stack } from '@/components/library/layout';
import { Panel } from '@/components/library/Panel';
import { Heading, Text } from '@/components/library/type';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import {
  COMMERCIAL_MODELS,
  MARKET_SECTORS,
  SQUAD_SHAPES,
  STEERING_FREQUENCIES,
  type CommercialModel,
  type MarketSector,
  type SquadShape,
  type SteeringFrequency,
} from '@/lib/handbook/choices';
import { trpc } from '@/lib/trpc/client';

interface MilestoneDraft {
  name: string;
  dueOn: string;
  proves: string;
}

export default function NewEngagementWizardPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const s = copy.spine;
  const router = useRouter();
  const create = trpc.spine.create.useMutation();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [clientOrg, setClientOrg] = useState('');
  const [marketSector, setMarketSector] = useState<MarketSector>('public');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [commercialModel, setCommercialModel] = useState<CommercialModel>('fixed-price');
  const [scopeClear, setScopeClear] = useState(true);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([{ name: '', dueOn: '', proves: '' }]);
  const [squadShape, setSquadShape] = useState<SquadShape>('discovery');
  const [steeringChair, setSteeringChair] = useState('');
  const [steeringFrequency, setSteeringFrequency] = useState<SteeringFrequency>('monthly');
  const [clientProductOwner, setClientProductOwner] = useState('');
  const [productOwnerDays, setProductOwnerDays] = useState('');
  const [accountManagerName, setAccountManagerName] = useState('');
  const [changeThresholdGbp, setChangeThresholdGbp] = useState('');

  function next() {
    if (step === 0 && (!name.trim() || !clientOrg.trim())) {
      setError(s.required);
      return;
    }
    setError('');
    setStep((value) => value + 1);
  }

  async function finish() {
    const days = productOwnerDays === '' ? undefined : Number(productOwnerDays);
    const threshold = changeThresholdGbp === '' ? undefined : Number(changeThresholdGbp);
    const created = await create.mutateAsync({
      name: name.trim(),
      clientOrg: clientOrg.trim(),
      marketSector,
      startsOn: startsOn || undefined,
      endsOn: endsOn || undefined,
      outcomes: outcomes.trim() || undefined,
      commercialModel,
      scopeClear,
      milestones: milestones
        .filter((item) => item.name.trim())
        .map((item) => ({
          name: item.name.trim(),
          dueOn: item.dueOn || undefined,
          proves: item.proves.trim() || undefined,
        })),
      squadShape,
      steeringChair: steeringChair.trim() || undefined,
      steeringFrequency,
      clientProductOwner: clientProductOwner.trim() || undefined,
      productOwnerDays: Number.isFinite(days) ? days : undefined,
      accountManagerName: accountManagerName.trim() || undefined,
      changeThresholdGbp: Number.isFinite(threshold) ? threshold : undefined,
    });
    router.push(`/squads/${created.id}/overview?created=1`);
  }

  return (
    <Stack gap={5}>
      <Heading level={1}>{s.newEngagement}</Heading>
      <ol aria-label={s.steps.join(' · ')} className="flex flex-wrap gap-3">
        {s.steps.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined}>
            <Text role={index === step ? 'label' : 'meta'}>{label}</Text>
          </li>
        ))}
      </ol>
      {error ? (
        <p role="alert">
          <Text>{error}</Text>
        </p>
      ) : null}
      {create.error ? (
        <p role="alert">
          <Text>{copy.ui.loadFailed}</Text>
        </p>
      ) : null}

      {step === 0 ? (
        <Stack gap={3}>
          <Heading level={2}>{s.aboutTitle}</Heading>
          <Field id="eng-name" label={s.name} hint={s.nameHint}>
            <TextInput value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field id="eng-client" label={s.client}>
            <TextInput value={clientOrg} onChange={(event) => setClientOrg(event.target.value)} />
          </Field>
          <Field id="eng-sector" label={s.sector}>
            <select id="eng-sector" value={marketSector} onChange={(event) => setMarketSector(event.target.value as MarketSector)}>
              {MARKET_SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {s.sectors[sector]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="eng-start" label={s.start}>
            <TextInput type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
          </Field>
          <Field id="eng-end" label={s.end}>
            <TextInput type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
          </Field>
          <Field id="eng-outcomes" label={s.outcomes} hint={s.outcomesHint}>
            <TextInput value={outcomes} onChange={(event) => setOutcomes(event.target.value)} />
          </Field>
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack gap={3}>
          <Heading level={2}>{s.commercialsTitle}</Heading>
          <Field id="eng-model" label={s.commercialModel}>
            <select
              id="eng-model"
              value={commercialModel}
              onChange={(event) => setCommercialModel(event.target.value as CommercialModel)}
            >
              {COMMERCIAL_MODELS.map((model) => (
                <option key={model} value={model}>
                  {s.models[model]}
                </option>
              ))}
            </select>
          </Field>
          {commercialModel === 'fixed-price' ? <Text>{s.fixedHelper}</Text> : null}
          <Heading level={3}>{s.milestones}</Heading>
          {milestones.map((item, index) => (
            <Grid key={index} columns={3} gap={2}>
              <Field id={`ms-name-${index}`} label={s.milestoneName}>
                <TextInput
                  value={item.name}
                  onChange={(event) =>
                    setMilestones((rows) => rows.map((row, i) => (i === index ? { ...row, name: event.target.value } : row)))
                  }
                />
              </Field>
              <Field id={`ms-date-${index}`} label={s.milestoneDate}>
                <TextInput
                  type="date"
                  value={item.dueOn}
                  onChange={(event) =>
                    setMilestones((rows) => rows.map((row, i) => (i === index ? { ...row, dueOn: event.target.value } : row)))
                  }
                />
              </Field>
              <Field id={`ms-proves-${index}`} label={s.milestoneProves}>
                <TextInput
                  value={item.proves}
                  onChange={(event) =>
                    setMilestones((rows) => rows.map((row, i) => (i === index ? { ...row, proves: event.target.value } : row)))
                  }
                />
              </Field>
            </Grid>
          ))}
          <div>
            <Button type="button" variant="secondary" onClick={() => setMilestones((rows) => [...rows, { name: '', dueOn: '', proves: '' }])}>
              {s.addMilestone}
            </Button>
          </div>
          <fieldset>
            <legend>{s.scopeClear}</legend>
            <label className="mr-4 inline-flex items-center gap-2">
              <input type="radio" name="scope" checked={scopeClear} onChange={() => setScopeClear(true)} />
              {s.yes}
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="scope" checked={!scopeClear} onChange={() => setScopeClear(false)} />
              {s.noDiscovery}
            </label>
          </fieldset>
          {scopeClear ? null : <Text>{s.scopeHelper}</Text>}
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack gap={3}>
          <Heading level={2}>{s.squadTitle}</Heading>
          <Text>{s.squadBody}</Text>
          <Grid columns={2} gap={3}>
            {SQUAD_SHAPES.map((shape) => (
              <Panel key={shape} padding={3}>
                <label className="block">
                  <input
                    type="radio"
                    name="shape"
                    className="mr-2"
                    checked={squadShape === shape}
                    onChange={() => setSquadShape(shape)}
                  />
                  <strong>{s.shapes[shape].title}</strong>
                  <Text>{s.shapes[shape].body}</Text>
                </label>
              </Panel>
            ))}
          </Grid>
        </Stack>
      ) : null}

      {step === 3 ? (
        <Stack gap={3}>
          <Heading level={2}>{s.governanceTitle}</Heading>
          <Field id="eng-chair" label={s.steeringChair}>
            <TextInput value={steeringChair} onChange={(event) => setSteeringChair(event.target.value)} />
          </Field>
          <Field id="eng-frequency" label={s.frequency}>
            <select
              id="eng-frequency"
              value={steeringFrequency}
              onChange={(event) => setSteeringFrequency(event.target.value as SteeringFrequency)}
            >
              {STEERING_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency === 'monthly' ? s.monthly : s.fortnightly}
                </option>
              ))}
            </select>
          </Field>
          <Field id="eng-po" label={s.productOwner}>
            <TextInput value={clientProductOwner} onChange={(event) => setClientProductOwner(event.target.value)} />
          </Field>
          <Field id="eng-days" label={s.availability}>
            <TextInput
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={productOwnerDays}
              onChange={(event) => setProductOwnerDays(event.target.value)}
            />
          </Field>
          {productOwnerDays !== '' && Number(productOwnerDays) < 2 ? <Text>{s.poHelper}</Text> : null}
          <Field id="eng-am" label={s.accountManager}>
            <TextInput value={accountManagerName} onChange={(event) => setAccountManagerName(event.target.value)} />
          </Field>
          <Field id="eng-threshold" label={s.threshold}>
            <TextInput
              type="number"
              min={0}
              value={changeThresholdGbp}
              onChange={(event) => setChangeThresholdGbp(event.target.value)}
            />
          </Field>
        </Stack>
      ) : null}

      <Cluster gap={3}>
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep((value) => value - 1)}>
            {s.back}
          </Button>
        ) : null}
        {step < 3 ? (
          <Button type="button" onClick={next}>
            {s.next}
          </Button>
        ) : (
          <Button type="button" onClick={() => void finish()} disabled={create.isPending}>
            {s.create}
          </Button>
        )}
      </Cluster>
    </Stack>
  );
}
