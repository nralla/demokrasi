# Geliştirme Rehberi

## Best Practices

### TypeScript

- **Strict mode** açık — tüm tipler explicit
- `interface` yerine `type` kullan (proje genelinde tutarlı)
- Engine dosyaları asla React import etmez
- `any` kullanma — bilinmeyen tip için `unknown`, sonra type guard ile daralt
- **İstisna**: Üçüncü parti kütüphane callback'lerinde (örn. Recharts `formatter`) tip uyumsuzluğu varsa `any` kabul edilebilir

### Engine (Simülasyon Motoru)

- **Pure functions tercih et** — engine sınıfları state tutar ama metodlar deterministic olmalı
- **Yeni bir policy etkisi eklerken**: `POLICY_STAT_EFFECTS` tablosuna ekle, cross-effects'i `_applyCrossEffects()` içinde tanımla
- **Yeni bir event eklerken**: `ALL_EVENTS` array'ine `EventDef` tipinde ekle
- **Rastgelelik sadece** `EventSystem`, `LeakSystem`, `TrendSystem` içinde — motorun geri kalanı deterministic
- **Tüm sayısal değerler `number`** — Godot'taki `int`/`float` ayrımı yok, her şey float

### UI (React)

- **Zustand selector** kullan: `const pm = useGameStore(s => s.pm)` — tüm store'u çekme
- **Bileşenler küçük olsun** — 200 satır üstüne çıkınca böl
- **Tailwind class'ları** sıralı: layout → sizing → colors → typography → misc
- **Recharts bileşenleri** responsive olmalı — `ResponsiveContainer` kullan

### State Yönetimi

```typescript
// ✅ DOĞRU: Selector ile minimum re-render
const turn = useGameStore(s => s.turn);

// ❌ YANLIŞ: Tüm store'u çekmek
const store = useGameStore();
```

### Yeni Sistem Ekleme

1. `src/engine/` altında yeni dosya oluştur
2. `src/engine/types.ts`'e gerekli tipleri ekle
3. `src/store/gameStore.ts`'te instance'ı oluştur
4. Tur akışında uygun adıma ekle (`nextTurn()` içinde)
5. UI bileşenini `src/components/` altında oluştur
6. `App.tsx`'te bileşeni yerleştir

## Commit Mesajları

```
feat: bakan atama UI'ı eklendi
fix: enflasyon cross-effect çift sayım düzeltildi
balance: çiftçi grubu ağırlığı 6.5 → 7.0
ui: bubble chart tooltip iyileştirildi
docs: CONTRIBUTING.md eklendi
refactor: economy_manager metod isimleri sadeleştirildi
```

## Test

```bash
npm run build   # En azından build hatası olmasın
npx tsc --noEmit # Tip kontrolü
```

Simülasyon motoru için test yazmak istersen:
- `src/engine/__tests__/` altında
- `vitest` ile (henüz kurulu değil, gerekiyorsa ekle)

## Kod Organizasyonu

```
src/
  engine/           ← Pure TS, React'tan bağımsız
    types.ts        ← Arayüzler
    game_data.ts    ← Sabit veriler
    *_manager.ts    ← Sistem sınıfları
    systems.ts      ← Küçük sistemler bir arada
  store/
    gameStore.ts    ← Zustand store (tek store)
  components/       ← React bileşenleri (şimdilik App.tsx'te inline)
    PolicyPanel.tsx
    VoterBubble.tsx
    CabinetPanel.tsx
    ...
  App.tsx           ← Root component
  main.tsx          ← Entry point
```

## Dosya Boyutu Sınırları

- Engine dosyası: max ~400 satır
- UI bileşeni: max ~200 satır
- Store: max ~300 satır (aksi halde slice'lara böl)
- Tip dosyası: max ~150 satır

Aşırı büyüyen dosyaları bölmek için önce `docs/REFACTOR.md`'e not düş.
