import { VOTER_GROUPS, STAT_DEFS, PARTY_LOYALTY } from './game_data';
import type { PolicyManager } from './policy_manager';
import type { EconomyManager } from './economy_manager';

export class VoterSimulation {
  approvals: Record<string, number> = {};
  mood_bonus: Record<string, number> = {};
  anger: Record<string, number> = {};
  private previousApprovals: Record<string, number> = {};
  cynicism: Record<string, number> = {};
  loyalty_locked: Record<string, boolean> = {};
  turnout_rates: Record<string, number> = {};
  activism_bonus = 0;

  onApprovalsChanged?: () => void;

  constructor() {
    for (const id of Object.keys(VOTER_GROUPS)) {
      this.approvals[id] = 48;
      this.mood_bonus[id] = 0;
      this.anger[id] = 0;
      this.previousApprovals[id] = 48;
      this.cynicism[id] = 0;
      this.loyalty_locked[id] = true;
      this.turnout_rates[id] = 55;
    }
  }

  recalculate(pm: PolicyManager, economy: EconomyManager | null, term: number, regionBonus = 0): void {
    for (const groupId of Object.keys(VOTER_GROUPS)) {
      this.previousApprovals[groupId] = this.approvals[groupId];
      const gdata = VOTER_GROUPS[groupId];
      const ideals = gdata.ideals;
      const statW = gdata.stat_weights;

      // Policy match
      let policyScore = 0;
      let policyWeightSum = 0;
      for (const [policyKey, ideal] of Object.entries(ideals)) {
        const current = pm.getPolicy(policyKey);
        const weight = this.policyWeightForGroup(groupId, policyKey);
        const matchScore = (100 - Math.abs(current - ideal)) * weight;
        policyScore += matchScore;
        policyWeightSum += weight * 100;
      }
      const policyApproval = policyWeightSum > 0 ? (policyScore / policyWeightSum) * 100 : 48;

      // Stat effect
      let statScore = 0;
      let statWSum = 0;
      for (const [statKey, w] of Object.entries(statW)) {
        const statVal = pm.getStat(statKey);
        const normalized = STAT_DEFS[statKey]?.good_high ? statVal / 100 : 1 - statVal / 100;
        statScore += normalized * w;
        statWSum += w;
      }
      const statApproval = statWSum > 0 ? (statScore / statWSum) * 100 : 48;

      // Economy penalty
      let economyPenalty = 0;
      if (economy) {
        const pen = economy.getVoterPenalties();
        economyPenalty += pen.all;
        if (groupId in pen.groups) economyPenalty += pen.groups[groupId];
      }

      // Term fatigue
      let termPenalty = (term - 1) * 4.5;
      if (economy && economy.getPressureBalance() < -100) {
        termPenalty += term * 2.5;
      }

      // Cynicism
      const cynicismPenalty = (this.cynicism[groupId] ?? 0) * 0.35;

      // Extra inflation penalty
      const infl = pm.getStat("inflation");
      if (infl > 52) economyPenalty += (infl - 52) * 0.35;
      if (pm.getStat("trust") < 38) economyPenalty += (38 - pm.getStat("trust")) * 0.22;

      // Calculate raw approval
      let raw =
        policyApproval * 0.30 +
        statApproval * 0.35 +
        (this.mood_bonus[groupId] ?? 0) -
        (this.anger[groupId] ?? 0) -
        economyPenalty -
        termPenalty -
        cynicismPenalty;

      // Region blend
      if (regionBonus !== 0) {
        raw = raw * 0.92 + regionBonus * 0.08;
      }

      // Party loyalty floor
      const loyalty = PARTY_LOYALTY[groupId] ?? 0.3;
      let floor = 0;
      if (this.loyalty_locked[groupId] && raw > 25 - loyalty * 25) {
        floor = 25 - loyalty * 25;
      }
      this.approvals[groupId] = Math.max(floor, Math.min(95, raw));

      // Loyalty break check
      if (this.loyalty_locked[groupId] && raw < 15) {
        this.loyalty_locked[groupId] = false;
      }

      // Turnout
      this.turnoutCalc(groupId);
    }
    this.onApprovalsChanged?.();
  }

