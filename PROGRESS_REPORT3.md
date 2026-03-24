# WikiEditTracker Progress Report v3

## Current Status: Unified Dashboard with Three-Pane Visualization

We've built a fully functional unified dashboard (WikiEditTracker 3.0) that renders correctly on page load with three simultaneous visualizations.

## What We Built

### prototype3.html - Unified Dashboard

A single-page application showing three visualizations simultaneously:

```
+------------------+------------------+
|                  |                  |
|   TREEMAP       |    SUNBURST      |
|   (with dots)    |   (radial)       |
|                  |                  |
+------------------+------------------+
|   SPARKLINES GRID                    |
+-------------------------------------+
|   EDIT LOG (live stream)             |
+-------------------------------------+
```

### Key Features

1. **Compact Treemap** (left column)
   - Culture/Geography take 60% height (more categories)
   - History & Society/STEM take 40% height (fewer categories)
   - Dots animate on topic activity, positioned below labels
   - Same category color coding

2. **Sunburst Radial Hierarchy** (center)
   - D3 partition layout showing hierarchical topic structure
   - Renders immediately on page load
   - Hover for tooltips
   - Updates in real-time with edit activity

3. **Sparklines Grid** (right column)
   - 64+ mini line charts for each topic
   - Shows activity over last ~1 minute
   - Color-coded by category
   - Updates every 2 seconds

4. **Edit Log** (bottom)
   - Live stream of recent Wikipedia edits
   - Shows article titles, timestamps, and topic badges

### View Modes

- **Dashboard** - All visualizations visible simultaneously (default)
- **Treemap** - Full-screen treemap with dots
- **Sunburst** - Full-screen sunburst hierarchy
- **Edit Log** - Full-screen edit stream
- **Sparks** - Full-screen sparklines grid

## Issues Resolved

### API Mode Detection (New Feature)
- **Problem**: Need to test if WikiEditTracker.toolforge.org can access LiftWing API directly
- **Solution**: Added automatic detection that tries direct API first, falls back to proxy if it fails
- **UI**: Shows "Direct" (green) or "Proxy" (orange) mode indicator in the header
- **Fallback**: If any direct API call fails during runtime, switches to proxy mode automatically

### Sunburst Rendering
- **Problem**: Sunburst didn't render on initial page load
- **Root Cause**: `updateSunburst()` used `.transition()` which only updated existing paths, not creating new ones
- **Solution**: Used D3's `.join()` pattern with proper enter/update/exit handlers
- **Additional**: Removed arc transitions that caused invalid SVG path errors

### Sunburst Arc Errors
- **Problem**: D3 arc generator produced invalid SVG paths when angles exceeded 2π
- **Solution**: Clamp end angles and filter arcs where `(d.x1 - d.x0) < 0.001` or `d.value === 0`

### Mini-Treemap Dot Plotting
- **Problem**: Dots only appeared in full treemap, not in dashboard mini-treemap
- **Root Cause**: `initFullTreemapUI()` overwrote `TOPIC_TO_CELL_ID` mappings
- **Solution**: Created separate `MINI_TOPIC_TO_CELL_ID` for mini cells

### Dot Positioning
- **Problem**: Dots appeared on top of topic labels
- **Solution**: Restructured topic chips with label at top, dot container below
- Added `.topic-chip-dots` container for dots to appear in

## Technical Notes

### Data Flow
1. Wikipedia EventStream → `processEdit()`
2. Filter by namespace 0 (articles) and confidence threshold
3. Categorize via `/predict` API
4. Update all visualizations:
   - Treemap dots (both full and mini)
   - Sunburst hierarchy
   - Sparkline arrays
   - Edit history log

### Key Files

| File | Description |
|------|-------------|
| `prototype.html` | Original treemap visualization |
| `prototype2.html` | Multi-view with switchable tabs |
| `prototype3.html` | Unified dashboard 3.0 (current) |
| `server.js` | CORS proxy for topic classification |

## Running

```bash
# Start proxy
npm start

# Serve locally (for EventStream compatibility)
npx serve .

# Open
http://localhost:3000/prototype3.html
```

## Next Steps Ideas

1. **Test deployed API mode** - Verify that WikiEditTracker.toolforge.org shows "Direct" mode (no proxy needed)
2. Add zoom/click-to-drill-down to sunburst
3. Persist view preference in localStorage
4. Add keyboard shortcuts for view switching
5. Export/copy functionality for data
6. Add filtering by category
7. Add time range selector
