# Tauri Entegrasyonu

## Mimari

Tauri sadece **native shell** görevi görür:
- WebView ile React uygulamasını gösterir
- `tauri-plugin-store` ile `.json` save dosyası yazar/okur
- Pencere yönetimi (boyut, başlık, minimize)

**Tauri = thin wrapper. Tüm oyun mantığı WebView içinde.**

## Kurulum

### Arch Linux / CachyOS

```bash
# Sistem bağımlılıkları
sudo pacman -S webkit2gtk-4.1

# Rust (zaten kuruluysa atla)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Proje Bağımlılıkları

```bash
npm install
# Tauri CLI ve plugin'ler package.json'da tanımlı
```

## Geliştirme

```bash
# Sadece web (hızlı iterasyon)
npm run dev

# Tauri ile masaüstü (hot reload)
npm run tauri dev

# TypeScript kontrolü
npx tsc --noEmit

# Production build
npm run tauri build
```

## Dosya Yapısı

```
src-tauri/
  tauri.conf.json    ← Pencere boyutu, build ayarları
  Cargo.toml         ← Rust bağımlılıkları
  src/
    main.rs          ← Entry point (Tauri bootstrap)
    lib.rs           ← Plugin kayıtları
  capabilities/
    default.json     ← İzinler (store, window, vb.)
  icons/             ← Uygulama ikonları
```

## tauri.conf.json Önemli Ayarlar

```json
{
  "app": {
    "windows": [{
      "title": "Türkiye Simülasyonu",
      "width": 1440,
      "height": 900,
      "resizable": true
    }]
  },
  "build": {
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  }
}
```

## Save/Load (tauri-plugin-store)

```typescript
import { Store } from '@tauri-apps/plugin-store';

// Kaydet
const store = await Store.load('save.json');
await store.set('game_state', { turn, term, policies, /* ... */ });
await store.save();

// Yükle
const store = await Store.load('save.json');
const state = await store.get('game_state');
```

### Store Stratejisi

- **Auto-save**: Her tur sonunda otomatik kaydet
- **Slot sistemi**: `slot_1.json`, `slot_2.json`, `slot_3.json`
- **Metadata**: Her save'de `{ turn, term, timestamp, overall_approval }` metadata

## Build

### Linux

```bash
npm run tauri build
# Çıktı: src-tauri/target/release/bundle/
#   - .deb (Debian/Ubuntu)
#   - .AppImage (taşınabilir)
```

### Windows (cross-compile)

Linux'tan Windows build'i için:
```bash
rustup target add x86_64-pc-windows-msvc
# CI'da yapmak daha kolay
```

### macOS

macOS cihaz gerektirir veya CI kullan.

## İzinler (Capabilities)

`src-tauri/capabilities/default.json`:
```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "store:default"
  ]
}
```

## Debug

```bash
# Tauri debug modda
npm run tauri dev

# Rust console log'ları
# Terminal çıktısında görünür

# WebView devtools
# Tauri penceresinde sağ tık → Inspect
```
