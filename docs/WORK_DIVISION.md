# İş Bölümü

## Geliştirici Profillerine Göre İş Paketleri

### 👤 Junior Frontend Dev (React öğreniyor)

**Paket 1: UI İyileştirmeleri** (tahmini: 1-2 gün)
- Mevcut inline CSS'leri Tailwind class'larına çevir
- Renk paletini tutarlı hale getir
- Mobil responsive test ve düzeltmeler
- Buton hover/focus state'leri
- Loading skeleton'lar ekle

**Paket 2: Statik Sayfalar** (tahmini: 1 gün)
- Credits/Hakkında sayfası
- Nasıl Oynanır rehberi (modal)
- Oyun sonu özet ekranı (legacy assessment)

### 👨‍💻 Mid Frontend Dev (React + TS deneyimli)

**Paket 3: Bakan Sistemi UI** (tahmini: 3-4 saat)
- `src/components/CabinetPanel.tsx` — bakan kartları
- `src/components/MinisterPicker.tsx` — aday seçim modal'ı
- Bakan detay tooltip (özel yetenek, gizli gündem)
- İstifa animasyonu

**Paket 4: Bölge Haritası** (tahmini: 3-4 saat)
- `src/components/RegionMap.tsx` — 7 bölgeli SVG harita
- Bölge tıklama → detay paneli
- Bölge renkleri (onay heatmap)
- Bölge hassasiyet göstergeleri

**Paket 5: Ekonomi Dashboard** (tahmini: 2-3 saat)
- `src/components/EconomyDashboard.tsx`
- Bütçe, borç, kur mini grafikleri (Recharts)
- Gösterge kartları (yeşil/kırmızı renk kodlu)
- Tarihsel veri tablosu

### 🧠 Senior Dev (Mimari + Backend)

**Paket 6: Component Extraction** (tahmini: 1-2 saat)
- `App.tsx`'teki inline bileşenleri `src/components/` altına taşı
- Her bileşen kendi dosyasında
- Props interface'lerini tanımla
- Gereksiz re-render'ları memo ile önle

**Paket 7: Save/Load Sistemi** (tahmini: 2-3 saat)
- `tauri-plugin-store` entegrasyonu
- Zustand persistence middleware
- Save/load UI (slot seçimi, kayıt listesi)
- Otomatik kayıt (her tur sonu)
- Save dosyası versiyonlama (breaking change koruması)

**Paket 8: Test Altyapısı** (tahmini: 3-4 saat)
- `vitest` kurulumu
- Engine unit test'leri (en az 10 test)
- UI smoke test'leri
- CI pipeline (GitHub Actions)

### 🎨 UI/UX Designer

**Paket 9: Görsel Tasarım** (tahmini: 1-2 gün)
- Renk paleti ve tipografi sistemi
- İkon seti seçimi (Lucide vs custom)
- Animasyon tasarımı (CSS transition)
- Accessibility audit (renk kontrastı, klavye navigasyonu)

### 🎮 Oyun Tasarımcısı / Denge Uzmanı

**Paket 10: İçerik ve Denge** (tahmini: 2-3 gün)
- Yeni event'ler yaz (oyun içi metinler)
- Yeni ikilemler tasarla (ilginç seçimler)
- Bakan adayı backstory'leri
- Ekonomi parametre kalibrasyonu
- Seçim barajı ve zorluk eğrisi testi

**Paket 11: Türkçe Metin Editörlüğü** (tahmini: 1 gün)
- Tüm oyun içi metinleri gözden geçir
- Tutarlı ton/yazım (sen dili vs siz dili)
- Gramer/imla kontrolü
- Grup isimlendirme standardizasyonu

## Eş Zamanlı Çalışma Planı

```
Hafta 1:
  Gün 1-2: Paket 6 (Component Extraction) ← ÖNCE BU!
  Gün 2-4: Paket 3 (Bakan UI) || Paket 4 (Harita) || Paket 5 (Ekonomi)
  Gün 4-5: Paket 7 (Save/Load) || Paket 9 (Tasarım)

Hafta 2:
  Gün 1-3: Paket 10 (İçerik) || Paket 1-2 (Junior işleri)
  Gün 3-5: Paket 8 (Test) || Paket 11 (Editörlük)
```

## Bağımlılık Zinciri

```
Component Extraction (6)
  ├─→ Bakan UI (3)
  ├─→ Harita (4)
  └─→ Ekonomi Dashboard (5)
       └─→ Save/Load (7)
            └─→ Test (8)

İçerik (10) → bağımsız, her an yapılabilir
Tasarım (9) → bağımsız, her an yapılabilir
```

## İletişim

- Yeni sistem eklemeden önce `docs/SYSTEMS.md`'i oku
- PR açmadan önce `npm run build` çalıştır
- Denge değişikliklerini `docs/BALANCE_LOG.md`'e kaydet
- Büyük refactor'ları önce issue/plan olarak dökümante et
