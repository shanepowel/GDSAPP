import type { Copy } from '@/lib/copy';

/** Welsh strings for Datum copy. Human-authored; not machine-translated. */
export const copyCy: Copy = {
  product: {
    name: 'Datum',
    owner: 'Turner & Townsend',
    thesis: 'Y tîm yw’r cynllun cyflawni.',
    strapline:
      'Sut mae Turner & Townsend yn diffinio cyflawni da, yn mesur y gallu a ddelir yn ei erbyn, ac yn cydosod y sgwad a all wneud y gwaith.',
  },

  home: {
    eyebrow: 'Ymarfer cyflawni',
    headline: 'Y tîm yw’r cynllun cyflawni.',
    sub: 'Nid y dull, nid y calendr. Y bobl sy’n troi i fyny bob dydd. Mae Datum yn gosod beth yw ystyr cyflawni da yma, yn sgorio’r gallu a ddelir yn ei erbyn, ac yn cydosod y sgwad ar gyfer swydd benodol. Mae sgorio gallu Llywodraeth Ddigidol a Data a pharodrwydd safon gwasanaeth wedi’u adeiladu i mewn.',
    primaryCta: 'Cerdded y demo',
    secondaryCta: 'Darllen yr ymarfer',
    signIn: 'Mewngofnodi',

    claims: [
      {
        title: 'Diffinio da, yn gyhoeddus',
        body: 'Mae’r llyfr chwarae yn agored ac yn ddarllenadwy cyn i chi fewngofnodi. Pum piler, y seremonïau sy’n eu bwydo, a’r hyn y mae’n rhaid i bob un ei gynhyrchu. Dim byd yn cael ei sgorio nad yw’r ymarfer yn ei ofyn.',
        proof: 'Ymarfer',
      },
      {
        title: 'Cydosod y sgwad',
        body: 'Pob ymgeisydd wedi’i sgorio yn erbyn y rôl: sgiliau’r fframwaith gallu yn gyntaf, yna wedi’i addasu gan ddisgyblaeth cyflawni a dystiwyd. Un llinell datum ar 0.60 yn rhedeg trwy’r tabl cyfan fel y gellir darllen sgwad mewn un pas.',
        proof: 'Sgwadiau',
      },
      {
        title: 'Ei ddarllen trwy unrhyw safon',
        body: 'Yr un sgwad, wedi’i asesu yn erbyn y safon sy’n llywodraethu’r cleient. GDS, Safon Gwasanaeth Digidol Cymru, adolygiad porth, neu ddyletswyddau rheoli gwybodaeth ar raglen gyfalaf.',
        proof: 'Sicrwydd',
      },
    ],

    credibility: {
      title: 'Heb dystiolaeth nid yw’r un peth â gwael',
      body: 'Pan nad oes gennym dystiolaeth cyflawni am rywun, mae eu lluosydd yn aros yn union 1.00 a dywed y rhyngwyneb hynny. Mae absenoldeb tystiolaeth yn ganfyddiad am ein offeryniaeth, byth yn farn am berson. Nid oes neb yn cael ei sgorio i lawr am fwlch yn ein cofnodion ein hunain.',
    },

    reasoning: {
      title: 'Mae pob rhif yn agor',
      body: 'Nid yw unrhyw gyfansawdd yn ymddangos heb ei waith un rhyngweithiad i ffwrdd: pa sgiliau, ar ba lefel, yn erbyn yr hyn y mae’r rôl yn ei ofyn, a pha ddarnau o dystiolaeth cyflawni a’i symudodd. Mae panel sy’n gwthio’n ôl yn cael y rhesymeg, nid troednodyn.',
    },
  },

  nav: {
    practice: { label: 'Ymarfer', hint: 'beth yw cyflawni da' },
    people: { label: 'Pobl', hint: 'y gallu a ddelir' },
    squads: { label: 'Sgwadiau', hint: 'y tîm ar gyfer y swydd hon' },
    assurance: { label: 'Sicrwydd', hint: 'parodrwydd yn erbyn safonau' },
    portfolio: { label: 'Portffolio', hint: 'ar draws ymgysylltiadau' },
  },

  context: {
    engagement: 'Ymgysylltiad',
    phase: 'Cyfnod',
    standards: 'Safonau a gymhwyswyd',
    maturity: 'Aeddfedrwydd',
    changeEngagement: 'Newid ymgysylltiad',
  },

  bands: {
    strong: 'Neilltuo heb gymhwyster.',
    viable: 'Neilltuo, a nodi’r angen datblygu.',
    stretch: 'Neilltuo dim ond gyda rheswm datganedig a chynllun cymorth.',
    gap: 'Peidio neilltuo. Mae hyn yn codi bwlch gallu.',
  },

  gaps: {
    skills_gap: 'Nid yw’r gallu yn cael ei ddal ar y lefel y mae’r rôl hon ei hangen.',
    rigour_gap: 'Mae’r sgiliau yma. Nid yw’r ddisgyblaeth cyflawni wedi’i thystio.',
    capacity_gap: 'Mae’r person cywir ar gael mewn egwyddor ond nid yn ymarferol.',
  },

  empty: {
    noSquad: 'Dim sgwad wedi’i gydosod eto. Dewiswch archetype i sgorio’r pwll yn ei erbyn.',
    noPeople: 'Dim pobl yn y pwll. Mewnforiwch o CSV y fframwaith gallu neu ychwanegwch rywun.',
    noSignals:
      'Dim tystiolaeth cyflawni wedi’i chofnodi ar gyfer y person hwn. Mae eu lluosydd yn aros ar 1.00. Cysylltwch ffynhonnell neilltuo i ddeillio signalau daliadaeth a chapasiti yn awtomatig.',
    noGaps: 'Mae pob rôl wedi’i llenwi uwchben y datum. Dim byd yn aros ar gyfer yr archetype hwn.',
    noEngagements: 'Dim ymgysylltiadau eto. Crëwch un i gydosod sgwad.',
  },

  errors: {
    scoreStale:
      'Cyfrifwyd y ffigurau hyn cyn y newid diwethaf i sgiliau neu neilltuadau. Ailgyfrifwch i adnewyddu.',
    frameworkDrift:
      'Mae’r archetype hwn yn cyfeirio at sgil sydd wedi’i ailenwi yn y fframwaith gallu. Mae’r ffigur yn dal i ddatrys yn erbyn y fersiwn y cafodd ei gyfrifo arni.',
  },

  practice: {
    pillarsTitle: 'Beth yw ystyr cyflawni da yma',
    pillarsLede:
      'Pum piler, un model gweithredu. Mae pob ffigur yn Datum yn olrhain i rywbeth ar y rhestr hon. Dim byd yn cael ei fesur nad yw’r ymarfer yn ei ofyn.',
    ceremoniesTitle: 'Seremonïau, a’r hyn y mae’n rhaid i bob un ei allyrru',
    ceremoniesLede:
      'Nid yw seremoni yn goroesi oni bai ei bod yn cynhyrchu rhywbeth y mae’r sgwad yn ei ddefnyddio wythnos nesaf neu sicrwydd yn ei ofyn yn ddiweddarach. Mae popeth isod yn bwydo ffigur.',
    maturityTitle: 'Lle mae ymarfer cyflawni yn cyrraedd',
    standardsTitle: 'Diffiniadau o barod a gwneud',
    standardsLede:
      'Mae diffiniadau estynedig o barod a gwneud yn cario meini prawf statudol a sicrwydd i’r tocyn, fel bod adolygiad porth yn gydosod, nid awduraeth.',
    keelTitle: 'The Keel',
    keelLede:
      'Mae parhad yn reolaeth sicrwydd. Mae rolau craidd yn aros am gyfnod cyflawn ar 0.8 FTE neu uwch. Mae capasiti yn rhannu 70 / 20 / 10: ymrwymedig, dewisol, llac.',
  },

  people: {
    eyebrow: 'Pobl',
    title: 'Y gallu a ddelir mewn gwirionedd',
    lede: 'Sgiliau, argaeledd a thrymder a dystiwyd i bawb yn y pwll. Dyma olwg dylunio’r sefydliad: yr hyn y gall y sefydliad ei faesu, cyn i unrhyw ymgysylltiad ofyn amdano.',
    viewAsGraph: 'Gweld fel graff',
    viewAsTable: 'Gweld fel tabl',
    pool: 'Y pwll',
    free: 'Rhydd',
    tenure: 'Daliadaeth',
    rigour: 'Tystiolaeth trymder',
    strongestFit: 'Ffit gryfaf',
    unevidenced: 'Heb dystiolaeth',
    peopleInPool: 'Pobl yn y pwll',
    unallocated: 'FTE heb ei neilltuo',
    unevidencedCount: 'Heb dystiolaeth',
    graphHint:
      'Mae’r graff yn olwg benodol ar siâp y sefydliad. Y llwybr diofyn yw’r tabl.',
  },

  squads: {
    eyebrow: 'Sgwadiau',
    title: 'Rolau a’r ffit orau sydd ar gael',
    lede:
      'Mae pob ymgeisydd yn cael ei sgorio ar sgiliau’r fframwaith gallu, yna ei addasu gan drymder cyflawni a dystiwyd. Y llinell fertigol yw’r datum: 0.60, y pwynt isod nad yw rôl wedi’i llenwi’n ddiogel.',
    role: 'Rôl',
    criticality: 'Critigolrwydd',
    bestCandidate: 'Ymgeisydd gorau',
    fitAgainstDatum: 'Ffit yn erbyn y datum',
    composite: 'Cyfansawdd',
    capacityFlag: 'capasiti',
    selectHint: 'Dewiswch unrhyw rôl i weld pob ymgeisydd a’r rhesymeg y tu ôl i bob ffigur.',
    gapsTitle: 'Yr hyn na all y sgwad hwn ei orchuddio eto',
    finding: 'Canfyddiad',
    recommendation: 'Cam',
    standardAtRisk: 'Safon mewn perygl',
    compute: 'Ailgyfrifo ffit',
    archetype: 'Archetype',
  },

  assurance: {
    eyebrow: 'Sicrwydd',
    title: 'Parodrwydd yn erbyn y safonau sy’n gymwys',
    lede:
      'Yr un sgwad, wedi’i ddarllen trwy ba bynnag safon sy’n llywodraethu’r cleient. Mae pwyntiau mewn perygl sy’n olrhain i rôl islaw’r datum yn cau trwy neilltuo yn hytrach nag trwy ddadl.',
    point: 'Pwynt',
    requirement: 'Gofyniad',
    status: 'Statws',
    why: 'Pam',
    preparedness: 'Mynegai Parodrwydd',
    pointsAtRisk: 'Pwyntiau mewn perygl',
  },

  portfolio: {
    eyebrow: 'Portffolio',
    title: 'Ar draws pob ymgysylltiad',
    lede:
      'Lle mae gallu yn denau, lle mae tystiolaeth ar goll, a pha byrth sydd wedi’u datgelu. Y crynhoad y mae cyfarwyddwr cyflawni yn ei gymryd i adolygiad misol.',
    engagements: 'Ymgysylltiadau',
    nextGate: 'Porth nesaf',
    rolesBelowDatum: 'Rolau islaw’r datum',
    maturity: 'Aeddfedrwydd',
  },

  tour: {
    step: 'Cam {current} o {total}',
    back: 'Yn ôl',
    next: 'Nesaf',
    dismiss: 'Cau',
    steps: [
      {
        view: 'practice',
        href: '/',
        text: 'Dechreuwch gyda’r ymarfer, nid y cynnyrch. Mae Datum yn mesur yn erbyn un diffiniad cyhoeddedig o gyflawni da, felly mae gan bob ffigur yn ddiweddarach rywbeth i fod yn ffigur ohono.',
      },
      {
        view: 'people',
        href: '/people',
        text: 'Dyma allu gwirioneddol y sefydliad: pwy a ddelir, faint ohonynt sy’n rhydd, a’r hyn y gallwn ei dystio am sut maent yn cyflawni.',
      },
      {
        view: 'squads',
        href: '/squads',
        text: 'Nawr y swydd. Rolau o’r archetype, pob ymgeisydd wedi’i sgorio, a llinell y datum ar 0.60 yn rhedeg trwy’r golofn gyfan fel y gallwch ei darllen mewn un pas.',
      },
      {
        view: 'squads-reason',
        href: '/squads?tour=4',
        text: 'Dewiswch unrhyw rôl i agor y rhesymeg. Daw sgiliau o Fframwaith Gallu Proffesiwn Digidol a Data y Llywodraeth. Daw’r braced trymder o ddisgyblaeth cyflawni a dystiwyd. Mae llinell doredig yn golygu heb dystiolaeth, nad yw byth yr un peth â gwael.',
      },
      {
        view: 'assurance',
        href: '/assurance',
        text: 'Yr un sgwad, wedi’i ddarllen trwy safon y cleient. Mae pwyntiau mewn perygl sy’n olrhain i rôl islaw’r datum yn cau trwy neilltuo yn hytrach nag trwy ddadl.',
      },
      {
        view: 'portfolio',
        href: '/portfolio',
        text: 'Ac ar draws llyfr y gwaith: lle mae gallu yn denau, pa byrth sydd wedi’u datgelu, a beth i’w recriwtio.',
      },
    ],
  },

  footer: {
    disclaimer:
      'Adeilad arddangos gan ddefnyddio Fframwaith Gallu Proffesiwn Digidol a Data y Llywodraeth, wedi’i gyhoeddi o dan Drwydded Llywodraeth Agored. Offeryn cynghorol. Nid penderfyniad swyddi.',
    demonstration: 'Adeilad arddangos',
    representative: 'Data cynrychioladol yn unig',
  },

  legend: {
    held: 'sgil wedi’i ddal ar y lefel ofynnol',
    partial: 'wedi’i ddal islaw’r lefel ofynnol',
    datum: 'datum, hyfywedd ar 0.60',
    bracket: 'braced trymder, llinell doredig pan nad oes tystiolaeth',
  },
};
