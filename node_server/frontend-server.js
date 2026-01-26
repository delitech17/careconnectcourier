const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Serve frontend static files
app.use(express.static(FRONTEND_DIR));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CareConnect Courier Frontend running on http://localhost:${PORT}`);
});
