import { MINISTER_ROLES, MINISTER_CANDIDATES } from './game_data';

export interface Minister {
  candidateKey: string;
  name: string;
  skill: number;
  scandal_risk: number;
  campaigning: number;
  trait: string;
  story: string;
  special: string;
  weakness: string;
  policy_pref: Record<string, string>;
  pleases: string[];
  angers: string[];
  scandal_text: string;
  hidden_agenda: string;
  loyalty: number;
}

export class CabinetManager {
  ministers: Record<string, Minister | null> = {}; // role_id → minister

  onMinisterResigned?: (roleId: string, name: string, reason: string) => void;
  onScandal?: (text: string, choices: Array<{ label: string; result_text: string }>) => void;

  constructor() {
    for (const roleId of Object.keys(MINISTER_ROLES)) {
      this.ministers[roleId] = null;
    }
  }

  appoint(roleId: string, candidateKey: string): string {
    if (!(roleId in MINISTER_ROLES)) return "Geçersiz bakanlık.";
    const c = MINISTER_CANDIDATES[candidateKey];
    if (!c) return "Geçersiz aday.";

    const old = this.ministers[roleId];
    if (old) {
      // Fired minister angers their fans
      // Other ministers lose loyalty
      for (const [rid, m] of Object.entries(this.ministers)) {
        if (m && rid !== roleId) {
          m.loyalty = Math.max(0, m.loyalty - 2);
        }
      }
    }

    this.ministers[roleId] = {
      candidateKey,
      ...c,
      loyalty: 50,
    };

    return old
      ? `${c.name} atandı (${old.name} görevden alındı)`
      : `${c.name} atandı.`;
  }

  fire(roleId: string): string {
    const m = this.ministers[roleId];
    if (!m) return "Bu bakanlık boş.";
    const name = m.name;
    this.ministers[roleId] = null;
    return `${name} görevden alındı — kabinede huzursuzluk!`;
  }

  updateLoyalty(pm: { getPolicy(key: string): number }): void {
    for (const [roleId, m] of Object.entries(this.ministers)) {
      if (!m) continue;

      // Policy preference drift
      let drift = 0;
      for (const [pkey, pref] of Object.entries(m.policy_pref)) {
        const val = pm.getPolicy(pkey);
        if (pref === "high" && val < 45) drift += 1.5;
        if (pref === "low" && val > 55) drift += 1.5;
      }
      m.loyalty = Math.max(0, m.loyalty - drift);

      // Scandal risk
      if (Math.random() < m.scandal_risk * 0.15) {
        m.loyalty -= 10;
        // Could trigger scandal event
      }

      // Very low loyalty → resign
      if (m.loyalty < 10 && Math.random() < 0.4) {
        const name = m.name;
        this.ministers[roleId] = null;
        this.onMinisterResigned?.(roleId, name, "Düşük sadakat");
      }

      // Low loyalty → leak
      if (m.loyalty < 20 && Math.random() < 0.25) {
        this.onScandal?.(`${m.name} kabine içi yazışmaları basına sızdırdı. '${m.weakness}' dedi.`, [
          { label: "Özür dile & değiştir", result_text: "Özür diledin ve bakanı değiştirdin." },
        ]);
      }
    }
  }

  getPolicyBonus(policyKey: string): number {
    let bonus = 0;
    for (const [roleId, m] of Object.entries(this.ministers)) {
      if (!m) continue;
      const role = MINISTER_ROLES[roleId];
      if (role?.policy === policyKey) {
        bonus += m.skill * (m.loyalty / 100) * 8;
      }
    }
    return bonus;
  }

  getCampaigningTotal(): number {
    let total = 0;
    for (const m of Object.values(this.ministers)) {
      if (m) total += m.campaigning;
    }
    return total;
  }

  getEmptyMinistryPenalty(): number {
    let empty = 0;
    for (const m of Object.values(this.ministers)) {
      if (!m) empty++;
    }
    return empty * 15; // 15% per empty
  }

  checkHiddenAgendas(turn: number): string[] {
    const msgs: string[] = [];
    for (const m of Object.values(this.ministers)) {
      if (!m) continue;
      if (Math.random() < 0.08) {
        msgs.push(`${m.name}: ${m.hidden_agenda}`);
      }
    }
    return msgs;
  }

  getMinistersList(): Array<{
    roleId: string; roleName: string; minister: Minister | null;
  }> {
    return Object.entries(MINISTER_ROLES).map(([id, role]) => ({
      roleId: id, roleName: role.name, minister: this.ministers[id],
    }));
  }

  getMinisterForRole(roleId: string): Minister | null {
    return this.ministers[roleId] ?? null;
  }
}
