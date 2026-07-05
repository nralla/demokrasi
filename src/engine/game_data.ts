import type {
  VoterGroup, PolicyDef, StatDef, LeverDef, PolicyPreset,
  MinisterRole, MinisterCandidate, CoalitionParty, SocialTrend,
  CrisisTrigger, RegionDef, EventDef, DilemmaDef, LeakDef,
} from './types';

// ──────────────────────────────────────────
// 14 VOTER GROUPS — Türkiye seçmen haritası
// ──────────────────────────────────────────

export const VOTER_GROUPS: Record<string, VoterGroup> = {
  gen_z_sehir: {
    name: "Gen Z Şehirli",
    desc: "Üniversiteli, sosyal medya, Batı yaşam tarzı eğilimi",
    color: "#26BFFF",
    weight: 9.5,
    ideals: {
      income_tax: 30, vat: 25, welfare: 70, education: 95, healthcare: 85,
      police: 15, military: 25, judiciary: 80, media: 90, interest: 40,
      agriculture: 40, infrastructure: 75, environment: 85, housing: 80,
    },
    stat_weights: { economy: 0.8, inflation: 1.4, unemployment: 1.2, happiness: 1.0, trust: 0.6, education_q: 1.3, health_q: 0.8, intl: 0.5 },
    cynicism_speed: 0.9,
  },
  sekuler_orta: {
    name: "Seküler Orta Sınıf",
    desc: "İstanbul/İzmir/Ankara orta gelir, laik eğilim",
    color: "#4D8CF2",
    weight: 11.0,
    ideals: {
      income_tax: 40, vat: 35, welfare: 60, education: 85, healthcare: 80,
      police: 30, military: 40, judiciary: 85, media: 85, interest: 45,
      agriculture: 45, infrastructure: 70, environment: 75, housing: 65,
    },
    stat_weights: { economy: 1.2, inflation: 1.5, unemployment: 1.0, happiness: 1.1, trust: 0.9, education_q: 1.0, health_q: 1.0, intl: 0.7 },
    cynicism_speed: 0.7,
  },
  muhafazakar_kent: {
    name: "Muhafazakar Kentli",
    desc: "Anadolu şehirleri, merkez sağ eğilim",
    color: "#8C59BF",
    weight: 14.0,
    ideals: {
      income_tax: 50, vat: 45, welfare: 55, education: 60, healthcare: 65,
      police: 65, military: 70, judiciary: 40, media: 35, interest: 55,
      agriculture: 50, infrastructure: 60, environment: 40, housing: 55,
    },
    stat_weights: { economy: 1.0, inflation: 1.3, unemployment: 0.9, happiness: 0.9, trust: 1.1, education_q: 0.7, health_q: 0.8, intl: 0.4 },
    cynicism_speed: 0.5,
  },
  muhafazakar_koy: {
    name: "Muhafazakar Köylü",
    desc: "İç Anadolu/Karadeniz kırsalı, geleneksel değerler",
    color: "#73B34D",
    weight: 10.5,
    ideals: {
      income_tax: 45, vat: 40, welfare: 40, education: 50, healthcare: 55,
      police: 70, military: 75, judiciary: 35, media: 25, interest: 50,
      agriculture: 75, infrastructure: 55, environment: 35, housing: 45,
    },
    stat_weights: { economy: 0.8, inflation: 1.1, unemployment: 0.7, happiness: 0.8, trust: 1.2, education_q: 0.5, health_q: 0.7, intl: 0.2 },
    cynicism_speed: 0.3,
  },
  milliyetci: {
    name: "Milliyetçi Seçmen",
    desc: "Ulus-devlet, sınır güvenliği, milli değerler",
    color: "#D94033",
    weight: 9.0,
    ideals: {
      income_tax: 45, vat: 40, welfare: 45, education: 55, healthcare: 55,
      police: 80, military: 90, judiciary: 45, media: 40, interest: 50,
      agriculture: 55, infrastructure: 65, environment: 30, housing: 50,
    },
    stat_weights: { economy: 0.9, inflation: 1.0, unemployment: 0.8, happiness: 0.7, trust: 1.0, education_q: 0.6, health_q: 0.6, intl: 0.8 },
    cynicism_speed: 0.4,
  },
  kurt_secmen: {
    name: "Kürt Seçmen",
    desc: "Güneydoğu/Batman/Diyarbakır, kimlik ve eşitlik talebi",
    color: "#E68C26",
    weight: 8.5,
    ideals: {
      income_tax: 35, vat: 30, welfare: 70, education: 75, healthcare: 75,
      police: 20, military: 25, judiciary: 85, media: 80, interest: 40,
      agriculture: 60, infrastructure: 70, environment: 50, housing: 70,
    },
    stat_weights: { economy: 0.7, inflation: 1.1, unemployment: 1.3, happiness: 1.0, trust: 1.4, education_q: 1.0, health_q: 0.9, intl: 0.5 },
    cynicism_speed: 0.9,
  },
  alevi: {
    name: "Alevi Toplum",
    desc: "Eşit yurttaşlık, laiklik, kültürel tanınma",
    color: "#B34DD9",
    weight: 5.5,
    ideals: {
      income_tax: 40, vat: 35, welfare: 65, education: 80, healthcare: 75,
      police: 25, military: 35, judiciary: 90, media: 85, interest: 42,
      agriculture: 45, infrastructure: 65, environment: 60, housing: 60,
    },
    stat_weights: { economy: 0.8, inflation: 1.0, unemployment: 0.9, happiness: 1.1, trust: 1.3, education_q: 0.9, health_q: 0.8, intl: 0.6 },
    cynicism_speed: 0.8,
  },
  esnaf_kobi: {
    name: "Esnaf & KOBİ",
    desc: "Mahalle esnafı, küçük işletme, KDV hassasiyeti",
    color: "#FFB326",
    weight: 8.0,
    ideals: {
      income_tax: 20, vat: 15, welfare: 35, education: 55, healthcare: 50,
      police: 55, military: 50, judiciary: 60, media: 50, interest: 35,
      agriculture: 45, infrastructure: 60, environment: 40, housing: 40,
    },
    stat_weights: { economy: 1.5, inflation: 1.6, unemployment: 0.8, happiness: 0.8, trust: 0.7, education_q: 0.4, health_q: 0.5, intl: 0.3 },
    cynicism_speed: 0.6,
  },
  sanayici: {
    name: "Sanayici & Holding",
    desc: "Büyük iş dünyası, ihracat, düşük vergi",
    color: "#D9A61A",
    weight: 3.5,
    ideals: {
      income_tax: 10, vat: 20, welfare: 25, education: 65, healthcare: 45,
      police: 60, military: 55, judiciary: 55, media: 45, interest: 30,
      agriculture: 30, infrastructure: 80, environment: 25, housing: 30,
    },
    stat_weights: { economy: 2.0, inflation: 1.2, unemployment: 0.6, happiness: 0.5, trust: 0.6, education_q: 0.5, health_q: 0.3, intl: 1.2 },
    cynicism_speed: 0.4,
  },
  memur: {
    name: "Memur & Kamu",
    desc: "Devlet memuru, maaş ve enflasyon hassas",
    color: "#66A6BF",
    weight: 7.5,
    ideals: {
      income_tax: 35, vat: 30, welfare: 60, education: 70, healthcare: 75,
      police: 40, military: 45, judiciary: 70, media: 60, interest: 55,
      agriculture: 40, infrastructure: 55, environment: 50, housing: 55,
    },
    stat_weights: { economy: 0.9, inflation: 2.0, unemployment: 0.5, happiness: 1.0, trust: 1.0, education_q: 0.7, health_q: 0.9, intl: 0.3 },
    cynicism_speed: 0.5,
  },
  emekli: {
    name: "Emekliler",
    desc: "Sabit gelir, enflasyon ve sağlık önceliği",
    color: "#998C73",
    weight: 9.0,
    ideals: {
      income_tax: 30, vat: 25, welfare: 80, education: 50, healthcare: 90,
      police: 55, military: 50, judiciary: 60, media: 45, interest: 60,
      agriculture: 50, infrastructure: 50, environment: 45, housing: 70,
    },
    stat_weights: { economy: 0.7, inflation: 2.2, unemployment: 0.3, happiness: 1.2, trust: 1.1, education_q: 0.3, health_q: 1.5, intl: 0.2 },
    cynicism_speed: 0.7,
  },
  ciftci: {
    name: "Çiftçi & Tarım",
    desc: "Traktör konvoyu potansiyeli, gübre/fuel maliyeti",
    color: "#599933",
    weight: 6.5,
    ideals: {
      income_tax: 25, vat: 20, welfare: 45, education: 45, healthcare: 55,
      police: 50, military: 55, judiciary: 50, media: 35, interest: 45,
      agriculture: 90, infrastructure: 55, environment: 55, housing: 40,
    },
    stat_weights: { economy: 1.1, inflation: 1.4, unemployment: 0.6, happiness: 0.9, trust: 0.8, education_q: 0.4, health_q: 0.6, intl: 0.2 },
    cynicism_speed: 0.4,
  },
  ogrenci: {
    name: "Öğrenci & Akademi",
    desc: "Genç, eğitim bütçesi, işsizlik kaygısı",
    color: "#40D9A6",
    weight: 5.0,
    ideals: {
      income_tax: 25, vat: 20, welfare: 65, education: 95, healthcare: 70,
      police: 20, military: 30, judiciary: 75, media: 85, interest: 38,
      agriculture: 35, infrastructure: 65, environment: 70, housing: 75,
    },
    stat_weights: { economy: 0.6, inflation: 1.0, unemployment: 1.8, happiness: 1.0, trust: 0.7, education_q: 1.8, health_q: 0.5, intl: 0.6 },
    cynicism_speed: 0.8,
  },
  dindar_genclik: {
    name: "Dindar Gençlik",
    desc: "Genç ama muhafazakar, aile ve inanç değerleri",
    color: "#A666CC",
    weight: 6.5,
    ideals: {
      income_tax: 45, vat: 40, welfare: 55, education: 55, healthcare: 60,
      police: 60, military: 65, judiciary: 45, media: 30, interest: 52,
      agriculture: 50, infrastructure: 55, environment: 35, housing: 55,
    },
    stat_weights: { economy: 0.8, inflation: 1.1, unemployment: 1.2, happiness: 0.9, trust: 1.0, education_q: 0.8, health_q: 0.7, intl: 0.3 },
    cynicism_speed: 0.5,
  },
};

