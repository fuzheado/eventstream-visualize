// Simple CORS proxy for LiftWing API
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Agent');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy to LiftWing API
app.use('/predict', createProxyMiddleware({
  target: 'https://api.wikimedia.org',
  changeOrigin: true,
  proxyTimeout: 10000, // 10 seconds
  timeout: 10000,      // 10 seconds
  pathRewrite: {
    '^/predict': '/service/lw/inference/v1/models/outlink-topic-model:predict'
  },
  onProxyReq: (proxyReq) => {
    // Add any headers needed by the target service
    proxyReq.setHeader('User-Agent', 'eventstream-visualize/1.0');
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).json({ error: 'Proxy timeout or connection issue', details: err.message });
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`LiftWing CORS proxy running on http://localhost:${PORT}`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/predict`);
  console.log('Health check: http://localhost:' + PORT + '/health');
});
