# WikiEditTracker Progress Report v3

## Current Status: Multi-View Unified Dashboard

We've created a unified dashboard that combines multiple visualization approaches into a single view.

## What We Built

### prototype3.html - Unified Dashboard

A single-page application showing all visualizations simultaneously:

```
+------------------+------------------+
|                  |   SUNBURST       |
|   TREEMAP       |   (radial)       |
|   (compact)      +------------------+
|                  |   STREAM GRAPH   |
+------------------+------------------+
|   SPARKLINES GRID                    |
+-------------------------------------+
```

### Key Features

1. **Compact Treemap** (left column)
   - 4 category blocks stacked vertically
   - Dots animate on topic activity
   - Same category color coding

2. **Sunburst Radial Hierarchy** (top right)
   - D3 partition layout showing hierarchical topic structure
   - Hover for tooltips
   - Updates in real-time with edit activity
   - *Known issue: D3 arc angle warnings in console (non-breaking)*

3. **Stream Graph** (middle right)
   - Stacked area chart showing topic proportions over rolling time
   - Time window selector (5m, 15m, 30m)
   - Updates every 5 seconds

4. **Sparklines Grid** (bottom)
   - 64+ mini line charts for each topic
   - Shows activity over last ~1 minute
   - Color-coded by category
   - Updates every 2 seconds

### View Modes

- **Dashboard** - All visualizations visible simultaneously
- **Single View** - Full-screen versions of each visualization (Treemap, Sunburst, Stream, Sparks)

## Technical Notes

### Issues Resolved
- Missing `stat-api` element causing errors
- SVG viewBox negative dimensions when container too small
- Stream graph height calculation fix
- Sunburst arc angle clamping for D3

### Known Issues
- Sunburst: D3 generates arc warnings when angles approach 2π (visual output is correct)
- Some API calls return 404/503 - LiftWing service availability

### Data Flow
1. Wikipedia EventStream → `processEdit()`
2. Filter by namespace 0 (articles) and confidence threshold
3. Categorize via `/predict` API
4. Update all visualizations:
   - Treemap dots
   - Sunburst hierarchy
   - Stream graph buckets
   - Sparkline arrays
   - Edit history log

## Files

| File | Description |
|------|-------------|
| `prototype.html` | Original treemap visualization |
| `prototype2.html` | Multi-view with switchable tabs |
| `prototype3.html` | Unified dashboard (current) |
| `server.js` | CORS proxy for topic classification |

## Running

```bash
# Start proxy
npm start

# Serve locally (for EventSource compatibility)
npx serve .

# Open
http://localhost:3000/prototype3.html
```

## Next Steps Ideas

1. Fix D3 arc warnings in sunburst
2. Add zoom/click-to-drill-down to sunburst
3. Persist view preference in localStorage
4. Add keyboard shortcuts for view switching
5. Export/copy functionality for data
