export type Messages = {
  signIn: {
    title: string;
    email: string;
    password: string;
    submit: string;
  };
  engagements: {
    title: string;
    new: string;
    empty: string;
  };
  common: {
    runAnalysis: string;
    save: string;
    loading: string;
    back: string;
    exportPdf: string;
    exportWord: string;
  };
  nav: {
    engagements: string;
    portfolio: string;
    portfolioAssurance: string;
    handover: string;
    benchmarking: string;
    framework: string;
  };
  portfolio: {
    title: string;
    titleAssurance: string;
    bySupplier: string;
  };
  framework: {
    title: string;
    recordBaseline: string;
    noDrift: string;
    hasDrift: string;
  };
  benchmarking: {
    title: string;
    record: string;
    event: string;
    result: string;
    notes: string;
  };
  tender: {
    importPdf: string;
    parseHint: string;
    importSelected: string;
  };
  app: {
    tagline: string;
    advisoryFooter: string;
    language: string;
    english: string;
    welsh: string;
  };
};

export type Locale = 'en' | 'cy';
