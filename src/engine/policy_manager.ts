import {
  STAT_DEFS, POLICY_STAT_EFFECTS, POLICY_CURVE_POWER,
  POLICIES, POLICY_POLITICAL_COST,
} from './game_data';
import type { EventDef } from './types';
import { getStatKeys, getPolicyKeys } from './game_data';

type CabinetBonusFn = (policyKey: string) => number;

export class PolicyManager {
  values: Record<string, number> = {};
  national_stats: Record<string, number> = {};
  last_impacts: string[] = [];
  persistent_deltas: Record<string, number> = {};

  political_capital = 100;
  max_political_capital = 100;

  cabinet_bonus_fn: CabinetBonusFn | null = null;
  private cross_effects_applied = false;

  // Callbacks
  onPoliciesChanged?: () => void;
  onStatsChanged?: () => void;

  constructor() {
    for (const key of getPolicyKeys()) {
      this.values[key] = 50;
    }
    for (const key of getStatKeys()) {
      this.national_stats[key] = STAT_DEFS[key].base;
      this.persistent_deltas[key] = 0;
    }
    this.recalculateAll();
  }

  setPolicy(key: string, value: number): void {
    if (!(key in this.values)) return;
    const old = this.values[key];
    this.values[key] = Math.max(0, Math.min(100, Math.round(value)));
    if (old !== this.values[key]) {
      this.recalculateAll();
      this.onPoliciesChanged?.();
    }
  }

  adjustPolicy(key: string, delta: number): void {
    this.setPolicy(key, (this.values[key] ?? 50) + delta);
  }

  setPoliciesBatch(updates: Record<string, number>): void {
    let changed = false;
    for (const [key, val] of Object.entries(updates)) {
      if (!(key in this.values)) continue;
      const nv = Math.max(0, Math.min(100, Math.round(val)));
      if (this.values[key] !== nv) {
        this.values[key] = nv;
        changed = true;
      }
    }
    if (changed) {
      this.recalculateAll();
      this.onPoliciesChanged?.();
    }
  }

  getPolicy(key: string): number {
    return this.values[key] ?? 50;
  }

  // ── Persistent deltas ──

  applyStatDelta(statKey: string, delta: number): void {
    if (!(statKey in this.national_stats)) return;
    this.national_stats[statKey] = this.clampStat(statKey, this.national_stats[statKey] + delta);
    this.persistent_deltas[statKey] = (this.persistent_deltas[statKey] ?? 0) + delta;
    this.applyCrossEffectsOnce();
    this.onStatsChanged?.();
  }

  decayPersistentDeltas(): void {
    for (const key of Object.keys(this.persistent_deltas)) {
      this.persistent_deltas[key] *= 0.85;
      if (Math.abs(this.persistent_deltas[key]) < 0.1) {
        this.persistent_deltas[key] = 0;
      }
    }
  }

  // ── Political capital ──

  refreshPoliticalCapital(approval: number, campaigningBonus: number): void {
    this.max_political_capital = 60 + approval * 0.4 + campaigningBonus * 10;
    this.political_capital = Math.min(
      this.political_capital + 18,
      this.max_political_capital
    );
    this.political_capital = Math.max(0, this.political_capital);
  }

  spendPoliticalCapital(amount: number): boolean {
    if (this.political_capital >= amount) {
      this.political_capital -= amount;
      return true;
    }
    return false;
  }

  // ── Non-linear curve ──

  getEffectiveLevel(policyKey: string, rawLevel: number): number {
    const power = POLICY_CURVE_POWER[policyKey] ?? 0.85;
    const normalized = rawLevel / 100;
    return Math.pow(normalized, power);
  }

  // ── Main recalc ──

  recalculateAll(): void {
    this.last_impacts = [];
    this.cross_effects_applied = false;

    // Reset to base
    for (const key of getStatKeys()) {
      this.national_stats[key] = STAT_DEFS[key].base;
    }

    // Apply non-linear policy effects
    for (const [policyKey, val] of Object.entries(this.values)) {
      let bonus = 0;
      if (this.cabinet_bonus_fn) {
        bonus = this.cabinet_bonus_fn(policyKey);
      }
      const rawLevel = Math.max(0, Math.min(100, val + bonus));
      const effective = this.getEffectiveLevel(policyKey, rawLevel);
      const effects = POLICY_STAT_EFFECTS[policyKey] ?? {};
      for (const [statKey, effectVal] of Object.entries(effects)) {
        if (statKey in this.national_stats) {
          this.national_stats[statKey] += effectVal * effective * 100;
        }
      }
    }

    // Budget
    this.recalculateBudget();

    // Cross-effects (once per cycle)
    this.applyCrossEffectsOnce();

    // Add persistent deltas
    for (const [statKey, delta] of Object.entries(this.persistent_deltas)) {
      if (statKey in this.national_stats) {
        this.national_stats[statKey] += delta;
      }
    }

    this.clampAllStats();
    this.onStatsChanged?.();
  }

  // ── Budget ──

