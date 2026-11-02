'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/library/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/library/Card';
import { Field, SelectInput, TextArea, TextInput } from '@/components/library/Field';
import { PageHeader } from '@/components/library/PageHeader';
import { Stepper } from '@/components/library/Stepper';
import { cn } from '@/lib/cn';
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

  const titles = [s.aboutTitle, s.commercialsTitle, s.squadTitle, s.governanceTitle];
  const note = (text: string, tone: 'info' | 'warn' = 'info') => (
    <p className={cn('m-0 rounded-asm px-4 py-3 text-sm', tone === 'warn' ? 'bg-asm-warn-wash text-asm-warn-ink' : 'bg-asm-brand-wash text-asm-brand')}>{text}</p>
  );
  const choice = (checked: boolean) =>
    cn(
      'flex cursor-pointer items-center gap-2.5 rounded-asm border px-4 py-3 text-[15px]',
      checked ? 'border-asm-brand bg-asm-brand-wash font-semibold text-asm-brand' : 'border-asm-line-strong text-asm-ink',
    );

  return (
    <div className="asm-root mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title={s.newEngagement} />
      <Stepper steps={s.steps} current={step} label={s.steps.join(' · ')} />
      {error ? (
        <p role="alert" className="m-0 rounded-asm bg-asm-risk-wash px-4 py-3 font-semibold text-asm-risk-ink">
          {error}
        </p>
      ) : null}
      {create.error ? (
        <p role="alert" className="m-0 rounded-asm bg-asm-risk-wash px-4 py-3 font-semibold text-asm-risk-ink">
          {copy.ui.loadFailed}
        </p>
      ) : null}

      <Card>
        <CardHeader title={titles[step]} description={step === 2 ? s.squadBody : undefined} />
        <CardBody className="flex flex-col gap-5">
          {step === 0 ? (
            <>
              <Field id="eng-name" label={s.name} hint={s.nameHint}>
                <TextInput value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field id="eng-client" label={s.client}>
                  <TextInput value={clientOrg} onChange={(event) => setClientOrg(event.target.value)} />
                </Field>
                <Field id="eng-sector" label={s.sector}>
                  <SelectInput value={marketSector} onChange={(event) => setMarketSector(event.target.value as MarketSector)}>
                    {MARKET_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {s.sectors[sector]}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field id="eng-start" label={s.start}>
                  <TextInput type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
                </Field>
                <Field id="eng-end" label={s.end}>
                  <TextInput type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
                </Field>
              </div>
              <Field id="eng-outcomes" label={s.outcomes} hint={s.outcomesHint}>
                <TextArea rows={4} value={outcomes} onChange={(event) => setOutcomes(event.target.value)} />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field id="eng-model" label={s.commercialModel}>
                <SelectInput value={commercialModel} onChange={(event) => setCommercialModel(event.target.value as CommercialModel)}>
                  {COMMERCIAL_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {s.models[model]}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              {commercialModel === 'fixed-price' ? note(s.fixedHelper) : null}
              <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                <legend className="mb-1 text-sm font-semibold text-asm-ink">{s.milestones}</legend>
                {milestones.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-asm border border-asm-line p-4 md:grid-cols-[2fr_1fr_2fr]">
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
                  </div>
                ))}
                <div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setMilestones((rows) => [...rows, { name: '', dueOn: '', proves: '' }])}>
                    {s.addMilestone}
                  </Button>
                </div>
              </fieldset>
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className="mb-1 text-sm font-semibold text-asm-ink">{s.scopeClear}</legend>
                <div className="flex flex-wrap gap-2">
                  <label className={choice(scopeClear)}>
                    <input type="radio" name="scope" className="accent-asm-brand" checked={scopeClear} onChange={() => setScopeClear(true)} />
                    {s.yes}
                  </label>
                  <label className={choice(!scopeClear)}>
                    <input type="radio" name="scope" className="accent-asm-brand" checked={!scopeClear} onChange={() => setScopeClear(false)} />
                    {s.noDiscovery}
                  </label>
                </div>
              </fieldset>
              {scopeClear ? null : note(s.scopeHelper, 'warn')}
            </>
          ) : null}

          {step === 2 ? (
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">{s.squadTitle}</legend>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {SQUAD_SHAPES.map((shape) => (
                  <label
                    key={shape}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-asm-lg border p-4',
                      squadShape === shape ? 'border-asm-brand bg-asm-brand-wash' : 'border-asm-line hover:border-asm-brand-soft',
                    )}
                  >
                    <input
                      type="radio"
                      name="shape"
                      className="mt-1 accent-asm-brand"
                      checked={squadShape === shape}
                      onChange={() => setSquadShape(shape)}
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-bold text-asm-brand">{s.shapes[shape].title}</span>
                      <span className="text-sm text-asm-ink-2">{s.shapes[shape].body}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 3 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field id="eng-chair" label={s.steeringChair}>
                  <TextInput value={steeringChair} onChange={(event) => setSteeringChair(event.target.value)} />
                </Field>
                <Field id="eng-frequency" label={s.frequency}>
                  <SelectInput value={steeringFrequency} onChange={(event) => setSteeringFrequency(event.target.value as SteeringFrequency)}>
                    {STEERING_FREQUENCIES.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequency === 'monthly' ? s.monthly : s.fortnightly}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field id="eng-po" label={s.productOwner}>
                  <TextInput value={clientProductOwner} onChange={(event) => setClientProductOwner(event.target.value)} />
                </Field>
                <Field id="eng-days" label={s.availability}>
                  <TextInput type="number" min={0} max={5} step={0.5} value={productOwnerDays} onChange={(event) => setProductOwnerDays(event.target.value)} />
                </Field>
              </div>
              {productOwnerDays !== '' && Number(productOwnerDays) < 2 ? note(s.poHelper, 'warn') : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field id="eng-am" label={s.accountManager}>
                  <TextInput value={accountManagerName} onChange={(event) => setAccountManagerName(event.target.value)} />
                </Field>
                <Field id="eng-threshold" label={s.threshold}>
                  <TextInput type="number" min={0} value={changeThresholdGbp} onChange={(event) => setChangeThresholdGbp(event.target.value)} />
                </Field>
              </div>
            </>
          ) : null}
        </CardBody>
        <CardFooter>
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((value) => value - 1)}>
              {s.back}
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button type="button" onClick={next}>
              {s.next}
            </Button>
          ) : (
            <Button type="button" onClick={() => void finish()} disabled={create.isPending}>
              {s.create}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
