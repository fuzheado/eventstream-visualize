# WikiEditTracker 3.0 - Product Requirements Document

## Overview

**Project Name:** WikiEditTracker 3.0  
**Type:** Real-time data visualization dashboard  
**Core Functionality:** Live visualization of Wikipedia edit activity organized by topic classification  
**Target Users:** Data enthusiasts, researchers, and anyone curious about Wikipedia editing patterns  

---

## Vision

A unified dashboard that tells the story of Wikipedia editing in real-time through three complementary visualizations working in harmony. The dashboard should feel alive, with activity pulsing through the interface as edits stream in, giving users an intuitive sense of what topics are being actively edited at any moment.

---

## Design Language

### Aesthetic Direction
Dark, data-dense interface inspired by terminal dashboards and mission control centers. Information-rich but not overwhelming, with clear visual hierarchy and purposeful use of color to encode meaning.

### Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Deep charcoal | `#0d1117` |
| Card/Panel | Dark slate | `#161b22` |
| Border | Subtle gray | `#30363d` |
| Text Primary | Off-white | `#c9d1d9` |
| Text Dim | Muted gray | `#8b949e` |
| Culture | Pink | `#e91e63` |
| Geography | Teal | `#00bcd4` |
| History & Society | Amber | `#ff9800` |
| STEM | Purple | `#9c27b0` |

### Typography
- **Font:** System fonts (SF Pro, Segoe UI, Roboto)
- **Headers:** 0.75em, uppercase, letter-spacing 1px
- **Labels:** 0.5em, normal case
- **Body:** 0.65em

### Spatial System
- Grid-based layout with 2px gaps
- Panels have 10px internal padding
- Topic chips use flexbox with wrapping

### Motion Philosophy
- **Dot pulse:** 0.3s ease-out scale animation on appearance
- **Fade decay:** Dots fade out over 2 seconds before removal
- **No jarring transitions:** Changes are smooth and continuous

---

## Layout Structure

### Dashboard View (Default)

```
+------------------------------------------+
|  HEADER: Title, Stats, Controls          |
+----------+-------------------+------------+
|          |                   |            |
| TREEMAP  |     SUNBURST      | SPARKLINES |
| (60/40)  |   (radial)       | (bars)     |
|          |                   |            |
+----------+-------------------+------------+
|  EDIT LOG: Live recent changes feed       |
+------------------------------------------+
```

### Panel Specifications

#### Treemap Panel (Left)
- **Size:** 60% height for Culture/Geography, 40% for History/STEM
- **Contains:** Topic chips with labels and dot containers
- **Dots:** Appear below labels in dedicated area

#### Sunburst Panel (Center)
- **Type:** D3 partition radial hierarchy
- **Rings:** 4 category rings with sub-category segments
- **Interactivity:** Hover tooltips

#### Sparklines Panel (Right)
- **Type:** Horizontal bar charts
- **Shows:** Topic counts updated every 2 seconds
- **Order:** By category grouping

#### Edit Log (Bottom)
- **Type:** Scrolling feed
- **Entries:** Last 30 edits with timestamp, article, topics
- **Auto-scroll:** Newest at top

---

## Features & Interactions

### Core Features

1. **Live Event Stream**
   - Connects to Wikipedia EventStream via Server-Sent Events
   - Filters for namespace 0 (articles only)
   - Deduplicates based on edit ID

2. **Topic Classification**
   - Sends article titles to LiftWing API via local proxy
   - Classifies into 64 topic categories
   - Filters by confidence threshold (adjustable 0.1-0.5)

3. **Treemap Visualization**
   - Shows all 64 topics in compact grid
   - Dots animate in when edits are classified
   - Dots fade out based on decay timer (adjustable 1-10s)
   - Category colors indicate topic type

4. **Sunburst Visualization**
   - Radial hierarchy showing category → subcategory → topic
   - Arc sizes proportional to edit activity
   - Updates in real-time
   - Hover shows topic details

5. **Sparkline Counts**
   - Running tally of edits per topic
   - Color-coded by category
   - Updates every 2 seconds

6. **Edit Log**
   - Timestamped list of recent edits
   - Shows article title (linked to Wikipedia)
   - Shows top 2 detected topics

7. **API Mode Detection**
   - On page load, attempts direct access to LiftWing API
   - Falls back to local proxy if direct access fails
   - UI indicator shows "Direct" (green) or "Proxy" (orange)

### View Modes