// ──────────────────────────────────────────
// 6 CORE LEVERS (14 slider yerine hızlı oynanış)
// ──────────────────────────────────────────

export const CORE_LEVERS: LeverDef[] = [
  { id: "tax", name: "Vergiler", hint: "Düşük = sevilirsin, kasa boşalır", keys: ["income_tax", "vat"], color: "#E6594D" },
  { id: "social", name: "Sosyal Devlet", hint: "Emekli, genç, hasta — hepsi buradan", keys: ["welfare", "healthcare", "education", "housing"], color: "#59BFF2" },
  { id: "security", name: "Güvenlik", hint: "Polis + asker — milliyetçi sever", keys: ["police", "military"], color: "#8073B3" },
  { id: "interest", name: "Faiz", hint: "Yüksek faiz enflasyonu keser, esnaf kızar", keys: ["interest"], color: "#D98C33" },
  { id: "freedom", name: "Adalet & Medya", hint: "Laik blok ve gençler için kritik", keys: ["judiciary", "media"], color: "#A680E6" },
  { id: "invest", name: "Yatırım", hint: "Yol, tarım, çevre — uzun vade", keys: ["infrastructure", "agriculture", "environment"], color: "#66BF73" },
];

// ──────────────────────────────────────────
// POLICY PRESETS
// ──────────────────────────────────────────

export const POLICY_PRESETS: Record<string, PolicyPreset> = {
  populist: {
    name: "Halka Dağıt",
    desc: "Kısa vadede alkış, uzun vadede fatura.",
    levers: { tax: 18, social: 85, security: 45, interest: 30, freedom: 40, invest: 40 },
  },
  belt: {
    name: "Kemer Sık",
    desc: "Esnaf ve sanayici rahatlar, sosyal taban kızar.",
    levers: { tax: 62, social: 35, security: 55, interest: 68, freedom: 50, invest: 55 },
  },
  nation: {
    name: "Milli Hat",
    desc: "Bayraklar dalgalanır, Kürt & genç gerilir.",
    levers: { tax: 48, social: 42, security: 88, freedom: 28, invest: 48 },
  },
};

// ──────────────────────────────────────────
// POLICY CATEGORIES
// ──────────────────────────────────────────

export const POLICY_CATEGORIES: Record<string, string> = {
  ekonomi: "Ekonomi",
  sosyal: "Sosyal",
  güvenlik: "Güvenlik",
  kurumsal: "Kurumsal",
};

// ──────────────────────────────────────────
// 14 POLICIES
// ──────────────────────────────────────────

export const POLICIES: Record<string, PolicyDef> = {
  income_tax:   { name: "Gelir Vergisi",     cat: "ekonomi",  cost: 0.0,  revenue: 0.35, color: "#E64D4D" },
  vat:          { name: "KDV",               cat: "ekonomi",  cost: 0.0,  revenue: 0.25, color: "#F27359" },
  interest:     { name: "Faiz Politikası",   cat: "ekonomi",  cost: 0.05, revenue: 0.0,  color: "#CC8033" },
  agriculture:  { name: "Tarım Desteği",     cat: "ekonomi",  cost: 0.18, revenue: 0.0,  color: "#66B340" },
  welfare:      { name: "Sosyal Yardım",     cat: "sosyal",   cost: 0.28, revenue: 0.0,  color: "#59B3F2" },
  education:    { name: "Eğitim Bütçesi",    cat: "sosyal",   cost: 0.22, revenue: 0.0,  color: "#66D973" },
  healthcare:   { name: "Sağlık Bütçesi",    cat: "sosyal",   cost: 0.25, revenue: 0.0,  color: "#F280BF" },
  housing:      { name: "Konut & Kira",      cat: "sosyal",   cost: 0.15, revenue: 0.0,  color: "#8CBFE6" },
  police:       { name: "Polis & Güvenlik",  cat: "güvenlik", cost: 0.15, revenue: 0.0,  color: "#8080BF" },
  military:     { name: "Askeri Harcama",    cat: "güvenlik", cost: 0.2,  revenue: 0.0,  color: "#8C6659" },
  judiciary:    { name: "Yargı Bağımsızlığı",cat: "güvenlik", cost: 0.08, revenue: 0.0,  color: "#998CD9" },
  media:        { name: "Medya Özgürlüğü",   cat: "kurumsal", cost: 0.05, revenue: 0.0,  color: "#BF8CF2" },
  infrastructure:{ name: "Altyapı Yatırımı", cat: "kurumsal", cost: 0.22, revenue: 0.0,  color: "#B3A64D" },
  environment:  { name: "Çevre Politikası",  cat: "kurumsal", cost: 0.1,  revenue: 0.0,  color: "#4DB380" },
};

// ──────────────────────────────────────────
// POLICY → STAT EFFECTS (per policy point 0-100)
// ──────────────────────────────────────────

