# Product Requirements Document (PRD)
## Wikipedia Live Edit Visualization

### 1. Overview
Create a real-time visualization web app that monitors live Wikipedia edits and displays them according to article topics using the LiftWing language-agnostic link-based article topic model.

### 2. Goals
- Provide a live activity monitor showing where edits are happening across Wikipedia topics.
- Visualize each edit as a dot in a topic region, with size/opacity reflecting model confidence.
- Allow users to explore editing patterns by topic in real time.

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
                             (Grid-based UI)
```

### 4. Data Pipeline

| Step | Component | Input | Output | Notes |
|------|-----------|-------|--------|-------|
| 1 | EventStreams Client | SSE endpoint `https://stream.wikimedia.org/v2/stream/recentchange` | Raw JSON change events | Discard canary events (`meta.domain === 'canary'`). |
| 2 | Browser Filter | Raw change events | Filtered Events | Keep only English Wikipedia (`server_name === 'en.wikipedia.org'`) and Article Namespace (`namespace === 0`). |
| 3 | CORS Proxy | `page_title` | `prediction.results` | Handles CORS preflight (OPTIONS) and forwards to LiftWing API. |
| 4 | Topic Mapper | Granular Topic (e.g. `STEM.Physics`) | Parent Category | Maps 64 sub-topics to top-level categories: Culture, Geography, History & Society, STEM. |
| 5 | Browser Visualizer | Enriched event | Visual update | Renders edit in the corresponding topic cell with pulse animation. |

### 5. Frontend Visualization
- **Layout**: Dynamic grid representing topic categories.
- **Edit Indicator**: Pulse animation for new edits.
- **Topic Mapping**: Hierarchical mapping from granular sub-topics (e.g., `Culture.Visual_arts.Architecture`) to top-level buckets.
- **Robust Timestamps**: Multi-format parser for `meta.dt` (Unix), `meta.dt_utc` (ISO), and browser local time.
- **Controls**: 
  - Confidence threshold slider (filter out low-score classifications).
  - Max log entries control.
  - Pause/Resume stream.
  - Clear log/cache.

### 6. Technical Specifications

#### 6.1 CORS Proxy (`proxy.js`)
- **Technology**: Node.js, Express, `http-proxy-middleware`.
- **Port**: 3001 (default).
- **Features**: 
  - Explicit CORS header injection (`Access-Control-Allow-Origin: *`).
  - Preflight (OPTIONS) request handling (returns 200 OK).
  - 10-second timeout to handle API latency.
  - Path rewriting to the LiftWing prediction endpoint.

#### 6.2 Browser Client
- **Caching**: In-memory `Map` with 5-minute TTL and 1000-entry capacity limit.
- **Event Handling**: Native `EventSource` (no custom headers as they are unsupported by the spec).
- **Filtering**: Strict filtering for `namespace: 0` to focus on encyclopedia content.

### 7. APIs & Integration Points
| API | Purpose | Endpoint | Notes |
|-----|---------|----------|-------|
| Wikimedia EventStreams | Raw edit feed | `https://stream.wikimedia.org/v2/stream/recentchange` | SSE; no auth. |
| LiftWing Topic Model | Classification | `https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict` | Accessible via local proxy. |

### 8. Development & Setup
1. **Proxy**: `npm install` then `npm start`.
2. **Client**: Open `prototype_with_proxy.html` (via local server like `python3 -m http.server` to avoid local file restrictions).
3. **Diagnostics**: Use `final_working_test.html` for real-time pipeline debugging.

--- 
*Updated: March 24, 2026*
