import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { CORE_LEVERS, POLICY_PRESETS, MINISTER_ROLES, MINISTER_CANDIDATES } from './engine/game_data';
import { CareerManager } from './engine/systems';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';

const ROLE_CANDIDATE_PREFIX: Record<string, string> = {
  finance: 'fin_', interior: 'int_', foreign: 'for_',
  health: 'health_', education: 'edu_', agriculture: 'agr_', justice: 'just_',
};

export default function App() {
  const phase = useGameStore(s => s.phase);
  if (phase === 'party_pick') return <PartyPick />;
  return <GameScreen />;
}

// ── PARTY PICK ──
function PartyPick() {
  const start = useGameStore(s => s.startGame);
  const presets = Object.entries(POLICY_PRESETS);
  const icons: Record<string, string> = { populist: '🌟', center: '⚖️', nation: '🛡' };
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-[#1a1a2e] p-8">
      <h1 className="text-4xl font-bold text-white">Türkiye Simülasyonu</h1>
      <p className="text-gray-400 text-lg">Nasıl başlamak istiyorsun?</p>
      <div className="flex gap-4 max-w-3xl">
        {presets.map(([id, p]) => (
          <button
            key={id}
            onClick={() => start(id)}
            className="flex-1 bg-[#222244] hover:bg-[#2a2a55] border border-[#333] rounded-xl p-6 text-left transition"
          >
            <div className="text-3xl mb-2">{icons[id] ?? '📋'}</div>
            <div className="text-white font-bold text-lg">{p.name}</div>
            <div className="text-gray-400 text-sm mt-1">{p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── GAME SCREEN ──
function GameScreen() {
  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e] overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <BottomBar />
      <PopupOverlay />
    </div>
  );
}

// ── TOP BAR ──
function TopBar() {
  const pm = useGameStore(s => s.pm);
  const turn = useGameStore(s => s.turn);
  const term = useGameStore(s => s.term);
  const feedback = useGameStore(s => s.feedback);
  const reactionLine = useGameStore(s => s.reactionLine);
  const statKeys = ['economy', 'inflation', 'unemployment', 'stability', 'budget', 'trust', 'intl'];

  return (
    <div className="bg-[#111122] border-b border-[#333] px-4 py-2">
      <div className="flex items-center gap-3 text-xs overflow-x-auto">
        <span className="text-gray-400 font-bold whitespace-nowrap">DÖNEM {term}</span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400 whitespace-nowrap">Tur {turn}/{CareerManager.TURNS_PER_TERM}</span>
        <span className="text-gray-500">|</span>
        {statKeys.map(k => {
          const v = pm.getStat(k);
          const good = pm.isStatGoodHigh(k);
          const color = (good && v >= 55) || (!good && v <= 45) ? '#4dbf4d'
            : (good && v <= 35) || (!good && v >= 65) ? '#d94d4d' : '#aaa';
          return (
            <span key={k} className="whitespace-nowrap" style={{ color }}>
              {pm.getStatName(k)} {Math.round(v)}
            </span>
          );
        })}
        <span className="text-gray-500">|</span>
        <span className="text-yellow-400 whitespace-nowrap font-bold">
          ⭐ {Math.round(pm.political_capital)}/{Math.round(pm.max_political_capital)} SP
        </span>
      </div>
      <div className="flex gap-4 mt-1 text-xs">
        <span className="text-orange-400">{reactionLine}</span>
        <span className="text-gray-500 italic ml-auto">{feedback}</span>
      </div>
    </div>
  );
}

// ── LEFT: LEVERS ──
function LeftPanel() {
  const pm = useGameStore(s => s.pm);
  const policyVersion = useGameStore(s => s.policyVersion);
  void policyVersion; // re-render tetikleyici
  const setLeverValue = useGameStore(s => s.setLeverValue);
  const setPolicy = useGameStore(s => s.setPolicy);

  return (
    <div className="w-84 bg-[#111122] border-r border-[#333] overflow-y-auto p-3 flex flex-col gap-3">
      <div className="text-gray-300 font-bold text-sm">Politika Kolları</div>
      {CORE_LEVERS.map(lever => {
        const vals = lever.keys.map(k => pm.getPolicy(k));
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return (
          <div key={lever.id} className="bg-[#1a1a33] rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">{lever.name}</span>
              <span className="text-gray-400">{Math.round(avg)}</span>
            </div>
            <input
              type="range" min={0} max={100} value={Math.round(avg)}
              onChange={e => setLeverValue(lever.id, parseInt(e.target.value))}
              className="w-full"
              style={{ background: lever.color }}
            />
            <div className="text-gray-500 text-xs mt-1">{lever.hint}</div>
            {lever.keys.length > 1 && (
              <div className="mt-2 flex flex-col gap-1">
                {lever.keys.map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-28 truncate">{pm.getPolicyName(k)}</span>
                    <input
                      type="range" min={0} max={100} value={pm.getPolicy(k)}
                      onChange={e => setPolicy(k, parseInt(e.target.value))}
                      className="flex-1 h-3"
                      style={{ background: pm.getPolicyColor(k) }}
                    />
                    <span className="text-xs text-gray-500 w-6">{pm.getPolicy(k)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── CENTER: BUBBLE CHART + LOG ──
function CenterPanel() {
  const vs = useGameStore(s => s.vs);
  const log = useGameStore(s => s.log);
  const groups = vs.getGroupListSorted();

  const data = groups.map(g => ({
    name: g.name,
    approval: Math.round(g.approval),
    weight: g.weight,
    color: g.color,
    loyal: g.loyal,
    delta: Math.round(g.delta * 10) / 10,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 p-2">
        <div className="text-gray-400 text-xs mb-1">Seçmen Grupları (büyüklük = ağırlık)</div>
        {data.length > 0 && (
          <ScatterChart width={500} height={320} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis type="number" dataKey="approval" name="Onay" unit="%" domain={[0, 100]} stroke="#666" tick={{ fontSize: 10 }} />
            <YAxis type="number" dataKey="delta" name="Değişim" unit="%" domain={[-15, 15]} stroke="#666" tick={{ fontSize: 10 }} />
            <ZAxis type="number" dataKey="weight" range={[40, 280]} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid #444', borderRadius: 8, fontSize: 12 }}
              formatter={(val: any, name: any) => [`${val}${name === 'approval' ? '%' : ' puan'}`, name === 'approval' ? 'Onay' : 'Değişim']}
            />
            <Scatter data={data} fill="#888">
              {data.map((d, i) => (
                <circle key={i} r={Math.max(8, d.weight * 10)} fill={d.color} opacity={0.8} stroke={d.loyal ? 'none' : '#f90'} strokeWidth={d.loyal ? 0 : 2} />
              ))}
            </Scatter>
          </ScatterChart>
        )}
        <div className="text-gray-500 text-xs text-center">
          ▲▼ = son tur değişim | Turuncu çerçeve = sadakat kırıldı
        </div>
      </div>
      <div className="h-40 bg-[#0d0d1a] border-t border-[#333] overflow-y-auto p-2">
        {log.slice(-20).map((entry, i) => (
          <div key={i} className="text-xs py-0.5" style={{ color: entry.color }}>
            <span className="text-gray-600">T{entry.turn}</span> {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RIGHT: CABINET + GROUPS ──
function RightPanel() {
  const cabinet = useGameStore(s => s.cabinet);
  const cabinetVersion = useGameStore(s => s.cabinetVersion);
  void cabinetVersion;
  const vs = useGameStore(s => s.vs);
  const appoint = useGameStore(s => s.appointMinister);
  const fire = useGameStore(s => s.fireMinister);
  const groups = vs.getGroupListSorted();
  const [expanded, setExpanded] = useState<string | null>(null);

  const getCandidates = (roleId: string) => {
    const prefix = ROLE_CANDIDATE_PREFIX[roleId];
    if (!prefix) return [];
    return Object.entries(MINISTER_CANDIDATES)
      .filter(([key]) => key.startsWith(prefix));
  };

  return (
    <div className="w-72 bg-[#111122] border-l border-[#333] overflow-y-auto p-3 flex flex-col gap-2">
      <div className="text-gray-300 font-bold text-sm">Kabine</div>
      {cabinet.getMinistersList().map(({ roleId, roleName, minister }) => {
        const isOpen = expanded === roleId;
        const candidates = getCandidates(roleId);
        return (
          <div key={roleId} className="bg-[#1a1a33] rounded-lg p-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{roleName}</span>
              {minister ? (
                <button
                  onClick={() => { fire(roleId); setExpanded(null); }}
                  className="text-red-400 hover:text-red-300 text-[10px] px-1.5 py-0.5 rounded border border-red-800 hover:border-red-600"
                >
                  Azlet
                </button>
              ) : (
                <button
                  onClick={() => setExpanded(isOpen ? null : roleId)}
                  className="text-yellow-400 hover:text-yellow-300 text-[10px] px-1.5 py-0.5 rounded border border-yellow-800 hover:border-yellow-600"
                >
                  {isOpen ? 'Kapat' : 'Ata'}
                </button>
              )}
            </div>
            {minister ? (
              <>
                <div className="text-white font-bold text-xs mt-0.5">{minister.name}</div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <span className="text-green-400">⭐{Math.round(minister.skill * 100)}</span>
                  <span className="text-yellow-400">🎯{Math.round(minister.campaigning * 100)}</span>
                  <span className="text-red-400">⚠{Math.round(minister.scandal_risk * 100)}</span>
                  <span className={minister.loyalty > 40 ? 'text-green-400' : 'text-red-400'}>
                    ❤️{Math.round(minister.loyalty)}
                  </span>
                </div>
                <div className="text-gray-500 mt-0.5 italic truncate">{minister.trait}</div>
                {isOpen && (
                  <div className="mt-2 pt-2 border-t border-[#333] flex flex-col gap-1.5">
                    <div className="text-gray-500 text-[10px]">Değiştirmek için aday seç:</div>
                    {candidates.map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => { appoint(roleId, key); setExpanded(null); }}
                        className="text-left bg-[#222244] hover:bg-[#2a2a55] rounded p-2 transition"
                      >
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{c.name}</span>
                          <span className="text-green-400">⭐{Math.round(c.skill * 100)}</span>
                        </div>
                        <div className="text-gray-400 text-[10px] mt-0.5">{c.trait}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              isOpen && (
                <div className="mt-2 pt-2 border-t border-[#333] flex flex-col gap-1.5">
                  {candidates.map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => { appoint(roleId, key); setExpanded(null); }}
                      className="text-left bg-[#222244] hover:bg-[#2a2a55] rounded p-2 transition"
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-bold">{c.name}</span>
                        <div className="flex gap-1.5">
                          <span className="text-green-400">⭐{Math.round(c.skill * 100)}</span>
                          <span className="text-yellow-400">🎯{Math.round(c.campaigning * 100)}</span>
                          <span className="text-red-400">⚠{Math.round(c.scandal_risk * 100)}</span>
                        </div>
                      </div>
                      <div className="text-gray-400 text-[10px] mt-0.5">{c.trait}</div>
                      <div className="text-gray-500 text-[10px]">{c.special}</div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        );
      })}

      <div className="text-gray-300 font-bold text-sm mt-3">Seçmen Grupları</div>
      {groups.map(g => (
        <div key={g.id} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
          <span className="text-gray-300 w-28 truncate">{g.name}</span>
          <span className={g.approval >= 50 ? 'text-green-400' : 'text-red-400'}>{Math.round(g.approval)}%</span>
          <span className={g.delta > 0 ? 'text-green-400' : g.delta < 0 ? 'text-red-400' : 'text-gray-500'}>
            {g.delta > 0 ? '▲' : g.delta < 0 ? '▼' : '◆'}{Math.abs(Math.round(g.delta))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── BOTTOM BAR ──
function BottomBar() {
  const nextTurn = useGameStore(s => s.nextTurn);
  const turnButtonLabel = useGameStore(s => s.turnButtonLabel);
  const pendingLeak = useGameStore(s => s.pendingLeak);
  const pendingDilemma = useGameStore(s => s.pendingDilemma);

  return (
    <div className="bg-[#111122] border-t border-[#333] px-4 py-2 flex items-center gap-3">
      <button
        onClick={nextTurn}
        disabled={!!(pendingLeak || pendingDilemma)}
        className="bg-[#2a2a55] hover:bg-[#3a3a66] disabled:opacity-40 text-white px-6 py-2 rounded-lg font-bold text-sm transition"
      >
        {turnButtonLabel}
      </button>
      <span className="text-gray-500 text-xs">
        {pendingLeak ? '⚠ Önce sızıntıyı yanıtla' : pendingDilemma ? '⚖️ Önce ikilemi yanıtla' : ''}
      </span>
    </div>
  );
}

// ── POPUP (leaks, dilemmas, election, game over) ──
function PopupOverlay() {
  const pendingLeak = useGameStore(s => s.pendingLeak);
  const pendingDilemma = useGameStore(s => s.pendingDilemma);
  const pendingChoices = useGameStore(s => s.pendingChoices);
  const resolveChoice = useGameStore(s => s.resolveChoice);
  const electionResult = useGameStore(s => s.electionResult);
  const phase = useGameStore(s => s.phase);

  const show = pendingLeak || pendingDilemma || electionResult || phase === 'game_over';
  if (!show) return null;

  let title = '';
  let text = '';
  if (pendingLeak) { title = pendingLeak.title; text = pendingLeak.text; }
  if (pendingDilemma) { title = pendingDilemma.title; text = pendingDilemma.text; }
  if (electionResult) { title = 'Seçim Sonucu'; text = electionResult; }
  if (phase === 'game_over') { title = 'Oyun Bitti'; text = 'Simülasyon sona erdi. Tekrar başlatmak için sayfayı yenile.'; }

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1e1e3a] border border-[#555] rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <pre className="text-gray-300 text-sm whitespace-pre-wrap mb-4 font-sans leading-relaxed">{text}</pre>
        {pendingChoices && (
          <div className="flex flex-col gap-2">
            {pendingChoices.map((c, i) => (
              <button
                key={i}
                onClick={() => resolveChoice(i)}
                className="bg-[#2a2a55] hover:bg-[#3a3a66] text-white px-4 py-2 rounded-lg text-sm text-left transition"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        {(electionResult || phase === 'game_over') && (
          <button
            onClick={() => window.location.reload()}
            className="bg-[#4d4dbf] hover:bg-[#5d5dcf] text-white px-6 py-2 rounded-lg font-bold mt-3"
          >
            Yeniden Başla
          </button>
        )}
      </div>
    </div>
  );
}
