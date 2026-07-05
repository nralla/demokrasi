import { create } from 'zustand';
import { PolicyManager } from '../engine/policy_manager';
import { EconomyManager } from '../engine/economy_manager';
import { VoterSimulation } from '../engine/voter_simulation';
import { CabinetManager } from '../engine/cabinet_manager';
import { CoalitionSystem, CrisisSystem, EventSystem, DilemmaSystem, LeakSystem, TrendSystem, TerrorSystem, CareerManager, TermGoals } from '../engine/systems';
import { CORE_LEVERS, POLICY_PRESETS } from '../engine/game_data';
import type { EventDef, DilemmaDef, LeakDef, TurnLogEntry } from '../engine/types';

export type GamePhase = 'party_pick' | 'playing' | 'election' | 'game_over';

interface GameState {
  // Engine instances
  pm: PolicyManager;
  eco: EconomyManager;
  vs: VoterSimulation;
  cabinet: CabinetManager;
  coalition: CoalitionSystem;
  crisis: CrisisSystem;
  events: EventSystem;
  dilemmas: DilemmaSystem;
  leaks: LeakSystem;
  trends: TrendSystem;
  terror: TerrorSystem;
  career: CareerManager;
  termGoals: TermGoals;

  // UI state
  phase: GamePhase;
  turn: number;
  term: number;
  policyVersion: number;
  cabinetVersion: number;
  log: TurnLogEntry[];
  feedback: string;
  reactionLine: string;
  pendingEvent: EventDef | null;
  pendingDilemma: DilemmaDef | null;
  pendingLeak: LeakDef | null;
  pendingChoices: Array<{ label: string; action: () => void }> | null;
  electionResult: string | null;
  turnButtonLabel: string;

  // Actions
  startGame: (presetId: string) => void;
  nextTurn: () => void;
  setPolicy: (key: string, value: number) => void;
  setLeverValue: (leverId: string, value: number) => void;
  appointMinister: (roleId: string, candidateKey: string) => void;
  fireMinister: (roleId: string) => void;
  resolveChoice: (index: number) => void;
  tick: () => string[];
}

