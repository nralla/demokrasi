# Mimari Dokümantasyonu

## Genel Bakış

```
┌─ Tauri Shell (Rust) ───────────────────────┐
│  tauri-plugin-store → save/load (.json)     │
│                                             │
│  ┌─ WebView ─────────────────────────────┐  │
│  │  React UI                              │  │
│  │  ↕ zustand (useGameStore)              │  │
│  │  Simulation Engine (Pure TypeScript)   │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Katmanlar

### 1. Simulation Engine (`src/engine/`)

**Pure TypeScript — React'tan tamamen bağımsız.** Hiçbir UI kodu içermez, hook import etmez.

| Dosya | Sorumluluk | Satır |
|-------|-----------|-------|
| `types.ts` | Tüm TypeScript arayüzleri | ~160 |
| `game_data.ts` | Sabit veriler: 14 grup, 14 politika, 22 bakan, 21 event, 8 ikilem, 3 sızıntı | ~960 |
| `policy_manager.ts` | Politika değerleri, non-linear curve, cross-effects, siyasi sermaye | ~430 |
| `economy_manager.ts` | Bütçe, borç, döviz, enflasyon, GDP, success crises | ~260 |
| `voter_simulation.ts` | Grup onayı, sadakat, sinizm, politika şoku, kutuplaşma | ~490 |
| `cabinet_manager.ts` | Bakan atama, sadakat, gizli gündem, skandal | ~150 |
| `systems.ts` | Koalisyon, kariyer, dönem hedefi, kriz, event, ikilem, sızıntı, trend, terör | ~420 |

### 2. State Management (`src/store/`)

| Dosya | Açıklama |
|-------|----------|
| `gameStore.ts` | Zustand store — tüm oyun state'i, tur akışı, sistem bağlantıları |

**Store pattern:**
```typescript
const pm = useGameStore(s => s.pm);        // engine instance'larına direkt erişim
const turn = useGameStore(s => s.turn);    // UI state
const setPolicy = useGameStore(s => s.setPolicy); // action'lar
```

### 3. UI Layer (`src/App.tsx` + gelecek `src/components/`)

- **PartyPick** — başlangıç ekranı (3 preset seçimi)
- **GameScreen** — ana oyun layout'u
  - **TopBar** — istatistik barı, siyasi sermaye, geri bildirim
  - **LeftPanel** — 6 politika kolu slider'ları
  - **CenterPanel** — bubble chart (Recharts) + event log
  - **RightPanel** — kabine atama/azletme + seçmen grupları (tıklanabilir slot)
  - **BottomBar** — "Sonraki Tur" butonu
  - **PopupOverlay** — sızıntı, ikilem, seçim sonucu, game over

## Veri Akışı

```
Kullanıcı slider'ı hareket ettirir
  → setPolicy(key, value) [action]
    → pm.setPolicy() [engine: recalc tüm stat'ları]
    → vs.applyPolicyShock() [engine: grup mood değişimi]
    → recalcAll() [store: vs.recalculate + pm.refreshCapital]
      → UI re-render (Zustand selector'ları tetiklenir)

Kullanıcı "Sonraki Tur" basar
  → nextTurn() [action]
    → 16 adımlı tur akışı (bkz. SYSTEMS.md)
    → turn +1, UI güncellenir
```

## Non-Linear Curve Sistemi

Democracy 4'teki x^0.76 mantığı:
- Her politikanın `POLICY_CURVE_POWER` değeri var (0.68-0.88)
- `effective = pow(level/100, curvePower)` ile efektif seviye hesaplanır
- İlk puanlar daha etkili, sonra azalan getiri

## Parti Sadakati (Dynamic Floor)

- Her grubun `PARTY_LOYALTY` değeri var (0.15-0.65)
- Sadakat kilidi: onay 25 - loyalty*25 altına düşemez
- Ama onay < 15% ise kilit KIRILIR — grup tamamen muhalefete geçer
- Kırılan kilit bir daha geri gelmez (o dönem için)

## Siyasi Sermaye (Political Capital)

- Her tur yenilenir: `political_capital += 18` (max: 60 + approval*0.4 + campaigning*10)
- Her politika değişikliğinin bir maliyeti var (6-18 SP)
- Sermaye bitince politika değiştirilemez
- "Halka rağmen reform" mekaniğini simüle eder