| Mode | Description |
|------|-------------|
| Dashboard | All panels visible, optimized layout |
| Treemap | Full-screen treemap with detailed cells |
| Sunburst | Full-screen sunburst with zoom |
| Sparks | Full-screen sparklines grid |
| Edit Log | Full-screen scrolling log |

### Controls

- **Confidence Slider:** Adjust classification threshold (0.10 - 0.50)
- **Decay Slider:** Dot fade-out time (1s - 10s)
- **View Buttons:** Switch between dashboard modes

### Edge Cases

- **API Timeout:** Show cached classification if available, otherwise skip edit
- **Stream Disconnect:** Auto-reconnect, mark stale data visually
- **No Activity:** Show empty state with "Waiting for edits..." message
- **Rate Spike:** Throttle UI updates to maintain performance

---

## Component Inventory

### Topic Chip
- **Default:** Dark background, label centered, dot container empty
- **Active:** Contains animated dots in lower area
- **Hover:** Subtle brightness increase (not implemented, optional)

### Dot
- **Appearance:** Colored circle based on category
- **Size:** 3-9px based on confidence
- **Opacity:** 0.3-1.0 based on confidence
- **Animation:** Pulse scale on appear, fade on decay

### Sunburst Arc
- **Default:** Category color, 0.85 opacity
- **Hover:** 1.0 opacity, tooltip appears
- **Transition:** Instant update (no animation to avoid arc errors)

### Sparkline Bar
- **Default:** Category color, height proportional to count
- **Zero:** Empty/minimal height

### Edit Log Entry
- **Default:** Timestamp, article link, topic badges
- **New:** Slides in from top with subtle animation

---

## Technical Approach

### Architecture
- Single HTML file with embedded CSS and JavaScript
- D3.js for sunburst visualization
- Vanilla JS for all other functionality
- No build step required

### Data Flow
```
Wikipedia EventStream
        ↓
  processEdit()
        ↓
  ┌─────┴─────┐
  ↓           ↓
API Proxy   EventSource
  ↓           ↓
  ↓     ┌────┴────┐
  ↓     ↓         ↓
  ↓   Treemap   Sunburst
  ↓     ↓         ↓
  ↓   Sparklines Log
  ↓     ↓         ↓
  └─────┴─────────┘
        ↓
   All Visualizations Update
```

### External Dependencies
- D3.js v7 (CDN)
- Wikipedia EventStream API
- LiftWing Topic Classification API (via proxy)

### Local Proxy
- Node.js/Express server on port 3001
- Forwards requests to `api.wikimedia.org`
- Handles CORS preflight
- Only used as fallback when direct API access fails

### API Mode Detection
- On page load, attempts direct POST to LiftWing API endpoint
- Uses 3-second timeout to detect CORS/connectivity issues
- Automatic fallback to proxy if direct fails
- Mode indicator displayed in header UI

### Performance Considerations
- Sparkline updates throttled to 2-second intervals
- Sunburst uses efficient D3 join pattern
- DOM cleanup for expired dots
- Maximum 1000 processed edit IDs retained

---

## File Structure

```
eventstream-visualize/
├── prototype3.html      # Main dashboard (this version)
├── prototype2.html      # Previous multi-view version
├── prototype.html       # Original treemap version
├── server.js            # CORS proxy
├── package.json         # Node dependencies
├── README.md            # General documentation
├── PROGRESS_REPORT3.md  # Development progress
└── PRD3.md              # This document
```

---

## Success Metrics

### Must Have
- [x] Dashboard loads without console errors
- [x] Sunburst renders on initial page load
- [x] Treemap shows live dots
- [x] Sparklines update with counts
- [x] Edit log shows recent activity
- [x] Confidence threshold slider works
- [x] Decay slider controls dot fade time

### Should Have
- [x] Culture/Geography larger than History/STEM (60/40)
- [x] Dots appear below labels
- [x] Multiple view modes work correctly (Dashboard, Treemap, Sunburst, Sparks, Edit Log)
- [x] No SVG arc generation errors
- [x] Sparks view displays all 68 sparklines in tiled grid
- [x] Edit Log shows live updates with article links

### Could Have
- [ ] Click-to-drill-down in sunburst
- [ ] Keyboard shortcuts for view switching
- [ ] Persist settings in localStorage
- [ ] Export data functionality
- [ ] Time range filtering

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic treemap with dots |
| 2.0 | Later | Multi-view switchable tabs |
| 3.0 | Current | Unified dashboard, sunburst, sparklines |
