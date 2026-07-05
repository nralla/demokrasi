import { SUCCESS_CRISIS_TRIGGERS } from './game_data';
import type { PolicyManager } from './policy_manager';
import type { EconomyState } from './types';

export class EconomyManager {
  budget_balance = -30;
  public_debt = 2400;
  current_account = -38;
  usd_try = 34.5;
  gdp_growth = 2.8;
  populism_debt = 0;
  structural_flow = 0;
  gdp_index = 50;
  business_confidence = 45;
  foreign_investment = 40;

  private crises_triggered: Set<string> = new Set();

  onEconomyChanged?: () => void;

  tick(pm: PolicyManager): string[] {
    const impacts: string[] = [];
    const tax = pm.getPolicy("income_tax");
    const vat = pm.getPolicy("vat");
    const interest = pm.getPolicy("interest");
    const infrastructure = pm.getPolicy("infrastructure");
    const spend = this.totalSpending(pm);

    // Revenue - spending
    const revenue = (tax * 4.2 + vat * 3.0) * 0.14;
    this.budget_balance += revenue - spend;
    this.public_debt += Math.max(0, -this.budget_balance * 0.4) + spend * 0.1;

    // GDP update
    this.gdpUpdate(pm, revenue, spend);

    // Inflation from budget deficit
    let infl = pm.getStat("inflation");
    if (this.budget_balance < -100) {
      const inflPush = Math.abs(this.budget_balance) * 0.02;
      infl += inflPush;
      pm.applyStatDelta("inflation", inflPush * 0.7);
      if (this.budget_balance < -250) {
        impacts.push(`⚠ BÜTÇE KRİZİ: Açık ${Math.abs(this.budget_balance).toFixed(0)} milyar TL — enflasyon patlayacak`);
      }
    }

    // Populism penalty
    if (this.isPopulist(pm)) {
      this.populism_debt += 5.5;
      pm.applyStatDelta("inflation", 2.0);
      pm.applyStatDelta("trust", -0.5);
      if (this.populism_debt > 15) impacts.push("⚠ Popülist politikaların faturası birikiyor");
      if (this.populism_debt > 35) impacts.push("⚠ Popülist borç krizi kapıda — kemer sıkma şart!");
    }

    // Exchange rate
    this.usd_try += (infl - 48) * 0.16 - (interest - 50) * 0.06;
    this.usd_try += Math.max(0, -this.budget_balance) * 0.004;
    this.usd_try += Math.max(0, this.public_debt - 3500) * 0.005;
    this.usd_try = Math.max(8, Math.min(140, this.usd_try));

    // GDP growth
    this.gdp_growth = Math.max(-12, Math.min(10,
      3.5
      - Math.max(0, infl - 48) * 0.12
      - Math.max(0, -this.budget_balance) * 0.015
      + (infrastructure - 50) * 0.04
      + this.business_confidence * 0.03
    ));

    this.current_account -= spend * 0.05;

    // Business confidence
    this.business_confidence = Math.max(5, Math.min(90,
      45
      - Math.max(0, infl - 45) * 0.5
      - Math.max(0, -this.budget_balance) * 0.08
      + ((tax + vat) < 60 ? 5 : -8)
    ));

    // Warnings
    if (this.budget_balance < -250) {
      impacts.push("⚠ Bütçe açığı kontrol edilemez seviyede — IMF ile görüşme bekleniyor");
    }
    if (this.usd_try > 45) {
      impacts.push(`⚠ Kur ${this.usd_try.toFixed(1)} TL — ithalat durdu, market fiyatları uçtu`);
    }
    if (this.populism_debt > 40) {
      impacts.push("⚠ Popülist borç patladı — ekonomi çöküşe geçebilir");
    }
    if (this.public_debt > 5000) {
      impacts.push("⚠ Borç/GSYH oranı kritik — iflas riski");
    }

    this.syncPreview(pm);
    this.onEconomyChanged?.();
    return impacts;
  }

  private gdpUpdate(pm: PolicyManager, _revenue: number, _spend: number): void {
    const economyStat = pm.getStat("economy");
    const target = economyStat * 0.6 + (this.gdp_growth + 2.0) * 5.0 + this.business_confidence * 0.2;
    this.gdp_index = this.moveToward(this.gdp_index, Math.max(5, Math.min(95, target)), 3.0);
  }

  checkSuccessCrises(pm: PolicyManager, overallApproval: number): Array<{ name: string; desc: string; priority: number; stat_deltas: Record<string, number>; group_mood: Record<string, number>; group_anger?: Record<string, number> }> {
    const triggered: Array<any> = [];

    for (const [id, cfg] of Object.entries(SUCCESS_CRISIS_TRIGGERS)) {
      if (this.crises_triggered.has(id)) continue;
      let fires = false;
      switch (id) {
        case "debt_bomb": fires = this.public_debt > 4000 && this.populism_debt > 30; break;
        case "hyperinflation": fires = pm.getStat("inflation") > 68; break;
        case "capital_flight": fires = this.usd_try > 48; break;
        case "brain_drain": fires = pm.getStat("unemployment") > 58 && pm.getStat("education_q") < 40; break;
        case "general_strike": fires = pm.getStat("inflation") > 55 && overallApproval < 35; break;
      }
      if (fires) {
        triggered.push(cfg);
        this.crises_triggered.add(id);
      }
    }
    return triggered;
  }