  private turnoutCalc(groupId: string): void {
    const approval = this.approvals[groupId] ?? 50;
    const strength = Math.abs(approval - 50) / 50;
    const loyalty = PARTY_LOYALTY[groupId] ?? 0.3;
    this.turnout_rates[groupId] = Math.max(28, Math.min(88,
      48 + strength * 35 + this.activism_bonus * 8 + loyalty * 10
    ));
  }

  applyCynicism(): void {
    for (const groupId of Object.keys(VOTER_GROUPS)) {
      if ((this.approvals[groupId] ?? 50) > 65) {
        const speed = VOTER_GROUPS[groupId]?.cynicism_speed ?? 0.5;
        this.cynicism[groupId] = Math.min(25, (this.cynicism[groupId] ?? 0) + 1.5 * speed);
      } else if ((this.approvals[groupId] ?? 50) < 40) {
        this.cynicism[groupId] = Math.max(0, (this.cynicism[groupId] ?? 0) - 0.5);
      }
    }
  }

  setActivism(bonus: number): void {
    this.activism_bonus = bonus;
  }

  private policyWeightForGroup(groupId: string, policyKey: string): number {
    switch (groupId) {
      case "esnaf_kobi":
      case "sanayici":
        if (["income_tax", "vat", "interest"].includes(policyKey)) return 5.0;
        break;
      case "emekli":
      case "memur":
        if (["welfare", "healthcare"].includes(policyKey)) return 3.5;
        break;
      case "ciftci":
        if (policyKey === "agriculture") return 6.0;
        break;
      case "kurt_secmen":
      case "alevi":
        if (["judiciary", "police", "media"].includes(policyKey)) return 4.0;
        break;
      case "gen_z_sehir":
      case "ogrenci":
        if (["education", "media", "housing"].includes(policyKey)) return 3.5;
        break;
      case "milliyetci":
        if (["military", "police"].includes(policyKey)) return 4.5;
        break;
    }
    return 1.0;
  }

  getDelta(groupId: string): number {
    return (this.approvals[groupId] ?? 0) - (this.previousApprovals[groupId] ?? 0);
  }

  getTopMovers(count = 3): Array<{ id: string; name: string; delta: number; approval: number }> {
    const rows: Array<{ id: string; name: string; delta: number; approval: number }> = [];
    for (const [id, gdata] of Object.entries(VOTER_GROUPS)) {
      const delta = this.getDelta(id);
      if (Math.abs(delta) < 0.3) continue;
      rows.push({ id, name: gdata.name, delta, approval: this.approvals[id] });
    }
    rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return rows.slice(0, count);
  }

  getReactionLine(): string {
    const movers = this.getTopMovers(3);
    if (movers.length === 0) return "Seçmen sessiz — ama bu iyiye işaret değil.";
    const parts = movers.map(m => {
      const arrow = m.delta > 0 ? "▲" : "▼";
      return `${arrow} ${m.name} ${Math.abs(Math.round(m.delta))}`;
    });
    return "Tepki: " + parts.join(" │ ");
  }

