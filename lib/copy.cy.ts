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
        seeIn: 'Gweld yn Ymarfer',
      },
      {
        title: 'Gweld y sefydliad, yna ei newid',
        body: 'Cylchoedd, rolau a’r bobl sy’n eu dal, wedi’u tynnu o’r dyluniad byw. Mae templedi, senarios a swyddi gwag ar yr un olwg, fel bod ailgynllunio yn symudiad gweledol yn hytrach nag sleid.',
        seeIn: 'Gweld yn Pobl',
      },
      {
        title: 'Cydosod y sgwad',
        body: 'Pob ymgeisydd wedi’i sgorio yn erbyn y rôl: sgiliau’r fframwaith gallu yn gyntaf, yna wedi’i addasu gan ddisgyblaeth cyflawni a dystiwyd. Un llinell datum ar 0.60 yn rhedeg trwy’r tabl cyfan fel y gellir darllen sgwad mewn un pas.',
        seeIn: 'Gweld yn Sgwadiau',
      },
      {
        title: 'Ei ddarllen trwy unrhyw safon',
        body: 'Yr un sgwad, wedi’i asesu yn erbyn y safon sy’n llywodraethu’r cleient. GDS, Safon Gwasanaeth Digidol Cymru, adolygiad porth, neu ddyletswyddau rheoli gwybodaeth ar raglen gyfalaf.',
        seeIn: 'Gweld yn Sicrwydd',
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
    roles: { label: 'Rolau', hint: 'pwy sy’n gwneud beth, yn glir' },
    people: { label: 'Pobl', hint: 'y gallu a ddelir' },
    squads: { label: 'Cydosod sgwad', hint: 'y tîm ar gyfer y swydd hon' },
    assurance: { label: 'Sicrwydd', hint: 'parodrwydd yn erbyn safonau' },
    portfolio: { label: 'Portffolio', hint: 'ar draws ymgysylltiadau' },
  },

  context: {
    engagement: 'Ymgysylltiad',
    phase: 'Cyfnod',
    standards: 'Safonau a gymhwyswyd',
    maturity: 'Aeddfedrwydd',
    changeEngagement: 'Newid ymgysylltiad',
    maturityValue: 'Lefel {level} · {name}',
  },

  verdicts: {
    met: 'Wedi’i gyrraedd',
    atRisk: 'Mewn perygl',
    notMet: 'Heb ei gyrraedd',
    notAssessed: 'Heb ei asesu',
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
    noSquad: 'Dim sgwad wedi’i gydosod eto.',
    noSquadWhy:
      'Dewiswch archetype a chyfrifwch ffit i sgorio’r pwll yn erbyn y rolau y mae’r swydd hon eu hangen.',
    noPeople: 'Dim pobl yn y pwll.',
    noPeopleWhy:
      'Y pwll yw’r hyn y gall y sefydliad ei faesu. Ychwanegwch bobl ar ymgysylltiad, neu fewnforiwch o’r fframwaith gallu.',
    noSignals:
      'Dim byd wedi’i gofnodi ar gyfer y person hwn. Mae eu lluosydd yn aros ar 1.00. Cysylltwch ffynhonnell neilltuo i ddeillio signalau daliadaeth a chapasiti yn awtomatig.',
    noGaps: 'Mae pob rôl wedi’i llenwi uwchben y datum. Dim byd yn aros ar gyfer yr archetype hwn.',
    noEngagements: 'Dim ymgysylltiadau eto.',
    noEngagementsWhy:
      'Ymgysylltiad yw’r swydd. Crëwch un i gydosod sgwad a’i ddarllen trwy’r safon sy’n llywodraethu’r gwaith.',
    noScores: 'Dim sgoriau ffit eto.',
    noScoresWhy: 'Dewiswch archetype a chyfrifwch ffit i weld pob rôl yn erbyn y datum.',
    noArchetypes: 'Dim siapiau sgwad yn y llyfrgell eto.',
    noArchetypesWhy:
      'Mae siapiau tîm sy’n gweithio yn byw yn y llyfrgell archetype. Hadwch nhw, neu cloniwch un yn y gosodiadau, yna dewch yn ôl i gydosod sgwad.',
    noAnalysis: 'Heb ei asesu eto.',
    noAnalysisWhy:
      'Rhedegwch yr asesiad i ddarllen y sgwad hwn trwy’r safon sy’n llywodraethu’r ymgysylltiad.',
  },

  errors: {
    scoreStale:
      'Cyfrifwyd y ffigurau hyn cyn y newid diwethaf i sgiliau neu neilltuadau. Ailgyfrifwch i adnewyddu.',
    frameworkDrift:
      'Mae’r archetype hwn yn cyfeirio at sgil sydd wedi’i ailenwi yn y fframwaith gallu. Mae’r ffigur yn dal i ddatrys yn erbyn y fersiwn y cafodd ei gyfrifo arni.',
  },

  practice: {
    looksLikeTitle: 'Sut olwg sydd ar gyflawni da yma',
    looksLikeLede:
      'Darllenwch hyn yn gyntaf. Mae popeth y mae Datum yn ei fesur yn cael ei fesur yn erbyn yr hyn sydd ar y dudalen hon, felly nid yw ffigur yn golygu dim nes i chi weld beth yw ffigur ohono.',
    pillarsTitle: 'Y pum piler',
    pillarsLede:
      'Pum piler, un model gweithredu. Mae pob ffigur yn Datum yn olrhain i rywbeth ar y rhestr hon. Dim byd yn cael ei fesur nad yw’r ymarfer yn ei ofyn.',
    capacityTitle: 'Faint o wythnos person sydd wir yn rhydd',
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
    pillar: 'Piler',
    owns: 'Yn berchen',
    produces: 'Beth mae’n ei gynhyrchu i sicrwydd',
    ceremony: 'Seremoni',
    cadence: 'Cadens',
    emits: 'Yn allyrru',
    signal: 'Signal',
    youAreHere: 'dyma chi',
    readyTitle: 'Diffiniad o barod',
    doneTitle: 'Diffiniad o wneud',
    keelNumbers: 'Isafswm rôl graidd {fte} FTE · capasiti {split}',
  },

  people: {
    eyebrow: 'Pobl',
    title: 'Y gallu a ddelir mewn gwirionedd',
    lede: 'Y strwythur byw yn gyntaf: cylchoedd, rolau a phwy sy’n eu dal. Newidiwch y dyluniad yma. Y pwll isod yw’r hyn y gall y sefydliad ei faesu cyn i unrhyw ymgysylltiad ofyn amdano.',
    viewAsGraph: 'Gweld fel graff',
    viewAsTable: 'Gweld fel tabl',
    pool: 'Y pwll',
    person: 'Person',
    free: 'Rhydd',
    available: 'ar gael',
    tenure: 'Daliadaeth',
    rigour: 'Tystiolaeth cyflawni',
    skills: 'Sgiliau',
    strongestFit: 'Ffit gryfaf',
    unevidenced: 'Dim byd wedi’i gofnodi',
    peopleInPool: 'Pobl yn y pwll',
    unallocated: 'FTE heb ei neilltuo',
    unevidencedCount: 'Dim byd wedi’i gofnodi',
    dataGap: 'Bwlch yn ein data ni, nid eu methiant nhw',
    stayingPower: 'Gallu aros',
    stable: 'sefydlog',
    settling: 'yn setlo',
    fragmented: 'darniog',
    graphHint:
      'Y sefydliad ar waith. Mae tabl, templedi a senarios ar yr un olwg Pobl.',
    openPerson: 'Agor y person',
    noSkills: 'Dim sgiliau wedi’u cofnodi.',
    skillsHeld: 'Sgiliau a ddelir',
    assignments: 'Neilltuadau',
    rigourSignals: 'Yr hyn yr ydym wedi’i weld yn cael ei wneud',
    noAssignments: 'Dim neilltuadau.',
    fteHeld: '{fte} FTE',
    assignmentCount: '{count} neilltuad',
    personLede: '{fte} FTE · {count} neilltuad',
  },

  squads: {
    eyebrow: 'Sgwadiau',
    title: 'Rolau a’r ffit orau sydd ar gael',
    indexTitle: 'Sgwadiau',
    indexLede:
      'Cydosodwch y tîm ar gyfer swydd benodol. Mae pob rôl yn cael ei sgorio yn erbyn y datum ar 0.60.',
    lede:
      'Mae pob ymgeisydd yn cael ei sgorio ar sgiliau’r fframwaith gallu, yna ei addasu gan drymder cyflawni a dystiwyd. Y llinell fertigol yw’r datum: 0.60, y pwynt isod nad yw rôl wedi’i llenwi’n ddiogel.',
    role: 'Rôl',
    criticality: 'Critigolrwydd',
    bestCandidate: 'Ymgeisydd gorau',
    fitAgainstDatum: 'Ffit yn erbyn y datum',
    composite: 'Cyfansawdd',
    capacityFlag: 'dim digon o amser rhydd',
    criticalityLabels: {
      core: 'ni all redeg hebddo',
      supporting: 'yn gwanhau cyflawni',
      optional: 'da i’w gael',
    },
    selectHint: 'Agorwch rôl i weld y gwaith. Mae pob ymgeisydd un clic ymhellach.',
    gapsTitle: 'Yr hyn na all y sgwad hwn ei orchuddio eto',
    finding: 'Canfyddiad',
    move: 'Cam',
    standardAtRisk: 'Safon mewn perygl',
    moves: {
      upskill: 'Datblygu',
      second: 'Secondio',
      recruit: 'Recriwtio',
      rescope: 'Ail-gwmpasu',
    },
    roleEyebrow: 'Rôl yr archetype',
    rankedCandidates: 'Pob ymgeisydd, wedi’i raddio',
    candidateMeta: 'sgil {skill} · trymder ×{rigour}',
    compute: 'Ailgyfrifo ffit',
    archetype: 'Siâp sgwad',
    chooseArchetype: 'Dewiswch siâp sgwad',
    loadingArchetypes: 'Yn llwytho siapiau sgwad…',
    phase: 'Cyfnod',
    standard: 'Safon',
    standardWales: 'Safon Gwasanaeth Digidol Cymru',
    standardGds: 'Safon Gwasanaeth GDS',
    confirmProposal: 'Cadarnhau cynnig',
    allCandidates: 'Pob ymgeisydd',
    unfilled: 'Heb lenwi',
    recruit: 'Recriwtio',
    bestAvailable: 'gorau sydd ar gael {score}',
  },

  assurance: {
    eyebrow: 'Sicrwydd',
    title: 'A fydd y tîm hwn yn pasio',
    lede:
      'Yr un sgwad, wedi’i ddarllen yn erbyn y safon sy’n llywodraethu’r cleient. Mae’r rhan fwyaf o’r hyn sydd mewn perygl yma yn broblem tîm yn gwisgo gwisg safonau.',
    indexLede:
      'Dewiswch ymgysylltiad i ddarllen ei sgwad trwy’r safon sy’n llywodraethu’r gwaith.',
    point: 'Pwynt',
    requirement: 'Gofyniad',
    status: 'Statws',
    why: 'Pam',
    preparedness: 'Parodrwydd',
    pointsAtRisk: 'Pwyntiau mewn perygl',
    inThisPhase: 'Yn y cyfnod hwn',
    openAssess: 'Agor asesu',
  },

  portfolio: {
    eyebrow: 'Portffolio',
    title: 'Ar draws pob ymgysylltiad',
    lede: 'Lle rydym yn denau, pa byrth sydd wedi’u datgelu, a beth i’w recriwtio nesaf.',
    engagements: 'Ymgysylltiadau',
    nextGate: 'Porth nesaf',
    rolesBelowDatum: 'Rolau islaw’r datum',
    maturity: 'Aeddfedrwydd',
    meanPreparedness: 'Parodrwydd cymedrig',
    meanRigour: 'Trymder cymedrig',
    openGaps: 'Bylchau agored',
    withAnalysis: '{count} gydag asesiad',
    acrossAnalysed: 'ar draws ymgysylltiadau a aseswyd',
    deliveryDiscipline: 'disgyblaeth cyflawni',
    statutoryCount: '{count} statudol',
  },

  tour: {
    region: 'Taith dywys',
    step: 'Cam {current} o {total}',
    back: 'Yn ôl',
    next: 'Nesaf',
    dismiss: 'Cau',
    steps: [
      {
        view: 'practice',
        href: '/',
        text: 'Dechreuwch gyda beth yw ystyr cyflawni da, oherwydd nid yw sgôr yn golygu dim nes i chi wybod beth y mae’n ei sgorio. Y llun cyntaf yw’r ddadl gyfan: tîm sy’n dal pob sgil sydd ei angen ac sy’n gallu penderfynu drosto’i hun, yn erbyn pum person ar fenthyg na allant.',
      },
      {
        view: 'practice-clocks',
        href: '/?tour=2',
        text: 'Dau gloc. Mae’r tîm yn gweithio bob pythefnos. Mae llywodraethu yn gweithio mewn pyrth. Maent yn cwrdd ar ddiwedd cyfnod ac yn aros allan o ffordd ei gilydd yn y cyfamser. Camu hyn yn anghywir yw’r camgymeriad drutaf ar y dudalen.',
      },
      {
        view: 'roles',
        href: '/roles',
        text: 'Nawr y rolau, yn Gymraeg clir. Darllenwch y drydedd linell ar bob cerdyn. Mae bron pob methiant briffio yn dod o gymysgu dylunydd gwasanaeth â dylunydd gweledol, neu reolwr cyflawni â rheolwr prosiect.',
      },
      {
        view: 'people',
        href: '/people',
        text: 'Pwy rydym yn eu dal. Mae dwy beth gwahanol yn bwysig: faint o rywun sy’n rhydd, ac a ydynt yn tueddu i aros. Mae rhywun nad yw erioed wedi para cyfnod llawn yn cyrraedd heb gyd-destun ac yn gadael cyn y gall egluro dim.',
      },
      {
        view: 'squads',
        href: '/squads',
        text: 'Nawr cydosodwch un. Saith rôl, gwag. Llenwch nhw o’r rôl yn hytrach nag o bwy bynnag sy’n rhydd. Dyna’r gwahaniaeth rhwng tîm a grŵp o bobl sydd ar gael.',
      },
      {
        view: 'squads-weak',
        href: '/squads?tour=6',
        text: 'Tair rôl wedi’u llenwi. Gwyliwch y siâp yn newid: maint y cylch yw faint o berson y mae’r rôl ei angen, llinell doredig yw gwag, ambr yw wedi’i llenwi ond islaw’r datum. Mae wedi’i llenwi-ond-wan yn edrych wedi’i ddatrys, sy’n ei wneud yn fwy peryglus na sedd wag.',
      },
      {
        view: 'squads-unevidenced',
        href: '/squads?tour=7',
        text: 'Nid oes gan Carys dystiolaeth cyflawni wedi’i chofnodi o gwbl, felly mae ei braced yn doredig a’i lluosydd yn aros yn union 1.00. Bwlch yn ein cofnodion yw hynny, byth yn farc yn ei herbyn. Dwedwch hyn yn uchel mewn ystafell cleient; dyma’r peth y mae amheuwyr yn ei brofi gyntaf.',
      },
      {
        view: 'assurance',
        href: '/assurance',
        text: 'O’r diwedd, beth mae hyn yn ei olygu i’r asesiad. Pwyntiau mewn perygl sy’n cau trwy newid pwy sydd ar y tîm yn hytrach nag trwy newid unrhyw broses. Hygyrchedd yw’r un sydd angen recriwtio.',
      },
    ],
  },

  teach: {
    toggle: 'Egluro wrth i mi fynd',
    practiceIdea: {
      tag: 'Dechrau yma',
      title: 'Yr un syniad o dan y cyfan',
      body: [
        'Nid grŵp o arbenigwyr wedi’u benthyg o adrannau a’u pwyntio at swydd yw tîm cyflawni. Mae’n grŵp bach, sefydlog sy’n dal pob sgil y mae’r broblem ei hangen, ac y caniateir iddo benderfynu sut i’w datrys.',
        'Mae prawf syml. A all y tîm hwn roi rhywbeth o flaen defnyddwyr go iawn yr wythnos hon heb ofyn caniatâd i neb y tu allan iddo? Os mai na yw’r ateb, nid yw’r tîm wedi’i rymuso, ac ni fydd unrhyw faint o stand-ups, sbrintiau na siartiau yn newid hynny.',
      ],
    },
    twoClocks: {
      tag: 'Pam mae’n bwysig',
      title: 'Beth sy’n mynd o’i le pan fydd y ddau gloc yn cymysgu',
      body: [
        'Gwasgwch nhw at ei gilydd a chewch un o ddau fethiant. Naill ai mae’r tîm yn adeiladu’r hyn y mae’r porth ei eisiau yn hytrach na’r hyn y mae defnyddwyr ei angen, ac yn methu ei asesiad gwasanaeth. Neu mae’r tîm yn stopio symud tra’n aros am lywodraethu, ac yn llosgi traean o’r gyllideb ar ddim.',
      ],
    },
    capacityCaution: {
      tag: 'Rhybudd',
      title: 'Lle mae hyn yn mynd o’i le yn y marfer',
      body: [
        'Y band 20% yw’r peth cyntaf i gael ei dorri pan fydd dyddiad dan bwysau. Dyma hefyd y band sy’n cynhyrchu bron popeth y mae adolygiad sicrwydd yn ei ofyn. Mae ei dorri yn teimlo’n rhad ym mis un ac yn ddrud wrth y porth.',
      ],
    },
    rolesHowToRead: {
      tag: 'Sut i ddarllen y rhain',
      title: 'Y drydedd linell yw’r un ddefnyddiol',
      body: [
        'Gall y rhan fwyaf o bobl ddyfalu’n fras beth mae rôl yn ei wneud. Mae’r camgymeriadau yn dod o’r llinell “yn cael ei chymryd yn gyffredin am”. Os ydych yn briffio dylunydd gwasanaeth gan ddisgwyl dylunydd gweledol, neu reolwr cyflawni gan ddisgwyl rheolwr prosiect, cewch y gwaith anghywir a bydd yn cymryd mis i sylwi.',
      ],
    },
    peopleLookingAt: {
      tag: 'Beth rydych yn edrych arno',
      title: 'Mae amser rhydd a gallu aros yn bethau gwahanol',
      body: [
        'Nid yw rhywun yn rhydd yn eu gwneud yn ychwanegiad da. Bydd person nad yw erioed wedi aros gydag un ymgysylltiad am gyfnod llawn yn gyflym i’w neilltuo ac yn araf i helpu, oherwydd maent yn cyrraedd heb y cyd-destun ac yn gadael cyn y gallant egluro dim i adolygydd.',
        'Dyna beth yw gallu aros. Nid beirniadaeth o’r person yw darniog. Mae fel arfer yn ddisgrifiad o sut rydym wedi bod yn eu neilltuo.',
      ],
    },
    whatYouAreDoing: {
      tag: 'Beth rydych yn ei wneud',
      title: 'Llenwi rolau, nid archebu pobl',
      body: [
        'Dechreuwch o’r rôl a gofynnwch pwy sy’n ffitio, yn hytrach na dechrau o bwy sy’n rhydd. Mae’r ddau ddull hynny yn cynhyrchu timau gwahanol iawn, a’r ail yw sut mae sefydliadau yn gorffen gyda sgwad o bwy bynnag a orffennodd rywbeth yr wythnos diwethaf.',
        'Y rhif wrth ymyl pob person yw ffit rhwng 0 ac 1. Y llinell fertigol ar 0.60 yw’r datum: islaw hynny, nid yw’r rôl wedi’i llenwi’n ddiogel, beth bynnag yw teitl swydd y person.',
      ],
    },
    assessment: {
      tag: 'Beth yw asesiad mewn gwirionedd',
      title: 'Panel yn gofyn i dîm egluro ei hun',
      body: [
        'Nid adolygiad dogfen yw asesiad gwasanaeth. Mae’n dri neu bedwar o bobl brofiadol yn treulio hanner diwrnod gyda’r tîm, yn gofyn sut y gwnaed penderfyniadau a phwy a’u gwnaeth. Mae timau yn methu nid oherwydd bod y gwasanaeth yn wael ond oherwydd na all neb yn yr ystafell egluro pam ei fod fel y mae.',
        'Dyna pam mae’r person a oedd yno am y cyfnod cyfan yn bwysicach na’r person â’r CV gorau.',
      ],
    },
    portfolioUse: {
      tag: 'Sut i ddefnyddio’r dudalen hon',
      title: 'Recriwtiwch yn erbyn y patrwm, nid yr argyfwng',
      body: [
        'Mae un ymgysylltiad yn brin o ymchwilydd yn broblem staffio. Mae pedwar ymgysylltiad yn brin o’r un rôl yn broblem gallu, ac ni fydd llogi un contractwr ar gyfer yr ymgysylltiad mwyaf swnllyd yn cyffwrdd â hi. Mae’r dudalen hon yma i wahaniaethu rhwng y ddau sefyllfa hynny.',
      ],
    },
    nothingRecorded:
      'Dim byd wedi’i gofnodi. Nid ydym yn dal tystiolaeth cyflawni am y person hwn, felly mae eu lluosydd yn aros yn union 1.00 a’u ffigur yw sgiliau yn unig. Bwlch yn ein cofnodion ein hunain yw hyn. Ni chaiff byth ei drin fel marc yn eu herbyn.',
    derived: 'o’n cofnodion',
    asserted: 'wedi’i gofnodi gan berson',
  },

  roles: {
    eyebrow: 'Rolau',
    title: 'Pwy sy’n gwneud beth, yn Gymraeg clir',
    lede: 'Naw rôl y byddwch yn eu gweld ar draws ein sgwadiau. Mae pob cerdyn yn dweud beth yw’r rôl, beth sy’n mynd o’i le hebddi, a beth y cymerir hi’n gyffredin amdani. Dim jargon a dim acronymau.',
    withoutLabel: 'Heb un',
    mistakenLabel: 'Yn cael ei chymryd yn gyffredin am',
    discoveryTitle: 'Pa rolau y mae darganfod eu hangen',
    colRole: 'Rôl',
    colHowMuch: 'Faint',
    colEssential: 'Pa mor hanfodol',
    colIfLeftOut: 'Os byddwch yn ei hepgor',
    cards: [
      {
        id: 'dm',
        title: 'Rheolwr cyflawni',
        group: 'Cynnyrch a chyflawni',
        what: 'Yn clirio’r llwybr fel y gall y tîm weithio. Yn tynnu rhwystrau, yn dadwneud cymeradwyaethau, yn erlid y penderfyniad sy’n dal pawb yn ôl.',
        without: 'Mae’r tîm yn treulio’i wythnos yn aros: am fynediad, am benderfyniad, i rywun ateb. Mae cynnydd yn edrych yn araf ac ni all neb ddweud pam.',
        not: 'Nid tasgfeistr ac nid rheolwr prosiect. Mae’r tîm yn penderfynu sut y caiff y gwaith ei wneud. Mae’r rheolwr cyflawni yn tynnu beth bynnag sy’n eu stopio.',
      },
      {
        id: 'pm',
        title: 'Rheolwr cynnyrch',
        group: 'Cynnyrch a chyflawni',
        what: 'Yn penderfynu beth sy’n cael ei adeiladu a pham, ac yn dweud na wrth y gweddill. Yn berchen ar a oedd y peth yn werth ei wneud.',
        without: 'Mae popeth yn flaenoriaeth, felly nid oes dim. Mae’r tîm yn adeiladu pwy bynnag a weiddiodd uchaf, ac mae’r gwasanaeth yn gwneud sawl swydd yn wael.',
        not: 'Nid y person sy’n ysgrifennu’r gofynion a’u trosglwyddo. Maent yn gosod y broblem a’r tîm yn gweithio allan yr ateb.',
      },
      {
        id: 'ur',
        title: 'Ymchwilydd defnyddwyr',
        group: 'Dylunio sy’n canolbwyntio ar y defnyddiwr',
        what: 'Yn darganfod beth sydd ei angen ar bobl mewn gwirionedd trwy wylio nhw’n ceisio gwneud y peth, yn hytrach na gofyn beth maent ei eisiau.',
        without: 'Rydych yn adeiladu’r hyn y mae’r sefydliad yn ei dybio. Mae paneli asesiad yn gweld hyn mewn munudau, ac felly hefyd defnyddwyr, yn ddrutach.',
        not: 'Nid awdur arolwg ac nid ymchwil marchnad. Dyma arsylwi pobl go iawn yn ceisio tasgau go iawn.',
      },
      {
        id: 'sd',
        title: 'Dylunydd gwasanaeth',
        group: 'Dylunio sy’n canolbwyntio ar y defnyddiwr',
        what: 'Yn dylunio’r daith gyfan o’r dechrau i’r diwedd, gan gynnwys y rhannau nad ydynt yn sgrin: y llythyr, y galwad ffôn, yr ymweliad swyddfa.',
        without: 'Cewch wefan dda wedi’i bolltio ar broses dorri. Mae’r darn digidol yn gweithio a’r gwasanaeth yn dal i fethu.',
        not: 'Nid dylunydd gweledol. Ychydig iawn o’r swydd hon yw sut olwg sydd ar rywbeth.',
      },
      {
        id: 'cd',
        title: 'Dylunydd cynnwys',
        group: 'Dylunio sy’n canolbwyntio ar y defnyddiwr',
        what: 'Yn ysgrifennu’r hyn y mae pobl yn ei ddarllen, ac yn penderfynu’r drefn y maent yn ei ddarllen. Mewn gwasanaeth cyhoeddus, y geiriau yw’r gwasanaeth i raddau helaeth.',
        without: 'Ni all defnyddwyr gwblhau’r dasg hyd yn oed pan fydd y dechnoleg yn gweithio. Yng Nghymru mae hyn hefyd yn torri dyletswyddau iaith statudol.',
        not: 'Nid copiwr ac nid marchnata. Yn nes at gyfieithydd rhwng llywodraeth a phawb arall.',
      },
      {
        id: 'ta',
        title: 'Pensaer technegol',
        group: 'Pensaernïaeth',
        what: 'Yn gwneud y penderfyniadau technegol mawr ac yn ysgrifennu pam, fel nad yw’r tîm nesaf yn dyfalu ymhen dwy flynedd.',
        without: 'Mae penderfyniadau yn cael eu gwneud ar ddamwain, gan bwy bynnag oedd ar y tocyn. Ni all neb egluro siâp y system i adolygiad porth.',
        not: 'Nid y person sy’n tynnu diagram ac yn gadael. Maent yn aros gyda’r tîm a’r penderfyniadau yn brofadwy.',
      },
      {
        id: 'ba',
        title: 'Dadansoddwr busnes',
        group: 'Cynnyrch a chyflawni',
        what: 'Yn mapio sut y gwneir y gwaith heddiw, gan gynnwys y taenlenni a’r ffyrdd o gwmpas nad yw neb yn eu cyfaddef.',
        without: 'Mae’r gwasanaeth newydd wedi’i ddylunio ar gyfer y broses ar bapur yn hytrach na’r un y mae pobl yn ei rhedeg mewn gwirionedd.',
        not: 'Nid casglwr gofynion. Dealltwriaeth yw’r swydd, nid trawsgrifio.',
      },
      {
        id: 'pa',
        title: 'Dadansoddwr perfformiad',
        group: 'Data',
        what: 'Yn penderfynu sut olwg sydd ar lwyddiant mewn rhifau, cyn i ddim gael ei adeiladu, ac yna’n mesur a ddigwyddodd.',
        without: 'Ni allwch ddweud a weithiodd y gwasanaeth. Mae buddion a hawliwyd yn yr achos busnes yn aros heb eu profi.',
        not: 'Nid swyddogaeth adrodd. Os ydynt yn cyrraedd ar ôl lansio, cyrhaeddon nhw’n rhy hwyr i ddiffinio’r llinell sylfaen.',
      },
      {
        id: 'as',
        title: 'Arbenigwr hygyrchedd',
        group: 'Dylunio sy’n canolbwyntio ar y defnyddiwr',
        what: 'Yn sicrhau bod y gwasanaeth yn gweithio i bobl sy’n defnyddio darllenwyr sgrin, chwyddo, rheolaeth llais, neu ddim llygoden.',
        without: 'Mae rhwymedigaeth gyfreithiol yn cael ei cholli a thua un o bob pump defnyddiwr yn cael ei eithrio. Dyma’r methiant asesiad mwyaf cyffredin.',
        not: 'Nid rhestr wirio ar y diwedd. Mae ôl-osod hygyrchedd yn costio sawl gwaith yr hyn y mae ei adeiladu i mewn yn ei gostio.',
      },
    ],
  },

  figures: {
    label: 'Ffigur {n}.',
    empowered:
      'Yr un pum person, wedi’u trefnu dwy ffordd. Ar y chwith maent yn un tîm gydag un broblem a’r awdurdod i benderfynu. Ar y dde maent yn bump unigolyn ar fenthyg, pob un yn ateb i reolwr gwahanol, felly mae’n rhaid i bob penderfyniad deithio i fyny cyn y gall deithio ymlaen. Yr ail siâp yw’r mwyaf cyffredin a dyma’r achos unigol mwyaf o gyflawni araf.',
    empoweredAria:
      'Dau siâp tîm wedi’u cymharu: tîm grymus sy’n penderfynu drosto’i hun, a grŵp matrics yn adrodd i bump o reolwyr ar wahân.',
    clocks:
      'Mae gwaith yn rhedeg ar ddau gloc. Cloc cyflawni yw rhythm pythefnosol y tîm. Cloc llywodraethu yw’r pyrth a’r achosion busnes oddi tano. Maent yn cwrdd ar ddiwedd pob cyfnod ac yn annibynnol yn y cyfamser. Nid yw pyrth byth yn gosod y sbrint, ac nid yw sbrintiau byth yn aros am borth.',
    clocksAria:
      'Cylch bywyd cyflawni: darganfod, alpha, beta, byw, gyda phorth llywodraethu ar ddiwedd pob un.',
    capacity:
      'Nid pum diwrnod o waith newydd yw person llawn amser. Mae deg a thrigain y cant yn mynd i gyflawni ymrwymedig, ugain i’r pethau sy’n cadw cyflawni’n bosibl o gwbl, a deg yn aros heb ymrwymo o ddifrif. Cynlluniwch ar 100% a bydd y gwaith dewisol yn dal i ddigwydd, dim ond heb dâl ac ar ôl oriau, a’r ansawdd tystiolaeth yw’r peth cyntaf i ddioddef.',
    capacityAria:
      'Rhaniad capasiti: 70 y cant cyflawni ymrwymedig, 20 y cant dewisol, 10 y cant llac.',
    continuity:
      'Pedwar cyfnod o hanes, un rhes fesul person. Mae bloc llawn yn golygu iddynt aros gydag un ymgysylltiad am y cyfnod cyfan hwnnw. Darllenwch ar draws: rhediadau di-dor yw’r hyn sy’n gadael i rywun egluro penderfyniad i adolygiad porth flwyddyn yn ddiweddarach. Bylchau yw lle mae’r stori yn torri.',
    continuityAria:
      'Siart parhad. Mae blociau llawn yn dangos cyfnodau y bu pob person gydag un ymgysylltiad.',
    squadShape:
      'Siâp y sgwad fel y mae. Maint y cylch yw faint o berson y mae’r rôl ei angen. Amlinellau toredig yw heb eu llenwi. Amlinellau ambr yw wedi’u llenwi ond islaw’r datum, sy’n broblem wahanol i sedd wag ac fel arfer yn fwy peryglus, oherwydd mae’n edrych wedi’i datrys.',
    squadShapeAria:
      'Siâp sgwad: mae maint y cylch yn dangos faint o berson y mae’r rôl ei angen. Cylchoedd toredig yw heb eu llenwi.',
    demand:
      'Yr hyn y mae llyfr y gwaith ei angen yn erbyn yr hyn a ddelir, mewn cyfwerth llawn amser. Pinc arolwg yw galw, inc yw gallu. Hygyrchedd yw’r un i weithredu arno: galw ar draws pedwar ymgysylltiad a neb o gwbl, sydd hefyd yn y rheswm mwyaf cyffredin y mae gwasanaethau yn methu asesiad.',
    demandAria: 'Galw yn erbyn gallu a ddelir, yn ôl rôl.',
  },

  walkthrough: {
    openSeat: 'agored',
    rolesFilled: 'Rolau wedi’u llenwi',
    aboveDatum: '{count} uwchben y datum',
    essentialAtRisk: 'Rolau hanfodol mewn perygl',
    essentialAtRiskNote: 'gwag neu islaw’r llinell',
    stayingPower: 'Gallu aros y tîm',
    stayingPowerNote: 'cyfartaledd ar draws y rhai a neilltuwyd',
    readyToConfirm: 'Yn barod i gadarnhau',
    yes: 'Ie',
    no: 'Na',
    readyYes: 'mae pob rôl hanfodol wedi’i gorchuddio',
    readyNo: 'rolau hanfodol yn aros',
    rolesHeading: 'Y saith rôl',
    action: 'Cam',
    bestAvailableNamed: 'gorau sydd ar gael: {name}, {score}',
    bestAvailableNamedShort: 'gorau sydd ar gael: {name}, {score} (dim digon o amser rhydd)',
    assignName: 'Neilltuo {name}',
    seeAll: 'Gweld y cyfan',
    change: 'Newid',
    confirm: 'Cadarnhau’r sgwad hwn',
    startAgain: 'Dechrau eto',
    coverEssential: 'Gorchuddiwch bob rôl hanfodol cyn cadarnhau.',
    confirmHint: 'Mae cadarnhau yn cofnodi pwy a benderfynodd, a pham, yn erbyn pob rôl.',
    confirmedTitle: '{filled} o {total} rôl wedi’u llenwi, {above} uwchben y datum.',
    confirmedBody:
      'Beth sy’n digwydd nesaf. Mae’r bobl yn cael eu neilltuo ar yr FTE a ddatganwyd, mae’r ffigurau yn cael eu cipio fel y maent heddiw, a’r rhesymeg yn cael ei storio yn erbyn pob rôl. Os bydd rhywun yn gofyn ymhen naw mis pam y dewiswyd y tîm hwn, mae’r ateb eisoes wedi’i ysgrifennu.',
    confirmedOutstanding:
      'Dal yn aros. Nid oes arbenigwr hygyrchedd yn bodoli yn y pwll o gwbl. Penderfyniad recriwtio yw hynny, nid un neilltuo, a bydd yn wynebu’r asesiad.',
    personMeta: '{role} · {free} FTE yn rhydd',
    candidateMeta: 'sgiliau {skill} · yr hyn yr ydym wedi’i weld ×{evidence}',
    candidateMetaShort: 'sgiliau {skill} · yr hyn yr ydym wedi’i weld ×{evidence} · dim digon o amser rhydd',
    candidateMetaUnev: 'sgiliau {skill} · dim byd wedi’i gofnodi',
    candidateMetaUnevShort: 'sgiliau {skill} · dim byd wedi’i gofnodi · dim digon o amser rhydd',
    assignToRole: 'Neilltuo i’r rôl hon',
    remove: 'Tynnu',
    liveHint: 'Sgwad dysgu yw’r daith isod. Nid yw’n cael ei chadw yn erbyn ymgysylltiad.',
  },

  footer: {
    disclaimer:
      'Adeilad arddangos gan ddefnyddio Fframwaith Gallu Proffesiwn Digidol a Data y Llywodraeth, wedi’i gyhoeddi o dan Drwydded Llywodraeth Agored. Offeryn cynghorol. Nid penderfyniad swyddi.',
    demonstration: 'Adeilad arddangos',
    representative: 'Data cynrychioladol yn unig',
  },

  legend: {
    held: 'sgil wedi’i ddal ar y lefel sydd ei hangen',
    partial: 'wedi’i ddal, ond islaw’r lefel sydd ei hangen',
    absent: 'sgil heb ei ddal',
    datum: 'y datum, 0.60',
    bracket: 'tystiolaeth cyflawni, llinell doredig pan nad ydym yn dal dim',
  },

  ui: {
    loading: 'Yn llwytho…',
    createEngagement: 'Creu ymgysylltiad',
    showWorking: 'Dangos y gwaith',
    hideWorking: 'Cuddio’r gwaith',
    managePeople: 'Rheoli pobl',
    back: 'Yn ôl',
    continue: 'Parhau',
  },

  wizard: {
    title: 'Creu ymgysylltiad',
    stepsLabel: 'Camau creu',
    steps: ['Cleient a gwasanaeth', 'Safon a chyfnod', 'Tîm', 'Modd'],
    clientOrg: 'Sefydliad y cleient',
    serviceName: 'Enw’r gwasanaeth',
    sector: 'Sector',
    sectorDigital: 'Gwasanaeth digidol',
    sectorCapital: 'Rhaglen gyfalaf',
    sectorHybrid: 'Hybrid',
    serviceDescription: 'Disgrifiad o’r gwasanaeth',
    standard: 'Safon',
    phase: 'Cyfnod',
    teamHint: 'Dechreuwch o dempled. Mewnforio CSV a thynnu o gyfeiriadur Entra yn cyrraedd yn nes ymlaen.',
    template: 'Templed',
    skipTemplate: 'Hepgor — ychwanegu tîm yn ddiweddarach',
    mode: 'Modd',
    modeHint:
      'Mae modd yn newid rhagosodiadau, byth gallu. Mae Bid yn glanio ar Drefnu; Mobilise ar Bobl; Assure ar Sicrwydd.',
    untitled: 'Ymgysylltiad heb deitl',
  },
};