export const useGameStore = create<GameState>((set, get) => {
  const pm = new PolicyManager();
  const eco = new EconomyManager();
  const vs = new VoterSimulation();
  const cabinet = new CabinetManager();
  const coalition = new CoalitionSystem();
  const crisis = new CrisisSystem();
  const events = new EventSystem();
  const dilemmas = new DilemmaSystem();
  const leaks = new LeakSystem();
  const trends = new TrendSystem();
  const terror = new TerrorSystem();
  const career = new CareerManager();
  const termGoals = new TermGoals();

  // Wire cabinet bonus
  pm.cabinet_bonus_fn = (key: string) => cabinet.getPolicyBonus(key);

  // Wire callbacks
  cabinet.onMinisterResigned = (_roleId, name, reason) => {
    addLog(`${name} istifa etti: ${reason}`, '#e6983a');
    set({ feedback: `${name} istifa etti!` });
  };

  cabinet.onScandal = (text, choices) => {
    addLog(text, '#d94d4d');
    set({
      pendingLeak: { title: 'Kabine Skandalı', text, choices },
      pendingChoices: choices.map((c, _i) => ({
        label: c.label,
        action: () => {
          addLog(c.result_text, '#e6983a');
          set({ pendingLeak: null, pendingChoices: null });
        },
      })),
    });
  };

  function addLog(text: string, color: string, type: TurnLogEntry['type'] = 'info') {
    set(s => ({
      log: [...s.log.slice(-100), { turn: s.turn, text, color, type }],
    }));
  }

  function recalcAll() {
    vs.recalculate(pm, eco, career.current_term);
    const overall = vs.getOverallApproval();
    const campaignBonus = cabinet.getCampaigningTotal();
    pm.refreshPoliticalCapital(overall, campaignBonus);
    set({
      reactionLine: vs.getReactionLine(),
    });
  }

  return {
    pm, eco, vs, cabinet, coalition, crisis, events, dilemmas, leaks, trends, terror, career, termGoals,

    phase: 'party_pick',
    turn: 1,
    term: 1,
    policyVersion: 0,
    cabinetVersion: 0,
    log: [],
    feedback: 'Paket seç ve başla!',
    reactionLine: '',
    pendingEvent: null,
    pendingDilemma: null,
    pendingLeak: null,
    pendingChoices: null,
    electionResult: null,
    turnButtonLabel: '1) Sonraki Tur →',

    startGame: (presetId: string) => {
      const preset = POLICY_PRESETS[presetId];
      if (preset) {
        const updates: Record<string, number> = {};
        for (const [leverId, val] of Object.entries(preset.levers)) {
          const lever = CORE_LEVERS.find(l => l.id === leverId);
          if (lever) {
            for (const key of lever.keys) {
              updates[key] = val;
            }
          }
        }
        pm.setPoliciesBatch(updates);
      }
      termGoals.pickNew(pm);
      recalcAll();
      set({
        phase: 'playing',
        turn: 1,
        term: 1,
        log: [],
        feedback: 'Sonraki Tur\'a bas — ilk gündem gelsin.',
        turnButtonLabel: '1) Sonraki Tur →',
      });
    },

    nextTurn: () => {
      const s = get();
      if (s.phase !== 'playing') return;

      // Check election
      if (s.turn >= CareerManager.TURNS_PER_TERM) {
        // Election time
        const overall = vs.getOverallApproval();
        const rawApproval = vs.getRawApproval();
        const turnout = vs.getTurnout();
        const threshold = career.getWinThreshold();
        const ownSeats = coalition.getOwnSeatEstimate(overall, turnout);
        const won = coalition.checkMajority(ownSeats);

        career.recordTermResult(won, overall, eco.getSummary());
        const narrative = career.getElectionNarrative(won, overall, threshold, rawApproval, turnout, eco.getSummary());
        const statusText = coalition.getStatusText(ownSeats);

        set({
          phase: 'election',
          electionResult: [
            `🗳️ DÖNEM ${career.current_term} SEÇİM SONUCU 🗳️`,
            '',
            narrative,
            '',
            statusText,
            `Kararsız seçmen: ${Math.round(vs.getSwingVoterPct())}% | Kutuplaşma: ${Math.round(vs.getPolarization())} puan`,
            terror.getStatus(),
            '',
            won ? (career.canContinue(won) ? '🎉 Kazandın! Sonraki döneme hazırlan.' : '🎉 Kazandın! Ama bu son dönemindi.') : '❌ Kaybettin!',
          ].join('\n'),
        });

        if (career.canContinue(won)) {
          eco.carryToNextTerm();
          career.nextTerm();
          termGoals.pickNew(pm);
          pm.decayPersistentDeltas();
          recalcAll();
          set({
            turn: 1,
            term: career.current_term,
            phase: 'playing',
            feedback: `Yeni dönem: ${career.current_term}. dönem başladı.`,
            turnButtonLabel: '1) Sonraki Tur →',
          });
        } else {
          set({ phase: 'game_over' });
        }
        return;
      }

      // ── Normal turn flow ──
      const impacts: string[] = [];

      // 1. Refresh political capital
      const campaignBonus = cabinet.getCampaigningTotal();
      pm.refreshPoliticalCapital(vs.getOverallApproval(), campaignBonus);

      // 2. Decay persistent deltas
      pm.decayPersistentDeltas();

      // 3. Cabinet loyalty
      cabinet.updateLoyalty(pm);

      // 4. Lost generation check
      if (career.checkLostGeneration(pm)) {
        pm.applyStatDelta('education_q', -3);
        pm.applyStatDelta('health_q', -3);
        impacts.push('⚠ Kayıp nesil: eğitim/sağlık ihmali kalıcı hasar bıraktı');
      }

      // 5. Cynicism
      vs.applyCynicism();

      // 6. Polarization + rivalry
      const polEff = vs.getPolarizationEffects();
      if (polEff.stability_penalty > 0) {
        pm.applyStatDelta('stability', -polEff.stability_penalty);
        pm.applyStatDelta('trust', -polEff.trust_penalty);
        impacts.push(polEff.warning);
      }
      const rivalryMsgs = vs.applyGroupRivalry();
      impacts.push(...rivalryMsgs);

      // 7. Auto-anger
      const angerMsgs = vs.autoAngerAccumulation(pm);
      impacts.push(...angerMsgs);

      // 8. Leaks
      const leak = leaks.checkLeak(pm);
      if (leak) {
        addLog(`📰 ${leak.title}: ${leak.text}`, '#d94d4d', 'leak');
        set({
          pendingLeak: leak,
          pendingChoices: leak.choices.map((c, _i) => ({
            label: c.label,
            action: () => {
              if (c.stat_deltas) {
                for (const [k, v] of Object.entries(c.stat_deltas)) pm.applyStatDelta(k, v);
              }
              if (c.group_mood) {
                for (const [g, v] of Object.entries(c.group_mood)) vs.applyGroupMood(g, v);
              }
              addLog(c.result_text, '#e6983a', 'leak');
              set({ pendingLeak: null, pendingChoices: null });
              recalcAll();
            },
          })),
        });
      }

      // 9. Random event
      if (!get().pendingLeak && !get().pendingDilemma) {
        const evt = events.pickEvent(pm, pm.values);
        if (evt) {
          addLog(`${evt.title}: ${evt.text}`, '#4da6d9', 'event');
          if (evt.stat_deltas) {
            for (const [k, v] of Object.entries(evt.stat_deltas)) pm.applyStatDelta(k, v);
          }
          if (evt.group_mood) {
            for (const [g, v] of Object.entries(evt.group_mood)) vs.applyGroupMood(g, v);
          }
          if (evt.group_anger) {
            for (const [g, v] of Object.entries(evt.group_anger)) vs.applyGroupAnger(g, v);
          }
        }
      }

      // 10. Dilemmas (every 4th turn)
      if (!get().pendingLeak) {
        const dilemma = dilemmas.pickDilemma(s.turn);
        if (dilemma) {
          addLog(`⚖️ İkilem: ${dilemma.title}`, '#e6b33a', 'dilemma');
          set({
            pendingDilemma: dilemma,
            pendingChoices: dilemma.choices.map((c, _i) => ({
              label: c.label,
              action: () => {
                if (c.stat_deltas) {
                  for (const [k, v] of Object.entries(c.stat_deltas)) pm.applyStatDelta(k, v);
                }
                if (c.group_mood) {
                  for (const [g, v] of Object.entries(c.group_mood)) vs.applyGroupMood(g, v);
                }
                if (c.group_anger) {
                  for (const [g, v] of Object.entries(c.group_anger)) vs.applyGroupAnger(g, v);
                }
                addLog(c.result_text, '#e6983a', 'dilemma');
                set({ pendingDilemma: null, pendingChoices: null });
                recalcAll();
              },
            })),
          });
        }
      }

      // 11. Social trends
      const trendLines = trends.applyTrendBoosts(vs);
      for (const line of trendLines) {
        if (line !== 'Gündem sakin') addLog(`📱 ${line}`, '#8c59bf', 'trend');
      }

      // 12. Terror
      const terrorImpacts = terror.tick(pm);
      impacts.push(...terrorImpacts);

      // 13. Economy
      const ecoImpacts = eco.tick(pm);
      impacts.push(...ecoImpacts);

      // 14. Success crises
      const sucCrises = eco.checkSuccessCrises(pm, vs.getOverallApproval());
      for (const sc of sucCrises) {
        addLog(`🔴 ${sc.name}: ${sc.desc}`, '#d94d4d', 'crisis');
        if (sc.stat_deltas) {
          for (const [k, v] of Object.entries(sc.stat_deltas)) pm.applyStatDelta(k, v);
        }
        if (sc.group_mood) {
          for (const [g, v] of Object.entries(sc.group_mood)) vs.applyGroupMood(g, v);
        }
        if (sc.group_anger) {
          for (const [g, v] of Object.entries(sc.group_anger)) vs.applyGroupAnger(g, v);
        }
      }

      // 15. Mood decay + recalc
      vs.decayMood();
      recalcAll();

      // 16. Crisis warnings
      const crisisWarnings = crisis.check(pm);
      for (const cw of crisisWarnings) {
        impacts.push(`🔴 ${cw.text}`);
      }

      // 17. Term goal check
      const wasDone = termGoals.completed;
      termGoals.check(pm, vs, eco);
      if (termGoals.completed && !wasDone) {
        addLog('🏆 Dönem hedefi tamamlandı!', '#4dbf4d', 'success');
      }

      // 18. Turn +1
      const newTurn = s.turn + 1;

      // Log impacts
      for (const imp of impacts) {
        addLog(imp, imp.startsWith('🔴') ? '#d94d4d' : imp.startsWith('⚠') ? '#e6983a' : '#8cbfe6', 'info');
      }

      set({
        turn: newTurn,
        feedback: impacts.length > 0 ? impacts[impacts.length - 1] : 'Tur ilerledi.',
        reactionLine: vs.getReactionLine(),
        turnButtonLabel: newTurn >= CareerManager.TURNS_PER_TERM ? '🗳️ Seçim Günü!' : `${newTurn}) Sonraki Tur →`,
      });
    },

    setPolicy: (key: string, value: number) => {
      const s = get();
      const oldVal = s.pm.getPolicy(key);
      const cost = s.pm.getPolicyPoliticalCost(key);
      if (!s.pm.spendPoliticalCapital(cost)) {
        set({ feedback: `⚠ Yetersiz siyasi sermaye! ${cost} gerekli, ${Math.round(s.pm.political_capital)} var.` });
        return;
      }
      s.pm.setPolicy(key, value);
      const shockMsg = s.vs.applyPolicyShock(key, oldVal, value);
      recalcAll();
      set({
        feedback: shockMsg || `${s.pm.getPolicyName(key)} → ${Math.round(value)}`,
        policyVersion: s.policyVersion + 1,
      });
    },

    setLeverValue: (leverId: string, value: number) => {
      const lever = CORE_LEVERS.find(l => l.id === leverId);
      if (!lever) return;
      const s = get();
      for (const key of lever.keys) {
        s.pm.setPolicy(key, value);
      }
      recalcAll();
      set({
        feedback: `${lever.name} → ${Math.round(value)}`,
        policyVersion: s.policyVersion + 1,
      });
    },

    appointMinister: (roleId: string, candidateKey: string) => {
      const msg = cabinet.appoint(roleId, candidateKey);
      recalcAll();
      const s = get();
      set({
        feedback: msg,
        cabinetVersion: s.cabinetVersion + 1,
      });
      addLog(msg, '#4da6d9', 'info');
    },

    fireMinister: (roleId: string) => {
      const msg = cabinet.fire(roleId);
      recalcAll();
      const s = get();
      set({
        feedback: msg,
        cabinetVersion: s.cabinetVersion + 1,
      });
      addLog(msg, '#e6983a', 'info');
    },

    resolveChoice: (index: number) => {
      const s = get();
      if (s.pendingChoices && index < s.pendingChoices.length) {
        s.pendingChoices[index].action();
      }
    },

    tick: () => {
      get().nextTurn();
      return [];
    },
  };
});