  getOverallApproval(): number {
    let weightedSum = 0, weightTotal = 0;
    for (const [id, gdata] of Object.entries(VOTER_GROUPS)) {
      const weight = gdata.weight * ((this.turnout_rates[id] ?? 55) / 100);
      weightedSum += (this.approvals[id] ?? 50) * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  getRawApproval(): number {
    let weightedSum = 0, weightTotal = 0;
    for (const [id, gdata] of Object.entries(VOTER_GROUPS)) {
      weightedSum += (this.approvals[id] ?? 50) * gdata.weight;
      weightTotal += gdata.weight;
    }
    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  getTurnout(): number {
    let total = 0, wsum = 0;
    for (const [id, gdata] of Object.entries(VOTER_GROUPS)) {
      total += (this.turnout_rates[id] ?? 55) * gdata.weight;
      wsum += gdata.weight;
    }
    return wsum > 0 ? total / wsum : 50;
  }

  getSwingVoterPct(): number {
    let swingWeight = 0, totalWeight = 0;
    for (const [id, gdata] of Object.entries(VOTER_GROUPS)) {
      const a = this.approvals[id] ?? 50;
      if (a >= 38 && a <= 62) swingWeight += gdata.weight;
      totalWeight += gdata.weight;
    }
    return totalWeight > 0 ? (swingWeight / totalWeight) * 100 : 0;
  }

  applyGroupMood(groupId: string, delta: number): void {
    if (groupId in this.mood_bonus) {
      this.mood_bonus[groupId] = Math.max(-25, Math.min(15, (this.mood_bonus[groupId] ?? 0) + delta));
    }
  }

  applyGroupAnger(groupId: string, delta: number): void {
    if (groupId in this.anger) {
      this.anger[groupId] = Math.max(0, Math.min(60, (this.anger[groupId] ?? 0) + delta));
    }
  }

  applyAllMood(delta: number): void {
    for (const id of Object.keys(this.mood_bonus)) {
      this.applyGroupMood(id, delta);
    }
  }

  decayMood(): void {
    for (const id of Object.keys(this.mood_bonus)) {
      this.mood_bonus[id] = this.moveToward(this.mood_bonus[id] ?? 0, 0, 4);
      this.anger[id] = this.moveToward(this.anger[id] ?? 0, 0, 0.8);
    }
  }

  autoAngerAccumulation(pm: PolicyManager): string[] {
    const warnings: string[] = [];
    for (const [groupId, gdata] of Object.entries(VOTER_GROUPS)) {
      const ideals = gdata.ideals;
      let totalGap = 0;
      for (const [policyKey, ideal] of Object.entries(ideals)) {
        totalGap += Math.abs(pm.getPolicy(policyKey) - ideal);
      }
      const avgGap = totalGap / Object.keys(ideals).length;
      if (avgGap > 22 && (this.anger[groupId] ?? 0) < 40) {
        const oldAnger = this.anger[groupId] ?? 0;
        this.anger[groupId] = (this.anger[groupId] ?? 0) + 2.5;
        if (this.anger[groupId] > 25 && oldAnger <= 25) {
          warnings.push(`${gdata.name} kendini ihmal edilmiş hissediyor`);
        }
      }
    }
    return warnings;
  }

  getGroupListSorted(): Array<{
    id: string; name: string; approval: number; delta: number;
    turnout: number; loyal: boolean; weight: number; color: string;
  }> {
    const list = Object.entries(VOTER_GROUPS).map(([id, gdata]) => ({
      id,
      name: gdata.name,
      approval: this.approvals[id] ?? 50,
      delta: this.getDelta(id),
      turnout: this.turnout_rates[id] ?? 55,
      loyal: this.loyalty_locked[id] ?? true,
      weight: gdata.weight,
      color: gdata.color,
    }));
    list.sort((a, b) => a.approval - b.approval);
    return list;
  }

  getPolarization(): number {
    let minA = 100, maxA = 0;
    for (const a of Object.values(this.approvals)) {
      minA = Math.min(minA, a);
      maxA = Math.max(maxA, a);
    }
    return maxA - minA;
  }

  getPolarizationEffects(): { stability_penalty: number; trust_penalty: number; warning: string } {
    const gap = this.getPolarization();
    const effects = { stability_penalty: 0, trust_penalty: 0, warning: "" };
    if (gap > 55) {
      effects.stability_penalty = (gap - 55) * 0.25;
      effects.trust_penalty = (gap - 55) * 0.15;
      effects.warning = "Toplum kutuplaşıyor — uçurum büyüyor";
    }
    if (gap > 70) {
      effects.stability_penalty += (gap - 70) * 0.35;
      effects.warning = "KRİTİK KUTUPLAŞMA: Toplum ikiye bölündü, sokak çatışmaları riski!";
    }
    return effects;
  }

  applyPolicyShock(policyKey: string, oldVal: number, newVal: number): string {
    const delta = newVal - oldVal;
    if (Math.abs(delta) < 3) return "";

    let shockPower = Math.abs(delta) / 50;
    shockPower = Math.max(0.15, Math.min(2.0, shockPower));
    const lines: string[] = [];

    switch (policyKey) {
      case "income_tax":
      case "vat":
        if (delta > 0) {
          const hit = -shockPower * 18;
          this.applyGroupMood("esnaf_kobi", hit * 1.2);
          this.applyGroupMood("sanayici", hit * 1.1);
          this.applyGroupMood("memur", hit * 0.6);
          this.applyGroupMood("ciftci", hit * 0.5);
          this.applyGroupAnger("esnaf_kobi", shockPower * 12);
          this.applyGroupAnger("sanayici", shockPower * 8);
          lines.push("Vergi artışı: esnaf ve sanayici öfkeli!");
        } else {
          const boost = shockPower * 14;
          this.applyGroupMood("esnaf_kobi", boost * 1.1);
          this.applyGroupMood("sanayici", boost * 1.0);
          this.applyGroupMood("memur", boost * 0.4);
          lines.push("Vergi indirimi: iş dünyası memnun!");
        }
        break;

      case "welfare":
      case "healthcare":
        if (delta > 0) {
          this.applyGroupMood("emekli", shockPower * 12);
          this.applyGroupMood("memur", shockPower * 6);
          lines.push("Sosyal harcama artışı: emekli ve memur sevindi");
        } else {
          this.applyGroupMood("emekli", -shockPower * 15);
          this.applyGroupMood("memur", -shockPower * 8);
          this.applyGroupAnger("emekli", shockPower * 14);
          lines.push("Sosyal kesinti: emekliler isyanda!");
        }
        break;

      case "police":
      case "military":
        if (delta > 0) {
          this.applyGroupMood("milliyetci", shockPower * 10);
          this.applyGroupMood("muhafazakar_kent", shockPower * 6);
          this.applyGroupMood("gen_z_sehir", -shockPower * 8);
          this.applyGroupMood("kurt_secmen", -shockPower * 7);
          lines.push("Güvenlik artışı: milliyetçi sevindi, gençler rahatsız");
        } else {
          this.applyGroupMood("milliyetci", -shockPower * 14);
          this.applyGroupAnger("milliyetci", shockPower * 10);
          this.applyGroupMood("gen_z_sehir", shockPower * 6);
          lines.push("Güvenlik azalması: milliyetçi taban öfkeli!");
        }
        break;

      case "judiciary":
      case "media":
        if (delta > 0) {
          this.applyGroupMood("kurt_secmen", shockPower * 10);
          this.applyGroupMood("alevi", shockPower * 8);
          this.applyGroupMood("sekuler_orta", shockPower * 7);
          this.applyGroupMood("muhafazakar_kent", -shockPower * 6);
          lines.push("Özgürlük genişlemesi: laik blok memnun");
        } else {
          this.applyGroupMood("gen_z_sehir", -shockPower * 12);
          this.applyGroupMood("sekuler_orta", -shockPower * 8);
          this.applyGroupMood("kurt_secmen", -shockPower * 7);
          this.applyGroupAnger("gen_z_sehir", shockPower * 8);
          lines.push("Özgürlük kısıtlaması: gençler ve laikler öfkeli!");
        }
        break;

      case "interest":
        if (delta > 0) {
          this.applyGroupMood("emekli", shockPower * 6);
          this.applyGroupMood("memur", shockPower * 4);
          this.applyGroupMood("esnaf_kobi", -shockPower * 11);
          this.applyGroupMood("sanayici", -shockPower * 8);
          lines.push("Faiz artışı: enflasyon düşecek ama esnaf kredisi pahalandı");
        } else {
          this.applyGroupMood("esnaf_kobi", shockPower * 10);
          this.applyGroupMood("sanayici", shockPower * 7);
          this.applyGroupMood("emekli", -shockPower * 8);
          this.applyGroupMood("memur", -shockPower * 5);
          lines.push("Faiz indirimi: kredi ucuzladı ama emekli enflasyondan korkuyor");
        }
        break;

      case "agriculture":
        if (delta > 0) {
          this.applyGroupMood("ciftci", shockPower * 18);
          this.applyGroupMood("muhafazakar_koy", shockPower * 8);
          lines.push("Tarım desteği: çiftçinin yüzü güldü!");
        } else {
          this.applyGroupMood("ciftci", -shockPower * 20);
          this.applyGroupAnger("ciftci", shockPower * 16);
          this.applyGroupMood("muhafazakar_koy", -shockPower * 6);
          lines.push("Tarım kesintisi: çiftçi sokağa döküldü!");
        }
        break;

      case "education":
        if (delta > 0) {
          this.applyGroupMood("ogrenci", shockPower * 12);
          this.applyGroupMood("gen_z_sehir", shockPower * 8);
          lines.push("Eğitim yatırımı: gençler umutlu");
        } else {
          this.applyGroupMood("ogrenci", -shockPower * 14);
          this.applyGroupMood("gen_z_sehir", -shockPower * 9);
          this.applyGroupAnger("ogrenci", shockPower * 10);
          lines.push("Eğitim kesintisi: öğrenciler protestoda!");
        }
        break;
    }

    return lines.join("\n");
  }

  applyGroupRivalry(): string[] {
    const warnings: string[] = [];

    if ((this.approvals["kurt_secmen"] ?? 50) > 68) {
      this.applyGroupAnger("milliyetci", 3.0);
      if ((this.anger["milliyetci"] ?? 0) > 30) {
        warnings.push("Kürt açılımı milliyetçi tabanı kızdırıyor");
      }
    }

    if ((this.approvals["gen_z_sehir"] ?? 50) > 75 && (this.approvals["ogrenci"] ?? 50) > 75) {
      this.applyGroupAnger("muhafazakar_kent", 2.5);
      this.applyGroupAnger("dindar_genclik", 2.0);
      if ((this.anger["muhafazakar_kent"] ?? 0) > 25) {
        warnings.push("Muhafazakar taban 'aile değerleri erozyonu' diyor");
      }
    }

    if ((this.approvals["sanayici"] ?? 50) > 78) {
      this.applyGroupAnger("emekli", 2.5);
      this.applyGroupAnger("memur", 2.0);
      if ((this.anger["emekli"] ?? 0) > 30) {
        warnings.push("Emekliler 'zenginlere çalışıyorsun' diyor");
      }
    }

    if ((this.approvals["milliyetci"] ?? 50) > 75) {
      this.applyGroupAnger("kurt_secmen", 2.5);
      this.applyGroupAnger("alevi", 2.0);
      if ((this.anger["kurt_secmen"] ?? 0) > 30) {
        warnings.push("Azınlık grupları kendini dışlanmış hissediyor");
      }
    }

    if ((this.approvals["dindar_genclik"] ?? 50) > 75 && (this.approvals["muhafazakar_kent"] ?? 50) > 72) {
      this.applyGroupAnger("sekuler_orta", 2.0);
      this.applyGroupAnger("gen_z_sehir", 2.5);
    }

    return warnings;
  }

  getGroupName(id: string): string { return VOTER_GROUPS[id]?.name ?? id; }
  getGroupColor(id: string): string { return VOTER_GROUPS[id]?.color ?? "#fff"; }
  getGroupDesc(id: string): string { return VOTER_GROUPS[id]?.desc ?? ""; }

  private moveToward(from: number, to: number, delta: number): number {
    if (Math.abs(to - from) <= delta) return to;
    return from + Math.sign(to - from) * delta;
  }
}
