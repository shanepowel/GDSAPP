import PDFDocument from 'pdfkit';
import { BRAND } from '@/lib/brand';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export interface BrandedReportInput {
  engagementName: string;
  standardLabel: string;
  requirementTitle: string;
  phase: string;
  generatedAt: Date;
  result: ExtendedAnalysisResult;
  advisoryFooter: string;
}

const PDF_COLORS = {
  ink: BRAND.colors.ink,
  accent: BRAND.colors.blue,
  muted: BRAND.colors.slate,
  navy: BRAND.colors.navy,
};

export function buildBrandedReportPdf(input: BrandedReportInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fillColor(PDF_COLORS.ink)
      .fontSize(10)
      .text(BRAND.productLine, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(20).text(input.engagementName, { continued: false });
    doc.fontSize(11).fillColor(PDF_COLORS.muted).text(`${input.standardLabel} · ${input.phase} phase`);
    doc.text(`Requirement: ${input.requirementTitle}`);
    doc.text(`Generated ${input.generatedAt.toLocaleString('en-GB')}`);
    doc.moveDown();

    doc.fillColor(PDF_COLORS.accent).rect(50, doc.y, 495, 3).fill();
    doc.moveDown(0.8);
    doc.fillColor(PDF_COLORS.ink).fontSize(14).text('Executive summary');
    doc.fontSize(11).fillColor(PDF_COLORS.ink);
    doc.text(`Overall readiness: ${Math.round(input.result.overallReadiness)}% (${input.result.readinessBand})`);
    doc.text(`Team composition: ${Math.round(input.result.composition.overallPercent)}%`);
    if (input.result.rigour) {
      doc.text(`Agile rigour: ${Math.round(input.result.rigour.overallPercent)}%`);
    }
    if (input.result.bidOutlook) {
      doc.text(`Call-off quality outlook: ${input.result.bidOutlook.overallQualityOutlook}%`);
    }
    doc.moveDown();

    const gaps = input.result.readiness.points.filter(
      (p) => p.status === 'gap' || p.status === 'partial',
    );
    doc.fontSize(14).text('Top gaps');
    doc.fontSize(10);
    for (const g of gaps.slice(0, 8)) {
      doc.text(`• ${g.number}. ${g.title}: ${g.status}`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Adaptation actions');
    doc.fontSize(10);
    for (const a of input.result.adaptation.actions.slice(0, 6)) {
      doc.text(`• ${a.title}`);
    }

    doc.addPage();
    doc.fontSize(14).text('Readiness detail (summary)');
    doc.fontSize(9);
    for (const p of input.result.readiness.points) {
      if (doc.y > 720) {
        doc.addPage();
      }
      doc.text(`${p.number}. ${p.title} [${p.status}]: score ${Math.round(p.score * 100)}%`);
    }

    doc.moveDown(2);
    doc.fontSize(8).fillColor(PDF_COLORS.muted).text(input.advisoryFooter, { align: 'left' });

    doc.end();
  });
}