export const POLICY_STAT_EFFECTS: Record<string, Record<string, number>> = {
  income_tax:    { economy: -0.42, inflation: -0.28, unemployment: 0.20, budget: 1.20, trust: -0.15, happiness: -0.12 },
  vat:           { economy: -0.28, inflation: -0.18, unemployment: 0.14, budget: 1.00, trust: -0.22, happiness: -0.14 },
  interest:      { economy: -0.50, inflation: -0.80, unemployment: 0.40, budget: 0.18, trust: -0.12 },
  agriculture:   { economy: 0.22,  inflation: 0.14,  unemployment: -0.18, budget: -0.60, trust: 0.12 },
  welfare:       { economy: -0.18, inflation: 0.10,  unemployment: -0.28, budget: -0.90, trust: 0.18, happiness: 0.50 },
  education:     { economy: 0.28,  inflation: 0.07,  unemployment: -0.35, budget: -0.75, education_q: 0.80, happiness: 0.18 },
  healthcare:    { economy: -0.10, inflation: 0.07,  unemployment: -0.07, budget: -0.85, health_q: 0.90, happiness: 0.35 },
  housing:       { economy: 0.07,  inflation: 0.14,  unemployment: -0.10, budget: -0.50, happiness: 0.40, trust: 0.15 },
  police:        { economy: -0.07, inflation: 0.0,   unemployment: 0.0,  budget: -0.50, stability: 0.65, trust: -0.18, happiness: -0.15 },
  military:      { economy: -0.14, inflation: 0.07,  budget: -0.65, stability: 0.40, intl: 0.28, trust: 0.12 },
  judiciary:     { economy: 0.10,  inflation: 0.0,   budget: -0.28, stability: 0.35, trust: 0.60, intl: 0.22 },
  media:         { economy: 0.07,  inflation: 0.0,   budget: -0.18, stability: -0.20, trust: 0.35, intl: 0.35, happiness: 0.15 },
  infrastructure:{ economy: 0.60,  inflation: 0.18,  unemployment: -0.40, budget: -0.75, happiness: 0.22, intl: 0.15 },
  environment:   { economy: -0.14, inflation: 0.04,  budget: -0.35, happiness: 0.18, health_q: 0.22, intl: 0.28 },
};

// ──────────────────────────────────────────
// NON-LINEAR CURVE POWERS (Democracy 4 x^0.76 style)
// ──────────────────────────────────────────

export const POLICY_CURVE_POWER: Record<string, number> = {
  income_tax: 0.82, vat: 0.82, interest: 0.70, agriculture: 0.88,
  welfare: 0.75, education: 0.72, healthcare: 0.72, housing: 0.78,
  police: 0.68, military: 0.68, judiciary: 0.80, media: 0.80,
  infrastructure: 0.85, environment: 0.85,
};

// ──────────────────────────────────────────
// 10 NATIONAL STATS
// ──────────────────────────────────────────

export const STAT_DEFS: Record<string, StatDef> = {
  economy:      { name: "Ekonomi",              good_high: true,  base: 50.0 },
  inflation:    { name: "Enflasyon",            good_high: false, base: 45.0 },
  unemployment: { name: "İşsizlik",             good_high: false, base: 40.0 },
  budget:       { name: "Bütçe Denge",          good_high: true,  base: 50.0 },
  stability:    { name: "İstikrar",             good_high: true,  base: 55.0 },
  happiness:    { name: "Yaşam Memnuniyeti",    good_high: true,  base: 50.0 },
  trust:        { name: "Devlete Güven",        good_high: true,  base: 48.0 },
  education_q:  { name: "Eğitim Kalitesi",      good_high: true,  base: 50.0 },
  health_q:     { name: "Sağlık Kalitesi",      good_high: true,  base: 52.0 },
  intl:         { name: "Uluslararası İtibar",  good_high: true,  base: 50.0 },
};

// ──────────────────────────────────────────
// PARTY LOYALTY per group
// ──────────────────────────────────────────

export const PARTY_LOYALTY: Record<string, number> = {
  gen_z_sehir: 0.15, sekuler_orta: 0.35, muhafazakar_kent: 0.55,
  muhafazakar_koy: 0.65, milliyetci: 0.50, kurt_secmen: 0.20,
  alevi: 0.20, esnaf_kobi: 0.30, sanayici: 0.25,
  memur: 0.45, emekli: 0.40, ciftci: 0.50,
  ogrenci: 0.15, dindar_genclik: 0.50,
};

// ──────────────────────────────────────────
// POLITICAL CAPITAL COSTS per policy
// ──────────────────────────────────────────

export const POLICY_POLITICAL_COST: Record<string, number> = {
  income_tax: 12, vat: 14, interest: 18, agriculture: 8,
  welfare: 8, education: 7, healthcare: 7, housing: 9,
  police: 10, military: 15, judiciary: 14, media: 14,
  infrastructure: 6, environment: 9,
};

// ──────────────────────────────────────────
// 7 REGIONS
// ──────────────────────────────────────────

export const REGIONS: Record<string, RegionDef> = {
  marmara: {
    name: "Marmara", weight: 22.0,
    policy_sensitivity: { vat: -1.2, income_tax: -0.8, infrastructure: 0.9, housing: 1.0, environment: 0.6 },
    stat_weights: { economy: 1.2, inflation: 1.3 },
  },
  ege: {
    name: "Ege", weight: 10.0,
    policy_sensitivity: { agriculture: 0.7, environment: 0.8, vat: -0.6 },
    stat_weights: { happiness: 1.0, economy: 0.8 },
  },
  ic_anadolu: {
    name: "İç Anadolu", weight: 18.0,
    policy_sensitivity: { agriculture: 0.8, welfare: 0.4, police: 0.5, military: 0.6 },
    stat_weights: { trust: 0.9, stability: 1.0 },
  },
  karadeniz: {
    name: "Karadeniz", weight: 12.0,
    policy_sensitivity: { agriculture: 1.0, infrastructure: 0.7, welfare: 0.5 },
    stat_weights: { happiness: 0.8 },
  },
  akdeniz: {
    name: "Akdeniz", weight: 11.0,
    policy_sensitivity: { infrastructure: 0.8, environment: 0.7, housing: 0.5 },
    stat_weights: { economy: 0.9 },
  },
  guneydogu: {
    name: "Güneydoğu", weight: 12.0,
    policy_sensitivity: { agriculture: 1.2, welfare: 0.9, judiciary: 1.0, police: -0.8, military: -0.5 },
    stat_weights: { trust: 1.2, education_q: 0.8 },
  },
  dogu: {
    name: "Doğu", weight: 8.0,
    policy_sensitivity: { agriculture: 1.5, welfare: 1.0, infrastructure: 0.9, military: 0.4 },
    stat_weights: { trust: 1.0, health_q: 0.7 },
  },
};

// ──────────────────────────────────────────
// 7 MINISTER ROLES
// ──────────────────────────────────────────

export const MINISTER_ROLES: Record<string, MinisterRole> = {
  finance:    { name: "Maliye",   policy: "income_tax" },
  interior:   { name: "İçişleri", policy: "police" },
  foreign:    { name: "Dışişleri", policy: "infrastructure" },
  health:     { name: "Sağlık",   policy: "healthcare" },
  education:  { name: "Eğitim",   policy: "education" },
  agriculture:{ name: "Tarım",    policy: "agriculture" },
  justice:    { name: "Adalet",   policy: "judiciary" },
};

// ──────────────────────────────────────────
// MINISTER CANDIDATES
// ──────────────────────────────────────────

