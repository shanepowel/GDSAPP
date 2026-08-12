/**
 * Welsh export gate (spec 6.4): machine-translated Welsh must not reach an export.
 */
export type TranslationReview = {
  locale: string;
  reviewStatus: string;
  criterionRef?: string;
};

export type ExportGateResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'machine-welsh';
      message: string;
      machineCriterionRefs: string[];
    };

export function assertWelshExportAllowed(
  locale: string,
  translations: TranslationReview[],
): ExportGateResult {
  if (locale !== 'cy') return { ok: true };

  const machine = translations.filter(
    (t) => t.locale === 'cy' && t.reviewStatus !== 'human',
  );
  if (machine.length === 0) return { ok: true };

  const refs = [
    ...new Set(machine.map((m) => m.criterionRef).filter(Boolean) as string[]),
  ];
  return {
    ok: false,
    reason: 'machine-welsh',
    message:
      'Welsh export blocked: one or more criterion translations are machine-translated and have not been human-reviewed.',
    machineCriterionRefs: refs,
  };
}
