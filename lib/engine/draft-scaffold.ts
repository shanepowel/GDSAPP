import type { BidQuestionResult } from '@/lib/types/extension';
import type { AnalysisResult } from '@/lib/types/analysis';

export function buildAnswerScaffold(
  questionText: string,
  bidResult: BidQuestionResult | undefined,
  analysis: AnalysisResult | null,
): string {
  const lines: string[] = [
    '[Advisory draft scaffold — human approval required before use]',
    '',
    `Question: ${questionText}`,
    '',
    'Points to make:',
  ];

  if (bidResult) {
    lines.push(
      `- Predicted capability coverage: ${bidResult.capabilityCoverage}% (band indicator ${bidResult.predictedBand} on the tender scale).`,
      `- Evidence strength linked: ${bidResult.evidenceStrength}%.`,
      `- ${bidResult.confidenceNote}`,
    );
    if (bidResult.passFailRisk) lines.push('- **Bid risk:** mandatory pass/fail threshold may not be met.');
    bidResult.pointMovers.forEach((m) => lines.push(`- To improve: ${m}`));
  }

  if (analysis) {
    lines.push(
      `- Team readiness (service standard lens): ${analysis.overallReadiness}% (${analysis.readinessBand}).`,
    );
    const topGaps = analysis.readiness.points
      .filter((p) => p.status === 'gap' || p.status === 'partial')
      .slice(0, 3);
    topGaps.forEach((g) => lines.push(`- Related standard point ${g.number}: ${g.title} (${g.status}).`));
    analysis.adaptation.actions.slice(0, 3).forEach((a) => {
      lines.push(`- Adaptation: ${a.title} — ${a.description}`);
    });
  }

  lines.push('', 'Evidence to cite:', '- [List linked evidence artefacts from the register]', '');
  return lines.join('\n');
}