  private recalculateBudget(): void {
    let revenue = 0;
    let spending = 0;
    for (const [key, val] of Object.entries(this.values)) {
      const effective = this.getEffectiveLevel(key, val);
      const pdata = POLICIES[key];
      if (!pdata) continue;
      revenue += (pdata.revenue ?? 0) * effective * 100;
      spending += (pdata.cost ?? 0) * effective * 100;
    }
    this.national_stats.budget = Math.max(0, Math.min(100, 50 + (revenue - spending) * 0.8));
  }

  // ── Cross effects ──

  applyCrossEffectsOnce(): void {
    if (this.cross_effects_applied) return;
    this.cross_effects_applied = true;
    this.applyCrossEffects();
  }

  private applyCrossEffects(): void {
    const s = this.national_stats;

    // Budget → inflation, trust, economy
    if (s.budget < 45) {
      const gap = 45 - s.budget;
      s.inflation += gap * 0.18;
      s.trust -= gap * 0.12;
      s.happiness -= gap * 0.08;
      s.economy -= gap * 0.08;
      if (gap > 10) this.last_impacts.push("Bütçe açığı derinleşiyor: enflasyon ve güvensizlik artıyor");
    } else if (s.budget > 65) {
      const surplus = s.budget - 65;
      s.economy += surplus * 0.04;
      s.trust += surplus * 0.03;
    }

    // Inflation → happiness, economy, trust
    if (s.inflation > 50) {
      const pain = s.inflation - 50;
      s.happiness -= pain * 0.22;
      s.economy -= pain * 0.15;
      s.trust -= pain * 0.12;
      if (pain > 8) this.last_impacts.push("Yüksek enflasyon halkın alım gücünü eritiyor");
      if (pain > 18) this.last_impacts.push("Enflasyon kriz seviyesinde — acil faiz artışı gerek!");
    }

    // Unemployment → stability, happiness
    if (s.unemployment > 45) {
      const u = s.unemployment - 45;
      s.happiness -= u * 0.16;
      s.stability -= u * 0.12;
      s.trust -= u * 0.08;
    }

    // Low trust → stability
    if (s.trust < 38) {
      s.stability -= (38 - s.trust) * 0.25;
    }

    // Education & health cross
    let eduBonus = 0, healthBonus = 0;
    if (this.cabinet_bonus_fn) {
      eduBonus = this.cabinet_bonus_fn("education");
      healthBonus = this.cabinet_bonus_fn("healthcare");
    }
    const eduEff = this.getEffectiveLevel("education", (this.values.education ?? 50) + eduBonus);
    const healthEff = this.getEffectiveLevel("healthcare", (this.values.healthcare ?? 50) + healthBonus);
    s.education_q += eduEff * 50 - 25;
    s.health_q += healthEff * 50 - 25;

    // Interest rate deep chain
    const interest = this.values.interest ?? 50;
    if (interest > 60) {
      s.inflation -= (interest - 60) * 0.18;
      s.economy -= (interest - 60) * 0.10;
      s.unemployment += (interest - 60) * 0.06;
      s.happiness -= (interest - 60) * 0.04;
      if (interest > 75) this.last_impacts.push("Yüksek faiz: enflasyon düşüyor ama piyasa durgun, işsizlik artıyor");
    } else if (interest < 35) {
      s.inflation += (35 - interest) * 0.16;
      s.economy += (35 - interest) * 0.06;
      s.unemployment -= (35 - interest) * 0.05;
      s.happiness += (35 - interest) * 0.03;
      s.intl -= (35 - interest) * 0.06;
      if (interest < 22) this.last_impacts.push("Düşük faiz: piyasa canlı ama TL değer kaybediyor, ithalat pahalı");
    }

    // Tax chain
    const incomeTax = this.values.income_tax ?? 50;
    const vat = this.values.vat ?? 50;
    if (incomeTax > 65) {
      const gap = incomeTax - 65;
      s.economy -= gap * 0.06;
      s.happiness -= gap * 0.08;
      s.unemployment += gap * 0.03;
      if (incomeTax > 80) this.last_impacts.push("Aşırı vergi yükü: tüketim düştü, beyin göçü hızlandı");
    } else if (incomeTax < 30) {
      const gap = 30 - incomeTax;
      s.economy += gap * 0.05;
      s.happiness += gap * 0.06;
      s.budget -= gap * 0.12;
      if (incomeTax < 18) this.last_impacts.push("Vergi geliri çok düşük: bütçe alarm veriyor");
    }
    if (vat > 65) {
      const gap = vat - 65;
      s.economy -= gap * 0.05;
      s.happiness -= gap * 0.07;
      s.inflation += gap * 0.03;
      if (vat > 80) this.last_impacts.push("Yüksek KDV: temel tüketim malları pahalandı, dar gelirli eziliyor");
    }

    // Welfare chain
    const welfare = this.values.welfare ?? 50;
    if (welfare > 65) {
      const gap = welfare - 65;
      s.happiness += gap * 0.04;
      s.inflation += gap * 0.03;
      s.unemployment += gap * 0.02;
      if (welfare > 82) this.last_impacts.push("Aşırı sosyal yardım: 'çalışmadan geçinme' eleştirisi artıyor");
    }

    // Security-freedom balance
    const police = this.values.police ?? 50;
    const military = this.values.military ?? 50;
    if (police > 70 && military > 70) {
      const excess = (police - 70 + military - 70) / 2;
      s.stability += excess * 0.06;
      s.trust -= excess * 0.04;
      s.intl -= excess * 0.08;
      s.happiness -= excess * 0.03;
      if (police > 85 || military > 85) this.last_impacts.push("Aşırı güvenlik: uluslararası toplum 'otoriterleşme' diyor");
    }

    // Education long-term
    const education = this.values.education ?? 50;
    if (education > 60) {
      const gap = education - 60;
      s.economy += gap * 0.02;
      s.unemployment -= gap * 0.03;
      if (education > 85) this.last_impacts.push("Eğitime büyük yatırım: gelecek nesiller için umut verici");
    } else if (education < 30) {
      const gap = 30 - education;
      s.unemployment += gap * 0.04;
      s.intl -= gap * 0.03;
    }

    // Low security penalties
    if (police <= 18) {
      const gap = 18 - police;
      s.stability -= gap * 0.40;
      s.trust -= gap * 0.25;
      s.happiness -= gap * 0.18;
      if (police <= 8) this.last_impacts.push("KRİTİK: Polis gücü çöktü — organize suç yükseliyor");
      else if (police <= 14) this.last_impacts.push("Polis yetersiz — şehirlerde güvenlik sorunu");
    }
    if (military <= 18) {
      const gap = 18 - military;
      s.stability -= gap * 0.35;
      s.intl -= gap * 0.28;
      s.trust -= gap * 0.18;
      if (military <= 10) this.last_impacts.push("KRİTİK: Askeri güç zayıf — sınır tehdidi büyüyor");
    }
    if (police <= 14 && military <= 18) {
      s.stability -= 10;
      s.intl -= 6;
      this.last_impacts.push("Savunmasız Türkiye: komşu ülkelerdeki örgütler güçleniyor");
    }

    if ((this.values.healthcare ?? 50) <= 18) {
      const gap = 18 - (this.values.healthcare ?? 50);
      s.health_q -= gap * 0.45;
      s.happiness -= gap * 0.25;
      this.last_impacts.push("Sağlık sistemi alarm veriyor");
    }
    if (education <= 14) {
      const gap = 14 - education;
      s.education_q -= gap * 0.55;
      s.unemployment += gap * 0.10;
      this.last_impacts.push("Eğitim sistemi çöküyor — vasıfsız işgücü artıyor");
    }
    if ((this.values.media ?? 50) <= 12) {
      const gap = 12 - (this.values.media ?? 50);
      s.trust -= gap * 0.35;
      s.intl -= gap * 0.40;
    }
    if ((this.values.judiciary ?? 50) <= 14) {
      const gap = 14 - (this.values.judiciary ?? 50);
      s.trust -= gap * 0.40;
      s.intl -= gap * 0.25;
    }

    // GDP boom reduces unemployment
    if (s.economy > 60) {
      const boom = s.economy - 60;
      s.unemployment -= boom * 0.08;
      s.happiness += boom * 0.03;
    }

    this.clampAllStats();
  }

