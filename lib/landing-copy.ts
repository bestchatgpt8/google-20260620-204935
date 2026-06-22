export type LandingLocale =
  | "en"
  | "fr"
  | "es"
  | "de"
  | "it"
  | "nl"
  | "tr"
  | "ar"
  | "vi"
  | "ko"
  | "ja"
  | "zhCN"
  | "zhTW";

export type LandingCopy = {
  languageLabel: string;
  nav: {
    features: string;
    syntax: string;
    useCases: string;
    trust: string;
    docs: string;
    start: string;
  };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleEmphasis: string;
    titleEnd: string;
    lead: string;
    primary: string;
    secondary: string;
    consoleTab: string;
    consoleLabel: string;
    resultLabel: string;
    enginesCaption: string;
  };
  stats: Array<{
    value: string;
    label: string;
  }>;
  features: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      body: string;
    }>;
  };
  showcase: {
    eyebrow: string;
    title: string;
    body: string;
    nestedTab: string;
    windowTab: string;
    nestedCaption: string;
    windowCaption: string;
  };
  cases: {
    eyebrow: string;
    title: string;
    items: Array<{
      tag: string;
      title: string;
      body: string;
    }>;
  };
  trust: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      body: string;
    }>;
  };
  cta: {
    eyebrow: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  footer: {
    body: string;
    product: string;
    solutions: string;
    resources: string;
    legal: string;
  };
};

export const landingLanguages: Array<{
  code: LandingLocale;
  label: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}> = [
  { code: "en", label: "English", nativeName: "English", dir: "ltr" },
  { code: "fr", label: "French", nativeName: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "de", label: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "it", label: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "nl", label: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "ko", label: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "ja", label: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "zhCN", label: "Simplified Chinese", nativeName: "简体中文", dir: "ltr" },
  { code: "zhTW", label: "Traditional Chinese", nativeName: "繁體中文", dir: "ltr" }
];

const baseStats = {
  en: [
    { value: "SQL:2011", label: "ANSI-compatible foundations" },
    { value: "4 engines", label: "One mental model across workflows" },
    { value: "EB scale", label: "Designed for warehouse-scale analysis" },
    { value: "0 rewrites", label: "Move patterns without relearning syntax" }
  ],
  zhCN: [
    { value: "SQL:2011", label: "兼容 ANSI 的语法基础" },
    { value: "4 大引擎", label: "跨工作流共享同一种思维模型" },
    { value: "EB 级", label: "面向数据仓库级分析规模" },
    { value: "0 次重写", label: "迁移模式，无需重新学习语法" }
  ]
};

