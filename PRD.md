# Product Requirements Document (PRD)
## Wikipedia Live Edit Visualization

### 1. Overview
Create a real-time visualization web app that monitors live Wikipedia edits and displays them according to article topics using the LiftWing language-agnostic link-based article topic model.

### 2. Goals
- Provide a live activity monitor showing where edits are happening across Wikipedia topics.
- Visualize each edit as a dot in a topic region, with size/opacity reflecting model confidence.
- Allow users to explore editing patterns by topic in real time.

### 3. System Architecture (High‑Level)

#### 3.1 Backend-Optional Architecture (Recommended for Simplicity)
For a minimal deployment, the entire application can run in the client web browser:
```
+-------------------+      +----------------------+      +---------------------+
| EventStreams (SSE)| ---> |  Browser Client      | ---> | LiftWing API        |
| (recentchange)    |      | (React + vanilla JS) |      | (direct fetch)      |
+-------------------+      +----------------------+      +---------------------+
       ^                         |                          |
       |                         v                          v
       |               +------------------+        +------------------+
       |               | Topic Cache (Map)|        | Visualization    |
       |               | (in-memory TTL)  |        | (D3/Canvas)      |
       |               +------------------+        +------------------+
       |                         |                          |
       +-------------------------+--------------------------+
                                 |
                         User Interaction/Controls
```

#### 3.2 Scalable Backend Architecture (Alternative)
For higher throughput or additional features (e.g., edit history aggregation), a backend can be added:
```
+-------------------+      +---------------------+      +----------------------+
| EventStreams (SSE)| ---> |  Stream Processor   | ---> | Topic Classifier Svc |
| (recentchange)    |      | (Node/TS)           |      | (LiftWing API wrapper)|
+-------------------+      +---------------------+      +----------------------+
                                                          |
                                                          v
                                                +------------------+
                                                |  Frontend App    |
                                                | (React + D3/Canvas)|
                                                +------------------+
```

### 4. Data Pipeline

#### 4.1 Client-Only Pipeline (Default)
| Step | Component | Input | Output | Notes |
|------|-----------|-------|--------|-------|
| 1 | EventStreams Client | SSE endpoint `https://stream.wikimedia.org/v2/stream/recentchange` | Raw JSON change events | Discard canary events (`meta.domain === 'canary'`). |
| 2 | Browser Filter | Raw change events | `{title, user, timestamp}` | Keep only English Wikipedia (`server_name === 'en.wikipedia.org'`). Optionally deduplicate by `title` or use a Set for recent titles. |
| 3 | Browser Topic Cache | `title` | `{[topic]: confidence}` (64‑dim vector) | Call LiftWing API directly; cache results in-memory with TTL (e.g., 5 min) to avoid repeat calls for same title. |
| 4 | Browser Visualizer | `{title, user, timestamp, topic vector}` | Visual updates | Render edit as dot in topic region; size/opacity scaled by confidence. |

#### 4.2 Backend-Assisted Pipeline (Alternative)
| Step | Component | Input | Output | Notes |
|------|-----------|-------|--------|-------|
| 1 | EventStreams Client | SSE endpoint `https://stream.wikimedia.org/v2/stream/recentchange` | Raw JSON change events | Discard canary events (`meta.domain === 'canary'`). |
| 2 | Stream Processor | Raw change events | `{title, wiki, rev_id, user, timestamp}` | Keep only English Wikipedia (`wiki === 'enwiki'`). Optionally deduplicate by `rev_id`. |
| 3 | Topic Classifier Service | `rev_id` (or page title) | `{[topic]: confidence}` (64‑dim vector) | Call LiftWing API (`/service/lw/inference/v1/models/outlink-topic-model:predict`). Cache results in Redis for a short TTL (e.g., 5 min). |
| 4 | Enrichment Service (optional) | `{title, ..., topic vector}` | `{title, ..., dominant_topic, confidence}` | Pick topic with max confidence; keep full vector for intensity encoding. |
| 5 | Frontend Receiver | Enriched edit events | Visual updates | Delivered via WebSocket (Socket.IO) or server‑sent events from a thin Node/Express layer. |

