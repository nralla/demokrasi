# Türkiye Simülasyonu

**Democracy 4-inspired political simulation** — Türkiye'yi 4 dönem boyunca yönet, 14 seçmen grubunun onayını kazan, mecliste çoğunluğu koru.

## Hızlı Başlangıç

```bash
npm install
npm run dev        # http://localhost:5173
npm run tauri dev  # Masaüstü uygulaması
```

> **Detaylı kurulum rehberi (Linux + Windows):** [`docs/SETUP.md`](docs/SETUP.md)

## Sistem Gereksinimleri

- **Node.js** >= 22, **Rust** >= 1.96 (Tauri için)
- **Arch**: `sudo pacman -S webkit2gtk-4.1`
- **Ubuntu/Debian**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
- **Fedora**: `sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel patchelf`
- **Windows**: VS Build Tools + WebView2 (detaylar [`docs/SETUP.md`](docs/SETUP.md))

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| UI | React 19 + TypeScript (strict) |
| State | Zustand |
| Grafik | Recharts |
| Stil | Tailwind CSS 4 |
| Build | Vite 8 |
| Masaüstü | Tauri v2 |

## Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| [`docs/SETUP.md`](docs/SETUP.md) | **Kurulum rehberi** — Linux + Windows, adım adım |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Mimari, veri akışı, tasarım kararları |
| [`docs/SYSTEMS.md`](docs/SYSTEMS.md) | Tur akışı, ekonomi modeli, kriz sistemi |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Kod standartları, best practices |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Yol haritası, öncelikler, TODO'lar |
| [`docs/TAURI.md`](docs/TAURI.md) | Tauri kurulumu, build, save/load |
| [`docs/WORK_DIVISION.md`](docs/WORK_DIVISION.md) | İş bölümü, geliştirici profillerine göre paketler |

## Hızlı Tur

1. **Paket seç** (🌟 Halkçı / ⚖️ Dengeli / 🛡️ Güvenlikçi)
2. **6 kolu ayarla** — her kol altındaki politikalara etki eder
3. **Sonraki Tur** — event'ler gelir, ekonomi güncellenir, gruplar tepki verir
4. **8 tur sonra seçim** — barajı aş, mecliste çoğunluğu koru
5. **4 dönem** — ülkeyi şekillendir, miras bırak

## Lisans

MIT