export const MINISTER_CANDIDATES: Record<string, MinisterCandidate> = {
  fin_technocrat: {
    name: "Dr. Arın", skill: 0.9, scandal_risk: 0.2, campaigning: 0.3,
    trait: "Ekonomiyi düzeltir.",
    story: "Eski Merkez Bankası başkan yardımcısı. Chicago Üniversitesi ekonomi doktorası. Piyasaların güvendiği bir isim.",
    special: "Faiz politikasına +5 bonus — 'Merkez Bankası bağımsızlığı' konusunda ısrarcı.",
    weakness: "Halkla iletişimi zayıf, televizyonda soğuk bulunur.",
    policy_pref: { interest: "high", income_tax: "low" },
    pleases: ["sanayici", "esnaf_kobi"], angers: ["emekli"],
    scandal_text: "Vergi affı listesinde akrabası çıktı.",
    hidden_agenda: "3 tur içinde %30 ihtimalle IMF ile gizli görüşme yapar — sızarsa trust -8.",
  },
  fin_populist: {
    name: "Kemal Bey", skill: 0.5, scandal_risk: 0.5, campaigning: 0.85,
    trait: "Popülist harcama sever.",
    story: "Eski belediye başkanı. Meydanlarda 'halkın adamı' diye anılır. Ekonomi eğitimi yok ama kalabalıkları coşturur.",
    special: "Her seçim dönemi +8 siyasi sermaye — 'sandıkta karşılığı var.'",
    weakness: "Bütçe disiplini nedir bilmez, harcama kalemleri kabarır.",
    policy_pref: { welfare: "high", income_tax: "low" },
    pleases: ["muhafazakar_koy", "emekli"], angers: ["sanayici"],
    scandal_text: "Gizli harcama talimatı sızdı.",
    hidden_agenda: "2 tur içinde %45 ihtimalle 'habersiz zam' skandalı — memur öfkelenir.",
  },
  int_hard: {
    name: "Albay Selim", skill: 0.8, scandal_risk: 0.4, campaigning: 0.5,
    trait: "Sert güvenlik.",
    story: "Emekli albay. 15 yıl doğuda görev yaptı. 'Terörle müzakere olmaz' çizgisinde.",
    special: "Terör riskini tur başına ekstra 3 puan düşürür.",
    weakness: "AB ve insan hakları örgütleriyle sürekli gerginlik.",
    policy_pref: { police: "high", military: "high", judiciary: "low" },
    pleases: ["milliyetci", "muhafazakar_kent"], angers: ["gen_z_sehir", "kurt_secmen"],
    scandal_text: "Gözaltı skandalı medyada.",
    hidden_agenda: "Gösterilere orantısız müdahale emri verebilir — international trust -5.",
  },
  int_soft: {
    name: "Av. Derya", skill: 0.6, scandal_risk: 0.15, campaigning: 0.7,
    trait: "Diyalogcu içişleri.",
    story: "İnsan hakları avukatı. Baro başkan yardımcılığı yaptı. 'Polise eğitim şart' der.",
    special: "Protesto event'leri %50 daha az tetiklenir.",
    weakness: "Milliyetçi basında 'yumuşak karnımız' diye manşet olur.",
    policy_pref: { police: "low", judiciary: "high", media: "high" },
    pleases: ["kurt_secmen", "alevi"], angers: ["milliyetci"],
    scandal_text: "Protesto müdahalesi tartışıldı.",
    hidden_agenda: "Gizli tanık koruma programını genişletmek ister — muhafazakarları rahatsız eder.",
  },
  for_diplomat: {
    name: "Büyükelçi Nuri", skill: 0.85, scandal_risk: 0.25, campaigning: 0.5,
    trait: "Diplomasi ustası.",
    story: "25 yıllık diplomat. BM, NATO, AB masalarında Türkiye'yi temsil etti. 4 dil bilir.",
    special: "Uluslararası itibar (intl) her tur +2 yenilenir.",
    weakness: "İç politikayı anlamaz, Anadolu'da 'elit' diye burun kıvrılır.",
    policy_pref: { infrastructure: "high", media: "high" },
    pleases: ["sanayici", "sekuler_orta"], angers: ["milliyetci"],
    scandal_text: "Gizli görüşme kaydı sızdı.",
    hidden_agenda: "AB üyeliği için tavizler verebilir — içeride 'vatan satıldı' algısı.",
  },
  health_reformer: {
    name: "Prof. Ece", skill: 0.9, scandal_risk: 0.2, campaigning: 0.6,
    trait: "Sağlığı güçlendirir.",
    story: "Tıp fakültesi dekanı. Pandemi döneminde bilim kurulu üyesiydi. 'Her vatandaş nitelikli sağlığa erişmeli' vizyonu.",
    special: "Sağlık kalitesine (health_q) +3 sürekli bonus.",
    weakness: "İlaç lobisiyle arası açık, bütçe talepleri yüksek.",
    policy_pref: { healthcare: "high", welfare: "high" },
    pleases: ["emekli", "memur"], angers: [],
    scandal_text: "İhale dosyası karıştı.",
    hidden_agenda: "Özel hastane zincirini soruşturacak — sanayici desteği düşer.",
  },
  edu_youth: {
    name: "Öğr. Murat", skill: 0.75, scandal_risk: 0.35, campaigning: 0.75,
    trait: "Gençlere yakın.",
    story: "35 yaşında eğitim profesörü. TEDx konuşmaları viral olur. 'Kodlama her okula' kampanyasının öncüsü.",
    special: "Genç seçmen katılımını +%8 artırır.",
    weakness: "Deneyimsiz, bürokrasiyle başı belaya girer.",
    policy_pref: { education: "high", media: "high", judiciary: "high" },
    pleases: ["ogrenci", "gen_z_sehir"], angers: ["muhafazakar_koy"],
    scandal_text: "Müfredat tartışması.",
    hidden_agenda: "Laik eğitim reformu önerecek — dindar gençlik öfkelenir.",
  },
  agr_farmer: {
    name: "Çiftçi Hasan", skill: 0.8, scandal_risk: 0.3, campaigning: 0.4,
    trait: "Köyü bilir.",
    story: "Konya'da 500 dönüm arazi işledi. Ziraat odası başkanlığı yaptı. 'Mazot 10 liraya inmedikçe çiftçi gülmez.'",
    special: "Tarım politikasına +6 sürekli bonus — 'toprağı tanır.'",
    weakness: "Büyükşehir siyasetinde acemi, medya önünde heyecanlanır.",
    policy_pref: { agriculture: "high", infrastructure: "high", interest: "low" },
    pleases: ["ciftci", "muhafazakar_koy"], angers: ["sanayici"],
    scandal_text: "Gübre ihalesi soruşturması.",
    hidden_agenda: "Kendi bölgesine ekstra tarım fonu aktarır — diğer bölgeler homurdanır.",
  },
  just_law: {
    name: "Hakim Ayşe", skill: 0.85, scandal_risk: 0.15, campaigning: 0.55,
    trait: "Yargı reformu.",
    story: "20 yıllık hakim. AİHM'de Türkiye aleyhine çıkan kararları azalttı. 'Adalet gecikirse toplum çürür.'",
    special: "Trust (devlete güven) her tur +2 yenilenir.",
    weakness: "Siyasi baskıya boyun eğmez, bu da hükümetle gerginlik yaratır.",
    policy_pref: { judiciary: "high", media: "high", police: "low" },
    pleases: ["alevi", "kurt_secmen", "sekuler_orta"], angers: ["muhafazakar_kent"],
    scandal_text: "Atama listesi tartışması.",
    hidden_agenda: "Yolsuzluk soruşturması başlatacak — partiden tepki gelebilir.",
  },
  fin_banker: {
    name: "Zeynep Hanım", skill: 0.8, scandal_risk: 0.3, campaigning: 0.55,
    trait: "Wall Street tecrübesi.",
    story: "15 yıl Londra ve New York'ta yatırım bankacılığı. Goldman Sachs'ta emerging markets direktörü. 'Türkiye potansiyelini harcamamalı' diyor.",
    special: "Doğrudan yabancı yatırım her tur +4 artar.",
    weakness: "Küçük esnafı anlamaz, 'mahalle ekonomisi'ni küçümser.",
    policy_pref: { interest: "high", vat: "low", income_tax: "low" },
    pleases: ["sanayici", "sekuler_orta"], angers: ["esnaf_kobi", "emekli"],
    scandal_text: "Offshore hesap belgeleri basının elinde.",
    hidden_agenda: "Yabancı yatırımcıya özel vergi avantajı sağlayacak — esnaf 'haksız rekabet' diye ayaklanır.",
  },
  int_police: {
    name: "Emniyet M. Faruk", skill: 0.7, scandal_risk: 0.3, campaigning: 0.6,
    trait: "Polis kökenli teknokrat.",
    story: "30 yıllık emniyet mensubu. Interpol'de görev yaptı. 'Güvenlik bilimsel veriyle sağlanır, sloganla değil.'",
    special: "Her tur stability +1.5 (veriye dayalı güvenlik politikaları).",
    weakness: "Gençlik ve özgürlük hareketlerine mesafeli — 'önce düzen' der.",
    policy_pref: { police: "high", judiciary: "high", media: "high" },
    pleases: ["memur", "muhafazakar_kent"], angers: ["gen_z_sehir", "ogrenci"],
    scandal_text: "Eski dönemden bir gösterici dosyası açığa çıktı.",
    hidden_agenda: "Yüz tanıma sistemi yaygınlaştıracak — sivil toplum 'gözetim devleti' diye ayaklanır.",
  },
  for_export: {
    name: "İhracatçı Cemil", skill: 0.7, scandal_risk: 0.35, campaigning: 0.65,
    trait: "Ticaret diplomasisi.",
    story: "TİM eski başkan yardımcısı. Afrika ve Orta Asya'da 20 ülkeye ihracat köprüsü kurdu. 'Dış politika ticaretle başlar.'",
    special: "İhracat artışı: ekonomiye +3 her tur.",
    weakness: "İnsan hakları konularında sessiz kalması tepki çeker.",
    policy_pref: { infrastructure: "high", vat: "low", military: "low" },
    pleases: ["sanayici", "esnaf_kobi"], angers: ["milliyetci"],
    scandal_text: "İhracat teşvikinde usulsüzlük raporu sızdı.",
    hidden_agenda: "Savunma sanayi ihracatını genişletecek — AB'den yaptırım gelebilir.",
  },
  for_young: {
    name: "Dr. Selin", skill: 0.75, scandal_risk: 0.2, campaigning: 0.75,
    trait: "Yeni nesil diplomasi.",
    story: "38 yaşında siyaset bilimi profesörü. İklim diplomasisi ve dijital dönüşüm uzmanı. 'Dış politika Twitter'dan ibaret değil.'",
    special: "Gençlerin uluslararası değişim programı — happiness +2 her tur.",
    weakness: "Deneyimsiz bulunur, 'küçük elçi' lakabı takıldı.",
    policy_pref: { environment: "high", media: "high", infrastructure: "high" },
    pleases: ["gen_z_sehir", "ogrenci", "sekuler_orta"], angers: ["muhafazakar_koy"],
    scandal_text: "Üniversite yıllarından bir makale tartışma yarattı.",
    hidden_agenda: "İklim krizi için radikal yeşil dönüşüm önerecek — sanayici 'üretim durur' diye isyan eder.",
  },
  health_traditional: {
    name: "Dr. Osman", skill: 0.65, scandal_risk: 0.25, campaigning: 0.7,
    trait: "Geleneksel tıp destekçisi.",
    story: "Anadolu'da 25 yıl aile hekimliği yaptı. 'Modern tıp + geleneksel tıp = bütüncül sağlık' felsefesinde. Halkın içinden biri.",
    special: "Kırsal bölgelerde sağlık memnuniyeti +4.",
    weakness: "Büyük şehir hastaneleriyle iletişimi zayıf, uzmanlar eleştiriyor.",
    policy_pref: { healthcare: "high", education: "low", welfare: "high" },
    pleases: ["muhafazakar_koy", "ciftci", "emekli"], angers: ["sekuler_orta", "gen_z_sehir"],
    scandal_text: "Alternatif tıp kliniği denetimden geçti.",
    hidden_agenda: "Geleneksel tıp merkezlerine ayrıcalıklı bütçe — modern hastanelerin fonu kesilir.",
  },
  health_private: {
    name: "Dr. Leyla", skill: 0.85, scandal_risk: 0.4, campaigning: 0.4,
    trait: "Özel sektör sağlık.",
    story: "Özel hastane zinciri CEO'su. Johns Hopkins mezunu. 'Kamu-özel ortaklığıyla dünya standartlarında sağlık' vizyonu.",
    special: "Sağlık turizmi geliri: ekonomi +2, intl +2 her tur.",
    weakness: "Kamu hastanelerini küçümser, 'devlet hastanesinde kuyruk olmaz' sözü tepki çekti.",
    policy_pref: { healthcare: "high", income_tax: "low" },
    pleases: ["sanayici", "sekuler_orta"], angers: ["memur", "emekli"],
    scandal_text: "Kamu-özel hastane anlaşmasında usulsüzlük bulgusu.",
    hidden_agenda: "Kamu hastanelerini özelleştirme planı — memur sendikaları genel grev tehdidi yapar.",
  },
  edu_conservative: {
    name: "Prof. İsmail", skill: 0.7, scandal_risk: 0.2, campaigning: 0.7,
    trait: "Değerler eğitimi.",
    story: "İlahiyat ve eğitim bilimleri doktorası. İmam hatip mezunu, sonradan Harvard'da eğitim politikaları üzerine çalıştı. 'Maneviyat ve bilim bir arada.'",
    special: "Muhafazakar ailelerin eğitim memnuniyeti +5.",
    weakness: "Seküler kesim 'eğitimi dine alet ediyor' diye tepkili.",
    policy_pref: { education: "high", media: "low", judiciary: "low" },
    pleases: ["muhafazakar_kent", "muhafazakar_koy", "dindar_genclik"], angers: ["sekuler_orta", "alevi", "gen_z_sehir"],
    scandal_text: "Vakıf üniversitesine kontenjan ayrıcalığı belgesi.",
    hidden_agenda: "Zorunlu din eğitimini artırma planı — Alevi ve laik gruplar protestoya başlar.",
  },
  edu_tech: {
    name: "Dr. Aylin", skill: 0.85, scandal_risk: 0.15, campaigning: 0.65,
    trait: "Teknoloji eğitimi.",
    story: "MIT'de yapay zeka doktorası. 'Her çocuk 10 yaşında kod yazmalı' manifestosuyla tanındı. Silikon Vadisi'nden 3 girişim çıkardı.",
    special: "Teknoloji eğitimi: education_q +2 ve economy +2 her tur.",
    weakness: "Kırsalda internet olmadığını unutur, 'her köye fiber' sözü gerçekçi bulunmaz.",
    policy_pref: { education: "high", infrastructure: "high", media: "high" },
    pleases: ["gen_z_sehir", "ogrenci", "sanayici"], angers: ["muhafazakar_koy"],
    scandal_text: "Eğitim teknolojileri ihalesinde yakınlarına iş verdi.",
    hidden_agenda: "Tablet dağıtımı için büyük bütçe talebi — 'önce açlık, sonra tablet' eleştirisi alır.",
  },
  agr_corporate: {
    name: "Tarım CEO'su Melis", skill: 0.75, scandal_risk: 0.4, campaigning: 0.5,
    trait: "Endüstriyel tarım.",
    story: "Hollanda Wageningen mezunu. 'Hassas tarım ve dikey çiftliklerle Türkiye gıda devi olur' vizyonu. Büyük tarım şirketlerinin desteği var.",
    special: "Tarım verimliliği: ekonomi +3 ve ihracat artışı.",
    weakness: "Küçük çiftçi 'bizi bitirecek' diye korkar, aile tarımını küçümser.",
    policy_pref: { agriculture: "high", infrastructure: "high", environment: "low" },
    pleases: ["sanayici", "esnaf_kobi"], angers: ["ciftci", "muhafazakar_koy"],
    scandal_text: "Tohum tekelleşmesi araştırması basında.",
    hidden_agenda: "GDO'lu tohum ithalatını serbest bırakma planı — organik tarım lobisi ayaklanır.",
  },
  agr_organic: {
    name: "Ekolojik Ziraatçi Deniz", skill: 0.65, scandal_risk: 0.15, campaigning: 0.65,
    trait: "Organik ve yerel tarım.",
    story: "Ege'de organik zeytin üreticisi kooperatifinin kurucusu. Slow Food hareketi Türkiye temsilcisi. 'İyi, temiz, adil gıda' sloganı.",
    special: "Kırsal kalkınma: çiftçi ve muhafazakar köy approval +2 her tur.",
    weakness: "Büyük ölçekli üretimi anlamaz, 'endüstriyel tarım zehirdir' sözü ihracatçıları kızdırır.",
    policy_pref: { agriculture: "high", environment: "high", interest: "low" },
    pleases: ["ciftci", "muhafazakar_koy", "gen_z_sehir"], angers: ["sanayici"],
    scandal_text: "Organik sertifika usulsüzlüğü iddiası.",
    hidden_agenda: "Kimyasal gübre yasağı getirme planı — büyük çiftlikler 'verim düşer' diye isyan eder.",
  },
  just_prosecutor: {
    name: "Savcı Kerim", skill: 0.8, scandal_risk: 0.35, campaigning: 0.45,
    trait: "Suç ve ceza odaklı.",
    story: "25 yıllık cumhuriyet savcısı. Organize suçlar ve yolsuzluk davalarında görev yaptı. 'Adalet sadece mahkemede değil, sokakta başlar.'",
    special: "Yolsuzluk soruşturmaları: trust +2 ve stability +1 her tur.",
    weakness: "Medya önünde fazla sert konuşur, 'cadı avı' eleştirisi alır.",
    policy_pref: { judiciary: "high", police: "high", media: "low" },
    pleases: ["milliyetci", "muhafazakar_kent"], angers: ["kurt_secmen", "gen_z_sehir"],
    scandal_text: "Görevden alınan savcı dosyası basının eline geçti.",
    hidden_agenda: "Geniş çaplı yolsuzluk operasyonu başlatacak — koalisyon ortakları rahatsız olur.",
  },
  just_academic: {
    name: "Prof. Dr. Nuray", skill: 0.9, scandal_risk: 0.1, campaigning: 0.4,
    trait: "Anayasa hukukçusu.",
    story: "Anayasa hukuku profesörü, AYM'de bilirkişi olarak görev yaptı. 'Hukukun üstünlüğü pazarlık konusu olamaz' duruşuyla tanınır.",
    special: "Kurumsal güven: trust +3 her tur.",
    weakness: "Pratik siyaseti anlamaz, 'fildişi kule' eleştirisi alır. Siyasi krizlerde yavaş kalır.",
    policy_pref: { judiciary: "high", media: "high", police: "low" },
    pleases: ["sekuler_orta", "alevi", "gen_z_sehir"], angers: ["muhafazakar_kent", "milliyetci"],
    scandal_text: "Eski bir öğrencisiyle yazışması basına düştü.",
    hidden_agenda: "AYM yetkilerini genişletme önerisi — hükümet 'yargı darbesi' diye karşı çıkar.",
  },
};

