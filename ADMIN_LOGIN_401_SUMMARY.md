# 🔐 Admin Login 401 - Investigation & Solutions

## 🎯 Problem Summary

Getting **401 Unauthorized** when trying to log in at:
```
POST https://careconnectcourier.onrender.com/admin/login
```

With request body:
```json
{
  "token": "YOUR_ADMIN_TOKEN"
}
```

---

## ✅ What the Backend Expects

Your backend `/admin/login` endpoint works like this:

```javascript
app.post('/admin/login', async (req, res) => {
  const { token } = req.body;
  
  // ❌ If token field is missing → 400 Bad Request
  if (!token) return res.status(400).json({ error: 'token is required' });
  
  // ❌ If token doesn't match ADMIN_TOKEN → 401 Unauthorized
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  
  // ✅ If token matches → Generate JWT and return
  const jwtToken = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ ok: true, token: jwtToken, expiresIn: '12h' });
});
```

---

## 🔍 Why You're Getting 401

The token you're sending **doesn't match** the `ADMIN_TOKEN` environment variable on Render.

### Possible Reasons:
1. ❌ ADMIN_TOKEN is not set in Render environment
2. ❌ Token is set incorrectly (typo, spaces, etc.)
3. ❌ Using default token `demo-token-12345` (not for production)
4. ❌ Token changed but frontend still using old one
5. ❌ Copy-paste error (spaces, special chars)

---

## 🚀 Quick Fix Checklist

### Step 1: Verify Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service: `careconnect-courier`
3. Go to **Environment** tab
4. Check these variables exist:
   - ✅ `ADMIN_TOKEN` → Should be 64+ character string
   - ✅ `JWT_SECRET` → Should be 64+ character string
   - ✅ `NODE_ENV` → Should be `production`

**If missing:**
- Generate new tokens:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Add to Render Environment
- Render will redeploy automatically

### Step 2: Test the Endpoint

**Option A: Using PowerShell**
```powershell
# Copy your ADMIN_TOKEN from Render environment
$token = "your-token-from-render"
$body = @{token=$token} | ConvertTo-Json

Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Option B: Using Node.js Script**
```bash
node test-admin-login.js "your-token-here" https://careconnectcourier.onrender.com
```

**Option C: Using curl**
```bash
curl -X POST https://careconnectcourier.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'
```

### Step 3: Verify Response

**Success (200 OK):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "12h"
}
```

**Failure (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```
→ Token doesn't match ADMIN_TOKEN on server

### Step 4: Check CORS Configuration

The backend has CORS enabled, but verify `ALLOWED_ORIGINS` includes your domain:

In Render Environment, check:
```
ALLOWED_ORIGINS=https://careconnectcourier.onrender.com
```

---

## 🧪 Testing Priority

### Priority 1: Test Backend Directly
```bash
# Use curl or node test script to test the endpoint directly
# This bypasses any frontend issues
node test-admin-login.js "your-token" https://careconnectcourier.onrender.com
```

### Priority 2: Verify Environment Variables
Check Render Dashboard that ADMIN_TOKEN and JWT_SECRET are set.

### Priority 3: Check Render Logs
```
Render Dashboard → Service → Logs tab
```

Look for any error messages, especially around JWT signing.

### Priority 4: Test Locally First
Before testing on Render:
```bash
cd node_server
npm install
npm start
# Then test at http://localhost:3000
```

---

## 📋 Request Requirements

Your login request **MUST** have:

| Requirement | Value | Example |
|-------------|-------|---------|
| **Method** | POST | `POST /admin/login` |
| **URL** | `/admin/login` | `https://careconnectcourier.onrender.com/admin/login` |
| **Content-Type** | application/json | `"Content-Type": "application/json"` |
| **Body** | `{token: "..."}` | `{"token":"your_token"}` |
| **Token Value** | Must match ADMIN_TOKEN | Exact match, case-sensitive |

---

## 🔐 Security Checklist

- [ ] ADMIN_TOKEN is NOT `demo-token-12345` in production
- [ ] ADMIN_TOKEN is a long random string (64+ characters)
- [ ] JWT_SECRET is different from ADMIN_TOKEN
- [ ] Both tokens stored securely in Render environment
- [ ] HTTPS is used (Render provides this)
- [ ] CORS is configured for your domain
- [ ] Tokens are never committed to Git

---

## 📚 Documentation Files

I've created these files to help:

1. **[FIX_401_RENDER_DEPLOYMENT.md](FIX_401_RENDER_DEPLOYMENT.md)**
   - Complete JWT authentication implementation
   - Frontend changes made
   - Testing instructions

2. **[DEBUG_ADMIN_LOGIN_401.md](DEBUG_ADMIN_LOGIN_401.md)**
   - Detailed troubleshooting guide
   - Response code explanations
   - Step-by-step debugging
   - Environment variable verification

3. **test-admin-login.js**
   - Quick test script
   - Run: `node test-admin-login.js <token> <url>`
   - Provides detailed feedback

---

## 🎯 Next Steps

### Immediate Actions:
1. ✅ Verify ADMIN_TOKEN is set in Render Environment
2. ✅ Copy exact value of ADMIN_TOKEN
3. ✅ Run test: `node test-admin-login.js "TOKEN" https://careconnectcourier.onrender.com`
4. ✅ Check response status

### If 401 Error Persists:
1. ✅ Check Render Logs for error messages
2. ✅ Verify JWT_SECRET is also set
3. ✅ Regenerate both tokens if needed
4. ✅ Redeploy service

### If All Tests Pass:
1. ✅ Test frontend login at `/admin/index.html`
2. ✅ Verify JWT token is stored in localStorage
3. ✅ Access admin pages without 401 errors

---

## 📞 Still Need Help?

### Check These Resources:
- **Render Status:** https://status.render.com
- **Render Docs:** https://render.com/docs
- **Express Docs:** https://expressjs.com/
- **JWT Docs:** https://jwt.io/

### Debug Information to Collect:
1. Render Logs (from Logs tab)
2. Response status and body from test request
3. Request headers being sent
4. Environment variables (ADMIN_TOKEN, JWT_SECRET values masked)

---

**Status:** 🔍 Investigating 401 login error  
**Last Updated:** February 3, 2026  
**Environment:** Render Production
