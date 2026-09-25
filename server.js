// ═══════════════════════════════════════════════════════════════════════════
// TEGRITY VOYAGE MANAGEMENT (TVM) — Standalone Express Web Server
// ═══════════════════════════════════════════════════════════════════════════

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8082;
const SESSION_COOKIE = 'tvm_session_token';

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

// Authentication API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' && password === 'admin') || (username && password)) {
    res.cookie(SESSION_COOKIE, 'authenticated-user-tvm', { maxAge: 7 * 86400 * 1000, httpOnly: true });
    return res.json({ success: true, user: username });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ success: true });
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Middleware for authentication
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/login' || req.path.match(/\.(css|js|svg|png|jpg|ico|woff2?)$/i)) {
    return next();
  }
  const session = getCookie(req, SESSION_COOKIE);
  if (!session) {
    return res.redirect('/login');
  }
  next();
});

// Static files
app.use(express.static(__dirname));

// Root route & SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TegrityVoyageManagement (TVM) standalone app running on port ${PORT}`);
});