// ──────────────────────────────────────────
// 4 COALITION PARTIES
// ──────────────────────────────────────────

export const COALITION_PARTIES: Record<string, CoalitionParty> = {
  nationalist: {
    name: "Milliyetçi Blok", seats: 45, mood_boost: 6.0, mood_penalty: 5.0, anger: 4.0,
    pleases: ["milliyetci", "muhafazakar_kent"], angers: ["kurt_secmen", "gen_z_sehir"],
    cost_text: "Güvenlik artır, Kürt politikası yumuşatma.",
  },
  peoples: {
    name: "Halk Bloku", seats: 38, mood_boost: 5.0, mood_penalty: 6.0, anger: 5.0,
    pleases: ["kurt_secmen", "alevi"], angers: ["milliyetci", "muhafazakar_koy"],
    cost_text: "Yargı reformu ve Kürtçe TV vaadi.",
  },
  liberal: {
    name: "Liberal Grup", seats: 28, mood_boost: 4.0, mood_penalty: 4.0, anger: 3.0,
    pleases: ["sekuler_orta", "sanayici"], angers: ["muhafazakar_koy"],
    cost_text: "Vergi indirimi ve medya özgürlüğü.",
  },
  religious: {
    name: "Dindar Parti", seats: 32, mood_boost: 5.0, mood_penalty: 4.0, anger: 3.0,
    pleases: ["dindar_genclik", "muhafazakar_kent"], angers: ["gen_z_sehir", "alevi"],
    cost_text: "Aile politikası, laiklik tartışması.",
  },
};

