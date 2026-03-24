# Architecture Simplification: Client-Only Approach

This document outlines the exact changes needed to simplify the Wikipedia Live Edit Visualization from a backend-assisted architecture to a client-only approach running entirely in the web browser.

## Removed Components

The following backend components are eliminated in the client-only approach:

1. **Stream Processor** (Node.js/TypeScript service)
2. **Topic Classifier Service** (Node.js/TypeScript service with Redis)
3. **WebSocket Server** (Node.js + Socket.io)
4. **Redis** (in-memory cache replaced with browser Map)
5. **API Gateway** (Express server)
6. **Docker/Kubernetes deployment** (replaced with static site hosting)

## Added/Modified Components

The following components are added or modified to enable client-only operation:

1. **Browser-based EventStream Consumer** (using native EventSource API)
2. **In-Memory Topic Cache** (using Map with TTL mechanism)
3. **Direct LiftWing API Calls** (using fetch with proper User-Agent)
4. **Client-Side Filtering** (for English Wikipedia and canary events)
5. **Static File Hosting** (HTML/CSS/JS served directly)

## Detailed Changes

### 1. EventStream Consumption
**Before (Backend):**
```javascript
// Node.js using wikimedia-streams
import WikimediaStream from 'wikimedia-streams';
const stream = new WikimediaStream('recentchange');
stream.filter("mediawiki.recentchange")
    .all({ wiki: "enwiki" })
    .on('recentchange', (data, event) => {
        // Send to backend processing
    });
```

**After (Client-Only):**
```javascript
// Browser native EventSource
const eventSource = new EventSource(
  'https://stream.wikimedia.org/v2/stream/recentchange',
  { headers: { 'User-Agent': 'eventstream-visualize/1.0' } }
);

eventSource.onmessage = (event) => {
  const change = JSON.parse(event.data);
  // Filter client-side
  if (change.server_name === 'en.wikipedia.org' && 
      change.meta.domain !== 'canary') {
    processChange(change);
  }
};
```

### 2. Topic Classification
**Before (Backend Service):**
```javascript
// Internal API call to classifier service
const response = await fetch(`http://localhost:3001/classify/${rev_id}`);
const topics = await response.json();
// Sent via WebSocket to frontend
```

**After (Client-Only):**
```javascript
// Direct call to LiftWing API with caching
async function getTopics(pageTitle) {
  // Check in-memory cache first
  const cached = topicCache.get(pageTitle);
  if (cached && isFresh(cached)) {
    return cached.data;
  }
  
  // Call LiftWing API directly
  const response = await fetch(
    'https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'eventstream-visualize/1.0'
      },
      body: JSON.stringify({
        page_title: pageTitle,
        lang: 'en',
        threshold: 0.1
      })
    }
  );
  
  const data = await response.json();
  const results = data.prediction.results;
  
  // Update cache
  topicCache.set(pageTitle, { timestamp: Date.now(), data: results });
  return results;
}
```

### 3. Caching Mechanism
**Before (Backend):**
- Redis shared cache with TTL
- Accessed by multiple stream processor instances

**After (Client-Only):**
```javascript
// Simple in-memory cache with size limit
const topicCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

function isFresh(cachedEntry) {
  return (Date.now() - cachedEntry.timestamp) < CACHE_TTL;
}

// When adding to cache, enforce size limit
if (topicCache.size >= MAX_CACHE_SIZE) {
  // Remove oldest entry
  const oldestKey = Array.from(topicCache.keys()).reduce((a, b) => 
    topicCache.get(a).timestamp < topicCache.get(b).timestamp ? a : b
  );
  topicCache.delete(oldestKey);
}
topicCache.set(pageTitle, { timestamp: Date.now(), data: results });
```

### 4. Visualization Updates
**Before (Backend):**
- Events sent via WebSocket/Socket.io from server to client
- Client receives pre-processed events

**After (Client-Only):**
- Events processed entirely in browser
- Visualization updates happen immediately after topic lookup
- No intermediary messaging needed

### 5. User Interaction
**Before (Backend):**
- Controls might involve server communication for filtering preferences
- State potentially shared across users via backend

**After (Client-Only):**
- All filtering and controls handled client-side
- Preferences stored in localStorage or URL parameters if persistence needed
- No cross-user state sharing (each browser independent)

## Deployment Changes

**Before:**
- Docker containers for each service
- Kubernetes/Nomad orchestration
- Separate build/deploy pipelines for backend and frontend
- Load balancing, scaling policies, etc.

**After:**
- Single static site build (HTML/CSS/JS)
- Hosted on any static site provider (GitHub Pages, Netlify, Vercel, etc.)
- No server-side processes to maintain
- Simplified CI/CD: just rebuild and redeploy static assets

## Runtime Considerations

### Pros of Client-Only Approach:
1. **Simplicity**: No backend services to develop, deploy, or maintain
2. **Zero Infrastructure Cost**: Can be hosted for free on static site providers
3. **Lower Latency**: Direct browser→API calls (no network hop to backend)
4. **Easier Development**: Instant reloads, no backend restart needed
5. **Isolated Failures**: One user's browser issues don't affect others

### Cons/Limitations:
1. **Per-Client API Calls**: Each browser makes its own LiftWing API calls (could increase total API load if many users)
2. **No Persistent History**: Edits only visible while browser is open (unless implemented in localStorage)
3. **Limited Scalability**: Each client handles its own EventStream connection (though EventStreams is designed for many clients)
4. **Browser Resource Usage**: Slightly more CPU/memory used in each client's browser
5. **CORS Dependencies**: Relies on Wikimedia APIs having proper CORS headers

### Mitigations for Cons:
1. **Caching**: The in-memory cache significantly reduces duplicate API calls for frequently edited articles
2. **Batching Option**: Could implement a simple batching layer if API limits become an issue (collect titles, send occasional batch requests)
3. **History**: Add localStorage persistence for edit history if desired
4. **Monitoring**: Add basic usage stats to localStorage that can be periodically reported (opt-in) to understand actual load
5. **Fallback**: Design the client to detect API issues and gracefully degrade (show edits without topic coloring)

## File Structure Changes

**Before:**
```
/src
  /backend
    /stream-processor
    /topic-classifier
    /websocket-server
  /frontend
    /react-app
/docker-compose.yml
/kubernetes/
```

**After:**
```
/src
  /index.html
  /main.js
  /styles.css
  /components/
    /TopicGrid.js
    /EditIndicator.js
    /ControlsPanel.js
  /utils/
    /eventStream.js
    /topicCache.js
    /liftwingApi.js
```

## Implementation Recommendation

For a proof-of-concept or low-to-moderate traffic visualization, the client-only approach is strongly recommended due to its simplicity. Only consider adding backend components if:

1. You observe significant API rate limiting issues from many concurrent users
2. You need to maintain a persistent edit history across sessions
3. You want to compute aggregate statistics across all users
4. You add features requiring server-side computation (e.g., topic trend analysis, edit velocity metrics)

The prototype (`prototype.html`) demonstrates that the core functionality is achievable with client-side code only, using browser-native APIs and direct calls to the LiftWing service.