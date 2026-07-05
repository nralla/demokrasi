# Sistem Referansı

## Tur Akışı (18 Adım)

Her "Sonraki Tur" tıklamasında sırayla çalışır:

```
 1. Refresh political capital (onay + campaigning bonus)
 2. Decay persistent deltas (%15/turn)
 3. Cabinet loyalty update
 4. Lost generation check (eğitim/sağlık < 30 → 3+ tur → kalıcı debuff)
 5. Cynicism apply (mutlu gruplar sinikleşir)
 6. Polarization check + group rivalry
 7. Auto-anger accumulation (ihmal edilen gruplar öfkelenir)
 8. Leak check → sızıntı var mı?
 9. Random event pick & apply
10. Dilemma check (her 4. turda)
11. Social trends apply (1-2 hashtag)
12. Terror tick + escalation check
13. Economy tick (budget, debt, fx, inflation)
14. Success crisis check (işler çok iyi gidince)
15. Mood decay + full recalculate
16. Crisis warnings check (threshold krizleri)
17. Term goal check (dönem hedefi tamamlandı mı?)
18. Turn +1 → 8. turda seçim kontrolü
```

## Seçim Sistemi

- **Baraj**: 52% + 5%/dönem + 2%/peşpeşe kazanma
- **Vekil hesabı**: Etkin oy (onay × katılım) → orantısal temsil
- **Koalisyon**: Mecliste 301 çoğunluk için ortak gerekebilir
- **Katılım**: Baz 48%, strength_of_feeling +35%, activism +8%, loyalty +10%
- **Kararsız seçmen**: %38-62 onay aralığındaki gruplar

## Kriz Sistemi

### Threshold Crises (anlık, her tur kontrol)

| Kriz | Tetikleyici |
|------|------------|
| Enflasyon krizi | inflation > 75 |
| İşsizlik krizi | unemployment > 70 |
| İstikrar krizi | stability < 20 |
| Güven krizi | trust < 22 |
| Bütçe krizi | budget < 18 |
| Uluslararası kriz | intl < 20 |

### Success Crises (işler çok iyi gidince)

| Kriz | Tetikleyici |
|------|------------|
| Borç krizi | public_debt > 4000 && populism_debt > 30 |
| Hiperenflasyon | inflation > 68 |
| Sermaye kaçışı | usd_try > 48 |
| Beyin göçü | unemployment > 58 && education_q < 40 |
| Genel grev | inflation > 55 && overall_approval < 35 |

## Ekonomi Modeli

```
BÜTÇE:
  revenue = (income_tax * 4.2 + vat * 3.0) * 0.14
  spending = sum(welfare...environment) * 0.14
  budget_balance += revenue - spending

BORÇ:
  public_debt += max(0, -budget_balance * 0.4) + spending * 0.1

KUR:
  usd_try += (inflation - 48) * 0.16 - (interest - 50) * 0.06
  usd_try += max(0, -budget_balance) * 0.004
  usd_try += max(0, public_debt - 3500) * 0.005

GDP BÜYÜME:
  3.5 - max(0, infl-48)*0.12 - max(0,-budget)*0.015 + (infra-50)*0.04 + confidence*0.03

POPÜLİZM:
  (sosyal harcama > 55 && vergi < 42) → populism_debt += 5.5/tur
```

## Politika Şok Sistemi

Büyük değişiklikler (>3 puan) anlık grup tepkisi yaratır:

- **Vergi artışı**: Esnaf ve sanayici öfkelenir
- **Sosyal kesinti**: Emekliler isyan eder
- **Güvenlik artışı**: Milliyetçi sevinir, Kürt/genç rahatsız
- **Faiz artışı**: Emekli sevinir (enflasyon düşer), esnaf kızar (kredi pahalanır)
- **Tarım desteği**: Çiftçinin yüzü güler
- **Özgürlük kısıtlaması**: Gençler ve laikler öfkelenir

## Gruplar Arası Rekabet

- Kürt çok mutlu → Milliyetçi öfkelenir
- Gençler çok mutlu → Muhafazakar öfkelenir
- Sanayici çok mutlu → Emekli "zenginlere çalışıyorsun" der
- Milliyetçi çok mutlu → Azınlıklar dışlanmış hisseder
- Dindar çok mutlu → Seküler rahatsız olur