// ──────────────────────────────────────────
// 8 SOCIAL TRENDS
// ──────────────────────────────────────────

export const SOCIAL_TRENDS: SocialTrend[] = [
  { tag: "FaizDüşsün", desc: "Esnaf faiz indirimi istiyor", boosts: { esnaf_kobi: 4.0, sanayici: 3.0 }, penalties: { memur: -2.0 } },
  { tag: "Adaletİstiyoruz", desc: "Yargı bağımsızlığı talebi", boosts: { kurt_secmen: 5.0, alevi: 4.0, gen_z_sehir: 3.0 }, penalties: { muhafazakar_kent: -2.0 } },
  { tag: "KYKYoksul", desc: "Öğrenci burs isyanı", boosts: { ogrenci: 6.0, gen_z_sehir: 4.0 }, penalties: {} },
  { tag: "EmekliAç", desc: "Emekli maaşı yetersiz", boosts: { emekli: 6.0 }, penalties: { sanayici: -2.0 } },
  { tag: "VatanSağolsun", desc: "Milliyetçi dalga", boosts: { milliyetci: 5.0, muhafazakar_koy: 3.0 }, penalties: { kurt_secmen: -3.0 } },
  { tag: "ÇiftçiYürüyor", desc: "Mazot pahalı", boosts: { ciftci: 5.0 }, penalties: { esnaf_kobi: -1.0 } },
  { tag: "ABYaşamı", desc: "KONDA: %68 AB standardı istiyor", boosts: { sekuler_orta: 4.0, gen_z_sehir: 3.0 }, penalties: { muhafazakar_koy: -2.0 } },
  { tag: "DolarNereye", desc: "Kur paniği", boosts: {}, penalties: { esnaf_kobi: -4.0, emekli: -3.0, memur: -3.0 } },
];

// ──────────────────────────────────────────
// SUCCESS CRISIS TRIGGERS
// ──────────────────────────────────────────

export const SUCCESS_CRISIS_TRIGGERS: Record<string, CrisisTrigger> = {
  debt_bomb: {
    name: "Borç Krizi",
    desc: "Uzun süreli popülist politika sonucu borç patladı. IMF kapıda.",
    priority: 95,
    stat_deltas: { economy: -12.0, trust: -10.0, intl: -8.0, stability: -5.0 },
    group_mood: { sanayici: -10.0, sekuler_orta: -8.0, emekli: -6.0, esnaf_kobi: -8.0 },
  },
  hyperinflation: {
    name: "Hiperenflasyon Kapıda",
    desc: "Enflasyon kontrolden çıktı. Market rafları boş, vatandaş isyanda.",
    priority: 93,
    stat_deltas: { stability: -10.0, happiness: -12.0, trust: -8.0 },
    group_mood: { emekli: -14.0, memur: -10.0, esnaf_kobi: -12.0, ciftci: -8.0 },
  },
  capital_flight: {
    name: "Sermaye Kaçışı",
    desc: "Yabancı yatırımcı Türkiye'den çıkıyor. Borsa çakıldı.",
    priority: 88,
    stat_deltas: { economy: -10.0, unemployment: 8.0, intl: -6.0 },
    group_mood: { sanayici: -12.0, esnaf_kobi: -8.0, gen_z_sehir: -6.0 },
  },
  brain_drain: {
    name: "Beyin Göçü",
    desc: "Genç mezunlar yurt dışına kaçıyor. 'Bu ülkede gelecek yok' diyorlar.",
    priority: 82,
    stat_deltas: { economy: -6.0, education_q: -4.0, intl: -4.0 },
    group_mood: { gen_z_sehir: -10.0, ogrenci: -8.0, sekuler_orta: -6.0 },
  },
  general_strike: {
    name: "Genel Grev",
    desc: "Tüm sendikalar sokağa döküldü. Ülke durma noktasında.",
    priority: 90,
    stat_deltas: { economy: -8.0, stability: -14.0, happiness: -6.0 },
    group_mood: { memur: -8.0, emekli: -6.0, esnaf_kobi: -5.0 },
    group_anger: { memur: 14.0, emekli: 10.0 },
  },
};

