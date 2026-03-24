# Progress Report: Wikipedia Live Edit Visualization

## Overview
This document tracks our progress in building a real-time visualization of Wikipedia edits organized by article topics using the LiftWing language-agnostic link-based article topic model.

## Current Project Status: ✅ High-Density Treemap Prototype
We have evolved the visualization into a sophisticated, space-efficient dashboard that displays all 64 Wikipedia topics simultaneously in a hierarchical treemap layout.

### Core Architecture
1. **Wikipedia EventStream**: Live connection to `recentchange` stream.
2. **CORS Proxy (Node.js)**: Local Express server that handles preflight (OPTIONS) requests and forwards topic classification requests to the LiftWing API.
3. **LiftWing API**: Wikimedia's outlink-topic-model for article classification.
4. **Visualization Layer**: High-density treemap UI in `prototype.html`.

## Key Technical Solutions

### 1. High-Density Treemap Layout
Replaced the initial grid with a self-correcting treemap packing system.
- **Tiled Geometry**: Used Flexbox-based packing to ensure topic boxes interlock perfectly, filling 100% of the viewport.
- **Weighted Packing**: Implemented visual weighting where high-density groups (like Media and STEM) occupy more area than smaller groups.
- **Vertical Optimization**: Fine-tuned cell heights and log area dimensions to ensure a zero-scroll experience on standard monitors.

### 2. Hierarchical Taxonomy Support
Successfully mapped the full ORES/Articletopic taxonomy.
- **Nested Groups**: Created nested sub-category boxes for major regions (Africa, Asia, Europe) and fields (Media, STEM).
- **Catch-all Logic**: Implemented "(General)" cells for catch-all categories (ending in `*`), while specifically excluding them for categories where they don't apply (e.g., Americas).

### 3. Intelligent Data Pipeline
- **Namespace Filtering**: Processing only Namespace 0 (Main/Article) edits.
- **CORS Handling**: Robust local proxy for the LiftWing API.
- **Client-side Caching**: In-memory cache with TTL to optimize API usage and provide cache hit metrics.
- **Robust Timing**: Multi-format timestamp parser ensures accurate real-time clock synchronization.

## Files Added to Repo
- `prototype.html`: The definitive high-density treemap visualization.
- `proxy.js`: The CORS proxy server.
- `package.json`: Proxy dependencies and start script.
- `final_working_test.html`: Diagnostic and logging tool.
- `test_topics.js`: CLI tool to verify article classifications.

## Next Steps
1. **Trend Analysis**: Add a mini-chart showing edit volume per category over the last 15 minutes.
2. **Persistence**: Add a local database or cache to store the last 24 hours of topic data.
3. **Containerization**: Dockerize the proxy for cloud deployment.
