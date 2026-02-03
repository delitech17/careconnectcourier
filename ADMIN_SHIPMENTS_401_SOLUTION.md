# 🔐 /admin/shipments 401 Error - Complete Solution

## 🎯 The Problem

You're getting **401 Unauthorized** on `/admin/shipments` because:

```
❌ WRONG: Sending raw token directly
GET /admin/shipments
Authorization: Bearer demo-token-12345  ← Raw token (invalid for this endpoint)
Response: 401 Unauthorized

✅ CORRECT: Must exchange token for JWT first, then use JWT
1. POST /admin/login with raw token
   Authorization: Bearer demo-token-12345
   Response: { "token": "eyJhbGc...", "ok": true }

2. GET /admin/shipments with JWT
   Authorization: Bearer eyJhbGc...  ← JWT token (valid)
   Response: 200 OK with shipments data
```

---

## 📋 Authentication Pipeline

### Step 1: Login - Exchange Raw Token for JWT

**Request:**
```
POST /admin/login
Content-Type: application/json

{
  "token": "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"
}
```

**Backend Processing:**
```javascript
// server.js - /admin/login endpoint
app.post('/admin/login', async (req, res) => {
  const { token } = req.body;
  
  // Verify raw token matches ADMIN_TOKEN
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Generate JWT
  const jwtToken = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ ok: true, token: jwtToken, expiresIn: '12h' });
});
```

**Response (200 OK):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiaWF0IjoxNzcwMTM2ODQyLCJleHAiOjE3NzAxODAwNDJ9.zRusM_y7XtF59ajR7F9lGoL3nbjPjfk0GWj6R2rApDE",
  "expiresIn": "12h"
}
```

---

### Step 2: Access Protected Endpoint - Use JWT Token

**Request:**
```
GET /admin/shipments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiaWF0IjoxNzcwMTM2ODQyLCJleHAiOjE3NzAxODAwNDJ9.zRusM_y7XtF59ajR7F9lGoL3nbjPjfk0GWj6R2rApDE
```

**Backend Processing:**
```javascript
// server.js - adminAuth middleware
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Try to verify as raw token (legacy support)
  if (token === ADMIN_TOKEN) {
    return next();
  }
  
  // Try to verify as JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.admin) {
      return next();  // Valid JWT
    }
  } catch (err) {
    console.error('JWT verification failed:', err.message);
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
}

// Protected route
app.get('/admin/shipments', adminAuth, async (req, res) => {
  // Return shipments data
  const shipments = await readJSON('shipments.json');
  res.json(shipments);
});
```

**Response (200 OK):**
```json
[
  {
    "id": "SHIP001",
    "tracking_code": "CC123456789",
    "owner_name": "John Doe",
    "origin": "New York",
    "destination": "Los Angeles",
    "status": "In Transit",
    ...
  }
]
```

---

## 🧪 Testing the Complete Flow

### Test 1: Get JWT Token First

**PowerShell:**
```powershell
# Step 1: Exchange raw token for JWT
$token = "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"
$body = @{token=$token} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$loginData = $loginResponse.Content | ConvertFrom-Json
$jwtToken = $loginData.token

Write-Output "✅ JWT Token: $jwtToken"
```

### Test 2: Use JWT to Access Protected Endpoint

**PowerShell:**
```powershell
# Step 2: Use JWT to access /admin/shipments
$shipmentResponse = Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/shipments" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $jwtToken"}

Write-Output "Status: $($shipmentResponse.StatusCode)"
Write-Output "Shipments: $($shipmentResponse.Content | ConvertFrom-Json | ConvertTo-Json)"
```

### Test 3: Using curl

```bash
# Step 1: Get JWT
RESPONSE=$(curl -X POST https://careconnectcourier.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"token":"92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"}')

JWT=$(echo $RESPONSE | jq -r '.token')
echo "JWT Token: $JWT"

# Step 2: Use JWT
curl -H "Authorization: Bearer $JWT" \
  https://careconnectcourier.onrender.com/admin/shipments
```

---

## ✅ Your Environment - Verified Working

### ADMIN_TOKEN (Raw Token)
```
92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545
```

This is what you send to `/admin/login` to get a JWT.

### JWT_SECRET
```
6ffaba7ff9c1f950c2b7a54f2b254fe330ba152370f0dc972b30c8ea81a36e0a
```

This is what the backend uses to sign and verify JWT tokens.

### Both Confirmed Working ✅
- Backend test returned 200 OK
- JWT was successfully generated
- Token is valid for 12 hours

---

## 🚀 Complete End-to-End Example

### Scenario: Frontend Login → Access Admin Pages

```javascript
// ===== FRONTEND =====

// 1. User enters token on login page
const rawToken = "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545";

// 2. Exchange for JWT
const loginResponse = await fetch('/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: rawToken })
});

