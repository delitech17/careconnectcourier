const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo-token-12345';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key-12345';

// Security middleware
app.use(helmet());

// Basic rate-limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200, // limit each IP
  standardHeaders: true,
  legacyHeaders: false
});
// app.use(limiter);

// // CORS: restrict to configured origins (comma-separated ALLOWED_ORIGINS)
// const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',').map(s => s.trim());
// // Limit request body size to mitigate large payload attacks
// app.use(express.json({ limit: process.env.JSON_LIMIT || '100kb' }));
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // allow server-to-server or same-origin requests
//     if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
//     return callback(new Error('CORS policy: This origin is not allowed.'), false);
//   }
// }));

// ============ STATIC FILES ============
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// ============ EMAIL SETUP ============
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Function to send notification emails
async function sendMovementNotification(shipment, movement) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@careconnectcourier.com',
      to: shipment.owner_email || shipment.email || 'info@careconnectcourier.com',
      subject: `Shipment Update: ${shipment.tracking_code}`,
      html: `
        <h2>Your Shipment Has Been Updated</h2>
        <p><strong>Tracking Code:</strong> ${shipment.tracking_code}</p>
        <p><strong>Status:</strong> ${movement.status}</p>
        <p><strong>Location:</strong> ${movement.location}</p>
        <p><strong>Note:</strong> ${movement.note}</p>
        <p><strong>Time:</strong> ${movement.timestamp}</p>
        <br>
        <p><a href="https://careconnectcourier.com/tracking.html">Track Your Shipment</a></p>
      `
    };
    await emailTransporter.sendMail(mailOptions);
    console.log('Email sent for movement update');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

// Middleware: Admin auth
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Middleware: User auth (JWT)
function userAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_DIR = path.join(__dirname, 'backups');

// ============ BACKUP FUNCTION ============
async function backupShipmentData() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const shipmentFile = path.join(DATA_DIR, 'shipments.json');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `shipments-${timestamp}.json`);
    const data = await fs.readFile(shipmentFile, 'utf8');
    await fs.writeFile(backupFile, data, 'utf8');
    console.log(`Backup created: ${backupFile}`);
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

// Run backups daily
setInterval(backupShipmentData, 24 * 60 * 60 * 1000); // Daily

