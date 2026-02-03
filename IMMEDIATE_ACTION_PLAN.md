# 🎯 Action Plan: Fix Your 401 Error

## Your Current Situation ✅

| Item | Status | Details |
|------|--------|---------|
| Environment Variables | ✅ Correct | ADMIN_TOKEN & JWT_SECRET set |
| CORS Configuration | ✅ Correct | Your domain included |
| Backend Logic | ✅ Correct | /admin/login endpoint ready |
| Frontend Code | ✅ Updated | JWT flow implemented |
| Service Status | ? Unknown | Need to verify |

---

## 🚀 Action Steps (Do These Now)

### ✅ Step 1: Test Endpoint (5 minutes)

**Run this in PowerShell:**

```powershell
# Your actual ADMIN_TOKEN from Render
$token = "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"
$body = @{token=$token} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Output "Status Code: $($response.StatusCode)"
Write-Output "Response Body:"
Write-Output $response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Output:**
```
Status Code: 200
Response Body:
{
  "ok":  true,
  "token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn":  "12h"
}
```

**If you get 200:** ✅ **Proceed to Step 2**  
**If you get 401:** ❌ **Check Service Status (Step 4)**  
**If Connection Error:** ❌ **Service may be down (Step 4)**

---

### ✅ Step 2: Test Frontend Login (5 minutes)

1. Open browser and go to:
   ```
   https://careconnectcourier.onrender.com/admin/index.html
   ```

2. You should see login form with:
   - Input field for admin token
   - "Access Admin Panel" button

3. Copy and paste your token:
   ```
   92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545
   ```

4. Click "Access Admin Panel"

5. Expected behavior:
   - ⏳ "Verifying token..." message appears
   - ✓ "Access granted! Loading..." message
   - Admin dashboard should load

**If you see success message:** ✅ **Proceed to Step 3**  
**If you see error:** ❌ **Check browser console (F12) for error details**

---

### ✅ Step 3: Verify JWT Token & Access Admin Pages (5 minutes)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
   ```javascript
   localStorage.getItem('adminJWT')
   ```

4. Expected output:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiaWF0IjoxNzM4NTQzMjAwLCJleHAiOjE3Mzg2Mjk2MDB9.X5VhY1...
   ```

5. Token should start with `eyJ` and be very long

6. Now test accessing admin pages:
   - ✅ https://careconnectcourier.onrender.com/admin/shipments-list.html
   - ✅ https://careconnectcourier.onrender.com/admin/chats.html
   - ✅ https://careconnectcourier.onrender.com/admin/dashboard.html

**If all pages load without 401:** ✅ **SUCCESS! Your auth is working**  
**If you get 401 on pages:** ❌ **JWT might not be in header (check Network tab)**

---

### ✅ Step 4: If Testing Fails - Check Service Status

**Go to [Render Dashboard](https://dashboard.render.com):**

1. Click on service: `careconnect-courier`
2. Check **Status** section:
   - Should say: **Live** ✅
   - If it says "Building" or "Deploying" → Wait for it to finish
   - If it says error → Check logs

3. Check **Logs** tab:
   - Look for any error messages
   - Look for crash messages
   - Check if service started successfully

4. If service is down:
   - Click **Manual Deploy** → **Deploy latest commit**
   - Wait for deployment to complete
   - Then re-run Step 1

---

## 🧪 Alternative Testing Methods

### Using Node.js Script (Same folder)

```bash
# Navigate to project folder
cd C:\Users\user\careconnectcourier

# Run test script
node test-admin-login.js "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545" "https://careconnectcourier.onrender.com"
```

This will give you detailed feedback about what's happening.

### Using curl (in Git Bash or WSL)

```bash
curl -X POST https://careconnectcourier.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"token":"92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"}'
```

---

## 📋 Decision Tree

```
START
  ↓
Does /admin/login return 200?
  ├─ YES → Does frontend show "Access granted"?
  │        ├─ YES → Does localStorage have adminJWT?
  │        │        ├─ YES → ✅ SUCCESS! Auth is working
  │        │        └─ NO → Check admin-auth.js for issues
  │        └─ NO → Check browser console for errors
  └─ NO → Is service running?
          ├─ YES → Is token correct?
          │        ├─ YES → Regenerate tokens
          │        └─ NO → Copy exact token from Render
          └─ NO → Restart service or check Render logs
```

---

## 🚨 If You're Still Getting 401

### Check #1: Token Format
- No spaces before/after
- Exactly 64 hexadecimal characters
- All lowercase letters a-f and numbers 0-9
- Copied from Render Dashboard

### Check #2: Request Format
- Method: `POST`
- URL: `/admin/login`
- Body: `{"token":"YOUR_TOKEN"}`
- Header: `Content-Type: application/json`

### Check #3: Environment Variables
- Render Dashboard → Environment tab
- Verify ADMIN_TOKEN is 64 chars
- Verify JWT_SECRET is 64 chars
- Both should be different values

### Check #4: Render Logs
- Render Dashboard → Logs tab
- Search for "token" or "Unauthorized"
- Look for when your request was made
- Check for error messages

### Check #5: Service Status
- Render Dashboard → Overview tab
- Status should be "Live" (green)
- If not live, deployment failed
- Check deployment logs

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ `/admin/login` endpoint returns 200 with JWT
2. ✅ Frontend login form accepts your token
3. ✅ Browser shows "Access granted" message
4. ✅ localStorage contains `adminJWT` token
5. ✅ All admin pages load without 401 errors
6. ✅ Can view shipments, chats, movements
7. ✅ Can create new shipments and movements

---

## 📝 Important Commands Reference

```bash
# Test endpoint
curl -X POST https://careconnectcourier.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"token":"92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545"}'

# Check service logs
# Go to: https://dashboard.render.com → Service → Logs

# Generate new token if needed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test locally first
cd node_server
npm start
# Then test at http://localhost:3000/admin/login
```

---

## 📞 Quick Support

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Token doesn't match ADMIN_TOKEN |
| CORS Error | Domain not in ALLOWED_ORIGINS |
| Service Down | Check Render Dashboard status |
| JWT Generation Failed | JWT_SECRET might not be set |
| Frontend shows blank | Check browser console (F12) for errors |

---

## 🎯 Timeline

- **Step 1 (Test Endpoint):** 5 minutes
- **Step 2 (Frontend Login):** 5 minutes  
- **Step 3 (Verify JWT):** 5 minutes
- **Total Time:** ~15 minutes to confirm everything works

---

**Start with Step 1 now and report the results!**

Status: Ready to debug | Last Updated: February 3, 2026
