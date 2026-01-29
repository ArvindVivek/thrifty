# Business Requirements Document

## THRIFTY - Resource Management Mini-Game

**Cloud9 x JetBrains Hackathon | Category 4: Event Mini-Game**

| Field   | Value                 |
| ------- | --------------------- |
| Version | 1.0                   |
| Date    | January 2026          |
| Author  | Arvind                |
| Status  | Draft for Development |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Game Overview](#2-game-overview)
3. [Theming & Branding](#3-theming--branding)
4. [Core Gameplay Mechanics](#4-core-gameplay-mechanics)
5. [Item System](#5-item-system)
6. [Power-Up System](#6-power-up-system)
7. [Scoring System](#7-scoring-system)
8. [Game Structure & Progression](#8-game-structure--progression)
9. [User Interface Requirements](#9-user-interface-requirements)
10. [Controls & Input](#10-controls--input)
11. [Audio & Visual Feedback](#11-audio--visual-feedback)
12. [Leaderboard System](#12-leaderboard-system)
13. [Technical Requirements](#13-technical-requirements)
14. [Acceptance Criteria](#14-acceptance-criteria)

---

## 1. Executive Summary

### 1.1 Purpose

THRIFTY is a fast-paced resource management mini-game designed for the Cloud9 x JetBrains hackathon event booth. Players catch falling items to equip a team while managing a limited budget, creating an accessible yet competitive experience perfect for quick play sessions.

### 1.2 One-Liner

> Move your catcher to grab falling items and gear up your squad, but don't go over budget!

### 1.3 Target Experience

- **Duration**: 2-3 minutes per complete game
- **Skill Level**: Instantly accessible, no gaming experience required
- **Replayability**: High, with randomized items and leaderboard competition
- **Event Suitability**: Perfect for booth play while waiting in line

### 1.4 Key Differentiators

- Simple one-hand controls (arrow keys or swipe)
- No prior VALORANT knowledge required
- Clear visual feedback and satisfying interactions
- Junie mascot adds personality and charm
- Competitive leaderboard drives replay value

---

## 2. Game Overview

### 2.1 Core Concept

Players control a "catcher" (styled as a Cloud9 jersey) that moves horizontally across the bottom of the screen. Items with different prices fall from above. Players must catch items to fill 5 equipment slots while staying under a budget limit. The challenge is deciding which items to catch and which to dodge.

### 2.2 Win Condition

Fill all 5 equipment slots before time runs out without exceeding the budget.

### 2.3 Fail Conditions

- **Budget Bust**: Total cost of caught items exceeds the budget limit
- **Time Out**: Timer reaches zero before all 5 slots are filled

### 2.4 Core Loop

```
1. Round starts with empty slots and set budget
2. Items fall from top of screen
3. Player moves catcher left/right to catch or dodge items
4. Caught items fill slots and deduct from budget
5. Round ends when all slots filled OR budget exceeded OR time runs out
6. Score calculated and displayed
7. Next round begins with harder parameters
8. After 5 rounds, final score shown and leaderboard updated
```

---

## 3. Theming & Branding

### 3.1 VALORANT Connection

The game draws inspiration from VALORANT's economy system without requiring any game knowledge:

| VALORANT Element     | THRIFTY Adaptation             |
| -------------------- | ------------------------------ |
| Buy phase            | Item catching mechanic         |
| Team credits         | Budget system                  |
| 5-player team        | 5 equipment slots              |
| "Thrifty" accolade   | Game name and efficiency bonus |
| Weapon/armor/utility | Item categories                |

The term "Thrifty" is an actual VALORANT in-game accolade awarded when a team wins a round while spending less credits than their opponents. This creates a subtle connection for VALORANT fans while remaining intuitive for newcomers.

### 3.2 Cloud9 Integration

**Visual Branding:**

- Primary color palette: C9 Blue (#0A74DA), White (#FFFFFF), Dark Navy (#1A365D)
- C9 logo displayed on title screen and UI elements
- Player catcher styled as a C9 jersey/shield
- 5 equipment slots shown as C9 player silhouettes with jersey numbers
- "C9 SQUAD" label above the slots
- Victory animations feature C9 branding

**Narrative Framing:**

- Player acts as the team's equipment manager
- Goal is to "gear up the Cloud9 squad" before the match
- Success messages reference team preparation

### 3.3 JetBrains / Junie Integration

Junie (the JetBrains cat mascot) serves as the player's sidekick and commentator:

**Junie's Role:**

- Appears in a fixed position on screen (bottom-left corner)
- Reacts to player actions in real-time
- Provides encouragement and humor
- Celebrates successes and sympathizes with failures

**Junie Reactions:**

| Trigger                 | Emoji | Text Example        |
| ----------------------- | ----- | ------------------- |
| Round start             | 🐱    | "Let's gear up!"    |
| Catch cheap item        | 😸    | "That's thrifty!"   |
| Catch expensive item    | 😰    | "Big spender..."    |
| Catch power-up          | 😺    | "Nice find!"        |
| 4 slots filled          | 😼    | "One more!"         |
| Budget warning (<20%)   | 😿    | "Watch the budget!" |
| Round complete          | 😻    | "Squad ready!"      |
| Perfect budget (0 left) | 🎉    | "PERFECT!"          |
| Budget bust             | 🙀    | "Over budget!"      |
| Time running low        | 😿    | "Hurry up!"         |
| Time out                | 😿    | "Too slow..."       |
| Hit negative power-up   | 😾    | "Ouch!"             |
| Game over (good score)  | 😻    | "Amazing work!"     |
| Game over (low score)   | 😿    | "Try again!"        |

**Junie Visibility:**

- Always visible but non-intrusive
- Reaction bubble appears briefly (1.5 seconds) then fades
- Adds personality without distracting from gameplay

---

## 4. Core Gameplay Mechanics

### 4.1 The Catcher

The catcher is the player-controlled element that collects falling items.

**Visual Design:**

- Styled as a Cloud9 jersey or shield shape
- Approximately 80-100 pixels wide
- Clearly visible against the game background
- Subtle glow or highlight effect for visibility

**Movement:**

- Moves horizontally along the bottom of the screen
- Smooth, responsive movement
- Speed: Approximately 400-500 pixels per second
- Cannot move off-screen (bounded by game area edges)

**Collection Zone:**

- Items are caught when they overlap with the catcher
- Hitbox is generous (slightly larger than visual) for accessibility
- Visual feedback on catch (brief flash or particle effect)

### 4.2 Falling Items

Items spawn at the top of the screen and fall downward.

**Spawn Behavior:**

- Items spawn at random horizontal positions
- Spawn rate varies by round (see Section 8)
- Multiple items can be on screen simultaneously (3-6 typical)
- Items spawn with slight horizontal offset to avoid perfect vertical stacking

**Fall Behavior:**

- Items fall at a constant speed (varies by round)
- No horizontal movement (straight down only)
- Items that reach the bottom without being caught disappear
- No penalty for missing items (strategic dodging is valid)

**Visual Design:**

- Each item displays its icon and cost clearly
- Items are large enough to read cost at a glance (minimum 60x60 pixels)
- Color-coded by category for quick recognition
- Subtle drop shadow for depth

### 4.3 Equipment Slots

Five slots at the bottom of the screen represent the team to be equipped.

**Visual Design:**

- Displayed as 5 C9 player silhouettes or jersey shapes
- Numbered P1 through P5
- Empty slots show dashed border
- Filled slots show the caught item's icon
- Subtle animation when slot is filled

**Fill Behavior:**

- Items automatically fill the leftmost empty slot
- No player choice in slot assignment (simplifies gameplay)
- Once filled, a slot cannot be changed
- All 5 must be filled to complete the round

### 4.4 Budget System

The budget is the core constraint that creates strategic decisions.

**Display:**

- Large, prominent budget display at top of screen
- Shows current remaining / starting budget (e.g., "2,400 / 4,000")
- Visual bar that depletes as budget is spent
- Color changes as budget decreases:
    - Green: >50% remaining
    - Yellow: 20-50% remaining
    - Red: <20% remaining

**Mechanics:**

- Each caught item deducts its cost from the budget
- Budget cannot go negative (catching an item that exceeds budget = instant bust)
- Leftover budget converts to bonus points

### 4.5 Timer

Time pressure adds urgency to each round.

**Display:**

- Countdown timer in top-right corner
- Large, readable numbers
- Color changes in final 5 seconds (red, pulsing)
- Optional: subtle ticking sound in final seconds

**Mechanics:**

- Timer starts when round begins
- Pauses during any transition screens
- Reaching zero with unfilled slots = round failure

---

## 5. Item System

### 5.1 Item Categories

Five distinct item categories provide variety and strategic choices:

| Category | Icon | Color            | Cost Range    | Drop Rate | Description              |
| -------- | ---- | ---------------- | ------------- | --------- | ------------------------ |
| Weapon   | 🔫   | Red (#FF6B6B)    | 500 - 1,500   | 30%       | Primary offensive gear   |
| Shield   | 🛡️   | Teal (#4ECDC4)   | 300 - 800     | 25%       | Defensive protection     |
| Utility  | ⚡   | Yellow (#FFE66D) | 200 - 600     | 25%       | Gadgets and tools        |
| Premium  | 💎   | Purple (#A855F7) | 1,000 - 1,800 | 15%       | High-value luxury items  |
| Bonus    | 🎁   | Green (#22C55E)  | 0 - 100       | 5%        | Free or very cheap items |

### 5.2 Item Properties

Each item has the following properties:

- **Icon**: Visual identifier (emoji or custom sprite)
- **Category**: One of the five types above
- **Cost**: Credits deducted from budget when caught (displayed on item)
- **Value**: Points contributed to score (hidden from player, roughly correlates with cost)

### 5.3 Item Generation

Items are randomly generated with the following logic:

```
1. Select category based on drop rate percentages
2. Generate cost within category's range (uniform random)
3. Calculate value as: cost × (0.8 to 1.2 random multiplier)
4. Assign random horizontal spawn position (10% to 90% of screen width)
```

This creates variation where sometimes cheap items are great deals (high value-to-cost ratio) and sometimes expensive items are overpriced.

### 5.4 Item Visual Display

Each falling item shows:

- Category icon (large, centered)
- Cost in credits (below icon, bold text)
- Background color matching category
- Rounded container with subtle border

Example item appearance:

```
┌─────────┐
│   🔫    │
│   850   │
└─────────┘
```

---

## 6. Power-Up System

### 6.1 Overview

Power-ups add excitement and unpredictability. They appear as special falling items that provide temporary effects or instant bonuses/penalties when caught.

### 6.2 Positive Power-Ups

| Power-Up         | Icon | Color  | Effect                                | Duration  | Drop Rate |
| ---------------- | ---- | ------ | ------------------------------------- | --------- | --------- |
| Slow Motion      | 🐢   | Blue   | Reduces item fall speed by 50%        | 5 seconds | 4%        |
| Budget Boost     | 💰   | Gold   | Adds +500 credits to budget           | Instant   | 3%        |
| Optimal Hint     | 👁️   | Cyan   | Highlights best value items on screen | 4 seconds | 3%        |
| Time Freeze      | ⏸️   | White  | Pauses countdown timer                | 3 seconds | 2%        |
| Score Multiplier | ⭐   | Orange | Next caught item worth 2x points      | 1 catch   | 3%        |

### 6.3 Negative Power-Ups (Obstacles)

To add challenge and risk/reward decisions, some falling items are negative:

| Obstacle     | Icon | Color    | Effect                                    | Drop Rate |
| ------------ | ---- | -------- | ----------------------------------------- | --------- |
| Budget Drain | 💸   | Dark Red | Removes 300 credits from budget           | 4%        |
| Speed Up     | 🔥   | Orange   | Increases fall speed by 50% for 4 seconds | 3%        |
| Slot Lock    | 🔒   | Gray     | Locks one random empty slot for 5 seconds | 2%        |
| Point Drain  | 💔   | Black    | Removes 200 points from round score       | 2%        |

### 6.4 Power-Up Visual Design

Power-ups are visually distinct from regular items:

- Pulsing glow effect
- Slightly larger than regular items
- Star/sparkle particle trail while falling
- Distinct border style (double border or animated border)

Negative power-ups have:

- Darker color scheme
- Warning indicators (spiky border, red tint)
- Subtle "danger" visual cue

### 6.5 Power-Up Balance

Power-ups are balanced to enhance gameplay without dominating it:

- **Total power-up drop rate**: ~26% (roughly 1 in 4 items)
- **Positive vs negative ratio**: 60% positive, 40% negative
- **Spawn timing**: Power-ups cannot spawn in first 3 seconds of a round
- **Stacking**: Effects of the same type do not stack (new effect replaces old)
- **Visual indicator**: Active effects shown in HUD with remaining duration

### 6.6 Strategic Considerations

Power-ups create interesting decisions:

- Do I catch that Budget Drain to fill a slot, or dodge and wait?
- Should I risk catching the Slow Motion when my budget is tight?
- Is the Optimal Hint worth catching if I'm doing well?

### 6.7 Other Power-Ups

Slow: All items falling are slowed down for a period of time
Spree: Bunch of items fall at once (double edged sword)
Speed: Increase speed of the bucket/slider for a period of time
Vision: See the price of all items before they appear in our FOV

---

## 7. Scoring System

### 7.1 Score Components

Each completed round calculates score from multiple components:

| Component        | Calculation                           | Purpose                     |
| ---------------- | ------------------------------------- | --------------------------- |
| Base Score       | 500 points (flat)                     | Reward for completing round |
| Item Value       | Sum of all caught items' value scores | Reward item quality         |
| Budget Bonus     | Remaining budget × 2                  | Reward efficiency           |
| Time Bonus       | Remaining seconds × 30                | Reward speed                |
| Combo Multiplier | See below                             | Reward special achievements |

### 7.2 Combo Multipliers

Multipliers are applied to the total score before final calculation:

| Combo            | Condition                            | Multiplier |
| ---------------- | ------------------------------------ | ---------- |
| Perfect Budget   | Exactly 0 credits remaining          | 2.0×       |
| Balanced Loadout | At least 3 different item categories | 1.2×       |
| Specialist       | 4 or more items of same category     | 1.5×       |
| Speed Demon      | Complete with 15+ seconds remaining  | 1.3×       |
| Thrifty          | Complete with 50%+ budget remaining  | 1.4×       |

Multiple combos can apply (multiplicative). For example:

- Balanced (1.2×) + Speed Demon (1.3×) = 1.56× total multiplier

### 7.3 Failed Round Scoring

- **Budget Bust**: 0 points for the round
- **Time Out**: Partial credit based on slots filled (100 points per filled slot)

### 7.4 Score Calculation Example

```
Round completed:
- 5 items caught with total value: 2,100
- Starting budget: 3,500
- Remaining budget: 450
- Time remaining: 8 seconds
- Combos: Balanced (3 categories)

Calculation:
Base Score:      500
Item Value:    2,100
Budget Bonus:    900 (450 × 2)
Time Bonus:      240 (8 × 30)
─────────────────────
Subtotal:      3,740

Combo: Balanced 1.2×

Final Round Score: 4,488
```

### 7.5 Final Score

Total game score is the sum of all 5 round scores.

---

## 8. Game Structure & Progression

### 8.1 Game Flow

```
┌─────────────────┐
│  TITLE SCREEN   │
│  - Start Game   │
│  - Leaderboard  │
└────────┬────────┘
         ↓
┌─────────────────┐
│  HOW TO PLAY    │
│  (5 seconds or  │
│   tap to skip)  │
└────────┬────────┘
         ↓
┌─────────────────┐
│    ROUND 1      │←──────────┐
│   (Gameplay)    │           │
└────────┬────────┘           │
         ↓                    │
┌─────────────────┐           │
│ ROUND COMPLETE  │           │
│  or ROUND FAIL  │           │
│ (Score display) │           │
└────────┬────────┘           │
         ↓                    │
    Round < 5? ───Yes─────────┘
         │
         No
         ↓
┌─────────────────┐
│   GAME OVER     │
│ - Final Score   │
│ - Enter Name    │
│ - Leaderboard   │
│ - Play Again    │
└─────────────────┘
```

### 8.2 Round Configuration

5 rounds with progressive difficulty:

| Round | Budget | Time | Fall Speed  | Spawn Rate | Power-Up Rate |
| ----- | ------ | ---- | ----------- | ---------- | ------------- |
| 1     | 4,500  | 30s  | Slow        | 1.2s       | 20%           |
| 2     | 4,000  | 28s  | Medium-Slow | 1.0s       | 22%           |
| 3     | 3,500  | 26s  | Medium      | 0.9s       | 24%           |
| 4     | 3,000  | 24s  | Medium-Fast | 0.8s       | 26%           |
| 5     | 2,500  | 22s  | Fast        | 0.7s       | 30%           |

**Total gameplay time**: Approximately 130-150 seconds of active play, plus transitions ≈ 2.5-3 minutes.

### 8.3 Difficulty Scaling

Difficulty increases through multiple vectors:

1. **Tighter Budget**: Less room for expensive mistakes
2. **Less Time**: More pressure to act quickly
3. **Faster Items**: Less reaction time per decision
4. **More Items**: More simultaneous choices on screen
5. **More Power-Ups**: More risk/reward decisions (higher negative rate in later rounds)

### 8.4 Round Transitions

Between rounds:

- Score breakdown displayed (2-3 seconds to read)
- Junie reaction shown
- "NEXT ROUND" button (or auto-advance after 3 seconds)
- Brief "Round X" title card (1 second)

---

## 9. User Interface Requirements

### 9.1 Screen Layout - Gameplay

```
┌─────────────────────────────────────────────────────────────┐
│  ROUND 3/5              BUDGET: 2,150 / 3,500      ⏱️ 18s  │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🔫            💎           ⚡                       │
│         800          1400         350                       │
│                                                             │
│                  🛡️           🐢                            │
│                  600         SLOW                           │
│                                                             │
│              💸              🔫                              │
│             -300            1100                            │
│                                                             │
│                     (falling items)                         │
│                                                             │
│─────────────────────────────────────────────────────────────│
│                                                             │
│                      ┌─────────┐                            │
│                      │   C9    │  ← Player catcher          │
│                      └─────────┘                            │
│                                                             │
│  ┌─────┬─────┬─────┬─────┬─────┐                           │
│  │ 🔫  │ 🛡️  │     │     │     │  ← Equipment slots        │
│  │ 800 │ 600 │ P3  │ P4  │ P5  │                           │
│  └─────┴─────┴─────┴─────┴─────┘                           │
│                                                             │
│  🐱 "Looking good!"              [🐢 Slow: 3s] ← Active FX  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 UI Elements

**Header Bar:**

- Round indicator (left): "ROUND X/5"
- Budget display (center): Current/Max with progress bar
- Timer (right): Countdown in seconds

**Game Area:**

- Full width falling zone
- Clear vertical space for items to fall
- Background should be subtle (not distracting)

**Catcher Zone:**

- Catcher moves in this horizontal band
- Clear visual separation from slots below

**Equipment Slots:**

- 5 slots in a row, clearly labeled
- Show caught items with their cost
- Empty slots show "P1", "P2", etc.

**Status Bar:**

- Junie reaction (left)
- Active power-up effects with duration (right)

### 9.3 Screen Layout - Title

```
┌─────────────────────────────────────────┐
│                                         │
│               🐱                        │
│                                         │
│           THRIFTY                       │
│      "Gear Up. Stay Sharp."             │
│                                         │
│         [ START GAME ]                  │
│                                         │
│         [ LEADERBOARD ]                 │
│                                         │
│                                         │
│        Cloud9 × JetBrains               │
│                                         │
└─────────────────────────────────────────┘
```

### 9.4 Screen Layout - Round Complete

```
┌─────────────────────────────────────────┐
│                                         │
│               😻                        │
│        Round 3 Complete!                │
│         "Squad ready!"                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Base Score:         +500        │   │
│  │ Item Value:       +2,100        │   │
│  │ Budget Bonus:       +900        │   │
│  │ Time Bonus:         +240        │   │
│  │ ─────────────────────────────── │   │
│  │ Combo: Balanced      ×1.2       │   │
│  │ ─────────────────────────────── │   │
│  │ ROUND TOTAL:       4,488        │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [ NEXT ROUND ]                  │
│                                         │
│      Total Score: 12,350                │
│                                         │
└─────────────────────────────────────────┘
```

### 9.5 Screen Layout - Game Over

```
┌─────────────────────────────────────────┐
│                                         │
│               🏆                        │
│           GAME OVER                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      FINAL SCORE                │   │
│  │        28,450                   │   │
│  │                                 │   │
│  │   Rank: A    Title: Budget Boss │   │
│  └─────────────────────────────────┘   │
│                                         │
│      Enter Name: [____________]         │
│            [ SUBMIT SCORE ]             │
│                                         │
│          [ PLAY AGAIN ]                 │
│                                         │
│  🐱 "Great job out there!"             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 10. Controls & Input

### 10.1 Primary Controls (Keyboard)

| Input         | Action                 |
| ------------- | ---------------------- |
| ← Left Arrow  | Move catcher left      |
| → Right Arrow | Move catcher right     |
| Enter / Space | Confirm on menus       |
| Escape        | Pause (if implemented) |

### 10.2 Alternative Controls (Touch/Mobile)

| Input           | Action                |
| --------------- | --------------------- |
| Swipe Left      | Move catcher left     |
| Swipe Right     | Move catcher right    |
| Tap             | Confirm on menus      |
| Hold Left Side  | Continuous move left  |
| Hold Right Side | Continuous move right |

### 10.3 Control Feel

- **Responsiveness**: Catcher should respond instantly to input (no acceleration delay)
- **Speed**: Fast enough to cross screen in ~1.5 seconds
- **Smoothness**: Movement should feel fluid, not jerky
- **Boundaries**: Catcher stops at screen edges (no wrapping)

### 10.4 Catching Mechanic

- Items are caught automatically when they overlap with the catcher
- No "catch" button required
- Player's only choice is positioning (catch or dodge)
- Generous hitbox for accessibility

### 10.5 Dodging Strategy

Since catching is automatic on overlap, dodging is achieved by:

- Moving away from falling items
- Positioning between item fall paths
- Timing movements to let unwanted items pass

This creates interesting gameplay where players must actively avoid bad items while pursuing good ones.

---

## 11. Audio & Visual Feedback

### 11.1 Sound Effects

| Event                      | Sound Description         |
| -------------------------- | ------------------------- |
| Item caught                | Soft "pop" or "ding"      |
| Slot filled                | Satisfying "click"        |
| Power-up caught (positive) | Magical chime             |
| Power-up caught (negative) | Warning buzz              |
| Budget warning             | Subtle alert tone         |
| Round complete             | Victory fanfare           |
| Round failed               | Deflating sound           |
| Timer low (5s)             | Ticking intensifies       |
| Game over                  | Final score reveal jingle |

### 11.2 Visual Feedback

| Event           | Visual Effect                     |
| --------------- | --------------------------------- |
| Item caught     | Brief flash, item flies to slot   |
| Slot filled     | Slot glows momentarily            |
| Budget deducted | Number animates down, bar shrinks |
| Power-up active | Pulsing icon in status bar        |
| Slow motion     | Screen has subtle blue tint       |
| Speed up        | Screen has subtle orange tint     |
| Budget bust     | Red flash, screen shake           |
| Round complete  | Confetti particles                |
| Combo achieved  | Combo name flies across screen    |

### 11.3 Junie Animations

- **Idle**: Subtle bobbing or blinking
- **Reaction**: Emoji change + speech bubble appears
- **Celebration**: Bouncing or jumping motion
- **Disappointment**: Drooping or sad pose

---

## 12. Leaderboard System

### 12.1 Data Stored

For each leaderboard entry:

- Player name (max 15 characters)
- Final score
- Timestamp
- (Optional) Highest single-round score
- (Optional) Best combo achieved

### 12.2 Leaderboard Display

```
🏆 THRIFTY LEADERBOARD 🏆

#1  ThriftMaster      38,420  ⭐
#2  C9Fan2024         35,100
#3  JunieLover        33,890
#4  BudgetBoss        31,200
#5  EcoWarrior        29,850
...
#42 You              24,350   ← (highlighted)

[ PLAY AGAIN ]  [ MAIN MENU ]
```

### 12.3 Name Entry

- Appears after game over if score qualifies (or always)
- Simple text input field
- Max 15 characters
- Filter inappropriate words (basic blocklist)
- "Submit" button to save

### 12.4 Persistence

- Leaderboard stored using browser localStorage or provided storage API
- Top 100 scores retained
- Persists across sessions
- Shared across all players at the event booth

### 12.5 Event Booth Considerations

- Large display mode for showing top 10 on external monitor
- Reset option for event staff (hidden/admin)
- Export option for event data collection

---

## 13. Technical Requirements

### 13.1 Platform

- **Primary**: Web browser (Chrome, Firefox, Safari, Edge)
- **Framework**: React with hooks
- **Styling**: TailwindCSS
- **No external dependencies** beyond React and Tailwind

### 13.2 Performance

- **Target frame rate**: 60 FPS
- **Load time**: < 3 seconds on typical connection
- **Memory usage**: < 100MB
- **No perceptible lag** on input response

### 13.3 Responsive Design

- **Minimum width**: 360px (mobile portrait)
- **Optimal width**: 400-600px
- **Maximum width**: 800px (scales beyond this)
- **Aspect ratio**: Works in portrait and landscape

### 13.4 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

### 13.5 Accessibility

- High contrast colors for visibility
- Large touch targets (minimum 44px)
- Screen reader support for menus (aria labels)
- No flashing effects that could trigger seizures
- Colorblind-friendly item differentiation (shapes + colors)

---

## 14. Acceptance Criteria

### 14.1 Minimum Viable Product (MVP)

The following must be complete for hackathon submission:

1. ✅ Title screen with Start Game button
2. ✅ Basic how-to-play instruction screen
3. ✅ Core gameplay loop functional (5 rounds)
4. ✅ Catcher movement with arrow keys
5. ✅ Items fall and can be caught
6. ✅ 5 item categories with varying costs
7. ✅ Budget system deducts correctly
8. ✅ Timer counts down
9. ✅ Win/lose conditions trigger correctly
10. ✅ Score calculation with basic components
11. ✅ Round transition screens
12. ✅ Game over screen with final score
13. ✅ Leaderboard display and name entry
14. ✅ Junie mascot with basic reactions
15. ✅ C9 branding visible throughout

### 14.2 Enhanced Features (If Time Permits)

1. ⬜ Full power-up system (positive and negative)
2. ⬜ Combo multiplier system
3. ⬜ Sound effects
4. ⬜ Visual effects (particles, animations)
5. ⬜ Touch/swipe controls for mobile
6. ⬜ Pause functionality
7. ⬜ Settings (sound toggle, controls)
8. ⬜ Advanced Junie animations

### 14.3 Demo Requirements

The hackathon demonstration must show:

- Complete game from title to game over
- At least one successful round completion
- At least one failed round (bust or timeout)
- Leaderboard score submission
- Responsive Junie reactions
- Clear C9 and JetBrains branding

### 14.4 Quality Standards

- No game-breaking bugs
- Consistent visual styling
- Readable text at all sizes
- Smooth animations (no stuttering)
- Intuitive without explanation

---

## Appendix A: Rank Titles

| Score Range     | Rank | Title          |
| --------------- | ---- | -------------- |
| 35,000+         | S    | Thrift Master  |
| 30,000 - 34,999 | A    | Budget Boss    |
| 25,000 - 29,999 | B    | Smart Shopper  |
| 20,000 - 24,999 | C    | Bargain Hunter |
| 15,000 - 19,999 | D    | Penny Pincher  |
| 0 - 14,999      | F    | Big Spender    |

---

## Appendix B: Item Value Calculation

```javascript
// Item value determines score contribution
// Creates variation where some items are "better deals" than others

function calculateItemValue(cost, category) {
    const baseMultiplier = {
        weapon: 1.0,
        shield: 1.1, // Shields slightly more valuable
        utility: 1.2, // Utility items good value
        premium: 0.9, // Premium items slightly overpriced
        bonus: 2.0, // Bonus items are great deals
    }

    const randomVariance = 0.8 + Math.random() * 0.4 // 0.8 to 1.2

    return Math.floor(cost * baseMultiplier[category] * randomVariance)
}
```

---

## Appendix C: Difficulty Tuning Guidelines

If playtesting reveals balance issues:

**If too easy:**

- Reduce starting budgets
- Increase item costs
- Speed up fall speed
- Reduce time limits
- Increase negative power-up rate

**If too hard:**

- Increase starting budgets
- Add more bonus/cheap items
- Slow down fall speed
- Extend time limits
- Increase positive power-up rate

**Target success rate:** 60-70% of rounds completed successfully for average players.

---

_— End of Document —_
