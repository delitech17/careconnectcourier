# 🔍 Debug: 401 Error on `/admin/login` Endpoint

## Problem
Getting **401 Unauthorized** when trying to log in at `https://careconnectcourier.onrender.com/admin/login`

---

## ✅ Quick Checklist

- [ ] Render service is running (check status)
- [ ] `ADMIN_TOKEN` environment variable is set on Render
- [ ] `JWT_SECRET` environment variable is set on Render
- [ ] Request body contains `{ token: "YOUR_TOKEN" }`
- [ ] Content-Type header is `application/json`
- [ ] Token value matches exactly (case-sensitive, no spaces)

---

## 🔧 The `/admin/login` Endpoint

### Expected Request Format

```
POST /admin/login
Content-Type: application/json

{
  "token": "YOUR_ADMIN_TOKEN_HERE"
}
```

### Expected Response (Success - 200)

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "12h"
}
```

### Error Response (401)

```json
{
  "error": "Unauthorized"
}
```

This means the token you sent doesn't match `ADMIN_TOKEN`.

### Error Response (400)

```json
{
  "error": "token is required"
}
```

This means the request body doesn't contain a `token` field.

---

## 🧪 Testing Steps

### Step 1: Verify Render Service is Running

**Option A: Using Browser**
1. Go to `https://careconnectcourier.onrender.com/`
2. You should see the homepage
3. If you get a connection error, the service is down

**Option B: Check Render Dashboard**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `careconnect-courier` service
3. Check the status - should say "Live"
4. Check recent deployments - look for errors

### Step 2: Test Login Endpoint with curl

**Option A: PowerShell (Windows)**

```powershell
# Replace YOUR_ADMIN_TOKEN with your actual token from Render environment
$token = "YOUR_ADMIN_TOKEN"
$body = @{
    token = $token
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected Output (Success):**
```
StatusCode        : 200
StatusDescription : OK
Content           : {"ok":true,"token":"eyJhbGc...","expiresIn":"12h"}
```

**Expected Output (401 Error):**
```
StatusCode        : 401
StatusDescription : Unauthorized
Content           : {"error":"Unauthorized"}
```

**Option B: curl (Git Bash or WSL)**

```bash
# Test with token from environment variable
ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"

curl -X POST https://careconnectcourier.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$ADMIN_TOKEN\"}"
```

**Option C: Using Postman**
1. Open Postman
2. Create new POST request
3. URL: `https://careconnectcourier.onrender.com/admin/login`
4. Body tab → Raw → JSON
5. Paste:
   ```json
   {
     "token": "YOUR_ADMIN_TOKEN_HERE"
   }
   ```
6. Headers tab → Check:
   - Content-Type: application/json
7. Click Send
8. Check response status and body

---

## 🔍 Troubleshooting by Response Code

### 401 Unauthorized - Token Mismatch

**Cause:** The token you sent doesn't match `ADMIN_TOKEN` on the server.

**Checks:**
1. ✅ Verify token in Render Environment Variables
   - Render Dashboard → Service → Environment
   - Find `ADMIN_TOKEN` variable
   - Copy the exact value

2. ✅ Check for whitespace
   - No spaces before/after token
   - No newlines

3. ✅ Verify token is set
   - Don't use the default `demo-token-12345` on production
   - Should be a 64-character random string

4. ✅ Case sensitivity
   - Tokens are case-sensitive
   - Copy exactly as shown

**Solution:**
```powershell
# 1. Get the exact token from Render
$token = "paste-exact-token-from-render"

# 2. Test with this exact token
Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{token=$token} | ConvertTo-Json)
```

### 400 Bad Request - Missing Token

**Cause:** Request body doesn't contain `token` field.

**Checks:**
1. ✅ Request body format is correct:
   ```json
   {
     "token": "YOUR_TOKEN"
   }
   ```

2. ✅ Content-Type header is `application/json`

3. ✅ JSON is valid (no trailing commas, quotes matched)

**Solution:**
```powershell
# Correct format
$body = @{
    token = "YOUR_TOKEN"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### 500 Internal Server Error - JWT Generation Failed

**Cause:** Server can't generate JWT token.

**Checks:**
1. ✅ `JWT_SECRET` is set in Render Environment
   - Render Dashboard → Service → Environment
   - Look for `JWT_SECRET` variable
   - Should be present and non-empty

2. ✅ JWT_SECRET is different from ADMIN_TOKEN
   - Both should be different values

3. ✅ Check Render logs for error details
   - Render Dashboard → Service → Logs tab
   - Look for error messages

**Solution:**
If JWT_SECRET is missing:
1. Generate new JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add to Render Environment Variables
3. Render will redeploy automatically

### CORS Error - Cross-Origin Request Blocked

**Error in Browser Console:**
```
Access to XMLHttpRequest from origin 'https://careconnectcourier.onrender.com' 
has been blocked by CORS policy
```

**Cause:** CORS not configured for your origin.

**Checks:**
1. ✅ `ALLOWED_ORIGINS` includes your domain
   - Render Dashboard → Environment
   - Look for `ALLOWED_ORIGINS`
   - Should include `https://careconnectcourier.onrender.com`

