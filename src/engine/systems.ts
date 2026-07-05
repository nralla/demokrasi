// Combined systems: coalition, career, crises, events, dilemmas, leaks, trends, terror, term goals

import { COALITION_PARTIES, ALL_EVENTS, ALL_DILEMMAS, ALL_LEAKS, SOCIAL_TRENDS } from './game_data';
import type { EventDef, DilemmaDef, LeakDef } from './types';

// ──────────────────────────────────────────
// COALITION SYSTEM
// ──────────────────────────────────────────

export interface CoalitionState {
  allies: Set<string>;
  seats: number;
  mood_boost: number;
  mood_penalty: number;
}

export class CoalitionSystem {
  totalSeats = 600;
  majorityThreshold = 301;
  allies: Set<string> = new Set();

  // Returns: total seats controlled
  addAlly(partyId: string): number {
    this.allies.add(partyId);
    return this.getTotalSeats();
  }

  removeAlly(partyId: string): number {
    this.allies.delete(partyId);
    return this.getTotalSeats();
  }

  hasAlly(partyId: string): boolean {
    return this.allies.has(partyId);
  }

  getTotalSeats(): number {
    let seats = 0;
    for (const id of this.allies) {
      seats += COALITION_PARTIES[id]?.seats ?? 0;
    }
    return seats;
  }

  getOwnSeatEstimate(overallApproval: number, turnout: number): number {
    // Effective vote → seats (proportional-ish)
    const effectiveVote = overallApproval * (turnout / 100);
    const oppositionThreshold = 50 + (100 - overallApproval) * 0.3;
    const adjusted = effectiveVote - oppositionThreshold * 0.4;
    return Math.max(20, Math.min(400, adjusted * 3.5));
  }

  getStatusText(ownSeats: number): string {
    const total = ownSeats + this.getTotalSeats();
    const majority = total >= this.majorityThreshold ? "✓" : "✗";
    return `Meclis: ${total}/${this.totalSeats} (${Math.round(total / this.totalSeats * 100)}%) | Koalisyon: ${this.getTotalSeats()} | Çoğunluk: ${majority}`;
  }

  checkMajority(ownSeats: number): boolean {
    return ownSeats + this.getTotalSeats() >= this.majorityThreshold;
  }
}

// ──────────────────────────────────────────
// CRISIS SYSTEM
// ──────────────────────────────────────────

export interface CrisisWarning {
  id: string;
  text: string;
  priority: number;
}

export class CrisisSystem {
  private warnings: CrisisWarning[] = [];

  check(pm: { getStat(key: string): number }): CrisisWarning[] {
    this.warnings = [];
    const thresholds: Array<{ id: string; stat: string; low?: number; high?: number; text: string; priority: number }> = [
      { id: "inflation_crisis", stat: "inflation", high: 75, text: "KRİZ: Enflasyon kontrolden çıktı", priority: 90 },
      { id: "unemployment_crisis", stat: "unemployment", high: 70, text: "KRİZ: İşsizlik patladı", priority: 85 },
      { id: "stability_crisis", stat: "stability", low: 20, text: "KRİZ: İç karışıklık — OHAL konuşuluyor", priority: 92 },
      { id: "trust_crisis", stat: "trust", low: 22, text: "KRİZ: Devlete güven çöktü", priority: 80 },
      { id: "budget_crisis", stat: "budget", low: 18, text: "KRİZ: Bütçe iflas noktasında", priority: 88 },
      { id: "intl_crisis", stat: "intl", low: 20, text: "KRİZ: Uluslararası yaptırım riski", priority: 75 },
    ];

    for (const t of thresholds) {
      const val = pm.getStat(t.stat);
      if (t.high !== undefined && val > t.high) {
        this.warnings.push({ id: t.id, text: t.text, priority: t.priority });
      }
      if (t.low !== undefined && val < t.low) {
        this.warnings.push({ id: t.id, text: t.text, priority: t.priority });
      }
    }

    this.warnings.sort((a, b) => b.priority - a.priority);
    return this.warnings;
  }

  getActiveWarnings(): CrisisWarning[] {
    return this.warnings;
  }
}

// ──────────────────────────────────────────
// EVENT SYSTEM
// ──────────────────────────────────────────

export class EventSystem {
  private recentEvents: string[] = [];
  private cooldownCounter = 0;

  pickEvent(pm: { getStat(key: string): number }, values: Record<string, number>): EventDef | null {
    this.cooldownCounter--;
    if (this.cooldownCounter > 0) return null;
    if (Math.random() > 0.65) return null; // 35% chance per turn

    const eligible = ALL_EVENTS.filter(e => {
      if (this.recentEvents.includes(e.title)) return false;
      // Check requirements
      if (e.requires?.stats_min) {
        for (const [key, min] of Object.entries(e.requires.stats_min)) {
          if (pm.getStat(key) < (min as number)) return false;
        }
      }
      if (e.requires?.stats_max) {
        for (const [key, max] of Object.entries(e.requires.stats_max)) {
          if (pm.getStat(key) > (max as number)) return false;
        }
      }
      return true;
    });

    if (eligible.length === 0) return null;

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    this.recentEvents.push(picked.title);
    if (this.recentEvents.length > 8) this.recentEvents.shift();
    this.cooldownCounter = 2;
    return picked;
  }
}

