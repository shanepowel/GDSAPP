import PDFDocument from 'pdfkit';
import { BRAND } from '@/lib/brand';
import type { AssuranceReportPayload } from '@/lib/export/assurance-report';
import { JUDGEMENT_APPENDIX_SECTION } from '@/lib/export/assurance-report';

const INK = '#14181f';
const MUTED = '#5c6570';
const RULE = '#d0d5db';

/**
 * Assurance PDF — same TitleBlock fields and scoring payload as the screen.
 * Body uses a serif face (Times) as the pdfkit stand-in for Source Serif 4
 * (see ADAPTATIONS.md). Every page footer carries version + generation date.
 */
export function buildAssuranceReportPdf(payload: AssuranceReportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const tb = payload.titleBlock;
    const confLabel =
      payload.confidentiality === 'internal'
        ? 'CONFIDENTIAL — INTERNAL'
        : payload.confidentiality === 'client'
          ? 'CONFIDENTIAL — CLIENT'
          : 'PUBLISHABLE';

    // Cover / TitleBlock
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(BRAND.productLine);
    doc.moveDown(0.4);
    doc.fontSize(8).fillColor(INK).text(confLabel, { align: 'right' });
    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(tb.reference);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(tb.standardLabel);
    if (tb.serviceName) {
      doc.moveDown(0.3);
      doc.font('Times-Bold').fontSize(16).fillColor(INK).text(tb.serviceName);
    }
    doc.moveDown(0.3);
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text(
        `${tb.phase} · Rev ${tb.revision} · Prepared by ${tb.preparedBy} · ${tb.dateLabel}`,
      );
    doc.moveDown(0.8);
    doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor(RULE).stroke();
    doc.moveDown(1);

    if (payload.sections.includes('overview')) {
      doc.font('Times-Bold').fontSize(14).fillColor(INK).text('Preparedness overview');
      doc.moveDown(0.4);
      doc
        .font('Times-Roman')
        .fontSize(11)
        .text(
          `Index: ${payload.scoring.index === null ? '—' : payload.scoring.index} · Confidence: ${payload.scoring.confidence}`,
        );
      doc.moveDown(0.8);
    }

    if (payload.sections.includes('gaps') && payload.gaps.length > 0) {
      ensureSpace(doc, 80);
      doc.font('Times-Bold').fontSize(14).fillColor(INK).text('Gaps');
      doc.moveDown(0.4);
      for (const g of payload.gaps) {
        ensureSpace(doc, 56);
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(INK)
          .text(`${g.criterionRef}  ${g.title}${g.statutory ? '  [statutory]' : ''}`);
        doc.font('Times-Roman').fontSize(10).text(g.reason);
        doc.font('Times-Italic').fontSize(10).text(`Move: ${g.move}`);
        doc.moveDown(0.5);
      }
      doc.moveDown(0.4);
    }

    if (payload.sections.includes('evidence') && payload.evidence.length > 0) {
      ensureSpace(doc, 80);
      doc.font('Times-Bold').fontSize(14).fillColor(INK).text('Evidence ledger');
      doc.moveDown(0.4);
      for (const e of payload.evidence) {
        ensureSpace(doc, 40);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(e.title);
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(MUTED)
          .text(
            `${e.kind} · ${e.provenance} · ${e.confidentiality}` +
              (e.expiresAt ? ` · expires ${e.expiresAt.slice(0, 10)}` : '') +
              (e.criterionRefs.length ? ` · points ${e.criterionRefs.join(', ')}` : ''),
          );
        doc.moveDown(0.35);
      }
      doc.moveDown(0.4);
    }

    // Judgement register — always on
    void JUDGEMENT_APPENDIX_SECTION;
    doc.addPage();
    doc.font('Times-Bold').fontSize(14).fillColor(INK).text('Judgement register');
    doc
      .font('Times-Roman')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Every current judgement with author provenance. This appendix cannot be omitted.');
    doc.moveDown(0.6);

    if (payload.judgements.length === 0) {
      doc.font('Times-Roman').fontSize(10).fillColor(INK).text('No judgements recorded yet.');
    } else {
      for (const j of payload.judgements) {
        ensureSpace(doc, 72);
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(INK)
          .text(`${j.criterionRef}  ${j.criterionTitle}  [${j.verdict}]`);
        doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(j.provenanceLabel);
        doc
          .font('Times-Roman')
          .fontSize(10)
          .fillColor(INK)
          .text(j.rationale, { width: 500 });
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(MUTED)
          .text(
            `Confirmed by ${j.confirmerName}${j.confirmerEmail ? ` <${j.confirmerEmail}>` : ''} · ${j.confirmedAt.slice(0, 10)}` +
              (j.aiModel ? ` · model ${j.aiModel}` : ''),
          );
        doc.moveDown(0.55);
      }
    }

    // Footers on every page
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(MUTED)
        .text(
          `${BRAND.productLine} v${payload.productVersion} · Generated ${payload.generatedAt} · ${confLabel} · Page ${i - range.start + 1} of ${range.count}`,
          48,
          780,
          { width: 500, align: 'left', lineBreak: false },
        );
    }

    doc.end();
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y > 750 - needed) {
    doc.addPage();
  }
}
