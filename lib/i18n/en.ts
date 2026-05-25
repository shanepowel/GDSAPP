import type { Messages } from '@/lib/i18n/types';

export const en: Messages = {
  signIn: {
    title: 'Sign in',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
  },
  engagements: {
    title: 'Call-offs',
    new: 'New call-off',
    empty: 'No call-offs yet. Create one to assess team readiness against a service standard.',
  },
  common: {
    runAnalysis: 'Run analysis',
    save: 'Save',
    loading: 'Loading…',
    back: 'Back',
    exportPdf: 'Export branded PDF',
    exportWord: 'Export drafts to Word',
  },
  nav: {
    engagements: 'Call-offs',
    portfolio: 'Portfolio',
    portfolioAssurance: 'Portfolio assurance',
    handover: 'Handover pack',
    benchmarking: 'Benchmarking',
    framework: 'Framework',
  },
  portfolio: {
    title: 'Portfolio',
    titleAssurance: 'Portfolio assurance',
    bySupplier: 'By supplier',
  },
  framework: {
    title: 'Framework drift detection',
    recordBaseline: 'Record baseline snapshot',
    noDrift: 'No drift from the latest recorded baseline.',
    hasDrift: 'Changes detected in the dependency map.',
  },
  benchmarking: {
    title: 'Benchmarking and outcomes',
    record: 'Record outcome',
    event: 'Event',
    result: 'Result',
    notes: 'Notes',
  },
  tender: {
    importPdf: 'Import tender PDF',
    parseHint: 'PDF is parsed automatically. Review every question before use in a live bid.',
    importSelected: 'Import selected questions',
  },
  app: {
    tagline: 'Standard readiness and team fit',
    advisoryFooter:
      'Built on public frameworks under the Open Government Licence. Advisory tool; not a hiring decision.',
    language: 'Language',
    english: 'English',
    welsh: 'Welsh',
  },
};
