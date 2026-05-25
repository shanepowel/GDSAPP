export type Messages = {
  signIn: {
    title: string;
    tabSignIn: string;
    tabRegister: string;
    email: string;
    password: string;
    submit: string;
    name: string;
    organisation: string;
    createAccount: string;
    registerHint: string;
    signInHint: string;
    accountCreated: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    ctaSignIn: string;
    ctaRegister: string;
    ctaDashboard: string;
    whatTitle: string;
    whatBody: string;
    howTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    step4Title: string;
    step4Body: string;
    whoTitle: string;
    whoBody: string;
  };
  profile: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    organisation: string;
    role: string;
    currentPassword: string;
    newPassword: string;
    passwordHint: string;
    saved: string;
    signOut: string;
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
    profile: string;
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