export const landingCopy: Record<LandingLocale, LandingCopy> = {
  en: {
    languageLabel: "Language",
    nav: {
      features: "Capabilities",
      syntax: "Syntax",
      useCases: "Use cases",
      trust: "Trust",
      docs: "Docs",
      start: "Start"
    },
    hero: {
      eyebrow: "Unified query language",
      titleStart: "Write one",
      titleEmphasis: "universal language",
      titleEnd: "for enterprise data.",
      lead:
        "GoogleSQL.com brings schema-aware generation, dry-run safety, and admin governance into one polished workflow for BigQuery-first teams.",
      primary: "Start writing SQL",
      secondary: "Explore syntax",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery workflow",
      resultLabel: "Result preview / 0.8s",
      enginesCaption: "One language pattern for"
    },
    stats: baseStats.en,
    features: {
      eyebrow: "Core capabilities",
      title: "A query workflow built for scale and review",
      items: [
        {
          title: "Schema-aware SQL generation",
          body:
            "Turn plain-language questions into reviewable GoogleSQL with table context, field awareness, and safe defaults."
        },
        {
          title: "Nested and repeated data",
          body:
            "Use STRUCT and ARRAY patterns naturally, without flattening every model before analysts can ask questions."
        },
        {
          title: "Dry-run cost control",
          body:
            "Estimate bytes, cost, and runtime before execution so teams can catch expensive queries early."
        },
        {
          title: "Admin governance",
          body:
            "Manage rollouts, approvals, schema policies, and audit events from a protected Cloudflare-backed console."
        }
      ]
    },
    showcase: {
      eyebrow: "Syntax in production",
      title: "Express complex data models directly in SQL",
      body:
        "From nested records to analytic windows, GoogleSQL keeps advanced modeling close to each SELECT statement.",
      nestedTab: "Nested data",
      windowTab: "Window analysis",
      nestedCaption: "STRUCT & ARRAY / nested modeling",
      windowCaption: "Window functions / trend analysis"
    },
    cases: {
      eyebrow: "Use cases",
      title: "From analyst questions to governed execution",
      items: [
        {
          tag: "BigQuery",
          title: "Warehouse analytics",
          body:
            "Create safer revenue, cohort, and operations queries with schema context and dry-run validation."
        },
        {
          tag: "Admin",
          title: "Review queues",
          body:
            "Route risky or high-cost SQL through approval before anyone turns a draft into a production run."
        },
        {
          tag: "Catalog",
          title: "Schema policy",
          body:
            "Mark queryable fields, flag PII, and keep the SQL generator aligned with the data team's rules."
        }
      ]
    },
    trust: {
      eyebrow: "Enterprise foundation",
      title: "Designed for teams that need control",
      items: [
        {
          title: "Role-based admin access",
          body: "Protect the console with OAuth sessions and admin-only routes."
        },
        {
          title: "Audit history",
          body: "Record sign-ins, dry-runs, approvals, rollbacks, and schema policy changes."
        },
        {
          title: "Rollback-ready releases",
          body: "Ship through canary controls with a known healthy rollback target."
        },
        {
          title: "Live BigQuery dry-runs",
          body: "Use service-account backed dry-runs when credentials are configured."
        }
      ]
    },
    cta: {
      eyebrow: "Start now",
      title: "Ready to unify your SQL workflow?",
      body:
        "Open the query workbench, connect schema context, and move toward safer BigQuery operations.",
      primary: "Open tools",
      secondary: "Read tutorials"
    },
    footer: {
      body:
        "A multilingual GoogleSQL workflow for generation, validation, governance, and learning.",
      product: "Product",
      solutions: "Solutions",
      resources: "Resources",
      legal:
        "GoogleSQL.com is an independent product and is not affiliated with, endorsed by, or sponsored by Google."
    }
  },
  fr: {
    languageLabel: "Langue",
    nav: {
      features: "Capacités",
      syntax: "Syntaxe",
      useCases: "Usages",
      trust: "Confiance",
      docs: "Docs",
      start: "Démarrer"
    },
    hero: {
      eyebrow: "Langage de requête unifié",
      titleStart: "Écrivez un",
      titleEmphasis: "langage universel",
      titleEnd: "pour les données d'entreprise.",
      lead:
        "GoogleSQL.com réunit génération sensible au schéma, validation dry-run et gouvernance admin dans un flux élégant pour les équipes BigQuery.",
      primary: "Écrire du SQL",
      secondary: "Explorer la syntaxe",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / flux BigQuery",
      resultLabel: "Aperçu résultat / 0,8 s",
      enginesCaption: "Un modèle de langage pour"
    },
    stats: [
      { value: "SQL:2011", label: "Fondations compatibles ANSI" },
      { value: "4 moteurs", label: "Un même modèle mental" },
      { value: "Échelle EB", label: "Pensé pour l'analyse entrepôt" },
      { value: "0 réécriture", label: "Migrer sans réapprendre" }
    ],
    features: {
      eyebrow: "Capacités clés",
      title: "Un flux de requête conçu pour l'échelle et la revue",
      items: [
        {
          title: "Génération SQL avec schéma",
          body:
            "Transformez une question métier en GoogleSQL relisible avec contexte de tables, champs et garde-fous."
        },
        {
          title: "Données imbriquées",
          body:
            "Utilisez STRUCT et ARRAY sans aplatir tous les modèles avant l'analyse."
        },
        {
          title: "Contrôle des coûts dry-run",
          body:
            "Estimez octets, coût et durée avant exécution pour bloquer les requêtes risquées."
        },
        {
          title: "Gouvernance admin",
          body:
            "Pilotez déploiements, validations, politiques de schéma et audit depuis une console protégée."
        }
      ]
    },
    showcase: {
      eyebrow: "Syntaxe en production",
      title: "Exprimez les modèles complexes directement en SQL",
      body:
        "Des enregistrements imbriqués aux fenêtres analytiques, GoogleSQL garde le modèle près du SELECT.",
      nestedTab: "Données imbriquées",
      windowTab: "Fenêtres",
      nestedCaption: "STRUCT & ARRAY / modèle imbriqué",
      windowCaption: "Fonctions de fenêtre / tendances"
    },
    cases: {
      eyebrow: "Usages",
      title: "Des questions analyste à l'exécution gouvernée",
      items: [
        {
          tag: "BigQuery",
          title: "Analyse entrepôt",
          body:
            "Produisez des requêtes revenus, cohortes et opérations avec contexte de schéma et dry-run."
        },
        {
          tag: "Admin",
          title: "Files de revue",
          body:
            "Envoyez les SQL coûteux ou sensibles en validation avant production."
        },
        {
          tag: "Catalog",
          title: "Politique de schéma",
          body:
            "Marquez les champs interrogeables, signalez la PII et alignez le générateur sur les règles data."
        }
      ]
    },
    trust: {
      eyebrow: "Socle entreprise",
      title: "Conçu pour les équipes qui veulent garder le contrôle",
      items: [
        { title: "Accès admin par rôle", body: "Protégez la console avec OAuth et routes admin." },
        { title: "Historique d'audit", body: "Tracez connexions, dry-runs, validations, rollbacks et politiques." },
        { title: "Releases réversibles", body: "Déployez en canary avec cible de rollback saine." },
        { title: "Dry-runs BigQuery live", body: "Utilisez un compte de service quand les identifiants sont configurés." }
      ]
    },
    cta: {
      eyebrow: "Commencer",
      title: "Prêt à unifier votre flux SQL ?",
      body: "Ouvrez l'atelier, connectez le schéma et sécurisez vos opérations BigQuery.",
      primary: "Ouvrir les outils",
      secondary: "Lire les tutoriels"
    },
    footer: {
      body: "Un flux GoogleSQL multilingue pour générer, valider, gouverner et apprendre.",
      product: "Produit",
      solutions: "Solutions",
      resources: "Ressources",
      legal: "GoogleSQL.com est un produit indépendant, non affilié, approuvé ni sponsorisé par Google."
    }
  },
  es: {
    languageLabel: "Idioma",
    nav: {
      features: "Capacidades",
      syntax: "Sintaxis",
      useCases: "Casos",
      trust: "Confianza",
      docs: "Docs",
      start: "Empezar"
    },
    hero: {
      eyebrow: "Lenguaje de consulta unificado",
      titleStart: "Escribe un",
      titleEmphasis: "lenguaje universal",
      titleEnd: "para datos empresariales.",
      lead:
        "GoogleSQL.com une generación con contexto de esquema, validación dry-run y gobierno admin para equipos centrados en BigQuery.",
      primary: "Escribir SQL",
      secondary: "Explorar sintaxis",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / flujo BigQuery",
      resultLabel: "Vista previa / 0,8 s",
      enginesCaption: "Un patrón de lenguaje para"
    },
    stats: [
      { value: "SQL:2011", label: "Base compatible con ANSI" },
      { value: "4 motores", label: "Un mismo modelo mental" },
      { value: "Escala EB", label: "Para análisis de almacén" },
      { value: "0 reescrituras", label: "Mover patrones sin reaprender" }
    ],
    features: {
      eyebrow: "Capacidades clave",
      title: "Un flujo de consultas para escala y revisión",
      items: [
        { title: "SQL con esquema", body: "Convierte preguntas en GoogleSQL revisable con contexto de tablas y campos." },
        { title: "Datos anidados", body: "Usa STRUCT y ARRAY sin aplanar cada modelo antes del análisis." },
        { title: "Control de costes", body: "Estima bytes, coste y tiempo antes de ejecutar consultas caras." },
        { title: "Gobierno admin", body: "Gestiona despliegues, aprobaciones, políticas de esquema y auditoría." }
      ]
    },
    showcase: {
      eyebrow: "Sintaxis en producción",
      title: "Expresa modelos complejos directamente en SQL",
      body: "De registros anidados a ventanas analíticas, GoogleSQL mantiene el modelado cerca del SELECT.",
      nestedTab: "Datos anidados",
      windowTab: "Ventanas",
      nestedCaption: "STRUCT & ARRAY / modelo anidado",
      windowCaption: "Funciones de ventana / tendencias"
    },
    cases: {
      eyebrow: "Casos de uso",
      title: "De preguntas de analistas a ejecución gobernada",
      items: [
        { tag: "BigQuery", title: "Analítica warehouse", body: "Crea consultas de ingresos, cohortes y operaciones con dry-run." },
        { tag: "Admin", title: "Colas de revisión", body: "Aprueba SQL riesgoso o costoso antes de producción." },
        { tag: "Catalog", title: "Política de esquema", body: "Marca campos consultables, PII y reglas del equipo de datos." }
      ]
    },
    trust: {
      eyebrow: "Base empresarial",
      title: "Diseñado para equipos que necesitan control",
      items: [
        { title: "Acceso por rol", body: "Protege la consola con OAuth y rutas solo admin." },
        { title: "Auditoría", body: "Registra sesiones, dry-runs, aprobaciones, rollbacks y cambios." },
        { title: "Rollback rápido", body: "Publica con canary y un objetivo sano de reversión." },
        { title: "Dry-runs BigQuery", body: "Usa cuenta de servicio cuando las credenciales están listas." }
      ]
    },
    cta: {
      eyebrow: "Empieza",
      title: "¿Listo para unificar tu flujo SQL?",
      body: "Abre el banco de trabajo, conecta el esquema y opera BigQuery con más seguridad.",
      primary: "Abrir herramientas",
      secondary: "Leer tutoriales"
    },
    footer: {
      body: "Un flujo GoogleSQL multilingüe para generar, validar, gobernar y aprender.",
      product: "Producto",
      solutions: "Soluciones",
      resources: "Recursos",
      legal: "GoogleSQL.com es un producto independiente y no está afiliado, avalado ni patrocinado por Google."
    }
  },
  de: {
    languageLabel: "Sprache",
    nav: {
      features: "Funktionen",
      syntax: "Syntax",
      useCases: "Anwendungen",
      trust: "Sicherheit",
      docs: "Doku",
      start: "Start"
    },
    hero: {
      eyebrow: "Einheitliche Abfragesprache",
      titleStart: "Schreiben Sie eine",
      titleEmphasis: "universelle Sprache",
      titleEnd: "für Unternehmensdaten.",
      lead:
        "GoogleSQL.com verbindet schema-bewusste Generierung, Dry-run-Prüfung und Admin-Governance für BigQuery-orientierte Teams.",
      primary: "SQL schreiben",
      secondary: "Syntax ansehen",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery Workflow",
      resultLabel: "Ergebnisvorschau / 0,8 s",
      enginesCaption: "Ein Sprachmuster für"
    },
    stats: [
      { value: "SQL:2011", label: "ANSI-kompatible Basis" },
      { value: "4 Engines", label: "Ein gemeinsames Denkmodell" },
      { value: "EB-Skala", label: "Für Warehouse-Analysen" },
      { value: "0 Rewrite", label: "Muster ohne Neulernen bewegen" }
    ],
    features: {
      eyebrow: "Kernfunktionen",
      title: "Ein Abfrage-Workflow für Skalierung und Review",
      items: [
        { title: "Schema-bewusste SQL-Erzeugung", body: "Aus Fachfragen wird prüfbares GoogleSQL mit Tabellen- und Feldkontext." },
        { title: "Verschachtelte Daten", body: "STRUCT und ARRAY natürlich nutzen, ohne jedes Modell zu flachen." },
        { title: "Dry-run-Kostenkontrolle", body: "Bytes, Kosten und Laufzeit vor der Ausführung abschätzen." },
        { title: "Admin-Governance", body: "Rollouts, Freigaben, Schema-Regeln und Audit zentral steuern." }
      ]
    },
    showcase: {
      eyebrow: "Syntax in Produktion",
      title: "Komplexe Datenmodelle direkt in SQL ausdrücken",
      body: "Von Nested Records bis Window-Analysen bleibt Modellierung nah am SELECT.",
      nestedTab: "Nested Data",
      windowTab: "Window Analyse",
      nestedCaption: "STRUCT & ARRAY / Nested Modeling",
      windowCaption: "Window Functions / Trendanalyse"
    },
    cases: {
      eyebrow: "Anwendungen",
      title: "Von Analystenfragen zu gesteuerter Ausführung",
      items: [
        { tag: "BigQuery", title: "Warehouse Analytics", body: "Sichere Umsatz-, Kohorten- und Operations-Abfragen mit Dry-run." },
        { tag: "Admin", title: "Review Queues", body: "Risikoreiches SQL vor Produktionsläufen freigeben lassen." },
        { tag: "Catalog", title: "Schema Policy", body: "Felder, PII und Generatorregeln im Team-Katalog pflegen." }
      ]
    },
    trust: {
      eyebrow: "Enterprise-Basis",
      title: "Für Teams gebaut, die Kontrolle brauchen",
      items: [
        { title: "Rollenbasierter Adminzugang", body: "Konsole mit OAuth-Sessions und Admin-Routen schützen." },
        { title: "Audit-Verlauf", body: "Logins, Dry-runs, Freigaben, Rollbacks und Schemaänderungen erfassen." },
        { title: "Rollback-fähige Releases", body: "Über Canary mit bekannt gesundem Ziel veröffentlichen." },
        { title: "Live BigQuery Dry-runs", body: "Service Account nutzen, sobald Credentials konfiguriert sind." }
      ]
    },
    cta: {
      eyebrow: "Loslegen",
      title: "Bereit, Ihren SQL-Workflow zu vereinheitlichen?",
      body: "Öffnen Sie die Tools, verbinden Sie Schemas und arbeiten Sie sicherer mit BigQuery.",
      primary: "Tools öffnen",
      secondary: "Tutorials lesen"
    },
    footer: {
      body: "Ein mehrsprachiger GoogleSQL-Workflow für Generierung, Prüfung, Governance und Lernen.",
      product: "Produkt",
      solutions: "Lösungen",
      resources: "Ressourcen",
      legal: "GoogleSQL.com ist ein unabhängiges Produkt und nicht mit Google verbunden, unterstützt oder gesponsert."
    }
  },
  it: {
    languageLabel: "Lingua",
    nav: {
      features: "Capacità",
      syntax: "Sintassi",
      useCases: "Casi d'uso",
      trust: "Fiducia",
      docs: "Docs",
      start: "Inizia"
    },
    hero: {
      eyebrow: "Linguaggio di query unificato",
      titleStart: "Scrivi un",
      titleEmphasis: "linguaggio universale",
      titleEnd: "per i dati aziendali.",
      lead:
        "GoogleSQL.com combina generazione consapevole dello schema, dry-run di sicurezza e governance admin per team BigQuery.",
      primary: "Scrivi SQL",
      secondary: "Esplora la sintassi",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / workflow BigQuery",
      resultLabel: "Anteprima risultato / 0,8 s",
      enginesCaption: "Un modello linguistico per"
    },
    stats: [
      { value: "SQL:2011", label: "Fondamenti compatibili ANSI" },
      { value: "4 motori", label: "Un modello mentale condiviso" },
      { value: "Scala EB", label: "Per analisi warehouse" },
      { value: "0 riscritture", label: "Sposta pattern senza reimparare" }
    ],
    features: {
      eyebrow: "Capacità principali",
      title: "Un workflow di query per scala e revisione",
      items: [
        { title: "SQL consapevole dello schema", body: "Trasforma domande in GoogleSQL revisionabile con contesto di tabelle e campi." },
        { title: "Dati annidati", body: "Usa STRUCT e ARRAY senza appiattire ogni modello." },
        { title: "Controllo costi dry-run", body: "Stima byte, costo e durata prima dell'esecuzione." },
        { title: "Governance admin", body: "Gestisci rollout, approvazioni, policy di schema e audit." }
      ]
    },
    showcase: {
      eyebrow: "Sintassi in produzione",
      title: "Esprimi modelli complessi direttamente in SQL",
      body: "Dai record annidati alle finestre analitiche, GoogleSQL mantiene il modello vicino al SELECT.",
      nestedTab: "Dati annidati",
      windowTab: "Finestre",
      nestedCaption: "STRUCT & ARRAY / modello annidato",
      windowCaption: "Funzioni finestra / trend"
    },
    cases: {
      eyebrow: "Casi d'uso",
      title: "Dalle domande degli analisti all'esecuzione governata",
      items: [
        { tag: "BigQuery", title: "Analytics warehouse", body: "Crea query più sicure per ricavi, coorti e operation." },
        { tag: "Admin", title: "Code di revisione", body: "Invia SQL rischioso o costoso in approvazione." },
        { tag: "Catalog", title: "Policy schema", body: "Marca campi interrogabili, PII e regole del team data." }
      ]
    },
    trust: {
      eyebrow: "Fondazione enterprise",
      title: "Progettato per team che richiedono controllo",
      items: [
        { title: "Accesso admin per ruolo", body: "Proteggi la console con OAuth e rotte admin." },
        { title: "Audit history", body: "Registra login, dry-run, approvazioni, rollback e policy." },
        { title: "Release con rollback", body: "Rilascia in canary con target sano." },
        { title: "Dry-run BigQuery live", body: "Usa account di servizio quando configurato." }
      ]
    },
    cta: {
      eyebrow: "Inizia ora",
      title: "Pronto a unificare il tuo workflow SQL?",
      body: "Apri gli strumenti, collega il contesto schema e opera su BigQuery in modo più sicuro.",
      primary: "Apri strumenti",
      secondary: "Leggi tutorial"
    },
    footer: {
      body: "Un workflow GoogleSQL multilingue per generare, validare, governare e imparare.",
      product: "Prodotto",
      solutions: "Soluzioni",
      resources: "Risorse",
      legal: "GoogleSQL.com è un prodotto indipendente e non è affiliato, approvato o sponsorizzato da Google."
    }
  },
  nl: {
    languageLabel: "Taal",
    nav: {
      features: "Mogelijkheden",
      syntax: "Syntaxis",
      useCases: "Toepassingen",
      trust: "Vertrouwen",
      docs: "Docs",
      start: "Start"
    },
    hero: {
      eyebrow: "Eenduidige querytaal",
      titleStart: "Schrijf één",
      titleEmphasis: "universele taal",
      titleEnd: "voor bedrijfsdata.",
      lead:
        "GoogleSQL.com combineert schema-bewuste generatie, dry-run veiligheid en admin-governance voor BigQuery-teams.",
      primary: "SQL schrijven",
      secondary: "Syntaxis bekijken",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery workflow",
      resultLabel: "Resultaatpreview / 0,8 s",
      enginesCaption: "Eén taalpatroon voor"
    },
    stats: [
      { value: "SQL:2011", label: "ANSI-compatibele basis" },
      { value: "4 engines", label: "Eén gedeeld denkmodel" },
      { value: "EB-schaal", label: "Voor warehouse-analyse" },
      { value: "0 herschrijf", label: "Patronen verplaatsen zonder herleren" }
    ],
    features: {
      eyebrow: "Kernmogelijkheden",
      title: "Een queryworkflow voor schaal en review",
      items: [
        { title: "Schema-bewuste SQL", body: "Maak van vragen controleerbare GoogleSQL met tabel- en veldcontext." },
        { title: "Geneste data", body: "Gebruik STRUCT en ARRAY zonder elk model eerst plat te maken." },
        { title: "Dry-run kostencontrole", body: "Schat bytes, kosten en runtime voordat queries draaien." },
        { title: "Admin-governance", body: "Beheer rollouts, approvals, schema policies en audits." }
      ]
    },
    showcase: {
      eyebrow: "Syntaxis in productie",
      title: "Druk complexe modellen direct in SQL uit",
      body: "Van geneste records tot window-analyses: modellering blijft dicht bij SELECT.",
      nestedTab: "Geneste data",
      windowTab: "Window analyse",
      nestedCaption: "STRUCT & ARRAY / genest model",
      windowCaption: "Window functions / trends"
    },
    cases: {
      eyebrow: "Toepassingen",
      title: "Van analistenvragen naar beheerste uitvoering",
      items: [
        { tag: "BigQuery", title: "Warehouse analytics", body: "Maak veiligere revenue-, cohort- en operations-query's." },
        { tag: "Admin", title: "Review queues", body: "Laat risicovolle of dure SQL goedkeuren." },
        { tag: "Catalog", title: "Schema policy", body: "Markeer queryable velden, PII en data-teamregels." }
      ]
    },
    trust: {
      eyebrow: "Enterprise basis",
      title: "Ontworpen voor teams die controle nodig hebben",
      items: [
        { title: "Rolgebaseerde admin", body: "Bescherm de console met OAuth en adminroutes." },
        { title: "Auditgeschiedenis", body: "Registreer logins, dry-runs, approvals, rollbacks en policies." },
        { title: "Rollback-ready releases", body: "Release via canary met een gezond rollbackdoel." },
        { title: "Live BigQuery dry-runs", body: "Gebruik service accounts zodra credentials klaar zijn." }
      ]
    },
    cta: {
      eyebrow: "Begin nu",
      title: "Klaar om je SQL-workflow te verenigen?",
      body: "Open de tools, verbind schemacontext en werk veiliger met BigQuery.",
      primary: "Tools openen",
      secondary: "Tutorials lezen"
    },
    footer: {
      body: "Een meertalige GoogleSQL-workflow voor genereren, valideren, governance en leren.",
      product: "Product",
      solutions: "Oplossingen",
      resources: "Resources",
      legal: "GoogleSQL.com is een onafhankelijk product en is niet gelieerd aan, goedgekeurd of gesponsord door Google."
    }
  },
  tr: {
    languageLabel: "Dil",
    nav: {
      features: "Yetenekler",
      syntax: "Sözdizimi",
      useCases: "Kullanım",
      trust: "Güven",
      docs: "Belgeler",
      start: "Başla"
    },
    hero: {
      eyebrow: "Birleşik sorgu dili",
      titleStart: "Kurumsal veri için",
      titleEmphasis: "evrensel bir dil",
      titleEnd: "yazın.",
      lead:
        "GoogleSQL.com, BigQuery ekipleri için şema farkındalığı, dry-run güvenliği ve admin yönetişimini tek akışta toplar.",
      primary: "SQL yaz",
      secondary: "Sözdizimini keşfet",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery akışı",
      resultLabel: "Sonuç önizleme / 0,8 sn",
      enginesCaption: "Tek dil kalıbı"
    },
    stats: [
      { value: "SQL:2011", label: "ANSI uyumlu temel" },
      { value: "4 motor", label: "Tek düşünme modeli" },
      { value: "EB ölçek", label: "Ambar ölçeğinde analiz" },
      { value: "0 yeniden yazım", label: "Sözdizimi öğrenmeden taşıma" }
    ],
    features: {
      eyebrow: "Temel yetenekler",
      title: "Ölçek ve inceleme için sorgu akışı",
      items: [
        { title: "Şema farkındalıklı SQL", body: "Soruları tablo ve alan bağlamıyla incelenebilir GoogleSQL'e dönüştürün." },
        { title: "İç içe veri", body: "STRUCT ve ARRAY kullanın; modeli düzleştirmek zorunda kalmayın." },
        { title: "Dry-run maliyet kontrolü", body: "Çalıştırmadan önce byte, maliyet ve süre tahmini alın." },
        { title: "Admin yönetişimi", body: "Yayın, onay, şema politikası ve audit yönetimini korumalı konsoldan yapın." }
      ]
    },
    showcase: {
      eyebrow: "Üretim sözdizimi",
      title: "Karmaşık modelleri doğrudan SQL'de ifade edin",
      body: "İç içe kayıtlardan analitik pencerelere, model SELECT'e yakın kalır.",
      nestedTab: "İç içe veri",
      windowTab: "Pencere analizi",
      nestedCaption: "STRUCT & ARRAY / iç içe model",
      windowCaption: "Window functions / trend"
    },
    cases: {
      eyebrow: "Kullanım alanları",
      title: "Analist sorularından kontrollü çalıştırmaya",
      items: [
        { tag: "BigQuery", title: "Warehouse analitiği", body: "Gelir, kohort ve operasyon sorgularını dry-run ile güvenli üretin." },
        { tag: "Admin", title: "İnceleme kuyrukları", body: "Riskli veya pahalı SQL'i üretimden önce onaya yönlendirin." },
        { tag: "Catalog", title: "Şema politikası", body: "Sorgulanabilir alanları, PII'yi ve ekip kurallarını işaretleyin." }
      ]
    },
    trust: {
      eyebrow: "Kurumsal temel",
      title: "Kontrol isteyen ekipler için tasarlandı",
      items: [
        { title: "Rol tabanlı admin", body: "Konsolu OAuth ve admin rotalarıyla koruyun." },
        { title: "Audit geçmişi", body: "Giriş, dry-run, onay, rollback ve politika değişikliklerini kaydedin." },
        { title: "Rollback hazır", body: "Canary ile yayınlayın, sağlıklı hedefe dönün." },
        { title: "Canlı BigQuery dry-run", body: "Kimlikler hazırsa service account dry-run kullanın." }
      ]
    },
    cta: {
      eyebrow: "Başla",
      title: "SQL akışınızı birleştirmeye hazır mısınız?",
      body: "Araçları açın, şema bağlamını bağlayın ve BigQuery operasyonlarını güvenli ilerletin.",
      primary: "Araçları aç",
      secondary: "Eğitimleri oku"
    },
    footer: {
      body: "Üretme, doğrulama, yönetişim ve öğrenme için çok dilli GoogleSQL akışı.",
      product: "Ürün",
      solutions: "Çözümler",
      resources: "Kaynaklar",
      legal: "GoogleSQL.com bağımsız bir üründür; Google ile bağlı, onaylı veya sponsorlu değildir."
    }
  },
  ar: {
    languageLabel: "اللغة",
    nav: {
      features: "القدرات",
      syntax: "الصياغة",
      useCases: "الاستخدامات",
      trust: "الثقة",
      docs: "الوثائق",
      start: "ابدأ"
    },
    hero: {
      eyebrow: "لغة استعلام موحدة",
      titleStart: "اكتب",
      titleEmphasis: "لغة عالمية",
      titleEnd: "لبيانات المؤسسة.",
      lead:
        "يجمع GoogleSQL.com توليد SQL المدرك للمخطط، وفحص dry-run، وحوكمة المسؤول في سير عمل واحد لفرق BigQuery.",
      primary: "ابدأ كتابة SQL",
      secondary: "استكشف الصياغة",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / سير BigQuery",
      resultLabel: "معاينة النتيجة / 0.8 ث",
      enginesCaption: "نمط لغة واحد من أجل"
    },
    stats: [
      { value: "SQL:2011", label: "أساس متوافق مع ANSI" },
      { value: "4 محركات", label: "نموذج تفكير واحد" },
      { value: "مقياس EB", label: "لتحليل مستودعات البيانات" },
      { value: "0 إعادة كتابة", label: "انقل الأنماط بلا تعلم جديد" }
    ],
    features: {
      eyebrow: "القدرات الأساسية",
      title: "سير استعلام مبني للمقياس والمراجعة",
      items: [
        { title: "توليد SQL مدرك للمخطط", body: "حوّل الأسئلة إلى GoogleSQL قابل للمراجعة مع سياق الجداول والحقول." },
        { title: "بيانات متداخلة ومتكررة", body: "استخدم STRUCT و ARRAY دون تسطيح كل نموذج." },
        { title: "تحكم تكلفة dry-run", body: "قدّر البايت والتكلفة والمدة قبل التنفيذ." },
        { title: "حوكمة المسؤول", body: "أدر الإصدارات والموافقات وسياسات المخطط وسجل التدقيق." }
      ]
    },
    showcase: {
      eyebrow: "الصياغة في الإنتاج",
      title: "عبّر عن النماذج المعقدة مباشرة في SQL",
      body: "من السجلات المتداخلة إلى النوافذ التحليلية، يبقى النموذج قريباً من SELECT.",
      nestedTab: "بيانات متداخلة",
      windowTab: "تحليل النوافذ",
      nestedCaption: "STRUCT & ARRAY / نمذجة متداخلة",
      windowCaption: "Window functions / تحليل الاتجاه"
    },
    cases: {
      eyebrow: "الاستخدامات",
      title: "من أسئلة المحللين إلى تنفيذ محكوم",
      items: [
        { tag: "BigQuery", title: "تحليلات المستودع", body: "أنشئ استعلامات إيرادات ومجموعات وعمليات أكثر أماناً." },
        { tag: "Admin", title: "طوابير المراجعة", body: "وجّه SQL عالي المخاطر أو التكلفة إلى الموافقة." },
        { tag: "Catalog", title: "سياسة المخطط", body: "حدد الحقول القابلة للاستعلام وحقول PII وقواعد الفريق." }
      ]
    },
    trust: {
      eyebrow: "أساس مؤسسي",
      title: "مصمم للفرق التي تحتاج إلى التحكم",
      items: [
        { title: "وصول حسب الدور", body: "احمِ لوحة التحكم بجلسات OAuth ومسارات المسؤول." },
        { title: "سجل تدقيق", body: "سجّل الدخول و dry-run والموافقات والرجوع وتغييرات السياسة." },
        { title: "إصدارات قابلة للرجوع", body: "انشر عبر canary مع هدف رجوع صحي." },
        { title: "Dry-run مباشر في BigQuery", body: "استخدم حساب خدمة عند إعداد بيانات الاعتماد." }
      ]
    },
    cta: {
      eyebrow: "ابدأ الآن",
      title: "هل أنت جاهز لتوحيد سير SQL؟",
      body: "افتح الأدوات، واربط سياق المخطط، وانتقل إلى عمليات BigQuery أكثر أماناً.",
      primary: "افتح الأدوات",
      secondary: "اقرأ الدروس"
    },
    footer: {
      body: "سير عمل GoogleSQL متعدد اللغات للتوليد والتحقق والحوكمة والتعلم.",
      product: "المنتج",
      solutions: "الحلول",
      resources: "الموارد",
      legal: "GoogleSQL.com منتج مستقل وغير تابع أو معتمد أو ممول من Google."
    }
  },
  vi: {
    languageLabel: "Ngôn ngữ",
    nav: {
      features: "Năng lực",
      syntax: "Cú pháp",
      useCases: "Ứng dụng",
      trust: "Tin cậy",
      docs: "Tài liệu",
      start: "Bắt đầu"
    },
    hero: {
      eyebrow: "Ngôn ngữ truy vấn thống nhất",
      titleStart: "Viết một",
      titleEmphasis: "ngôn ngữ chung",
      titleEnd: "cho dữ liệu doanh nghiệp.",
      lead:
        "GoogleSQL.com kết hợp sinh SQL theo schema, kiểm tra dry-run và quản trị admin cho các đội dùng BigQuery.",
      primary: "Viết SQL",
      secondary: "Xem cú pháp",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / quy trình BigQuery",
      resultLabel: "Xem trước kết quả / 0,8 giây",
      enginesCaption: "Một mẫu ngôn ngữ cho"
    },
    stats: [
      { value: "SQL:2011", label: "Nền tảng tương thích ANSI" },
      { value: "4 engine", label: "Một mô hình tư duy" },
      { value: "Quy mô EB", label: "Cho phân tích kho dữ liệu" },
      { value: "0 viết lại", label: "Di chuyển mẫu không học lại" }
    ],
    features: {
      eyebrow: "Năng lực cốt lõi",
      title: "Quy trình truy vấn cho quy mô và rà soát",
      items: [
        { title: "Sinh SQL theo schema", body: "Biến câu hỏi thành GoogleSQL có thể rà soát với ngữ cảnh bảng và trường." },
        { title: "Dữ liệu lồng nhau", body: "Dùng STRUCT và ARRAY tự nhiên, không cần làm phẳng mọi mô hình." },
        { title: "Kiểm soát chi phí dry-run", body: "Ước tính byte, chi phí và thời gian trước khi chạy." },
        { title: "Quản trị admin", body: "Quản lý rollout, phê duyệt, chính sách schema và audit." }
      ]
    },
    showcase: {
      eyebrow: "Cú pháp sản xuất",
      title: "Diễn đạt mô hình phức tạp trực tiếp bằng SQL",
      body: "Từ bản ghi lồng nhau đến window analysis, mô hình luôn gần câu SELECT.",
      nestedTab: "Dữ liệu lồng",
      windowTab: "Window",
      nestedCaption: "STRUCT & ARRAY / mô hình lồng",
      windowCaption: "Window functions / xu hướng"
    },
    cases: {
      eyebrow: "Ứng dụng",
      title: "Từ câu hỏi phân tích đến thực thi có kiểm soát",
      items: [
        { tag: "BigQuery", title: "Phân tích warehouse", body: "Tạo truy vấn doanh thu, cohort và vận hành an toàn hơn." },
        { tag: "Admin", title: "Hàng đợi review", body: "Đưa SQL rủi ro hoặc tốn kém vào luồng phê duyệt." },
        { tag: "Catalog", title: "Chính sách schema", body: "Đánh dấu trường queryable, PII và quy tắc của đội data." }
      ]
    },
    trust: {
      eyebrow: "Nền tảng doanh nghiệp",
      title: "Thiết kế cho đội cần kiểm soát",
      items: [
        { title: "Admin theo vai trò", body: "Bảo vệ console bằng OAuth và tuyến admin." },
        { title: "Lịch sử audit", body: "Ghi lại đăng nhập, dry-run, phê duyệt, rollback và policy." },
        { title: "Release dễ rollback", body: "Phát hành canary với mục tiêu rollback khỏe." },
        { title: "Dry-run BigQuery live", body: "Dùng service account khi đã cấu hình." }
      ]
    },
    cta: {
      eyebrow: "Bắt đầu",
      title: "Sẵn sàng thống nhất quy trình SQL?",
      body: "Mở công cụ, kết nối schema context và vận hành BigQuery an toàn hơn.",
      primary: "Mở công cụ",
      secondary: "Đọc hướng dẫn"
    },
    footer: {
      body: "Quy trình GoogleSQL đa ngôn ngữ để sinh, kiểm tra, quản trị và học.",
      product: "Sản phẩm",
      solutions: "Giải pháp",
      resources: "Tài nguyên",
      legal: "GoogleSQL.com là sản phẩm độc lập, không liên kết, chứng thực hoặc tài trợ bởi Google."
    }
  },
  ko: {
    languageLabel: "언어",
    nav: {
      features: "기능",
      syntax: "문법",
      useCases: "활용",
      trust: "신뢰",
      docs: "문서",
      start: "시작"
    },
    hero: {
      eyebrow: "통합 쿼리 언어",
      titleStart: "엔터프라이즈 데이터를 위한",
      titleEmphasis: "범용 언어",
      titleEnd: "를 작성하세요.",
      lead:
        "GoogleSQL.com은 BigQuery 중심 팀을 위해 스키마 인식 생성, dry-run 안전성, 관리자 거버넌스를 하나로 묶습니다.",
      primary: "SQL 작성",
      secondary: "문법 살펴보기",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery 워크플로",
      resultLabel: "결과 미리보기 / 0.8초",
      enginesCaption: "하나의 언어 패턴"
    },
    stats: [
      { value: "SQL:2011", label: "ANSI 호환 기반" },
      { value: "4 엔진", label: "하나의 사고 모델" },
      { value: "EB 규모", label: "웨어하우스 분석용" },
      { value: "0 재작성", label: "문법 재학습 없이 이동" }
    ],
    features: {
      eyebrow: "핵심 기능",
      title: "규모와 리뷰를 위한 쿼리 워크플로",
      items: [
        { title: "스키마 인식 SQL 생성", body: "질문을 테이블과 필드 맥락이 있는 검토 가능한 GoogleSQL로 바꿉니다." },
        { title: "중첩 데이터", body: "모든 모델을 평탄화하지 않고 STRUCT와 ARRAY를 자연스럽게 사용합니다." },
        { title: "Dry-run 비용 제어", body: "실행 전에 바이트, 비용, 예상 시간을 확인합니다." },
        { title: "관리자 거버넌스", body: "롤아웃, 승인, 스키마 정책, 감사 이벤트를 관리합니다." }
      ]
    },
    showcase: {
      eyebrow: "운영 문법",
      title: "복잡한 모델을 SQL 안에서 직접 표현",
      body: "중첩 레코드부터 윈도우 분석까지 모델링을 SELECT 가까이에 둡니다.",
      nestedTab: "중첩 데이터",
      windowTab: "윈도우 분석",
      nestedCaption: "STRUCT & ARRAY / 중첩 모델링",
      windowCaption: "Window functions / 추세 분석"
    },
    cases: {
      eyebrow: "활용 사례",
      title: "분석가 질문에서 통제된 실행까지",
      items: [
        { tag: "BigQuery", title: "웨어하우스 분석", body: "매출, 코호트, 운영 쿼리를 더 안전하게 만듭니다." },
        { tag: "Admin", title: "리뷰 큐", body: "위험하거나 비싼 SQL은 실행 전 승인으로 보냅니다." },
        { tag: "Catalog", title: "스키마 정책", body: "조회 가능 필드, PII, 데이터팀 규칙을 표시합니다." }
      ]
    },
    trust: {
      eyebrow: "엔터프라이즈 기반",
      title: "통제가 필요한 팀을 위해 설계",
      items: [
        { title: "역할 기반 관리자", body: "OAuth 세션과 관리자 라우트로 콘솔을 보호합니다." },
        { title: "감사 기록", body: "로그인, dry-run, 승인, 롤백, 정책 변경을 기록합니다." },
        { title: "롤백 가능한 릴리스", body: "건강한 롤백 대상과 함께 canary로 배포합니다." },
        { title: "실시간 BigQuery dry-run", body: "자격 증명이 준비되면 서비스 계정을 사용합니다." }
      ]
    },
    cta: {
      eyebrow: "지금 시작",
      title: "SQL 워크플로를 통합할 준비가 되셨나요?",
      body: "도구를 열고 스키마 컨텍스트를 연결해 BigQuery 운영을 더 안전하게 진행하세요.",
      primary: "도구 열기",
      secondary: "튜토리얼 읽기"
    },
    footer: {
      body: "생성, 검증, 거버넌스, 학습을 위한 다국어 GoogleSQL 워크플로.",
      product: "제품",
      solutions: "솔루션",
      resources: "리소스",
      legal: "GoogleSQL.com은 독립 제품이며 Google과 제휴, 보증 또는 후원을 받지 않습니다."
    }
  },
  ja: {
    languageLabel: "言語",
    nav: {
      features: "機能",
      syntax: "構文",
      useCases: "用途",
      trust: "信頼",
      docs: "ドキュメント",
      start: "開始"
    },
    hero: {
      eyebrow: "統一されたクエリ言語",
      titleStart: "企業データのための",
      titleEmphasis: "共通言語",
      titleEnd: "を書く。",
      lead:
        "GoogleSQL.com は、スキーマを理解した生成、dry-run 安全確認、管理者ガバナンスを BigQuery チーム向けにまとめます。",
      primary: "SQL を書く",
      secondary: "構文を見る",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery ワークフロー",
      resultLabel: "結果プレビュー / 0.8秒",
      enginesCaption: "ひとつの言語パターン"
    },
    stats: [
      { value: "SQL:2011", label: "ANSI 互換の基盤" },
      { value: "4 engines", label: "共通の思考モデル" },
      { value: "EB scale", label: "ウェアハウス分析向け" },
      { value: "0 rewrite", label: "再学習なしで移行" }
    ],
    features: {
      eyebrow: "主な機能",
      title: "スケールとレビューのためのクエリワークフロー",
      items: [
        { title: "スキーマ対応 SQL 生成", body: "質問をテーブルとフィールドの文脈を持つ GoogleSQL に変換します。" },
        { title: "ネストデータ", body: "STRUCT と ARRAY を使い、すべてを平坦化せずに分析できます。" },
        { title: "Dry-run コスト制御", body: "実行前にバイト、コスト、実行時間を見積もります。" },
        { title: "管理者ガバナンス", body: "ロールアウト、承認、スキーマポリシー、監査を管理します。" }
      ]
    },
    showcase: {
      eyebrow: "本番構文",
      title: "複雑なデータモデルを SQL で直接表現",
      body: "ネストレコードから分析ウィンドウまで、モデルを SELECT の近くに保ちます。",
      nestedTab: "ネストデータ",
      windowTab: "ウィンドウ分析",
      nestedCaption: "STRUCT & ARRAY / ネストモデル",
      windowCaption: "Window functions / トレンド"
    },
    cases: {
      eyebrow: "用途",
      title: "分析の質問から管理された実行へ",
      items: [
        { tag: "BigQuery", title: "Warehouse analytics", body: "収益、コホート、運用クエリをより安全に作成します。" },
        { tag: "Admin", title: "レビューキュー", body: "高リスクまたは高コスト SQL を承認フローへ送ります。" },
        { tag: "Catalog", title: "スキーマポリシー", body: "クエリ可能フィールド、PII、データチーム規則を管理します。" }
      ]
    },
    trust: {
      eyebrow: "エンタープライズ基盤",
      title: "制御が必要なチームのために設計",
      items: [
        { title: "ロールベース管理", body: "OAuth セッションと管理者ルートでコンソールを保護します。" },
        { title: "監査履歴", body: "ログイン、dry-run、承認、ロールバック、ポリシー変更を記録します。" },
        { title: "ロールバック可能", body: "健全な戻し先を持つ canary でリリースします。" },
        { title: "BigQuery dry-run", body: "認証情報がある場合はサービスアカウントを使います。" }
      ]
    },
    cta: {
      eyebrow: "今すぐ開始",
      title: "SQL ワークフローを統一しませんか？",
      body: "ツールを開き、スキーマコンテキストを接続し、BigQuery 運用をより安全に進めます。",
      primary: "ツールを開く",
      secondary: "チュートリアルを読む"
    },
    footer: {
      body: "生成、検証、ガバナンス、学習のための多言語 GoogleSQL ワークフロー。",
      product: "製品",
      solutions: "ソリューション",
      resources: "リソース",
      legal: "GoogleSQL.com は独立した製品であり、Google とは提携、承認、スポンサー関係にありません。"
    }
  },
  zhCN: {
    languageLabel: "语言",
    nav: {
      features: "核心能力",
      syntax: "语法示例",
      useCases: "应用场景",
      trust: "企业安全",
      docs: "文档",
      start: "开始使用"
    },
    hero: {
      eyebrow: "统一查询语言",
      titleStart: "为企业数据，书写",
      titleEmphasis: "一种通用语言",
      titleEnd: "。",
      lead:
        "GoogleSQL.com 将 schema-aware 生成、BigQuery dry-run 安全检查和后台治理整合到一个清晰的工作流中。",
      primary: "开始写 SQL",
      secondary: "查看语法",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery 工作流",
      resultLabel: "返回结果 / 0.8 秒",
      enginesCaption: "同一种语言模式，运行于"
    },
    stats: baseStats.zhCN,
    features: {
      eyebrow: "核心能力",
      title: "为规模化查询和团队审查设计",
      items: [
        {
          title: "感知 Schema 的 SQL 生成",
          body: "把自然语言问题转换为可审查的 GoogleSQL，同时带上表、字段和安全默认值。"
        },
        {
          title: "原生处理嵌套数据",
          body: "用 STRUCT 和 ARRAY 直接表达复杂结构，无需为了分析先把模型全部打平。"
        },
        {
          title: "Dry-run 成本控制",
          body: "执行前估算扫描量、成本和运行时间，提前拦截高风险查询。"
        },
        {
          title: "后台治理与审计",
          body: "在受保护的控制台里管理灰度、审批、schema 策略和审计事件。"
        }
      ]
    },
    showcase: {
      eyebrow: "语法即生产力",
      title: "为复杂数据建模设计的 SQL 表达力",
      body: "从嵌套结构到分析窗口函数，GoogleSQL 把高级建模能力放进每一条 SELECT 语句。",
      nestedTab: "嵌套数据建模",
      windowTab: "窗口分析",
      nestedCaption: "STRUCT & ARRAY / 嵌套建模",
      windowCaption: "窗口函数 / 趋势分析"
    },
    cases: {
      eyebrow: "应用场景",
      title: "从分析问题到受控执行",
      items: [
        {
          tag: "BigQuery",
          title: "企业级数据仓库",
          body: "为收入、留存、运营分析生成更安全的查询，并在执行前完成 dry-run。"
        },
        {
          tag: "Admin",
          title: "查询审查队列",
          body: "把高成本或敏感 SQL 送入审批流程，再决定是否进入生产执行。"
        },
        {
          tag: "Catalog",
          title: "Schema 策略",
          body: "标记可查询字段、PII 字段和团队规则，让生成器始终贴合数据治理要求。"
        }
      ]
    },
    trust: {
      eyebrow: "企业级基础",
      title: "为需要控制权的团队构建",
      items: [
        {
          title: "基于角色的后台访问",
          body: "通过 OAuth session 和 admin-only route 保护管理控制台。"
        },
        {
          title: "完整审计历史",
          body: "记录登录、dry-run、审批、回滚和 schema 策略变更。"
        },
        {
          title: "可快速回滚的发布",
          body: "通过 canary 灰度上线，并始终保留健康回滚目标。"
        },
        {
          title: "实时 BigQuery dry-run",
          body: "配置 service account 后，直接使用 BigQuery 真实 dry-run 结果。"
        }
      ]
    },
    cta: {
      eyebrow: "开始使用",
      title: "准备好统一你的 SQL 工作流了吗？",
      body: "打开查询工具，接入 schema 上下文，把 BigQuery 操作推进到更安全的阶段。",
      primary: "打开工具",
      secondary: "阅读教程"
    },
    footer: {
      body: "统一企业数据查询的标准语言，贯穿数据仓库、流处理与分布式事务系统。",
      product: "产品",
      solutions: "解决方案",
      resources: "资源",
      legal: "GoogleSQL.com 是独立产品，与 Google 无隶属、认可或赞助关系。"
    }
  },
  zhTW: {
    languageLabel: "語言",
    nav: {
      features: "核心能力",
      syntax: "語法範例",
      useCases: "應用場景",
      trust: "企業安全",
      docs: "文件",
      start: "開始使用"
    },
    hero: {
      eyebrow: "統一查詢語言",
      titleStart: "為企業資料，書寫",
      titleEmphasis: "一種通用語言",
      titleEnd: "。",
      lead:
        "GoogleSQL.com 將 schema-aware 生成、BigQuery dry-run 安全檢查與後台治理整合到清晰的工作流。",
      primary: "開始寫 SQL",
      secondary: "查看語法",
      consoleTab: "query_editor.sql",
      consoleLabel: "GoogleSQL / BigQuery 工作流",
      resultLabel: "回傳結果 / 0.8 秒",
      enginesCaption: "同一種語言模式，運行於"
    },
    stats: [
      { value: "SQL:2011", label: "相容 ANSI 的語法基礎" },
      { value: "4 大引擎", label: "跨工作流共享同一思維模型" },
      { value: "EB 級", label: "面向資料倉儲級分析規模" },
      { value: "0 次重寫", label: "遷移模式，無需重新學習語法" }
    ],
    features: {
      eyebrow: "核心能力",
      title: "為規模化查詢和團隊審查設計",
      items: [
        { title: "感知 Schema 的 SQL 生成", body: "把自然語言問題轉換為可審查的 GoogleSQL，帶上表、欄位與安全預設值。" },
        { title: "原生處理巢狀資料", body: "用 STRUCT 和 ARRAY 直接表達複雜結構，無需先把模型打平。" },
        { title: "Dry-run 成本控制", body: "執行前估算掃描量、成本和時間，提前攔截高風險查詢。" },
        { title: "後台治理與稽核", body: "在受保護的控制台管理灰度、審批、schema 策略和稽核事件。" }
      ]
    },
    showcase: {
      eyebrow: "語法即生產力",
      title: "為複雜資料建模設計的 SQL 表達力",
      body: "從巢狀結構到分析視窗函數，GoogleSQL 把進階建模能力放進每一條 SELECT。",
      nestedTab: "巢狀資料建模",
      windowTab: "視窗分析",
      nestedCaption: "STRUCT & ARRAY / 巢狀建模",
      windowCaption: "視窗函數 / 趨勢分析"
    },
    cases: {
      eyebrow: "應用場景",
      title: "從分析問題到受控執行",
      items: [
        { tag: "BigQuery", title: "企業級資料倉儲", body: "為收入、留存、營運分析生成更安全的查詢並 dry-run。" },
        { tag: "Admin", title: "查詢審查佇列", body: "把高成本或敏感 SQL 送入審批流程。" },
        { tag: "Catalog", title: "Schema 策略", body: "標記可查詢欄位、PII 欄位與團隊規則。" }
      ]
    },
    trust: {
      eyebrow: "企業級基礎",
      title: "為需要控制權的團隊構建",
      items: [
        { title: "基於角色的後台存取", body: "透過 OAuth session 和 admin-only route 保護管理控制台。" },
        { title: "完整稽核歷史", body: "記錄登入、dry-run、審批、回滾與 schema 策略變更。" },
        { title: "可快速回滾的發布", body: "透過 canary 灰度上線並保留健康回滾目標。" },
        { title: "即時 BigQuery dry-run", body: "配置 service account 後使用 BigQuery 真實 dry-run 結果。" }
      ]
    },
    cta: {
      eyebrow: "開始使用",
      title: "準備好統一你的 SQL 工作流了嗎？",
      body: "打開查詢工具，接入 schema 上下文，把 BigQuery 操作推進到更安全的階段。",
      primary: "打開工具",
      secondary: "閱讀教程"
    },
    footer: {
      body: "統一企業資料查詢的標準語言，貫穿資料倉儲、串流處理與分散式交易系統。",
      product: "產品",
      solutions: "解決方案",
      resources: "資源",
      legal: "GoogleSQL.com 是獨立產品，與 Google 無隸屬、認可或贊助關係。"
    }
  }
};
