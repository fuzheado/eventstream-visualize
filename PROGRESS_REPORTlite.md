# WikiEditTracker Lite - Progress Report

## Current Status
We have successfully implemented the WikiEditTracker Lite dashboard. It is a functional, single-page application that provides real-time insights into Wikimedia editing activity. We recently overhauled the **Stats** view to provide highly specific metrics broken out by project type (Commons, Wikidata, Wikipedia language).

## Implemented Features

### 1. Modes
- **Basic Mode:** Real-time counters for every language edition/Wikimedia project currently active in the stream. Color-coded by project type.
- **Sunburst Mode:** Dynamic radial hierarchy visualization showing project-to-language relationships. Updates dynamically as new events roll in. (Currently configured as non-zoomable for stability).
- **Stats Mode (Revised):** A three-column layout offering deep-dive analytics.
    - **Commons Column:** Edit Type distribution and Bot vs. Human tracking.
    - **Wikidata Column:** Edit Type distribution and Bot vs. Human tracking.
    - **Wikipedia Column:** Edit Type, Bot vs. Human, and Namespace breakdowns, filterable via a dropdown menu containing major language editions (defaults to English).

### 2. Data Processing & Bug Fixes
- Researched true EventStream payload schema to determine accurate categorization of events. 
    - The `type` field primarily outputs `edit`, `new`, `categorize`, and `log` rather than `move` or `delete`. 
    - Updated logic in `processEvent` to accurately parse these 4 major valid types into the Donut charts.
- Resolved Javascript errors related to uninitialized data objects and `ReferenceError` warnings.
- Secured DOM events by utilizing `DOMContentLoaded`.
- Ensured Donut Charts re-render perfectly with inline legends listing percentages and raw event numbers.

### 3. UI/UX
- Responsive grid layout for counters.
- Interactive donut charts with clean legend mapping.
- Clean header layout displaying Total Events, Active Sources, and Event rate (per min).

## Technical Notes
- **Performance:** In-memory tracking separates data objects distinctly by domain/project to avoid map-pollution and keep iteration times fast when updating charts.

## Next Steps
- Consider restoring zoomability to the sunburst chart utilizing a transition-based data update pattern (`d3.transition`) instead of tearing down the SVG on every event.
- Enhance layout robustness on mobile breakpoints (e.g., stacking the Stats columns vertically).
- Add functionality to detect newly created articles and surface them in a dedicated stream.
