# Yol Haritası (Roadmap)

## 🚀 Faz 1: Minimum Oynanabilir (MVP) — Şu An

- [x] Simülasyon motoru port edildi
- [x] Temel UI (slider, bubble chart, log)
- [x] Tur akışı çalışıyor
- [x] Event, ikilem, sızıntı sistemleri
- [x] Webkit2gtk kurulumu (sistem bağımlılığı, `docs/SETUP.md`'de belgeli)
- [ ] Tauri dev build test → `npm run tauri dev`

## 🔧 Faz 2: Tamamlayıcı Özellikler

### Bakan Sistemi UI
- [x] Bakan atama paneli (boş bakanlığa tıklayınca aday listesi)
- [x] Bakan değiştirme / kovma butonları
- [x] Bakan detay kartı (skill, sadakat, özel yetenek, gizli gündem)
- [x] İstifa / skandal bildirimleri

### Bölge Haritası
- [ ] 7 bölgeli Türkiye haritası (SVG veya CSS)
- [ ] Bölgelere tıklayınca detaylı hassasiyet bilgisi
- [ ] Bölge renkleri (onay seviyesine göre yeşil/kırmızı)

### Ekonomi Paneli
- [ ] Detaylı ekonomi göstergeleri (bütçe, borç, kur grafiği)
- [ ] Tarihsel trend çizgileri (Recharts line chart)
- [ ] Bütçe önizleme (slider değişimlerinde)

### Save / Load
- [ ] `tauri-plugin-store` ile otomatik kayıt
- [ ] Manuel save/load butonları
- [ ] Birden fazla save slot'u
- [ ] Oyun başında "Devam Et" seçeneği

## 🎨 Faz 3: Arayüz İyileştirmeleri

- [ ] Karanlık/Aydınlık tema
- [ ] Geçiş animasyonları (CSS transition)
- [ ] Ses efektleri (opsiyonel)
- [ ] Mobil responsive tasarım
- [ ] Klavye kısayolları (1-2-3 tuşlarıyla tur, Space ile ilerle)

## ⚖️ Faz 4: Denge ve İçerik

### Denge Ayarları
- [ ] Ekonomi parametreleri ince ayar
- [ ] Seçmen grubu ağırlıkları kalibrasyon
- [ ] Politika eğrileri (curve power) testi
- [ ] Enflasyon-enflasyon sarmalı testi

### Yeni İçerik
- [ ] 10+ yeni event
- [ ] 5+ yeni ikilem
- [ ] 5+ yeni bakan adayı
- [ ] 3+ yeni sosyal trend
- [ ] Özel seçim event'leri
- [ ] Uluslararası kriz event'leri (AB, NATO, komşular)

## 🏗️ Faz 5: Teknik Borç

- [ ] Engine dosyalarını `systems.ts`'ten ayır (her sistem kendi dosyasında)
- [ ] UI bileşenlerini `App.tsx`'ten ayır (`src/components/`)
- [ ] Test altyapısı kur (`vitest`)
- [ ] Engine unit test'leri
- [ ] CI/CD (GitHub Actions)
- [ ] Performans optimizasyonu (memo, useCallback, selector tuning)

## 📦 Faz 6: Deployment

- [ ] Tauri production build (`.deb`, `.AppImage`)
- [ ] Windows build (cross-compilation veya CI)
- [ ] macOS build
- [ ] Web deployment (Vercel/Netlify)
- [ ] Auto-updater (Tauri updater plugin)

---

## Önceliklendirme

| Öncelik | İş | Tahmini Süre |
|---------|-----|-------------|
| ✅ Done | Bakan atama UI | ✓ |
| 🔴 P0 | Save/Load | 2-3 saat |
| 🟡 P1 | Bölge haritası | 3-4 saat |
| 🟡 P1 | Ekonomi paneli | 2-3 saat |
| 🟡 P1 | Bileşenleri ayırma (refactor) | 1-2 saat |
| 🟢 P2 | Yeni event/ikilem | 2-3 saat |
| 🟢 P2 | Ses/animasyon | 2-4 saat |
| ⚪ P3 | Test yazma | 3-4 saat |
| ⚪ P3 | CI/CD | 1-2 saat |