// ──────────────────────────────────────────
// EVENTS (simplified — full list below)
// ──────────────────────────────────────────

export const ALL_EVENTS: EventDef[] = [
  {
    title: "Lira Dalgalanması",
    text: "Döviz kuru bir gecede sıçradı. Esnaf 'dükkanı kapatırım' dedi, sanayici Merkez Bankası'na baktı.",
    requires: { stats_min: { inflation: 50 } },
    stat_deltas: { economy: -4.0, trust: -3.0, inflation: 3.0 },
    group_mood: { esnaf_kobi: -6.0, emekli: -5.0, sanayici: -4.0 },
  },
  {
    title: "TikTok Ekonomi İsyanı",
    text: "Gen Z #EnflasyonNedenBuKadar diye trend açtı. Videolar 10M izlendi.",
    group_mood: { gen_z_sehir: -5.0, ogrenci: -4.0 },
  },
  {
    title: "KONDA Anketi Yayımlandı",
    text: "Anket: Nüfusun %68'i AB yaşam standardı istiyor. Seküler blok 'gördünüz mü' dedi.",
    group_mood: { sekuler_orta: 3.0, gen_z_sehir: 3.0, muhafazakar_koy: -3.0 },
  },
  {
    title: "Traktör Konvoyu",
    text: "Çiftçiler Ankara yolunu kesti. Mazot fiyatı manşet oldu.",
    requires: { stats_min: { inflation: 40 } },
    group_mood: { ciftci: -8.0, muhafazakar_koy: -4.0 },
    group_anger: { ciftci: 8.0 },
  },
  {
    title: "Üniversite Harç Protestosu",
    text: "Öğrenciler kampüsleri işgal etti. 'Eğitim hakkı' pankartları.",
    group_mood: { ogrenci: -6.0, gen_z_sehir: -4.0 },
  },
  {
    title: "Sağlık Bakanlığı Skandalı",
    text: "Hastane randevu sistemi çöktü. Emekliler Meclis önünde.",
    requires: { stats_min: { health_q: 35 } },
    stat_deltas: { trust: -4.0, health_q: -3.0 },
    group_mood: { emekli: -7.0, memur: -5.0 },
  },
  {
    title: "İş Dünyası Raporu",
    text: "İş dünyası 'vergi ve faiz yükü' raporu sundu. Sanayici basın toplantısı yaptı.",
    group_mood: { sanayici: -4.0, esnaf_kobi: -4.0 },
  },
  {
    title: "Diyarbakır Kültür Festivali",
    text: "Kültür festivali barış mesajıyla sona erdi. Kürt seçmen umutlandı.",
    group_mood: { kurt_secmen: 5.0, alevi: 2.0 },
  },
  {
    title: "Güvenlik Operasyonu",
    text: "Sınır ötesi operasyon haberi. Milliyetçi seçmen bayrak astı.",
    group_mood: { milliyetci: 6.0, muhafazakar_kent: 3.0, kurt_secmen: -4.0 },
  },
  {
    title: "Gazeteci Tutuklaması",
    text: "Bir gazeteci gözaltına alındı. Twitter'da #BasınÖzgürlüğü trend oldu.",
    requires: { stats_max: { media: 40 } },
    stat_deltas: { trust: -3.0, intl: -3.0 },
    group_mood: { gen_z_sehir: -5.0, sekuler_orta: -4.0 },
  },
  {
    title: "İhracat Rekoru",
    text: "Sanayi ihracatta rekor kırdı. Ekonomi bakanı gülümsedi — enflasyon hâlâ yüksek.",
    requires: { stats_min: { economy: 55 } },
    stat_deltas: { economy: 3.0, intl: 2.0 },
    group_mood: { sanayici: 5.0, esnaf_kobi: 3.0 },
  },
  {
    title: "Memur Maaş Zammı Baskısı",
    text: "Sendikalar 'enflasyon yuttu maaşımızı' dedi. Kamu çalışanları greve yakın.",
    requires: { stats_min: { inflation: 45 } },
    group_mood: { memur: -5.0, emekli: -3.0 },
  },
  {
    title: "Alevi Cemevi Açılışı",
    text: "Yeni cemevi açıldı. Alevi dedeler 'eşit yurttaşlık' mesajı verdi.",
    group_mood: { alevi: 6.0, sekuler_orta: 2.0, muhafazakar_koy: -2.0 },
  },
  {
    title: "Köy Düğünü Daveti",
    text: "Bir köy düğününe davet edildin. Halay çekmezsen kırgınlık olur.",
    group_mood: { muhafazakar_koy: 3.0, ciftci: 3.0 },
  },
  {
    title: "Startup Patlaması",
    text: "17 girişim 'unicorn oluruz' dedi. 16'sı logosunu değiştirdi.",
    group_mood: { gen_z_sehir: 3.0, sanayici: 2.0 },
  },
  {
    title: "Çevre Protestosu",
    text: "İklim aktivisti maden projesine zincirledi kendini. Gençler alkışladı.",
    group_mood: { gen_z_sehir: 4.0, ogrenci: 4.0, sanayici: -3.0 },
  },
  {
    title: "Futbol Maçı Tezahüratı",
    text: "'Daha az vergi, daha çok gol' tezahüratı yankılandı.",
    group_mood: { gen_z_sehir: 2.0, esnaf_kobi: 2.0 },
  },
  {
    title: "IMF Uyarısı",
    text: "Uluslararası kuruluş 'bütçe disiplini' uyarısı yaptı.",
    requires: { stats_max: { budget: 35 } },
    stat_deltas: { intl: -4.0, trust: -2.0 },
    group_mood: { sanayici: -4.0 },
  },
  {
    title: "Esnaf Kepenk İndirdi",
    text: "KDV artışı sonrası esnaf 2 saat kepenk kapattı. Mahalle destekledi.",
    requires: { stats_min: { vat: 60 } },
    group_mood: { esnaf_kobi: -6.0 },
    group_anger: { esnaf_kobi: 6.0 },
  },
  {
    title: "Dindar Gençlik Buluşması",
    text: "Genç muhafazakarlar 'aile ve değer' şenliği düzenledi.",
    group_mood: { dindar_genclik: 5.0, muhafazakar_kent: 3.0 },
  },
  {
    title: "Metro Açılışı",
    text: "Yeni metro hattı açıldı. Şehirli seçmen memnun.",
    requires: { stats_min: { infrastructure: 55 } },
    group_mood: { sekuler_orta: 3.0, gen_z_sehir: 3.0 },
  },
];

// ──────────────────────────────────────────
// DILEMMAS (every 4th turn)
// ──────────────────────────────────────────

