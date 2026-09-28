# Credit points system: starting design (v0.1)

For: Campus Plastic Credits Portal (Bisleri-branded). Research checked 28 Sep 2026.
All numbers below are **starting values** and are editable in the admin Settings. Calibrate them in a 2-4 week pilot (section 6).

## 1. Principles

1. **Points are recognition, not cash.** Scrap value per bottle is well under one rupee, so points and certificates are the sustainable reward.
2. **Points arrive only after the bin is weighed and verified.** Students see entries as pending until then.
3. **Simple for students, auditable for the client.** Students count items; the admin's scale is the source of truth.
4. **One anchor:** 1 point is about 3 g of clean plastic (about 333 points per kg). Every rate follows from it.
5. **Rates are snapshotted per entry,** so later changes never alter points already promised.

## 2. Points per item

| Category | Points per item | Assumed weight | Grams per point |
|---|---|---|---|
| PET bottle up to 750 ml | 5 | 15 g | 3.0 |
| PET bottle 1 to 1.5 L | 8 | 25 g | 3.1 |
| PET bottle 2 L and above | 15 | 45 g | 3.0 |
| Other clean rigid plastic (HDPE/PP containers, jugs) | 10 | 30 g | 3.0 |

Formula: `points = round(items x points_per_item x scale_factor)`, where `scale_factor` is 1 unless the admin scales a batch down after weighing.

## 3. Certificate tiers

| Tier | Points | About how many small bottles | About how much plastic | Time at one bottle per campus day* |
|---|---|---|---|---|
| Bronze | 100 | 20 | 0.3 kg | about 4 weeks |
| Silver | 500 | 100 | 1.5 kg | about 5 months |
| Gold | 1,000 | 200 | 3 kg | about one academic year |
| Platinum | 2,500 | 500 | 7.5 kg | 2 years or more, or heavy contributors |

*Assumes roughly 200 campus days a year. Each certificate is issued once per student per tier, carries a unique ID and a public verify link, and states the verified item count and estimated kg.

## 4. Guardrails

| Control | Default | Why |
|---|---|---|
| Items per entry | 20 | Stops one-tap inflation |
| Items per student per day | 40 | Lets hostel drop-offs through, caps farming |
| Cooldown per bin | 30 seconds | Blocks rapid repeat submits |
| Weight tolerance | 25% under expected | Normal variation in bottle weight and crushing |
| Hard stop | under 50% of expected | "Approve all" disabled; admin must scale or review |
| Scaling | points x min(1, weighed / expected) | Fair when a whole batch is short |
| Over-weight (above 150%) | Note only, no penalty | Usually contamination, not fraud |
| GPS proximity | 150 m, flag only | QR codes can be photographed; GPS indoors is unreliable |
| Undo window | 5 minutes while pending | Fixes typos without editing records |

## 5. What the market research says

- **Scrap value is tiny.** PET bottle scrap trades around Rs 30-40 per kg on Recykal's live board; other 2026 listings show roughly Rs 22-35 per kg for clear PET. With bottles weighing about 15 g, one bottle is worth roughly Rs 0.40-0.60 as scrap. Cash rewards do not work; points and certificates do.
- **Bottle weight varies.** An older industry statement (Sidel, 2007) put an average 500 ml water bottle at 13-16 g, and lighter designs of about 10 g or less exist. Start at 15 g and let the pilot calibrate it.
- **Incentive precedents are small.** A 2016 Delhi NCR reverse-vending pilot paid Re 1 per bottle. Coca-Cola India's 2025 machines in Puri give app points per bottle, redeemable for discounts on its products. Nothing in this space pays more than about Re 1 per bottle.
- **Certificates are what colleges value.** Bisleri's Bottles for Change programme (launched 5 June 2018) works with colleges. Its campus agreement with St. Joseph's University, Bengaluru, provides certification for participating students and a certificate for the university that supports its NAAC accreditation.
- **Documentation matters to colleges.** NAAC Criterion 7 asks institutions to evidence waste management with agreements and geo-tagged photographs. That is why the portal exports a Campus Sustainability Report and keeps a geo-located bin list.

**If the client later adds redeemable rewards:** keep the notional value at or below about Rs 0.10 per point (so a small bottle's 5 points costs about Rs 0.50), so reward cost never exceeds the scrap value collected.

## 6. Calibration plan (pilot)

1. Start with 3 bins and weigh at every pickup. The portal shows actual grams per item after each batch.
2. After about 10 batches, set `avg_grams` for the dominant type (PET up to 750 ml) to the median actual value.
3. Re-derive `points_per_item = round(avg_grams / 3)`. To make the programme more or less generous overall, change `grams_per_point`, not individual rates.
4. Set the tolerance from real spread: if honest-looking batches land between 80% and 110% of expected, 25% is right; widen only with evidence.
5. Look at the 95th percentile of items per student per day and set the daily cap just above it.
6. Freeze rates for a semester and announce any change in advance.

## 7. To confirm with the client

1. Accepted plastic types and drop-off rules.
2. Whether points may ever be redeemable for rewards (changes the economics).
3. Tier names, thresholds and certificate wording and signatory.
4. Whether the college wants a leaderboard.
5. Whether the Bottles for Change name and any Bisleri programme wording may be used.

## 8. Sources

- Bisleri Bottles for Change (about): https://bfc.bisleri.com/about-BFC and https://bisleri.com/plastic-recycling
- St. Joseph's University agreement (certification, NAAC): https://packagingsouthasia.com/recycling/bisleri-bottles-for-change/
- Recykal live PET scrap price: https://infra.recykal.market/domestic
- Plastic scrap price ranges (2026 update): https://resale.todaypricerates.com/plastic-scrap-price
- Bottle weight (Sidel): https://www.dairyreporter.com/Article/2007/07/03/lightweight-pet-bottle-targets-water-market/
- Rs 1 per bottle RVM pilot (2016): https://www.energetica-india.net/news/--gem-enviro-management-to-set-up-100-reverse-vending-machines-in-delhi-ncr
- Coca-Cola India RVMs, Puri (2025): https://www.impactonnet.com/more-from-impact/coca-cola-installs-reverse-vending-machines-in-puri-to-boost-recycling-10408.html
- NAAC Criterion 7 manual: https://iqac.aksuniversity.ac.in/wp-content/uploads/2025/03/Criteria-7-Instititional-Value-and-Best-Practices_-100-Marks_-as-per-revised-NAAC-Manual_-21-12-2022.pdf
- Bisleri colour history (blue to aqua green, 2006): https://www.bisleri.com/what-makes-us-stand-apart.html
- Third-party palette listing (unofficial, replace with brand guide): https://brandpalettes.com/bisleri-colors/
- DPDP Rules timeline: https://webiis10.mondaq.com/india/privacy-protection/1715184/meity-notifies-dpdp-rules-enforcement-timelines-and-formation-of-the-board
- Antigravity rules and AGENTS.md: https://agentpedia.codes/blog/antigravity-agents-md-guide and https://medium.com/google-cloud/where-does-antigravity-look-for-rules-and-workflows-1fcdf070bac8

Scrap prices and bottle weights are snapshots that vary by city, quality and season. Confirm against the client's actual recycler rate and real pickups.
