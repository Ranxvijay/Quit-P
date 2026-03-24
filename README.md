# FreedomPath — Quit Porn & Build Your Best Life

A full-featured React Native (Expo) wellness app to help people quit porn, master self-discipline, and build laser focus.

---

## Features

### 🔥 Home — Streak Tracker
- Animated streak ring that changes color as you progress
- Day counter with milestone recognition (7, 14, 21, 30, 60, 90, 180, 365 days)
- Daily check-in button
- Motivational quote of the day
- Benefit unlock timeline
- Compassionate relapse logging with notes

### 🛡️ Emergency SOS
- Rotating power affirmations (tap to cycle)
- **10-Minute Urge Surfer** timer — urges always pass in under 10 min
- 6 instant coping tools: Box Breathing, Cold Shower, Push-ups, Journal, Walk, Music
- 8 evidence-based urge activities with descriptions
- "Remember" science section

### ⏱️ Focus Timer
- Pomodoro-style deep work timer
- Work / Short Break / Long Break presets
- Custom duration selector (10–90 min)
- Session counter with daily stats
- Focus tips for deep work

### ✅ Habit Tracker
- 6 default recovery habits (Exercise, Cold Shower, Meditation, Reading, etc.)
- Per-habit streak tracking with badges
- Daily progress bar
- Mood-tracked journaling (1–5 scale + text)
- Identity affirmation card

### 📈 Progress & Analytics
- Streak stats (current, best, relapse count)
- Weekly habit completion bar chart
- Success rate calculation
- Full benefits timeline (12 milestones from Day 1 to Day 365)
- Science-backed explanation section

### 🛡️ Content Blocker
- **DNS Filtering** — 4 free DNS servers that block adult content on ALL apps & browsers (including private mode)
- Step-by-step setup guide for Android and iOS
- Android Private DNS one-liner setup
- iOS Screen Time integration with expert tips
- **Domain blocklist** — 50+ adult sites ready to copy as hosts file
- AdGuard DNS, OpenDNS FamilyShield, CleanBrowsing, NextDNS instructions

### 🌬️ Box Breathing (4-7-8)
- Animated breathing exercise modal
- 4 cycles × (4s inhale → 7s hold → 8s exhale)
- Proven to activate the parasympathetic nervous system and reduce urge intensity

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo | Cross-platform iOS & Android |
| Expo Router | File-based navigation |
| AsyncStorage | Local persistent data |
| expo-notifications | Push notifications & reminders |
| expo-haptics | Tactile feedback |
| react-native-svg | Animated streak ring |
| react-native-reanimated | Smooth animations |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start on iOS
npm run ios

# Start on Android
npm run android

# Start in browser (limited)
npm run web
```

---

## App Structure

```
app/
  _layout.tsx          ← Root layout, notification setup
  breathing.tsx        ← Box breathing modal
  (tabs)/
    _layout.tsx        ← Tab navigator (6 tabs)
    index.tsx          ← Home / Streak
    emergency.tsx      ← Emergency SOS
    focus.tsx          ← Focus Timer
    habits.tsx         ← Habit Tracker
    progress.tsx       ← Progress & Analytics
    blocker.tsx        ← Content Blocker

src/
  store/
    useStore.ts        ← Global state + AsyncStorage
  constants/
    theme.ts           ← Colors, spacing, radii
    quotes.ts          ← 25 motivational quotes
    benefits.ts        ← 12 science-backed benefit milestones
    coping.ts          ← Coping tools & emergency activities
    blocklist.ts       ← Domain blocklist + DNS servers + setup instructions
  components/
    StreakRing.tsx      ← Animated SVG ring
    Card.tsx           ← Base card component
    BenefitBadge.tsx   ← Benefit unlock cards
  utils/
    notifications.ts   ← Push notification scheduling
```

---

## Content Blocking — How It Works

The app provides **DNS-level blocking** which is the most effective approach available to a user-space mobile app:

1. **What it blocks**: DNS filtering intercepts domain resolution — when your phone tries to reach `pornhub.com`, the DNS server returns nothing, making the site unreachable in ANY app or browser, including private/incognito mode.

2. **Setup requirement**: Due to iOS and Android security restrictions, no app can automatically configure your system DNS. Users follow the one-time in-app setup guide (~2 minutes).

3. **Recommended**: Android users use **Private DNS** (`family-filter-dns.cleanbrowsing.org`) — one setting that applies to all networks. iOS users use **Screen Time** + DNS profile.

4. **Extra lock**: Have a trusted person set your Screen Time/parental control passcode to prevent disabling it during urges.

---

## License

MIT