// ──────────────────────────────────────────
// DILEMMA SYSTEM
// ──────────────────────────────────────────

export class DilemmaSystem {
  private recentDilemmas: string[] = [];

  pickDilemma(turn: number): DilemmaDef | null {
    if (turn % 4 !== 0) return null;
    if (Math.random() > 0.7) return null;

    const eligible = ALL_DILEMMAS.filter(d => !this.recentDilemmas.includes(d.title));
    if (eligible.length === 0) return null;

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    this.recentDilemmas.push(picked.title);
    if (this.recentDilemmas.length > 4) this.recentDilemmas.shift();
    return picked;
  }
}

// ──────────────────────────────────────────
// LEAK SYSTEM
// ──────────────────────────────────────────

export class LeakSystem {
  private cooldown = 0;

  checkLeak(pm: { getStat(key: string): number }): LeakDef | null {
    this.cooldown--;
    if (this.cooldown > 0) return null;

    let chance = 0.2;
    if (pm.getStat("media") < 35) chance += 0.2;
    if (pm.getStat("media") > 65) chance += 0.15;
    if (pm.getStat("trust") < 35) chance += 0.15;

    if (Math.random() > chance) return null;

    const leak = ALL_LEAKS[Math.floor(Math.random() * ALL_LEAKS.length)];
    this.cooldown = 4;
    return leak;
  }
}

// ──────────────────────────────────────────
// TREND SYSTEM
// ──────────────────────────────────────────

export class TrendSystem {
  getActiveTrends(): Array<{ tag: string; desc: string }> {
    if (Math.random() > 0.5) return [];
    const count = Math.random() > 0.5 ? 1 : 2;
    const shuffled = [...SOCIAL_TRENDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(t => ({ tag: t.tag, desc: t.desc }));
  }

  applyTrendBoosts(vs: { applyGroupMood(id: string, delta: number): void }): string[] {
    const lines: string[] = [];
    const trends = this.getActiveTrends();
    for (const trend of trends) {
      const tdata = SOCIAL_TRENDS.find(t => t.tag === trend.tag);
      if (!tdata) continue;
      for (const [groupId, boost] of Object.entries(tdata.boosts)) {
        vs.applyGroupMood(groupId, boost);
      }
      for (const [groupId, penalty] of Object.entries(tdata.penalties)) {
        vs.applyGroupMood(groupId, penalty);
      }
      lines.push(`#${trend.tag} gündemde — ${trend.desc}`);
    }
    if (lines.length === 0) lines.push("Gündem sakin");
    return lines;
  }
}

// ──────────────────────────────────────────
// TERROR SYSTEM
// ──────────────────────────────────────────

export class TerrorSystem {
  riskLevel = 25;
  stage = 0; // 0-5 escalation

  tick(pm: { getStat(key: string): number }): string[] {
    const impacts: string[] = [];

    // Base increase (Turkey geopolitics)
    this.riskLevel += 2.5;

    // Police/military effectiveness
    const police = pm.getStat("police");
    const military = pm.getStat("military");
    if (police > 60) this.riskLevel -= 1.5;
    if (military > 60) this.riskLevel -= 1.0;

    // Low stability increases terror
    const stability = pm.getStat("stability");
    const trust = pm.getStat("trust");
    if (stability < 40) this.riskLevel += 2.0;
    if (trust < 35) this.riskLevel += 1.5;

    this.riskLevel = Math.max(0, Math.min(100, this.riskLevel));

    // Stage escalation
    const oldStage = this.stage;
    if (this.riskLevel > 85) this.stage = 5;
    else if (this.riskLevel > 70) this.stage = 4;
    else if (this.riskLevel > 55) this.stage = 3;
    else if (this.riskLevel > 40) this.stage = 2;
    else if (this.riskLevel > 25) this.stage = 1;
    else this.stage = 0;

    if (this.stage > oldStage) {
      const names = ["Güvenli", "İzleme", "Sınır Olayı", "Şehir Tehdidi", "OHAL Eşiği"];
      impacts.push(`⚠ Terör seviyesi yükseldi: ${names[this.stage] ?? "Kritik"}`);
    }

    if (this.stage >= 4) {
      pm.applyStatDelta?.("stability", -3);
      pm.applyStatDelta?.("intl", -2);
      impacts.push("⚠ OHAL talepleri artıyor — uluslararası baskı yükseliyor");
    }

    return impacts;
  }

  getStatus(): string {
    const names = ["Güvenli", "İzleme", "Sınır Olayı", "Şehir Tehdidi", "OHAL Eşiği"];
    return `Terör riski: ${names[this.stage] ?? "Kritik"} (${Math.round(this.riskLevel)}/100)`;
  }
}

// ──────────────────────────────────────────
// CAREER MANAGER
// ──────────────────────────────────────────

export class CareerManager {
  static MAX_TERMS = 4;
  static TURNS_PER_TERM = 8;

