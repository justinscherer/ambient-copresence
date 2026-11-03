# Reader presence model

How many people are on one of the top 10 English Wikipedia pages (mobile web) right now,
and when they come and go. This is the data layer only; there's no UI yet.

## Files

| File                       | What it is                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `traffic.json`             | Snapshot of October 2026 enwiki mobile-web (agent=user) data: the top 10 articles' daily views plus site-wide views for every UTC hour. Regenerate with `node scripts/fetch-copresence-traffic.mjs 2026 10`. |
| `presence-model.ts`        | Pure functions: arrival rate, dwell time, expected readers, date mapping.                                                                                                                                    |
| `usePresenceSimulation.ts` | Vue composable that plays the model out reader by reader.                                                                                                                                                    |

## The articles

These are the October top 10 after removing `Main_Page`, `Special:Search`,
`Wikipedia:Featured_pictures` (project page, flat ~570k/day, likely automated) and `.xxx`
(erratic, likely automated). The 13th and 14th ranked pages backfill the list: Christa Pike,
RJ Mitte, Jailer 2, Patrick Stewart, Katie Zacharia (created Oct 9, so 0 before then),
Elizabeth Holmes, Drishyam: The Conclusion, Lizzie Borden, Ansel Adams, Nidal Hasan.

## How a number is made

1. **Which day.** The viewer's UTC day-of-month maps to the same October day (Nov 3 → Oct 3).
   That day's real daily views set the total arrivals.
2. **When in the day.** Arrivals are spread over the UTC day by that day's real site-wide
   hourly curve (interpolated between hours). The daily total is preserved exactly.
3. **Per-article tilt.** _Curious Rhythms_ (Piccardi, Gerlach & West) finds that reader
   country is the strongest driver of an article's rhythm, then device and topic.
   - A reader's local rhythm is modelled as 24h + 12h harmonics, which explain 94% of
     mobile variance in the paper.
   - It was fit together with a four-region mix so the sum reproduces October's real UTC
     curve (RMSE 0.025, peak ~20:30 local, trough ~5:30 local, evening ≈ 1.6× midday).
   - Each article gets an assumed regional audience. Indian films are 80% South Asia; US
     news is ~75–80% Americas.
   - Each article also gets a topic tilt: film/TV/biography toward the evening;
     crime/military/society toward the night; business toward working hours.
   - The tilt is the article's curve divided by the site curve, so it only reshapes the day.
4. **How long they stay.** From the _Reading time_ report (TeBlunthuis et al.), time on page
   is log-normal with σ ≈ 1.66, fit from the all-wiki 5–95th percentiles of
   1.8 / 8 / 25 / 75 / 439 s.
   - The median is 25 s × (22/26 mobile vs desktop) at 10 kB, then ×1.2 for each doubling
     of page length. That gives medians of 30–42 s on these pages.
   - Visits are capped at 1 h, which puts mean stays at 113–153 s.
5. **Readers present** = arrival rate × mean stay (Little's law): `expectedReaders()`.
   The simulation draws Poisson arrivals and a random stay for each reader. On load it
   backfills the past hour, so a page opens mid-crowd.

## Sample outputs

| Moment            | Readers across all 10                 |
| ----------------- | ------------------------------------- |
| Oct 1, 20:00 UTC  | ~9,200, mostly Christa Pike at ~8,500 |
| Oct 3, 20:00 UTC  | ~2,500                                |
| Oct 31, 08:00 UTC | ~820                                  |

## For the UI

```ts
const {
  clock,
  count,
  dots,
  dotScale,
  joinedRecently,
  leftRecently,
  expectedNow,
  setTime,
  setSpeed,
  goLive,
} = usePresenceSimulation(articleRef)
```

- `count`: readers on the page now. It changes as people actually arrive and leave.
- `dots`: up to ~48 stable readers `{ id, hue }` to draw. Each one stands for `dotScale`
  readers. Ids enter and leave the array when that reader arrives or leaves, so a
  `<TransitionGroup>` shows the comings and goings.
- `joinedRecently` / `leftRecently`: arrivals and departures in the last 10 real seconds.
- `expectedNow`: the smooth model value, for charts and labels.
- `clock`: `{ live, dayIndex, utcHour, speed }`.
- `setTime(day, hour, speed?)` jumps to a time, `setSpeed(n)` sets a time-lapse speed,
  and `goLive()` follows the real clock again.
- `expectedReaders(article, dayIndex, utcHour)`: sample this to plot a day's curve.

## Assumptions that move the numbers most

- **Page-length effect on stay** raises mean stay from ~84 s to ~113–153 s, and the
  number of readers present rises by the same factor (~1.4–1.8×).
- **Mobile stays are probably biased low.** The report lost 57% of mobile measurements.
- **Regional mixes and topic tilts are judgment calls.** Public pageview data has no
  per-article geography.
- **Spikes step at UTC midnight.** Daily data can't say what hour the news broke.