// Utility: generate unique tracking code
function generateTrackingCode() {
  return 'CC' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Utility: validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readJSON(file) {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJSON(file, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// API: services
app.get('/api/services', async (req, res) => {
  const services = await readJSON('services.json');
  res.json(services);
});

// API: testimonials
app.get('/api/testimonials', async (req, res) => {
  const testimonials = await readJSON('testimonials.json');
  res.json(testimonials);
});

// API: contact messages
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  const messages = await readJSON('messages.json');
  const entry = {
    id: Date.now(),
    name,
    email,
    subject: subject || '',
    message,
    created_at: new Date().toISOString()
  };
  messages.push(entry);
  await writeJSON('messages.json', messages);
  res.json({ ok: true, id: entry.id });
});

// API: quote requests
app.post('/api/quote', async (req, res) => {
  const { company, contact_name, email, origin, destination, weight, service } = req.body || {};
  if (!contact_name || !email || !origin || !destination) {
    return res.status(400).json({ error: 'contact_name, email, origin and destination are required' });
  }
  const quotes = await readJSON('quotes.json');
  const entry = {
    id: Date.now(),
    company: company || '',
    contact_name,
    email,
    origin,
    destination,
    weight: weight || '',
    service: service || '',
    created_at: new Date().toISOString()
  };
  quotes.push(entry);
  await writeJSON('quotes.json', quotes);
  res.json({ ok: true, id: entry.id });
});

// ============ TRACKING ENDPOINTS ============

// Admin: Create shipment
app.post('/admin/create_shipment', adminAuth, async (req, res) => {
  const { owner_name, owner_email, company, description, origin, destination, eta, weight, service, origin_lat, origin_lng, dest_lat, dest_lng } = req.body || {};
  
  if (!owner_name || !origin || !destination) {
    return res.status(400).json({ error: 'owner_name, origin, and destination are required' });
  }

  const tracking_code = generateTrackingCode();
  const shipments = await readJSON('shipments.json');
  const shipment = {
    id: `SHIP${Date.now()}`,
    tracking_code,
    owner_name,
    owner_email: owner_email || '',
    company: company || '',
    description: description || '',
    origin,
    destination,
    eta: eta || '',
    weight: weight || '',
    service: service || '',
    status: 'pending',
    created_at: new Date().toISOString(),
    origin_lat: parseFloat(origin_lat) || 0,
    origin_lng: parseFloat(origin_lng) || 0,
    dest_lat: parseFloat(dest_lat) || 0,
    dest_lng: parseFloat(dest_lng) || 0
  };
  shipments.push(shipment);
  await writeJSON('shipments.json', shipments);
  res.json({ ok: true, tracking_code, id: shipment.id });
});

// Admin: Add movement to shipment
app.post('/admin/add_movement', adminAuth, async (req, res) => {
  const { tracking_code, location, lat, lng, status, note } = req.body || {};
  
  if (!tracking_code || !location || !status) {
    return res.status(400).json({ error: 'tracking_code, location, and status are required' });
  }

  const shipments = await readJSON('shipments.json');
  const shipment = shipments.find(s => s.tracking_code === tracking_code);
  
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const movements = await readJSON('movements.json');
  const movement = {
    id: `MOV${Date.now()}`,
    shipment_id: shipment.id,
    timestamp: new Date().toISOString(),
    location,
    lat: parseFloat(lat) || 0,
    lng: parseFloat(lng) || 0,
    status,
    note: note || ''
  };
  movements.push(movement);
  await writeJSON('movements.json', movements);
  
  // Update shipment status
  shipment.status = status;
  await writeJSON('shipments.json', shipments);
  
  // Send email notification
  await sendMovementNotification(shipment, movement);
  
  res.json({ ok: true, id: movement.id });
});

// Public: Track shipment by code
app.get('/api/track/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const shipments = await readJSON('shipments.json');
  const shipment = shipments.find(s => s.tracking_code === code);
  
  if (!shipment) {
    return res.status(404).json({ error: 'Tracking code not found' });
  }

  const movements = await readJSON('movements.json');
  const shipmentMovements = movements
    .filter(m => m.shipment_id === shipment.id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const current = shipmentMovements[shipmentMovements.length - 1] || { location: shipment.origin, lat: shipment.origin_lat, lng: shipment.origin_lng };

  res.json({
    tracking_code: shipment.tracking_code,
    owner_name: shipment.owner_name,
    company: shipment.company,
    description: shipment.description,
    origin: shipment.origin,
    destination: shipment.destination,
    eta: shipment.eta,
    weight: shipment.weight,
    service: shipment.service,
    current_location: current.location,
    current_lat: current.lat,
    current_lng: current.lng,
    dest_lat: shipment.dest_lat,
    dest_lng: shipment.dest_lng,
    map_url: `https://www.google.com/maps/search/?api=1&query=${current.lat},${current.lng}`,
    movements: shipmentMovements.map(m => ({
      timestamp: m.timestamp,
      location: m.location,
      lat: m.lat,
      lng: m.lng,
      status: m.status,
      note: m.note
    }))
  });
});

// Note: Frontend fallback will be added at the end of this file

// ============ USER AUTHENTICATION & ACCOUNT ENDPOINTS ============

// User: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  let users = await readJSON('users.json');
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = {
    id: `USR${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString()
  };

  users.push(user);
  await writeJSON('users.json', users);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

// User: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const users = await readJSON('users.json');
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

// User: Get their shipments
app.get('/api/user/shipments', userAuth, async (req, res) => {
  const users = await readJSON('users.json');
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const shipments = await readJSON('shipments.json');
  const movements = await readJSON('movements.json');

  const userShipments = shipments.filter(s => s.owner_email === user.email);

  const enriched = userShipments.map(s => {
    const shipmentMovements = movements
      .filter(m => m.shipment_id === s.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      ...s,
      movements: shipmentMovements
    };
  });

  res.json(enriched);
});

// ============ PAYMENT PROCESSING (Stripe) ============

// Create payment for quote
app.post('/api/quote/pay', userAuth, async (req, res) => {
  const { quote_id, amount } = req.body || {};

  if (!quote_id || !amount) {
    return res.status(400).json({ error: 'quote_id and amount are required' });
  }

  // In production, use Stripe API
  // For now, just store the payment intent
  const payments = await readJSON('payments.json');
  const payment = {
    id: `PAY${Date.now()}`,
    user_id: req.user.id,
    quote_id,
    amount,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  payments.push(payment);
  await writeJSON('payments.json', payments);

  res.json({ ok: true, payment_id: payment.id, status: 'pending' });
});

// ============ LIVE CHAT ENDPOINTS ============

// User: Send chat message
app.post('/api/chat/send', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const chats = await readJSON('chats.json');
  const chat = {
    id: `CHAT${Date.now()}`,
    name,
    email,
    message,
    replied: false,
    reply: '',
    created_at: new Date().toISOString()
  };

  chats.push(chat);
  await writeJSON('chats.json', chats);

  res.json({ ok: true, id: chat.id });
});

// Admin: Get all shipments
app.get('/admin/shipments', adminAuth, async (req, res) => {
  const shipments = await readJSON('shipments.json');
  res.json(shipments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// Admin: Get all chat messages
app.get('/admin/chats', adminAuth, async (req, res) => {
  const chats = await readJSON('chats.json');
  res.json(chats.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// Admin: Reply to chat message
app.post('/admin/chat/reply', adminAuth, async (req, res) => {
  const { chat_id, reply } = req.body || {};

  if (!chat_id || !reply) {
    return res.status(400).json({ error: 'chat_id and reply are required' });
  }

  const chats = await readJSON('chats.json');
  const chat = chats.find(c => c.id === chat_id);

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  chat.replied = true;
  chat.reply = reply;
  chat.replied_at = new Date().toISOString();

  await writeJSON('chats.json', chats);

  // Send reply email notification
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@careconnectcourier.com',
      to: chat.email,
      subject: 'We replied to your message | CareConnect Courier',
      html: `
        <h2>Message Reply</h2>
        <p>Hi ${chat.name},</p>
        <p><strong>Your Message:</strong></p>
        <p>${chat.message}</p>
        <p><strong>Our Reply:</strong></p>
        <p>${reply}</p>
        <br>
        <p>Best regards,<br>CareConnect Courier Team</p>
      `
    });
  } catch (err) {
    console.error('Failed to send reply email:', err);
  }

  res.json({ ok: true });
});

// Admin: Get all contact messages
app.get('/api/admin/messages', adminAuth, async (req, res) => {
  const messages = await readJSON('messages.json');
  res.json(messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// Admin: Delete shipment
app.delete('/admin/delete_shipment/:id', adminAuth, async (req, res) => {
  const shipmentId = req.params.id;

  if (!shipmentId) {
    return res.status(400).json({ error: 'Shipment ID is required' });
  }

  try {
    let shipments = await readJSON('shipments.json');
    const shipmentIndex = shipments.findIndex(s => s.id === shipmentId);

    if (shipmentIndex === -1) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const deleted = shipments.splice(shipmentIndex, 1)[0];
    await writeJSON('shipments.json', shipments);

    // Also delete associated movements
    let movements = await readJSON('movements.json');
    movements = movements.filter(m => m.shipment_id !== shipmentId);
    await writeJSON('movements.json', movements);

    res.json({ ok: true, deleted: deleted.tracking_code });
  } catch (err) {
    console.error('Delete shipment error:', err);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`CareConnectCourier server listening on http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or set PORT env variable.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

// Production safety checks
if (process.env.NODE_ENV === 'production') {
  if (ADMIN_TOKEN === 'demo-token-12345' || JWT_SECRET === 'jwt-secret-key-12345') {
    console.error('ERROR: Production requires ADMIN_TOKEN and JWT_SECRET to be set via environment variables. Aborting.');
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Fallback to frontend index (must be last) - serve index only for non-API GETs
app.get('*', (req, res) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/admin')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});
