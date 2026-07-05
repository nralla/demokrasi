# CLAUDE.md

Bu dosya, Claude Code'a (claude.ai/code) bu repoda çalışırken rehberlik eder.

## Proje Özeti

Türkiye Simülasyonu — Democracy 4'ten esinlenmiş politik simülasyon. Oyuncu Türkiye'yi 4 dönem boyunca yönetir (her biri 8 tur), 6 basitleştirilmiş kaldıraç ile politika ayarlarını yaparak 14 seçmen grubunun onayını kazanmaya çalışır.

**Teknoloji**: Tauri v2 + React 19 + TypeScript 6 (strict) + Zustand + Recharts + Tailwind CSS 4 + Vite 8.

## Komutlar

```bash
npm install              # Bağımlılıkları kur
npm run dev              # Web geliştirme sunucusu → http://localhost:5173
npm run tauri dev        # Masaüstü uygulaması (hot reload, @tauri-apps/cli üzerinden)
npm run build            # Tip kontrolü (tsc -b) + production web build → dist/
npm run tauri build      # Production masaüstü build (@tauri-apps/cli üzerinden)
npm run lint             # oxlint (sıfır yapılandırmalı linter)
npm run preview          # Production web build'i önizle
npx tsc --noEmit         # Sadece tip kontrolü (build etmeden)
```

**Not**: `tauri dev` ve `tauri build` package.json'da açıkça tanımlı değil — `@tauri-apps/cli` tarafından `cargo tauri`'ye devredilir.

Henüz test altyapısı kurulu değil (vitest Faz 5'te planlanıyor). Şu an `npm run build` (`tsc -b` içerir) tip güvenliği kapısı olarak yeterli.

## Mimari

**Üç katmanlı mimari:**

1. **Simülasyon Motoru** (`src/engine/`) — Pure TypeScript, sıfır React importu. Tüm oyun mantığı.
2. **State** (`src/store/gameStore.ts`) — Tek Zustand store, motoru UI'a bağlar. Motor instance'ları store oluşturulurken bir kere yaratılır ve doğrudan bileşenlere sunulur.
3. **UI** (`src/App.tsx` sadece; `src/components/` henüz yok) — Tüm React bileşenleri App.tsx içinde inline. Bileşenler Faz 5'te ayrılacak.

Detaylar için `docs/ARCHITECTURE.md` ve `docs/SYSTEMS.md`.

## TypeScript Kuralları

- **Strict mode** — `any` yasak (istisna: üçüncü parti kütüphane callback'lerinde tip uyuşmazlığı, örn. Recharts formatter)
- **`verbatimModuleSyntax`** açık → tip importları için `import type`, tip re-export için `export type` zorunlu
- **`erasableSyntaxOnly`** açık (TS 6) → `enum`, `namespace`, parameter properties yasak. Onun yerine `type` + const nesneleri kullan.
- `interface` yerine `type` (proje genelinde tutarlı)
- Motor dosyaları asla React veya Zustand import etmez
- Tek Zustand store — birden fazla store olmaz

## Temel Oyun Sistemleri

- **Non-linear eğri**: `pow(level/100, curvePower)` — ilk puanlar daha etkili (Democracy 4 x^0.76 mantığı). Her politikanın `POLICY_CURVE_POWER` değeri var (0.68–0.88).
- **Dinamik onay tabanı**: Parti sadakati bir taban sağlar, ham onay < %15 ise kırılır (o dönem için kalıcı).
- **Siyasi sermaye**: Her tur yenilenir (taban 18), politika değişimlerinde harcanır (maliyet: 6–18). "Halka rağmen reform" mekaniği.
- **Kalıcı deltalar**: Event/eko stat değişimleri politika yeniden hesaplamalarında korunur (%15/tur azalma).
- **Kabine bonusu**: Bakan skill × sadakat, `cabinet.getPolicyBonus(key)` ile politika etkilerine bonus enjekte eder.
- **18 adımlı tur akışı**: Siyasi sermaye yenileme → delta azalması → kabine sadakati → kayıp nesil kontrolü → sinizm → kutuplaşma/rekabet → otomatik öfke → sızıntı kontrolü → rastgele event → ikilem (her 4. turda) → sosyal trend → terör tick → ekonomi tick → başarı krizi → mood azalması/recalc → kriz uyarıları → dönem hedefi kontrolü → tur +1/seçim kontrolü.

## Store Deseni

Motor instance'ları store oluşturulurken yaratılır ve doğrudan sunulur:

```typescript
const pm = useGameStore(s => s.pm);        // Motor instance'ına doğrudan erişim
const turn = useGameStore(s => s.turn);    // UI state
const setPolicy = useGameStore(s => s.setPolicy); // Action
```

Her zaman selector kullan — store'un tamamını çekme. Store, motor callback'lerini (örn. `cabinet.onMinisterResigned`, `cabinet.onScandal`) oluşturulma anında bağlar.

## Tailwind CSS 4

`@tailwindcss/vite` eklentisi kullanılır (PostCSS değil). CSS giriş noktası `src/index.css` içinde `@import "tailwindcss"`. `tailwind.config.js` yok — yapılandırma CSS içinde yapılır.

## Dosya Boyutu Sınırları

(`docs/CONTRIBUTING.md` ile uyumlu; aşılırsa böl ve `docs/REFACTOR.md`'e not düş)

- Motor dosyası: max ~500 satır
- UI (App.tsx / bileşenler): max ~400 satır
- Store: max ~450 satır
- Tip dosyası: max ~160 satır

Şu an aşan: `gameStore.ts` (437) — Faz 5'te bölünecek.

## Commit Mesajları

```
feat: yeni özellik
fix: hata düzeltme
balance: sayısal ayar (ağırlık, eğri, maliyet)
ui: görsel/stil değişiklikleri
docs: dokümantasyon
refactor: davranış değiştirmeyen kod yeniden yapılandırma
```

## Godot → Web Dönüşüm Notları

Bu proje, `../demokrasi/` altındaki orijinal Godot 4.3 GDScript projesinin tamamen yeniden yazımıdır. Temel farklar:
- GDScript `Dictionary` → TypeScript `Record<string, T>`
- GDScript `Array[String]` → TypeScript `string[]`
- GDScript `signal` → TypeScript callback (`onXxx?: () => void`)
- GDScript `class_name` → TypeScript `export class`
- GDScript `const` dictionary → TypeScript `Record<string, X>` export
- Tüm sayısal değerler `number` (TypeScript'te `int`/`float` ayrımı yok)

## Dokümantasyon Dizini

| Dosya | İçerik |
|------|---------|
| `docs/SETUP.md` | Kurulum rehberi (Linux + Windows, adım adım) |
| `docs/ARCHITECTURE.md` | Mimari, veri akışı, tasarım kararları |
| `docs/SYSTEMS.md` | Tur akışı, ekonomi modeli, kriz sistemi |
| `docs/CONTRIBUTING.md` | Kod standartları, best practices, yeni sistem ekleme |
| `docs/ROADMAP.md` | Yol haritası, öncelikler, TODO'lar |
| `docs/TAURI.md` | Tauri kurulumu, build, save/load |
| `docs/WORK_DIVISION.md` | İş bölümü, geliştirici profillerine göre paketler |
| `docs/BALANCE_LOG.md` | Denge değişiklik kaydı |
