# Kurulum ve Çalıştırma Rehberi

Bu rehber, projeyi **Linux** ve **Windows** üzerinde sıfırdan ayağa kaldırmak için gerekli tüm adımları içerir.

---

## İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Web Modu (Tarayıcı)](#1-web-modu-tarayıcı)
3. [Masaüstü Modu (Tauri)](#2-masaüstü-modu-tauri)
4. [Production Build](#3-production-build)
5. [VS Code Entegrasyonu](#4-vs-code-entegrasyonu)
6. [Platform Notları](#platform-notları)
7. [Sorun Giderme](#sorun-giderme)

---

## Ön Gereksinimler

| Araç | Minimum Sürüm | Ne İçin |
|------|--------------|---------|
| **Node.js** | ≥ 22 | JavaScript runtime |
| **npm** | ≥ 10 | Paket yöneticisi (Node ile gelir) |
| **Rust** | ≥ 1.96 | Sadece Tauri (masaüstü) modu için |
| **Cargo** | ≥ 1.96 | Rust paket yöneticisi (Rust ile gelir) |

### Linux — Araçları Kur

#### Arch / CachyOS / Manjaro

```bash
# Node.js + npm
sudo pacman -S nodejs npm

# Rust (zaten kuruluysa atla)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Kurulumdan sonra terminali yeniden başlat veya:
source ~/.cargo/env

# Tauri için sistem kütüphanesi (ZORUNLU)
sudo pacman -S webkit2gtk-4.1
```

#### Ubuntu / Debian

```bash
# Node.js 22 — NodeSource repodan
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Tauri için sistem kütüphaneleri (ZORUNLU)
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev \
  librsvg2-dev patchelf libgtk-3-dev libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev
```

#### Fedora

```bash
# Node.js 22
sudo dnf install nodejs npm

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Tauri için sistem kütüphaneleri (ZORUNLU)
sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel \
  librsvg2-devel patchelf gtk3-devel
```

### Windows — Araçları Kur

#### Node.js

1. https://nodejs.org adresinden **LTS (≥22)** sürümünü indir
2. Kurulum sihirbazını çalıştır (PATH'e ekle seçeneğini işaretle)
3. Kurulumu doğrula:

```powershell
node --version   # v22.x.x veya üstü
npm --version    # 10.x.x veya üstü
```

#### Rust (sadece Tauri masaüstü modu için)

1. https://rustup.rs adresinden `rustup-init.exe` indir
2. Çalıştır, varsayılan ayarlarla kur (Enter)
3. Kurulumu doğrula:

```powershell
rustc --version  # 1.96 veya üstü
cargo --version
```

#### Windows'ta Tauri Ek Gereksinimleri

Tauri'nin Windows'ta çalışması için **Microsoft Visual Studio C++ Build Tools** ve **WebView2** gerekir:

```powershell
# 1. WebView2 Bootstrapper'ı indir ve kur
#    https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# 2. Visual Studio Build Tools'u indir ve kur
#    https://visualstudio.microsoft.com/visual-cpp-build-tools/
#
#    Kurulumda şunu seçtiğinden emin ol:
#    ☑ "Desktop development with C++"
#      - Windows 10/11 SDK
#      - MSVC v143 build tools
```

> **Alternatif**: Sadece Web'de geliştireceksen (tarayıcıda), Rust ve Build Tools'a gerek YOK. Sadece Node.js yeterli.

---

## 1. Web Modu (Tarayıcı)

**En hızlı yol.** Sadece Node.js gerekir. Tauri/Rust GEREKMEZ.

```bash
# Proje dizinine git
cd demokrasi-web

# Bağımlılıkları kur (ilk seferde bir kere)
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda http://localhost:5173 açılır. Kod değiştikçe sayfa anında güncellenir (HMR — Hot Module Replacement).

```bash
# Diğer web komutları:
npm run build         # Production build → dist/
npm run preview       # Build edilmiş halini local'de önizle → http://localhost:4173
npm run lint          # Kod kalitesi kontrolü (oxlint)
npx tsc --noEmit      # TypeScript tip kontrolü
```

---

## 2. Masaüstü Modu (Tauri)

**Native masaüstü uygulaması.** Rust + sistem kütüphaneleri gerekir.

```bash
# Proje dizinine git
cd demokrasi-web

# Web bağımlılıklarını kur
npm install

# Tauri ile masaüstü uygulamasını başlat (hot reload)
npm run tauri dev
```

`npm run tauri dev` komutu şunları yapar:
1. Vite dev server'ı başlatır (http://localhost:5173)
2. Rust kodunu derler
3. Native pencere açar, WebView içinde uygulamayı gösterir
4. Kod değişikliklerinde otomatik yeniden yüklenir

### Tauri Debug

- **Rust log'ları**: Terminal çıktısında görünür
- **WebView DevTools**: Tauri penceresinde **sağ tık → Inspect**
- **Sadece Rust tarafını kontrol et**:
  ```bash
  cd src-tauri && cargo check
  ```

---

## 3. Production Build

### Web (statik site)

```bash
npm run build
# Çıktı: dist/ klasörü
# Bu klasörü herhangi bir web sunucusuna at: Nginx, Vercel, Netlify, vb.

# Local'de test et:
npm run preview   # http://localhost:4173
```

### Tauri (native uygulama)

```bash
npm run tauri build
```

**Linux çıktıları** (`src-tauri/target/release/bundle/`):

| Format | Dosya | Açıklama |
|--------|-------|----------|
| `.deb` | `demokrasi_0.1.0_amd64.deb` | Debian/Ubuntu kurulabilir paket |
| `.AppImage` | `demokrasi_0.1.0_amd64.AppImage` | Taşınabilir, tüm Linux'ta çalışır |
| `.rpm` | `demokrasi-0.1.0.x86_64.rpm` | Fedora/RHEL kurulabilir paket |

**Windows çıktıları** (`src-tauri/target/release/bundle/`):

| Format | Dosya | Açıklama |
|--------|-------|----------|
| `.msi` | `demokrasi_0.1.0_x64_en-US.msi` | Windows installer |
| `.exe` | `demokrasi_0.1.0_x64-setup.exe` | NSIS installer |
| `.exe` | `demokrasi.exe` | Taşınabilir (klasör içinde) |

---

## 4. VS Code Entegrasyonu

Önerilen eklentiler:

| Eklenti | Ne İşe Yarar |
|---------|-------------|
| **Tailwind CSS IntelliSense** | CSS sınıf önerileri, hover'da stil gösterimi |
| **rust-analyzer** | Rust kod tamamlama (sadece Tauri için) |
| **Tauri** | `tauri.conf.json` doğrulama |
| **Even Better TOML** | `Cargo.toml` renklendirme |
| **Pretty TypeScript Errors** | Daha okunabilir TS hataları |

`.vscode/settings.json` önerisi:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "[typescript][typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Platform Notları

### Linux

- **Wayland**: Tauri varsayılan olarak Wayland'da çalışır. Sorun çıkarsa:
  ```bash
  WEBKIT_DISABLE_COMPOSITING_MODE=1 npm run tauri dev
  ```
- **Arch/CachyOS**: `webkit2gtk-4.1` paketi zorunlu. Sistem güncelse sorunsuz çalışır.

### Windows

- **WebView2**: Windows 10 (build 1809+) ve Windows 11'de yerleşik gelir.
  Eksikse: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
- **Terminal**: PowerShell veya Windows Terminal önerilir. CMD de çalışır.
- **WSL2**: WSL2 içinde Linux gibi geliştirme yapabilirsin ama Tauri masaüstü penceresi için WSLg gerekir.

---

## Sorun Giderme

### `npm install` hataları

```bash
# Node sürümünü kontrol et
node --version   # ≥ 22 olmalı

# npm cache'i temizle
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### `npm run tauri dev` açılmıyor (Linux)

```bash
# webkit2gtk kurulu mu?
pkg-config --modversion webkit2gtk-4.1

# Kurulu değilse:
sudo pacman -S webkit2gtk-4.1        # Arch
sudo apt install libwebkit2gtk-4.1-dev  # Ubuntu/Debian
sudo dnf install webkit2gtk4.1-devel    # Fedora
```

### `npm run tauri dev` açılmıyor (Windows)

```powershell
# WebView2 kurulu mu? Denetim Masası > Programlar > "Microsoft Edge WebView2 Runtime"
# Yoksa: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# Build Tools kurulu mu?
where cl     # cl.exe (MSVC compiler) PATH'te olmalı

# Rust target doğru mu?
rustup target list --installed | findstr x86_64-pc-windows-msvc
```

### Port 5173 dolu

```bash
# Port'u kullanan process'i bul ve öldür
lsof -i :5173        # Linux/macOS
netstat -ano | findstr :5173   # Windows

# Alternatif: Farklı portta başlat
npx vite --port 3000
```

### TypeScript hataları

```bash
# Tip kontrolü
npx tsc --noEmit

# Eğer bağımlılık tipleriyle ilgili hata alıyorsan:
rm -rf node_modules package-lock.json
npm install
npx tsc --noEmit
```

### Rust build hataları

```bash
# Rust toolchain'i güncelle
rustup update

# Tüm cargo cache'ini temizle
cargo clean
cd src-tauri && cargo check
```

---

## Hızlı Başlangıç Özeti

### Web (her platform, 2 adım)

```bash
npm install
npm run dev        # → http://localhost:5173
```

### Masaüstü (Tauri)

**Linux:**
```bash
sudo pacman -S webkit2gtk-4.1   # Arch/CachyOS
# -- veya --
sudo apt install libwebkit2gtk-4.1-dev  # Ubuntu/Debian

npm install
npm run tauri dev
```

**Windows:**
```powershell
# 1. Node.js LTS kur: https://nodejs.org
# 2. Rust kur: https://rustup.rs
# 3. VS Build Tools + WebView2 kur (yukarıdaki bölüme bak)
npm install
npm run tauri dev
```

---

## Komut Referansı

| Komut | Ne Yapar | Gereksinim |
|-------|----------|------------|
| `npm install` | Bağımlılıkları kurar | Node.js |
| `npm run dev` | Web dev server başlatır | Node.js |
| `npm run build` | Production web build | Node.js |
| `npm run preview` | Build önizleme | Node.js |
| `npm run lint` | Kod kalitesi kontrolü | Node.js |
| `npm run tauri dev` | Masaüstü uygulaması (dev) | Node.js + Rust |
| `npm run tauri build` | Masaüstü uygulaması (prod) | Node.js + Rust |
| `npx tsc --noEmit` | TypeScript tip kontrolü | Node.js |
| `npx vite --port 3000` | Farklı portta başlat | Node.js |
