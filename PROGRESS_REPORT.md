# Progress Report: Wikipedia Live Edit Visualization

## Overview
This document tracks our progress in building a real-time visualization of Wikipedia edits organized by article topics using the LiftWing language-agnostic link-based article topic model.

## Current Project Status: ✅ Working Prototype
We have successfully implemented a full data pipeline from Wikipedia's real-time event stream to a browser-based visualization, overcoming CORS restrictions and data filtering challenges.

### Core Architecture
1. **Wikipedia EventStream**: Live connection to `recentchange` stream.
2. **CORS Proxy (Node.js)**: Local Express server that handles preflight (OPTIONS) requests and forwards topic classification requests to the LiftWing API.
3. **LiftWing API**: Wikimedia's outlink-topic-model for article classification.
4. **Visualization Layer**: Interactive grid-based UI showing edits by topic category.

## Key Technical Solutions

### 1. Overcoming CORS Restrictions
The LiftWing API does not allow direct browser-based cross-origin requests.
- **Solution**: Implemented `proxy.js` using `http-proxy-middleware`.
- **Preflight Fix**: Added explicit handling for HTTP OPTIONS requests in the proxy to satisfy browser security requirements.
- **Header Safety**: Removed restricted headers (like `User-Agent`) from browser-side `fetch` calls to prevent "Load failed" errors.

### 2. Intelligent Data Filtering
The Wikipedia EventStream is extremely high-volume. To focus on meaningful data:
- **Language Filtering**: Limited to `en.wikipedia.org`.
- **Namespace Filtering**: Added logic to process only Namespace 0 (Main/Article) edits, excluding Talk pages, User pages, and Categories.
- **Canary Removal**: Filtering out system health events.

### 3. Hierarchical Topic Mapping
The LiftWing model returns 64 granular topics (e.g., `Geography.Regions.Americas.North_America`).
- **Solution**: Implemented a prefix-matching algorithm to map granular sub-topics to their top-level parent categories: **Culture**, **Geography**, **History & Society**, and **STEM**.

### 4. Robust Timing
- **Solution**: Implemented a multi-format timestamp parser that handles Unix timestamps, ISO strings, and UTC fallbacks to ensure accurate "time-since-edit" display.

## Files Added to Repo
- `proxy.js`: The CORS proxy server.
- `package.json`: Proxy dependencies and start script.
- `prototype_with_proxy.html`: The full topic-based visualization.
- `final_working_test.html`: A detailed diagnostic and logging tool.
- `test_topics.js`: CLI tool to verify article classifications.

## Next Steps
1. **Enhanced Visuals**: Implement a Voronoi or Force-directed layout for the 64 sub-topics.
2. **Persistence**: Add a local database or cache to store the last 24 hours of topic data.
3. **Deployment**: Containerize the proxy for easier deployment to cloud platforms.
