# Product Requirements Document (PRD)
## Wikipedia Live Edit Visualization (WikiEditTracker)

### 1. Overview
Create a real-time visualization web app that monitors live Wikipedia edits and displays them according to article topics using the LiftWing language-agnostic link-based article topic model.

### 2. Goals
- Provide a high-density activity monitor showing where edits are happening across 64 Wikipedia topics.
- Visualize each edit as a pulsing dot in a hierarchical treemap layout.
- Allow users to explore editing patterns by topic in real time with precise filtering and decay controls.

### 3. System Architecture (Current Implementation)

#### 3.1 Proxy-Based Architecture
To bypass CORS restrictions on the LiftWing API while maintaining a simple deployment, we use a Node.js CORS proxy:

```
+-------------------+      +----------------------+      +---------------------+
| EventStreams (SSE)| ---> |  Browser Client      | <--> | CORS Proxy (Node)   |
| (recentchange)    |      | (Vanilla JS + HTML)  |      | (Express + HPM)     |
+-------------------+      +----------------------+      +---------------------+
                                     |                          |
                                     v                          v
                           +------------------+        +--------------------------+
                           | Topic Cache (Map)|        | LiftWing API             |
                           | (in-memory TTL)  |        | (outlink-topic-model)    |
                           +------------------+        +--------------------------+
                                     |
                             Visualization Layer
                             (High-Density Treemap)
```

### 4. Data Pipeline

| Step | Component | Input | Output | Notes |
|------|-----------|-------|--------|-------|
| 1 | EventStreams Client | SSE endpoint `https://stream.wikimedia.org/v2/stream/recentchange` | Raw JSON change events | Discard canary events (`meta.domain === 'canary'`). |
| 2 | Browser Filter | Raw change events | Filtered Events | Keep only English Wikipedia (`server_name === 'en.wikipedia.org'`) and Article Namespace (`namespace === 0`). |
| 3 | CORS Proxy | `page_title` | `prediction.results` | Handles CORS preflight (OPTIONS) and forwards to LiftWing API. |
| 4 | Topic Mapper | Granular Topic (e.g. `STEM.Physics`) | Treemap Cell ID | Maps 64 sub-topics to cells; handles hierarchical fallbacks and "General" catch-alls. |
| 5 | Browser Visualizer | Enriched event | Visual update | Renders edit in the corresponding treemap cell with weighted packing. |

### 5. Frontend Visualization
- **Layout**: High-density treemap with weighted topic boxes and perfectly interlocking geometry.
- **Edit Indicator**: Scalable pulsing dots; size and opacity determined by model confidence score.
- **Taxonomy Support**: Full 64-topic hierarchy with nested regional and subject-matter groups.
- **Controls**: 
  - **Min Confidence**: Slider to filter out low-score classifications (0.0 to 1.0).
  - **Decay (sec)**: Slider to adjust dot lifetime (1 to 20 seconds).
  - **Stats**: Real-time counters for Total Events, Namespace 0 edits, API calls, and Cache Hit %.

### 6. Technical Specifications

#### 6.1 CORS Proxy (`proxy.js`)
- **Technology**: Node.js, Express, `http-proxy-middleware`.
- **Features**: 
  - Explicit CORS header injection (`Access-Control-Allow-Origin: *`).
  - Preflight (OPTIONS) request handling.
  - 10-second timeout for high-latency API responses.

#### 6.2 Browser Client (`prototype.html`)
- **Caching**: In-memory `Map` with 5-minute TTL to reduce API load.
- **UI Packing**: Flex-based treemap architecture for edge-to-edge visualization.
- **Namespace Filtering**: Strict Namespace 0 focus.

### 7. APIs & Integration Points
| API | Purpose | Endpoint | Notes |
|-----|---------|----------|-------|
| Wikimedia EventStreams | Raw edit feed | `https://stream.wikimedia.org/v2/stream/recentchange` | SSE; no auth. |
| LiftWing Topic Model | Classification | `https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict` | Accessible via local proxy. |

--- 
*Updated: March 24, 2026*
