# Wikipedia Live Edit Visualization (WikiEditTracker)

A real-time visualization of Wikipedia edits organized by article topics using Wikimedia's [LiftWing Article Topic Model](https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict).

## Overview
WikiEditTracker connects to the Wikipedia [Recent Changes EventStream](https://stream.wikimedia.org/v2/stream/recentchange) and classifies each edit into one of 64 article topics. It visualizes these edits in real-time using a high-density treemap layout that packs categories edge-to-edge for maximum visibility.

### Architecture
- **Front-end**: HTML5 / JavaScript (EventSource + Fetch)
- **CORS Proxy**: Node.js / Express (handles LiftWing API security restrictions)
- **Data Source**: Wikipedia EventStream (English Wikipedia, Namespace 0)

## Getting Started

### 1. Prerequisites
- Node.js (v14 or later recommended)
- A modern web browser

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the CORS Proxy
The LiftWing API does not support direct browser-based requests. You must run the local proxy to handle CORS and preflight requests:
```bash
npm start
```
The proxy will be available at `http://localhost:3001`.

### 4. Run the Visualization
Open **`prototype.html`** in your browser.

Alternatively, serve the files using a local web server to avoid local file restrictions:
```bash
# Using Python
python3 -m http.server 3000
```
Then visit: `http://localhost:3000/prototype.html`

## Core Visualization Features
- **High-Density Treemap**: 64 topics perfectly tiled across the viewport with weighted packing.
- **Real-time Pulsing**: Edits appear as pulses in their respective topic cells; size/opacity reflects model confidence.
- **Hierarchical Layout**: Topics are grouped into parent categories (Culture, Geography, History & Society, STEM) with regional sub-categories.
- **Interactive Controls**: Adjust classification confidence thresholds and dot decay speed on the fly.
- **Detailed Audit Log**: Real-time scrolling log showing timestamps, article titles, and editors, with integrated mini bar-charts for detected topics.
- **Event Deduplication**: Robust handling of stream reconnections to ensure each edit is only displayed once.

## Diagnostic Tools
- **`final_working_test.html`**: A detailed logging tool to verify the EventStream connection and topic classification pipeline.
- **`test_topics.js`**: A CLI script to test article classifications via the proxy.
  ```bash
  node test_topics.js
  ```

## Troubleshooting
If you see "**API Error: Load failed**" or no topics appearing:
1. Ensure the Node.js proxy is running (`npm start`).
2. Verify you can access `http://localhost:3001/health` in your browser.
3. Check your internet connection (the proxy needs to reach `api.wikimedia.org`).
4. Ensure no browser extensions are blocking cross-origin requests.

## References
- Wikipedia EventStreams: https://wikitech.wikimedia.org/wiki/EventStreams
- LiftWing Article Topic Model: https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Language_agnostic_link-based_article_topic