2. ✅ If using frontend on same domain
   - Should work automatically (same-origin requests)

**Solution:**
Set in Render Environment:
```
ALLOWED_ORIGINS=https://careconnectcourier.onrender.com,http://localhost:3000
```

---

## 📊 Request/Response Flow Diagram

### Success Flow (200 OK)

```
┌─────────────────────────────────────┐
│ Frontend Request                    │
├─────────────────────────────────────┤
│ POST /admin/login                   │
│ Content-Type: application/json      │
│ Body: { token: "ABC123..." }        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Backend Validation                  │
├─────────────────────────────────────┤
│ 1. Extract token from body          │
│ 2. Check if token === ADMIN_TOKEN   │
│ 3. Generate JWT with sign()         │
│ 4. Return JWT                       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Success Response (200)              │
├─────────────────────────────────────┤
│ {                                   │
│   "ok": true,                       │
│   "token": "eyJhbGc...",            │
│   "expiresIn": "12h"                │
│ }                                   │
└─────────────────────────────────────┘
```

### Error Flow (401 Unauthorized)

```
┌─────────────────────────────────────┐
│ Frontend Request                    │
├─────────────────────────────────────┤
│ POST /admin/login                   │
│ Body: { token: "WRONG_TOKEN" }      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Backend Validation                  │
├─────────────────────────────────────┤
│ 1. Extract token: "WRONG_TOKEN"     │
│ 2. Check: "WRONG_TOKEN" === "ABC123"|
│ 3. Result: FALSE ❌                 │
│ 4. Return 401 error                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Error Response (401)                │
├─────────────────────────────────────┤
│ {                                   │
│   "error": "Unauthorized"           │
│ }                                   │
└─────────────────────────────────────┘
```

---

## 🔐 Environment Variables Check

### Required Environment Variables on Render

| Variable | Example Value | Where to Set |
|----------|---------------|--------------|
| `ADMIN_TOKEN` | `a1b2c3d4e5...` (64 chars) | Render Dashboard → Environment |
| `JWT_SECRET` | `x9y8z7w6v5...` (64 chars) | Render Dashboard → Environment |
| `NODE_ENV` | `production` | Render Dashboard → Environment |
| `APP_URL` | `https://careconnectcourier.onrender.com` | Render Dashboard → Environment |
| `ALLOWED_ORIGINS` | `https://careconnectcourier.onrender.com` | Render Dashboard → Environment |

### How to Verify on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service: `careconnect-courier`
3. Go to **Environment** tab
4. Check all variables are present
5. Values should NOT be visible (security masked)

### Generate New Tokens

```bash
# Generate ADMIN_TOKEN (64 hex characters)
node -e "console.log('ADMIN_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET (64 hex characters)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testing Locally First

If you want to test locally before Render:

```bash
cd node_server
npm install
npm start
```

Then test the login endpoint:

```powershell
# Set token to default
$token = "demo-token-12345"

Invoke-WebRequest -Uri "http://localhost:3000/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{token=$token} | ConvertTo-Json)
```

**Expected Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "12h"
}
```

---

## 📝 Step-by-Step Debug Process

### 1. Verify Render Service Status
```powershell
# Check if service is up
Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/"
```
✅ Should return HTML content (status 200)
❌ If connection error → Service is down

### 2. Check Environment Variables
- Render Dashboard → Service → Environment tab
- Verify `ADMIN_TOKEN` is set
- Verify `JWT_SECRET` is set
- Copy exact value of `ADMIN_TOKEN`

### 3. Test Login Endpoint
```powershell
$token = "PASTE_EXACT_TOKEN_HERE"
$body = @{token=$token} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Output "Status: $($response.StatusCode)"
Write-Output "Body: $($response.Content)"
```

### 4. Interpret Response
- **Status 200** → Success! You got a JWT token
- **Status 401** → Token doesn't match ADMIN_TOKEN
- **Status 400** → Request format is wrong
- **Status 500** → Server error (check logs)
- **Connection Error** → Service is down

### 5. Check Render Logs
- Render Dashboard → Service → Logs tab
- Look for any error messages
- Check timestamps match your request

---

## 🔗 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 after login | Verify ADMIN_TOKEN in Render environment |
| CORS error | Add domain to ALLOWED_ORIGINS |
| 500 error | Check JWT_SECRET is set in environment |
| Service not responding | Check if service is running on Render |
| Token not working | Make sure it's copied exactly (case-sensitive) |
| JSON parse error | Check Content-Type header is application/json |

---

## 📞 Render Support Info

If the service is down:
1. Check [Render Status Page](https://status.render.com)
2. Check Render Dashboard for deployment errors
3. Review recent deployments in service logs
4. Restart service: Click "Manual Deploy" → "Deploy latest commit"

---

## ✅ Next Steps

1. ✅ Verify ADMIN_TOKEN and JWT_SECRET are set on Render
2. ✅ Test `/admin/login` endpoint with curl/Postman
3. ✅ Check response status and error message
4. ✅ Review Render logs for details
5. ✅ If needed, regenerate tokens and redeploy

---

**Last Updated:** February 3, 2026  
**Environment:** Render Production  
**Status:** Debugging 401 login issue
