# WikiEditTracker Lite - Product Requirements Document

## Overview
**Project Name:** WikiEditTracker Lite  
**Type:** Real-time Wikimedia EventStream monitoring dashboard  
**Core Functionality:** Lightweight, single-file dashboard for visualizing live editing activity across Wikimedia projects.

---

## Vision
To provide a fast, zero-dependency, and instantly accessible dashboard that offers both high-level insights (project volume) and granular analytical breakdowns (namespace, edit types, bot activity) of real-time Wikimedia contributions.

---

## Features

### 1. Multi-Mode Visualization
*   **Basic Mode:** Grid layout showing real-time event counters for each Wikimedia project and language edition (e.g., "English Wikipedia", "Wikimedia Commons").
*   **Sunburst Mode:** Radial hierarchy visualization (non-zoomable):
    *   **Inner Ring:** Project Type (Wikipedia, Wiktionary, etc.)
    *   **Outer Ring:** Language Edition (e.g., "en", "de") or specific project (e.g., "Commons", "Wikidata").
*   **Stats Mode:** Analytical donut charts displaying granular activity filtered by project:
    *   **Three Column Layout:** Separated into `Commons`, `Wikidata`, and `Wikipedia`.
    *   **Language Selector:** A dropdown menu allows users to filter the `Wikipedia` column by specific language editions (defaulting to English).
    *   **Visualizations per Column:**
        *   **Edit Type Distribution:** Edit, New, Categorize, Log (Available on all 3 columns).
        *   **Bot vs Human Activity:** Ratio of automated vs manual edits (Available on all 3 columns).
        *   **Namespace Breakdown:** Edit distribution by namespace (Article, Talk, User, etc.) (Available *only* on the Wikipedia column).

### 2. Real-Time Data Processing
*   Connects directly to the Wikimedia `recentchange` EventStream.
*   Dynamically processes incoming JSON payloads.
*   Calculates rolling statistics (Total events, active sources, events per minute).

---

## Technical Approach

### Architecture
*   **Single File:** All functionality contained in `prototype-lite.html`.
*   **Dependencies:** D3.js (via CDN) for visualizations; Vanilla JavaScript for logic.
*   **Performance:** Designed to be lightweight, avoiding external server-side proxies.

### Data Flow
1.  **Event Stream:** WebSocket connection to `stream.wikimedia.org`.
2.  **Processing:** Each incoming event is parsed, and metrics (namespace, type, minor/major flag, bot flag) are updated in-memory into specific nested structures mapped to `commonsStats`, `wikidataStats`, and `wikipediaStats[lang]`.
3.  **Visualization:**
    *   Counters update DOM elements in real-time.
    *   Sunburst/Stats views update their internal data structures and re-render on demand or dynamically via `requestAnimationFrame` style updates without destroying interactions.

---

## File Structure
*   `prototype-lite.html`: Main application file.
*   `PRDlite.md`: This document.
*   `PROGRESS_REPORTlite.md`: Current project status.