### 5. Frontend Visualization
- **Layout**: Fixed grid or Voronoi diagram representing the 64 topics, grouped by the four top‑level categories (Culture, Geography, History & Society, STEM). Each topic gets a cell.
- **Edit Indicator**: Dot inside the cell of its dominant topic.
  - Size/Opacity = linear map of confidence (0‑1) → radius 2‑6px or alpha 0.2‑1.0.
  - Optional color hue per top‑level category.
- **Animation**: Dot appears, fades out over 2‑3 seconds.
- **Interaction**: Hover → tooltip with title, editor, timestamp, top‑3 topics. Click → open article.
- **Controls**: Filter by top‑level category, confidence threshold slider, pause/resume.
- **Tech Stack**: 
  - For client-only: React (or Preact), D3.js or Canvas, native EventSource/fetch, CSS Grid/Flexbox.
  - For backend-assisted: Same as above plus Socket.IO client for real‑time updates from server.

### 6. Backend Services (Optional)

The backend services below are only needed if you choose the scalable architecture. For the client-only approach, all processing happens in the browser.

- **Stream Processor (Node.js/TypeScript)** [Optional]
  - Uses `wikimedia-streams` or native `EventSource`.
  - Emits enriched events to Redis Pub/Sub or directly to WebSocket server.
- **Topic Classifier Service** [Optional]
  - Wrapper around LiftWing API with retry/backoff, rate‑limit handling.
  - Caches results in Redis (`GETSETEX <key> 300 <json>`).
  - Exposes internal HTTP endpoint (`/classify/:rev_id` or `/classify?title=`).
- **WebSocket Server (Node.js + Socket.io)** [Optional]
  - Subscribes to Redis Pub/Sub, broadcasts to clients.
  - Optionally performs client‑side filtering.
- **API Gateway (optional)** [Optional]
  - Express server serving static React build, health checks, internal service proxy.

### 7. APIs & Integration Points
| API | Purpose | Endpoint | Rate Limits / Notes |
|-----|---------|----------|---------------------|
| Wikimedia EventStreams | Raw edit feed | `https://stream.wikimedia.org/v2/stream/recentchange` | No auth; SSE; 15‑min server timeout (client must reconnect). |
| LiftWing Article Topic Model | Topic probabilities | `https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict` | POST JSON `{page_title, lang, threshold}`; returns prediction.results array. Cache aggressively. |
| Wikipedia REST (optional) | Verify article existence | `https://en.wikipedia.org/api/rest_v1/page/summary/<title>` | Use only if needed (e.g., resolve redirects). |
| Socket.io (custom) | Real‑time push to browser | `ws://<host>/socket.io/` | Managed by WebSocket server. |

### 8. Deployment & Scaling
- **Containerization**: Dockerize each service; use `docker‑compose` locally; Kubernetes/Nomad for prod.
- **Scaling**:
  - Stream Processor: single instance usually sufficient (few hundred events/sec for enwiki). Can fan‑out if needed.
  - Classifier Service: stateless; scale horizontally based on LiftWing rate limits; shared Redis cache.
  - WebSocket Server: scale with sticky sessions or Redis adapter for Socket.io.
- **Observability**: Log throughput, latency, cache hit/miss; export Prometheus metrics; health check endpoints.
- **Resilience**: Auto‑reconnect for EventStreams (store last‑event‑id in Redis); dead‑letter queue for failed classifications.
- **Security**: Proper `User-Agent` header for LiftWing; sanitize titles; serve frontend over HTTPS; WebSocket via wss://.
- **CI/CD**: Lint & unit tests (Jest); build Docker images on tag push; rollout via rolling update.

### 9. Open Questions & Next Steps
1. **Topic Granularity**: Show all 64 topics or collapse into four top‑level categories for layout simplicity?
2. **Update Frequency**: Near‑real‑time (sub‑second) vs. batched (e.g., 5 s) to reduce classifier load?
3. **Persistence**: Retain rolling window of edits (e.g., last 10 min) for trend visualization or only live dots?
4. **Accessibility**: Color‑blind friendly palettes, keyboard navigation.
5. **Mobile Responsiveness**: Desktop‑only or adapt to smaller screens?

--- 
*Prepared for the eventstream‑visualize project.*