  // ── Clamping ──

  clampAllStats(): void {
    for (const key of Object.keys(this.national_stats)) {
      this.national_stats[key] = this.clampStat(key, this.national_stats[key]);
    }
  }

  clampStat(_key: string, value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  // ── Queries ──

  getStat(key: string): number {
    return this.national_stats[key] ?? 50;
  }

  getStatName(key: string): string {
    return STAT_DEFS[key]?.name ?? key;
  }

  isStatGoodHigh(key: string): boolean {
    return STAT_DEFS[key]?.good_high ?? true;
  }

  getPolicyName(key: string): string {
    return POLICIES[key]?.name ?? key;
  }

  getPolicyColor(key: string): string {
    return POLICIES[key]?.color ?? "#FFFFFF";
  }

  getPolicyCategory(key: string): string {
    return POLICIES[key]?.cat ?? "";
  }

  getPolicyPoliticalCost(key: string): number {
    return POLICY_POLITICAL_COST[key] ?? 10;
  }

  getBudgetStatus(): string {
    const b = this.national_stats.budget;
    if (b >= 60) return `Fazla: ${Math.round(b - 50) > 0 ? '+' : ''}${Math.round(b - 50)}`;
    if (b <= 35) return `Açık: ${Math.round(b - 50)}`;
    return "Dengeli";
  }

  getSummaryLines(): string[] {
    const lines: string[] = [];
    for (const [key, val] of Object.entries(this.national_stats)) {
      const icon = this.statIcon(key, val);
      lines.push(`${icon} ${this.getStatName(key)}: ${Math.round(val)}`);
    }
    return lines;
  }

  private statIcon(key: string, val: number): string {
    const goodHigh = this.isStatGoodHigh(key);
    const good = goodHigh ? val >= 55 : val <= 45;
    const bad = goodHigh ? val <= 35 : val >= 65;
    if (good) return "▲";
    if (bad) return "▼";
    return "◆";
  }
}
