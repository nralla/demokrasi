# Denge Değişiklik Günlüğü

Bu dosya oyun dengesiyle ilgili yapılan tüm parametre değişikliklerini kaydeder.

Format: `Tarih — Değişiklik — Sebep — Beklenen Etki`

---

## 2026-07-05 — İlk Port (Godot → TypeScript)

Tüm parametreler Godot versiyonundan birebir taşındı. Aşağıdaki değerler orijinal oyunun ayarlarıdır:

### Politika Ağırlıkları (Policy Weights)

| Grup | Hassas Olduğu Politikalar | Ağırlık |
|------|--------------------------|---------|
| Esnaf/KOBİ, Sanayici | income_tax, vat, interest | 5.0x |
| Emekli, Memur | welfare, healthcare | 3.5x |
| Çiftçi | agriculture | 6.0x |
| Kürt, Alevi | judiciary, police, media | 4.0x |
| Gen Z, Öğrenci | education, media, housing | 3.5x |
| Milliyetçi | military, police | 4.5x |

### Ekonomi Çarpanları

- Bütçe açığı → enflasyon: gap * 0.18
- Enflasyon → mutluluk: pain * 0.22
- Enflasyon → ekonomi: pain * 0.15
- Düşük güven → istikrar: gap * 0.25

### Seçim Parametreleri

- Baraj baz: 52%
- Baraj artış/dönem: +5%
- Peşpeşe kazanma bonusu: +2%
- Katılım baz: 48%
- Katılım aralığı: 28-88%

### Sadakat

| Grup | Sadakat | Kırılma Noktası |
|------|---------|----------------|
| Muhafazakar Köylü | 0.65 | En sadık |
| Gen Z Şehirli | 0.15 | En kaygan |
| Öğrenci | 0.15 | En kaygan |

---

## Değişiklik Şablonu

```markdown
## YYYY-MM-DD — Değişiklik Adı

**Değişen**: [dosya:satır] parametre: eski → yeni
**Sebep**: Neden değiştirildi?
**Beklenen Etki**: Oyunda ne değişecek?
**Test**: Nasıl test edildi? (manuel / unit test / simülasyon)
```