  private isPopulist(pm: PolicyManager): boolean {
    const spendAvg = (
      pm.getPolicy("welfare") + pm.getPolicy("education") +
      pm.getPolicy("healthcare") + pm.getPolicy("housing")
    ) / 4;
    const taxAvg = (pm.getPolicy("income_tax") + pm.getPolicy("vat")) / 2;
    return spendAvg > 55 && taxAvg < 42;
  }

  syncPreview(pm: PolicyManager): void {
    const tax = pm.getPolicy("income_tax");
    const vat = pm.getPolicy("vat");
    const spend = this.totalSpending(pm);
    const revenue = (tax * 4.2 + vat * 3.0) * 0.14;
    this.structural_flow = revenue - spend;
  }

  getPressureBalance(): number {
    let flowPenalty = 0;
    if (this.structural_flow < 0) {
      flowPenalty = this.structural_flow * 8;
    }
    return this.budget_balance + flowPenalty;
  }

  getVoterPenalties(): { all: number; groups: Record<string, number> } {
    let allPenalty = 0;
    const groups: Record<string, number> = {};
    const pressure = this.getPressureBalance();

    if (pressure < -60) allPenalty += Math.abs(pressure) * 0.07;
    if (pressure < -200) allPenalty += 14;
    if (this.structural_flow < -10) allPenalty += Math.abs(this.structural_flow) * 0.3;

    // FX impact
    if (this.usd_try > 35) {
      groups["esnaf_kobi"] = (this.usd_try - 35) * 0.9;
      groups["emekli"] = (this.usd_try - 35) * 0.75;
      groups["memur"] = (this.usd_try - 35) * 0.6;
      groups["sanayici"] = (this.usd_try - 35) * 0.5;
      groups["ogrenci"] = (this.usd_try - 35) * 0.4;
    }
    if (this.usd_try > 50) {
      groups["gen_z_sehir"] = (groups["gen_z_sehir"] ?? 0) + 6;
      groups["muhafazakar_kent"] = (groups["muhafazakar_kent"] ?? 0) + 4;
    }

    // Debt impact
    if (this.public_debt > 3500) {
      groups["sanayici"] = (groups["sanayici"] ?? 0) + 8;
      groups["sekuler_orta"] = (groups["sekuler_orta"] ?? 0) + 5;
      groups["esnaf_kobi"] = (groups["esnaf_kobi"] ?? 0) + 4;
    }
    if (this.public_debt > 4500) {
      allPenalty += 10;
      groups["emekli"] = (groups["emekli"] ?? 0) + 6;
    }

    // Populism bill
    allPenalty += this.populism_debt * 0.5;

    // Low GDP
    if (this.gdp_index < 30) {
      allPenalty += (30 - this.gdp_index) * 0.3;
    }

    return { all: allPenalty, groups };
  }

  getSimpleStatus() {
    const pressure = this.getPressureBalance();
    let budgetText = "Dengeli";
    let budgetBad = false;
    if (pressure < -200) { budgetText = "KRİTİK!"; budgetBad = true; }
    else if (pressure < -80) { budgetText = "Açık"; budgetBad = true; }
    else if (this.budget_balance > 50) budgetText = "Fazla";

    return {
      budget: `${this.budget_balance >= 0 ? '+' : ''}${this.budget_balance.toFixed(0)} milyar (${budgetText})`,
      fx: `${this.usd_try.toFixed(1)} TL`,
      budget_bad: budgetBad,
      populism: Math.round(this.populism_debt),
      gdp: this.gdp_index.toFixed(0),
    };
  }

  private totalSpending(pm: PolicyManager): number {
    let total = 0;
    for (const key of ["welfare", "education", "healthcare", "housing", "police", "military", "agriculture", "infrastructure", "environment"]) {
      total += pm.getPolicy(key) * 0.14;
    }
    return total;
  }

  carryToNextTerm(): void {
    this.budget_balance *= 0.80;
    if (this.budget_balance > 0) this.budget_balance *= 0.4;
    this.public_debt += Math.max(0, -this.budget_balance * 0.6);
    this.populism_debt *= 0.65;
    this.populism_debt += 12;
    this.usd_try += 3.5;
    this.gdp_index -= 5;
    this.business_confidence -= 8;
  }

  getSummary(): string {
    return `Bütçe ${this.budget_balance >= 0 ? '+' : ''}${this.budget_balance.toFixed(0)} | Kur ${this.usd_try.toFixed(1)} | Borç ${this.public_debt.toFixed(0)} | GSYH ${this.gdp_index.toFixed(0)}`;
  }

  getState(): EconomyState {
    return {
      budget_balance: this.budget_balance,
      public_debt: this.public_debt,
      current_account: this.current_account,
      usd_try: this.usd_try,
      gdp_growth: this.gdp_growth,
      populism_debt: this.populism_debt,
      structural_flow: this.structural_flow,
      gdp_index: this.gdp_index,
      business_confidence: this.business_confidence,
      foreign_investment: this.foreign_investment,
    };
  }

  private moveToward(from: number, to: number, delta: number): number {
    if (Math.abs(to - from) <= delta) return to;
    return from + Math.sign(to - from) * delta;
  }
}