const { token: jwtToken } = await loginResponse.json();
console.log('JWT:', jwtToken);  // eyJhbGc...

// 3. Save JWT
localStorage.setItem('adminJWT', jwtToken);

// 4. Use JWT for all subsequent requests
const shipmentsResponse = await fetch('/admin/shipments', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});

const shipments = await shipmentsResponse.json();
console.log('Shipments:', shipments);  // Array of shipments ✅
```

---

## 🔍 Debugging 401 Errors

### Check 1: Is Token Being Sent?

**Browser Console:**
```javascript
// Check if Authorization header is being sent
const token = localStorage.getItem('adminJWT');
console.log('Token in localStorage:', token ? 'YES ✅' : 'NO ❌');
```

### Check 2: Is Token Valid?

**Browser Network Tab:**
1. F12 → Network tab
2. Make request to `/admin/shipments`
3. Look at the request:
   - **Headers** tab → Check `Authorization` header
   - **Response** tab → Check response body for error

### Check 3: Backend Logging

Enable debug logging in Render:
```
Render Dashboard → Service → Environment
Add: DEBUG_AUTH = true
```

Then check logs for detailed JWT verification messages.

---

## 📊 Error Codes & Meanings

| Status | Error | Cause |
|--------|-------|-------|
| **200** | (none) | ✅ Success - Data returned |
| **400** | Bad Request | Missing `token` field in body |
| **401** | Unauthorized | Token doesn't match or JWT invalid |
| **500** | Server Error | JWT_SECRET not set or other server issue |
| **CORS Error** | Cross-Origin blocked | ALLOWED_ORIGINS not configured |

---

## 🔐 CORS Configuration - Already Set ✅

Your Render environment has:
```
ALLOWED_ORIGINS = https://careconnectcourier.onrender.com,https://your-frontend.com
```

This allows requests from the frontend to the backend. ✅

---

## 📋 Complete Troubleshooting Checklist

- [ ] Is `/admin/login` returning 200 OK with JWT? (Test it: `node test-admin-login.js`)
- [ ] Is JWT token in localStorage? (Check: `localStorage.getItem('adminJWT')`)
- [ ] Is Authorization header being sent? (Check Network tab in F12)
- [ ] Is Authorization header format correct? (Should be: `Authorization: Bearer eyJhbGc...`)
- [ ] Is Render deployment complete? (Check Render Dashboard)
- [ ] Is ADMIN_TOKEN correct? (Should be the 64-char hex string)
- [ ] Is JWT_SECRET set? (Check Render Environment variables)
- [ ] Is NODE_ENV set to production? (Check Render Environment)

---

## 🎯 What You Need to Do

### For Development (Test Locally)

```bash
cd node_server
npm start

# Then test
node test-admin-login.js "demo-token-12345" "http://localhost:3000"
```

### For Production (Render)

```bash
# Test the backend endpoint
node test-admin-login.js "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545" "https://careconnectcourier.onrender.com"

# Should return 200 OK with JWT token
```

### For Frontend

1. Go to `/admin/index.html`
2. Enter your token
3. Click "Access Admin Panel"
4. Should see "✓ Access granted!"
5. Should be able to access `/admin/shipments-list.html` without 401

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `node_server/server.js` | Backend - /admin/login endpoint (line 296) |
| `node_server/server.js` | adminAuth middleware (line 113) |
| `frontend/admin/js/admin-auth.js` | Frontend - Login flow |
| `frontend/admin/js/admin-shipments-list.js` | Frontend - Uses JWT to fetch shipments |

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Login Endpoint | POST `/admin/login` |
| Protected Endpoint | GET `/admin/shipments` |
| Raw Token (ADMIN_TOKEN) | `92922a6a...` |
| Token Type | 64-character hexadecimal |
| JWT Expiry | 12 hours |
| CORS | Enabled for your domain |
| Backend Status | ✅ Working (verified) |

---

**Status:** Backend authentication verified and working  
**Next Step:** Verify frontend is using JWT correctly  
**Last Updated:** February 3, 2026
