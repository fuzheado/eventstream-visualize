# Wikipedia Live Edit Visualization

A real-time visualization of Wikipedia edits organized by article topics using Wikimedia's [LiftWing Article Topic Model](https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict).

## Overview
This project connects to the Wikipedia [Recent Changes EventStream](https://stream.wikimedia.org/v2/stream/recentchange) and classifies each edit into one of 64 article topics. It visualizes these edits in real-time using a topic-based grid layout.

### Architecture
- **Front-end**: HTML5 / JavaScript (EventSource + Fetch)
- **CORS Proxy**: Node.js / Express (to handle LiftWing API restrictions)
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
The LiftWing API does not support direct browser-based requests. You must run the local proxy:
```bash
npm start
```
The proxy will be available at `http://localhost:3001`.

### 4. Run the Visualization
Open `prototype_with_proxy.html` in your browser.

Alternatively, serve the files using a local web server:
```bash
# Using Python
python3 -m http.server 3000
```
Then visit: `http://localhost:3000/prototype_with_proxy.html`

## Diagnostic Tools
- **`final_working_test.html`**: A detailed logging tool to verify the EventStream connection and topic classification pipeline.
- **`test_topics.js`**: A CLI script to test article classifications via the proxy.
  ```bash
  node test_topics.js
  ```

## Key Features
- **Real-time Streaming**: Direct connection to Wikipedia's global edit events.
- **Namespace Filtering**: Automatically ignores Talk pages, User pages, and other non-article namespaces (processes Namespace 0 only).
- **Hierarchical Topic Mapping**: Maps 64 granular topics into four top-level categories: Culture, Geography, History & Society, and STEM.
- **CORS Preflight Handling**: Robust proxy implementation that manages browser security requirements (OPTIONS requests).
- **Robust Timestamps**: Accurate "time-since-edit" display using multiple source formats.

## Key Files
- `proxy.js`: Express-based CORS proxy server.
- `prototype_with_proxy.html`: Full topic-based grid visualization.
- `final_working_test.html`: Diagnostic and logging tool.
- `PROGRESS_REPORT.md`: Detailed log of the development process and technical challenges.

## Troubleshooting
If you see "**API Error: Load failed**" in the log:
1. Ensure the Node.js proxy is running (`npm start`).
2. Verify you can access `http://localhost:3001/health` in your browser.
3. Check your internet connection (the proxy needs to reach `api.wikimedia.org`).
4. Ensure no browser extensions are blocking the requests.

## References
- Wikipedia EventStreams: https://wikitech.wikimedia.org/wiki/EventStreams
- LiftWing Article Topic Model: https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Language_agnostic_link-based_article_topic
