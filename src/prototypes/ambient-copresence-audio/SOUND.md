# Reader presence, heard as a room

The audio version of [`ambient-copresence`](../ambient-copresence/MODEL.md). It uses the same
reader model (`presence-model.ts`, `usePresenceSimulation.ts`, `traffic.json`) and the same
tide and badge (`PresenceTide.vue`), imported from that folder. It adds sound.

## Files

| File              | What it is                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `room-sound.ts`   | Web Audio engine: bed, cues and reverb. Everything is synthesized; there are no audio files.    |
| `useRoomSound.ts` | Composable: feeds the simulation's `count` and `lastChange` to the engine and thins busy pages. |
| `tuning.ts`       | Every sound-design value, with its default and slider range. The engine reads these live.       |
| `TuningSheet.vue` | Bottom sheet with a slider per value, for tuning by ear.                                        |
| `index.vue`       | The page: the old shell plus the settings button and the sound toggle.                          |

## What you hear

- **Room tone:** two decorrelated loops of low-passed pink noise. Each drifts slowly around the
  stereo field, in opposite directions at different rates (~0.03 and ~0.05 Hz), barely moving
  on a quiet page (±0.2) and swinging fully left to right on a busy one (±1.0). Their cutoff
  and level wobble too (±105 Hz, ±29%), so the bed never settles. It stays dry (no reverb).
- **Someone arrives:** a short tick-like crunch at a random spot across 80% of the stereo
  field. It's a sparse scatter of tiny crackles (270 a second), band-passed around 3.9 kHz
  (Q 1.25), with a 6 ms attack and a 90 ms decay. Level 0.15.
- **Someone leaves:** a slow, soft swell of dull noise across 52% of the stereo field, with no
  flutter or rub. It's band-passed around 515 Hz (Q 0.8) and low-passed at 1.3× that. It has a
  778 ms attack and a 1.9 s decay. Level 0.09.
- **The resonator:** the room tone and every cue also feed a bank of narrow, ringing
  band-pass filters tuned to C dorian (C D E♭ F G A B♭) and their harmonics. It's 4% wet: a
  faint shimmer under everything. The more people are reading, the longer each ring lasts.
  See below.
- **The room:** every cue and all of the resonance runs through a stereo reverb. The room
  tone itself stays out of it. The reverb's size follows the crowd.

Each cue plays one of 8 pre-rendered textures. Filters and the envelope (linear attack,
exponential decay) are applied live. Every time a cue fires, its filter frequency, attack
and decay each drift by a random 0–7.4% up or down. They're clamped to ±24% of the baseline
above. Arrivals and departures drift separately. Level varies by up to −24%.

The master level is 0.81.

## How the crowd maps to sound

Room size is `log10(1 + readers) / log10(10,001)`, the same scale as the tide's dome, from
1 reader up to 10,000+.

| Room size          | 0 (1 reader) | 1 (10,000+) |
| ------------------ | ------------ | ----------- |
| Reverb tail (RT60) | 0.65 s       | 20 s        |
| Pre-delay          | 14 ms        | 190 ms      |
| Reverb return      | 0.22         | 2           |
| Tail tone          | 12,000 Hz    | 12,000 Hz   |
| Early reflections  | 2 in 8 ms    | 40 in 60 ms |
| Room tone level    | 0.085        | 0.24        |
| Room tone cutoff   | 555 Hz       | 945 Hz      |
| Room tone drift    | ±0.2 pan     | ±1.0 pan    |
| Resonator ring     | 0.05 s       | 1 s         |

A small, fairly dry room when few people are reading; a vast, bright, very wet hall (20 s
tail, reverb louder than the dry sound) when the page is packed. The room tone also gets
louder and brighter as the crowd grows.

A reverb's impulse response can't morph. Room size moves in 10 steps: each new step loads
into a second convolver, which crossfades in over 2.5 s. Swaps are at least 3 s apart.
Pre-delay, return and room tone glide continuously.

**Resonator.** The scale runs over four octaves from C1 (33 Hz) to B♭4. Each note brings its
first 8 harmonics at equal weight (roll-off 0). The fundamentals are equal-tempered and the
harmonics pure. Harmonics that land within 20 cents of a C dorian note are kept at full
weight. Ones that miss (E, B, F♯, C♯ and the flat 7th harmonics) come in at 0.21. Harmonics
within 15 cents of each other share one filter, which leaves 100 filters.

- Each filter's Q is set from the wanted ring time, `Q = ring × π × f ÷ ln 1000`.
- Each filter's level is scaled by √Q, so a longer ring is longer, not quieter. The bank's
  level is 1.41.
- The room tone and the cues share one bank. Its ringing, including the room tone's, goes
  out and into the reverb with the cues.
- Dry/wet is a straight crossfade: 4% means 96% dry plus 4% bank.
- **Cost:** 100 stereo filters take about 7% of one core on a recent Mac. Phones are several
  times slower. The slider maxima (6 octaves from C0, 16 harmonics) reach about 234 filters,
  around 18% on a Mac. Lower harmonics or octaves if a phone stutters.

**Cue thinning.** Arrivals and departures are tracked as smoothed rates (2 s time constant).
Every departure can play. When a rate is above 40 arrivals/s or 6 departures/s, each event
plays with probability `max ÷ rate`, so each cue stands for several readers. Cues land at random points inside each
200 ms tick, not on the tick grid. Quiet pages hear every arrival; Christa Pike at peak, or
any page in time-lapse, is a steady patter of crunches with the odd rustle. The readers
already present on load (the backfill) make no sound.

## Tuning by ear

The numbers above are the defaults in `tuning.ts`, last tuned by ear on Nov 3, 2026. The settings button, left of the sound
toggle, opens a bottom sheet with a slider for every value, grouped into Arrivals,
Departures, Variation, Resonator, Reverb, Room tone and Output. It also has a Room sound switch, since
the sheet covers the toggle.

- **Live values** (levels, rates, filters, envelopes, pre-delay, return, room tone, output)
  apply to the next cue or within ~50 ms.
- **Rendered values** re-render 250 ms after the slider stops: textures (crackle density,
  flutter, rub), the reverb response (tails, tone, reflections) and the resonator's pitches
  (lowest C, octaves, harmonics per note). The reverb crossfades
  to its new response.
- Values that differ from the default show in blue.
- **Copy changes** copies only the changed values as JSON, ready to paste back as new
  defaults. **Reset** returns everything to the defaults.
- Tuning is saved in this browser (`localStorage`) and survives reloads. Other browsers and
  devices hear the defaults. When new defaults are baked in, saved tuning from before is
  dropped.

## Starting

Browsers only start audio from a tap. The bottom-right toggle ("Room sound") starts it with a
1.5 s fade-in and stops it with a 0.4 s fade-out, then suspends audio. On iOS it asks for
playback audio, so sound plays with the silent switch on. Audio pauses while the tab is
hidden. Pages outside the top 10 show no toggle and play nothing.

Try: `/ambient-copresence-audio?title=Christa+Pike&day=1&hour=12&speed=1800` (busy, big room),
or `?title=Ansel+Adams&day=31&hour=8` (quiet, small room). `day`, `hour` and `speed` work
as in the visual prototype.
