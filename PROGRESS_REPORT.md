# Progress Report: Wikipedia Live Edit Visualization

## Overview
This document tracks our progress in building a real-time visualization of Wikipedia edits organized by article topics using the LiftWing language-agnostic link-based article topic model.

## Initial Approach
We began with a client-only architecture where the browser would:
1. Connect directly to Wikipedia's EventStream (https://stream.wikimedia.org/v2/stream/recentchange)
2. For each edit, call the LiftWing API directly to get topic classifications
3. Display edits in a topic-organized visualization

## Challenge Discovered: CORS Restrictions
During testing, we found that while:
- ✅ The EventStream connection worked perfectly (we could see events and timestamps)
- ❌ Direct calls to the LiftWing API from the browser failed with CORS errors

The LiftWing API endpoint (`https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict`) does not send the necessary CORS headers (`Access-Control-Allow-Origin: *`) to allow browser-based requests from arbitrary origins.

## Evidence of the Issue
From our testing:
- Events processed counter increased steadily (showing EventStream was working)
- API calls counter increased (showing we were attempting calls)
- But topics found counter remained at 0
- Error counter matched the API calls counter (indicating every API call failed)

## Solution Implemented: CORS Proxy
To bypass the CORS restriction while maintaining a simple architecture, we implemented a local CORS proxy:

### How the Proxy Works
1. Browser makes request to our local proxy (http://localhost:3001/predict)
2. Proxy forwards the request to the LiftWing API
3. Proxy returns the response to the browser with appropriate CORS headers
4. Browser receives the topic data and can display it

### Proxy Implementation
We created a simple Node.js proxy using:
- Express.js framework
- http-proxy-middleware package
- Explicit CORS headers (Access-Control-Allow-Origin: *, etc.)

The proxy rewrites URLs:
- `/predict` → `/service/lw/inference/v1/models/outlink-topic-model:predict`

## Current Working State
Our latest test (`final_working_test.html`) demonstrates that the system now works correctly:

✅ **EventStream Connection**: Successfully connects to Wikipedia's Recent Changes stream
✅ **Filtering**: Properly filters for English Wikipedia edits and removes canary events
✅ **API Calls**: Successfully calls the LiftWing API through our CORS proxy
✅ **Topic Classification**: Receives and displays topic classifications with confidence scores
✅ **Caching**: Implements client-side caching to reduce duplicate API calls
✅ **Visualization Ready**: Has the foundation for the full topic-based visualization

## Sample API Response
From our tests, the LiftWing API returns data in this format:
```json
{
  "prediction": {
    "article": "https://en.wikipedia.org/wiki/Frida_Kahlo",
    "results": [
      {"topic": "Culture.Biography.Biography*", "score": 0.867},
      {"topic": "Geography.Regions.Americas.North_America", "score": 0.500},
      {"topic": "Culture.Visual_arts.Visual_arts*", "score": 0.484},
      {"topic": "Culture.Biography.Women", "score": 0.281}
    ]
  }
}
```

## Files Modified/Created
1. `proxy.js` - The CORS proxy server
2. `package.json` - Dependencies for the proxy
3. `final_working_test.html` - Demonstration that the system works
4. `PROGRESS_REPORT.md` - This file

## Next Steps for Full Visualization
Now that we've solved the core data pipeline issue, we can implement the full visualization:

### 1. Topic-Based Layout
- Create a fixed grid or Voronoi diagram representing the 64 LiftWing topics
- Group topics by the four top-level categories: Culture, Geography, History & Society, STEM
- Assign each topic a cell in the layout

### 2. Edit Visualization
- For each edit, determine the dominant topic (highest score above threshold)
- Render a dot/pulse in the corresponding topic cell
- Size/opacity of dot based on confidence score
- Optional: color hue by top-level category for quick visual grouping

### 3. User Interaction
- Hover tooltip showing article title, editor, timestamp, and top-3 topics
- Click to open the Wikipedia article in a new tab
- Controls to filter by topic category and confidence threshold
- Pause/resume functionality

### 4. Performance Optimizations
- Maintain client-side cache with TTL (5 minutes) to reduce API calls
- Limit cache size to prevent memory growth
- Efficient DOM updates (only adding/removing dots as needed)
- Request throttling if needed to respect API rate limits

### 5. Deployment Options
- **Development**: Run proxy locally (`npm start`) and open visualization in browser
- **Production**: 
  - Option A: Deploy proxy as a simple backend service (still minimal infrastructure)
  - Option B: Implement server-side component that does EventStream consumption and API calls, then pushes to clients via WebSocket
  - Option C: For low-traffic use cases, the client+proxy approach can work in production with proper hosting

## Conclusion
We've successfully solved the core technical challenge preventing our visualization from working: the CORS restriction on the LiftWing API. With our CORS proxy solution, we now have a working data pipeline that can:
1. Consume live Wikipedia edits from EventStream
2. Look up topic classifications via the LiftWing API
3. Deliver this data to a browser-based visualization

The foundation is now in place to implement the full topic-based visualization as originally envisioned in the PRD.