export const ALL_DILEMMAS: DilemmaDef[] = [
  {
    title: "Merkez Bankası Baskısı",
    text: "Faiz indirimi için yoğun baskı var. Ne yapacaksın?",
    choices: [
      { label: "Faizi düşür", result_text: "Kredi ucuzladı, esnaf sevindi. Enflasyon riski arttı.", stat_deltas: { inflation: 5.0, economy: 3.0 }, group_mood: { esnaf_kobi: 8.0, sanayici: 5.0, emekli: -6.0 } },
      { label: "Faizi koru", result_text: "Enflasyon kontrol altında ama esnaf homurdanıyor.", stat_deltas: { trust: 3.0, intl: 2.0 }, group_mood: { emekli: 4.0, esnaf_kobi: -5.0 } },
    ],
  },
  {
    title: "Mülteci Politikası",
    text: "AB'den ek fon karşılığında geri kabul anlaşması masada.",
    choices: [
      { label: "Anlaşmayı imzala", result_text: "AB fonu geldi ama içeride milliyetçi muhalefet kızdı.", stat_deltas: { economy: 4.0, intl: 5.0, trust: -3.0 }, group_mood: { milliyetci: -7.0, sanayici: 4.0 } },
      { label: "Reddet", result_text: "AB ile ilişkiler gerildi ama milliyetçi taban memnun.", stat_deltas: { intl: -4.0, trust: 3.0 }, group_mood: { milliyetci: 6.0, sanayici: -3.0 } },
    ],
  },
  {
    title: "Kanal Projesi",
    text: "Dev bir kanal projesi önerisi masada. Maliyeti astronomik ama inşaat sektörü bastırıyor.",
    choices: [
      { label: "Başlat", result_text: "İnşaat sektörü canlandı ama borç tırmandı.", stat_deltas: { economy: 5.0, budget: -8.0, environment: -4.0 }, group_mood: { sanayici: 8.0, esnaf_kobi: 5.0, gen_z_sehir: -6.0 } },
      { label: "İptal et", result_text: "Çevreciler sevindi, inşaat lobisi kızgın.", stat_deltas: { environment: 4.0, budget: 3.0 }, group_mood: { gen_z_sehir: 6.0, ogrenci: 4.0, sanayici: -6.0 } },
    ],
  },
  {
    title: "Asgari Ücret Zammı",
    text: "Sendikalar %50 zam istiyor. İşverenler 'batarsak işçi de batar' diyor.",
    choices: [
      { label: "Yüksek zam", result_text: "İşçi mutlu, işveren öfkeli. Enflasyon riski.", stat_deltas: { happiness: 5.0, inflation: 3.0, economy: -2.0 }, group_mood: { memur: 8.0, emekli: 5.0, sanayici: -7.0 } },
      { label: "Düşük zam", result_text: "İşveren rahat, işçi sokağa döküldü.", stat_deltas: { economy: 3.0, stability: -4.0 }, group_mood: { sanayici: 6.0, memur: -8.0, emekli: -5.0 } },
    ],
  },
  {
    title: "Sosyal Medya Düzenlemesi",
    text: "Dezenformasyon yasası önerisi. Gençler 'sansür' diyor.",
    choices: [
      { label: "Düzenleme yap", result_text: "Dezenformasyon azaldı ama gençler 'sansür' diye isyan etti.", stat_deltas: { stability: 3.0, trust: -2.0, intl: -2.0 }, group_mood: { muhafazakar_kent: 5.0, gen_z_sehir: -8.0 } },
      { label: "Serbest bırak", result_text: "Gençler sevindi ama dezenformasyon yayılıyor.", stat_deltas: { trust: -1.0, intl: 3.0 }, group_mood: { gen_z_sehir: 6.0, muhafazakar_kent: -4.0 } },
    ],
  },
  {
    title: "Özelleştirme İhalesi",
    text: "Kamu enerji şirketi için özelleştirme ihalesi açıldı. Sendikalar karşı.",
    choices: [
      { label: "Özelleştir", result_text: "Bütçeye tek seferlik dev gelir, memur sendikaları isyanda.", stat_deltas: { budget: 8.0, economy: 3.0, stability: -3.0 }, group_mood: { sanayici: 7.0, memur: -8.0 } },
      { label: "Kamuda kalsın", result_text: "Memur sevindi ama bütçe açığı büyümeye devam.", stat_deltas: { stability: 3.0, budget: -2.0 }, group_mood: { memur: 6.0, sanayici: -4.0 } },
    ],
  },
  {
    title: "Yargı Reformu",
    text: "AB uyum paketi: Yargıya müdahale suç sayılsın mı?",
    choices: [
      { label: "Reformu geçir", result_text: "AB'den tarih geldi ama 'yargıda vesayet' tartışması başladı.", stat_deltas: { trust: 5.0, intl: 5.0, stability: -2.0 }, group_mood: { sekuler_orta: 7.0, alevi: 5.0, muhafazakar_kent: -5.0 } },
      { label: "Ertele", result_text: "Muhafazakar taban rahat ama AB ile müzakereler durdu.", stat_deltas: { intl: -4.0, trust: -2.0 }, group_mood: { muhafazakar_kent: 5.0, sekuler_orta: -5.0 } },
    ],
  },
  {
    title: "Tarımda GDO Kararı",
    text: "GDO'lu tohum ithalatı yasağı kalkmalı mı? Verim artar, organik lobisi isyanda.",
    choices: [
      { label: "Serbest bırak", result_text: "Verim arttı, ihracat canlandı ama organik tarım lobisi öfkeli.", stat_deltas: { economy: 5.0, agriculture: 5.0, environment: -3.0 }, group_mood: { ciftci: 5.0, sanayici: 4.0, gen_z_sehir: -5.0 } },
      { label: "Yasağı koru", result_text: "Organik imaj korundu ama verim tartışması sürüyor.", stat_deltas: { environment: 3.0, intl: 2.0 }, group_mood: { gen_z_sehir: 5.0, ciftci: -4.0 } },
    ],
  },
];

// ──────────────────────────────────────────
// LEAK EVENTS
// ──────────────────────────────────────────

export const ALL_LEAKS: LeakDef[] = [
  {
    title: "Gizli Gündem Sızdı",
    text: "Bir bakanlık yetkilisi 'yakın çevre ihale favorisi' listesini sızdırdı. Medya ayaklandı.",
    choices: [
      { label: "İnkar et", result_text: "Savunma tutmadı. Belgeler doğrulandı.", stat_deltas: { trust: -5.0, intl: -3.0 }, group_mood: { gen_z_sehir: -5.0, sekuler_orta: -4.0 } },
      { label: "Özür dile", result_text: "Özür diledin, soruşturma açtın. Bir miktar güven geri geldi.", stat_deltas: { trust: 3.0 }, group_mood: { alevi: 2.0, kurt_secmen: 2.0 } },
    ],
  },
  {
    title: "Belge Skandalı",
    text: "Bir gazeteci 'bakın bu belgeler' dedi. Twitter çöktü.",
    choices: [
      { label: "Savun", result_text: "Savunma tuttu... gibi göründü.", group_mood: { muhafazakar_kent: 2.0 }, stat_deltas: { trust: -2.0 } },
      { label: "Özür dile", result_text: "Şeffaflık vaadi verdin.", stat_deltas: { trust: 4.0, intl: 2.0 } },
    ],
  },
  {
    title: "Ses Kaydı Sızıntısı",
    text: "Kabine toplantısından 'seçimden önce faiz düşür' kaydı sızdı.",
    choices: [
      { label: "İnkar et", result_text: "Kayıt doğrulandı. Utanç verici.", stat_deltas: { trust: -6.0, intl: -4.0 } },
      { label: "Özür dile", result_text: "Bağımsızlık yasası önerdin.", group_mood: { sanayici: 3.0, sekuler_orta: 2.0 } },
    ],
  },
];

// ──────────────────────────────────────────
// HELPER: get policy keys
// ──────────────────────────────────────────

export function getPolicyKeys(): string[] {
  return Object.keys(POLICIES);
}

export function getPolicyKeysByCategory(cat: string): string[] {
  return Object.keys(POLICIES).filter(k => POLICIES[k].cat === cat);
}

export function getGroupIds(): string[] {
  return Object.keys(VOTER_GROUPS);
}

export function getStatKeys(): string[] {
  return Object.keys(STAT_DEFS);
}