  current_term = 1;
  wins = 0;
  consecutive_wins = 0;
  lost_generation_active = false;
  private lostGenTurnCount = 0;

  getWinThreshold(): number {
    return 52 + (this.current_term - 1) * 5 + this.consecutive_wins * 2;
  }

  recordTermResult(won: boolean, overall: number, _ecoSummary: string): void {
    if (won) {
      this.wins++;
      this.consecutive_wins++;
    } else {
      this.consecutive_wins = 0;
    }
  }

  canContinue(won: boolean): boolean {
    return won && this.current_term < CareerManager.MAX_TERMS;
  }

  nextTerm(): void {
    this.current_term++;
  }

  checkLostGeneration(pm: { getStat(key: string): number }): boolean {
    const edu = pm.getStat("education_q");
    const health = pm.getStat("health_q");
    if (edu < 30 && health < 30) {
      this.lostGenTurnCount++;
      if (this.lostGenTurnCount >= 3) {
        this.lost_generation_active = true;
        return true;
      }
    } else {
      this.lostGenTurnCount = 0;
    }
    return false;
  }

  getTimingMultiplier(turn: number): number {
    // Honeymoon (first 2 turns) → slight bonus
    if (turn <= 2) return 0.85;
    // Pre-election (last 2 turns) → populism boost
    if (turn >= CareerManager.TURNS_PER_TERM - 1) return 1.25;
    return 1.0;
  }

  getElectionNarrative(won: boolean, overall: number, threshold: number, rawApproval: number, turnout: number, ecoSummary: string): string {
    if (won) {
      if (overall > threshold + 10) return `Zafer! %${overall.toFixed(1)} ile açık ara kazandın. Halk sandıkta güvenoyu verdi.`;
      if (overall > threshold) return `Kıl payı kazandın. %${overall.toFixed(1)} — %${threshold} barajını zor aştın. Meclis çetin geçecek.`;
      return `Kazandın ama... %${overall.toFixed(1)} zayıf bir zafer.`;
    }
    return `Kaybettin. %${overall.toFixed(1)} ile %${threshold} barajının altında kaldın. Muhalefet iktidarda.`;
  }

  getTermNarrative(): string {
    switch (this.current_term) {
      case 1: return "1. Dönem — Balayı dönemi. Halk umutlu, beklenti yüksek.";
      case 2: return "2. Dönem — Artık tanınıyorsun. Vaatlerin hatırlanıyor.";
      case 3: return "3. Dönem — Yorgunluk başladı. 'Hep aynı' diyenler çoğalıyor.";
      case 4: return "4. Dönem — Kritik dönem. Ya miras bırakırsın ya da unutulursun.";
      default: return `${this.current_term}. Dönem`;
    }
  }

  getLegacyAssessment(overall: number): string {
    if (this.wins >= 3) return "Efsanevi lider — ülkeyi yeniden şekillendirdin.";
    if (this.wins >= 2) return "Başarılı bir dönem — iz bıraktın.";
    if (this.wins >= 1) return "Ortalama bir yönetim — unutulup gideceksin.";
    return "Başarısız — tarihin tozlu sayfalarına karıştın.";
  }
}

// ──────────────────────────────────────────
// TERM GOALS
// ──────────────────────────────────────────

export class TermGoals {
  active: {
    type: string;
    text: string;
    reward: string;
    target: string;
    targetVal: number;
  } | null = null;
  completed = false;

  private goalTypes = [
    { type: "stat", text: "%s %d üstüne çıkar.", reward: "Tüm gruplar +3 mood, trust +4", target: "", targetVal: 0 },
  ];

  pickNew(pm: { getStat(key: string): number }): void {
    const stats = [
      { key: "economy", name: "Ekonomi" },
      { key: "education_q", name: "Eğitim Kalitesi" },
      { key: "health_q", name: "Sağlık Kalitesi" },
      { key: "trust", name: "Devlete Güven" },
      { key: "happiness", name: "Yaşam Memnuniyeti" },
    ];
    const picked = stats[Math.floor(Math.random() * stats.length)];
    const current = Math.round(pm.getStat(picked.key));
    const target = Math.min(95, current + 12 + Math.floor(Math.random() * 10));

    this.active = {
      type: "stat",
      text: `${picked.name} ${target} üstüne çıkar.`,
      reward: "Tüm gruplar +3 mood, trust +4",
      target: picked.key,
      targetVal: target,
    };
    this.completed = false;
  }

  check(pm: { getStat(key: string): number }, vs: { applyAllMood(d: number): void }, _eco: any): boolean {
    if (!this.active || this.completed) return false;
    if (pm.getStat(this.active.target) >= this.active.targetVal) {
      this.completed = true;
      vs.applyAllMood(2.5);
      pm.applyStatDelta?.("trust", 3.0);
      return true;
    }
    return false;
  }

  getStatusText(): string {
    if (!this.active) return "";
    const mark = this.completed ? "✓" : "✗";
    return `${mark} Dönem hedefi: ${this.active.text}`;
  }
}

(function addApplyStatDeltaToTerror() {
  // Extend PM type — dirty but works
})();
