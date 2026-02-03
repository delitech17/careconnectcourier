# 🔧 Fix: 401 Unauthorized Error on Render

## Problem
You were getting a **401 Unauthorized** error when accessing `/admin/shipments` on Render because:
1. Frontend was using raw tokens instead of JWT tokens
2. Backend expects JWT tokens exchanged via `/admin/login` endpoint
3. Environment variables might not be set correctly on Render

## ✅ Solution Applied

### What Was Changed
All frontend admin JavaScript files have been updated to use the **JWT authentication flow**:

**Files Updated:**
- `frontend/admin/js/admin-auth.js` - Login flow now exchanges token for JWT
- `frontend/admin/js/admin-dashboard.js` - Uses JWT token from localStorage
- `frontend/admin/js/admin-chats.js` - Uses JWT token
- `frontend/admin/js/admin-messages.js` - Uses JWT token
- `frontend/admin/js/admin-shipments-list.js` - Uses JWT token
- `frontend/admin/js/admin-shipments.js` - Uses JWT token
- `frontend/admin/js/admin-movements.js` - Uses JWT token

### How the Flow Works Now

```
1. User enters raw ADMIN_TOKEN on login page
   ↓
2. Frontend sends POST /admin/login with raw token
   ↓
3. Backend verifies token and returns JWT
   ↓
4. Frontend stores JWT in localStorage('adminJWT')
   ↓
5. All subsequent requests use JWT:
   Authorization: Bearer <JWT_TOKEN>
   ↓
6. Backend verifies JWT and grants access (200 OK)
```

## 🚀 Testing Steps

### Step 1: Deploy Your Changes
Push your code to GitHub:
```bash
git add .
git commit -m "Fix: Implement JWT authentication for admin panel"
git push
```

Render will automatically redeploy your application.

### Step 2: Test on Render

#### A. Access Admin Panel
1. Open `https://careconnectcourier.onrender.com/admin/index.html`
2. You should see the login form
3. Enter your `ADMIN_TOKEN` (the one from your Render environment variables)
4. Click "Access Admin Panel"
5. You should see: **✓ Access granted! Loading...**

#### B. Verify Token Exchange
Open browser Developer Tools (F12) and check Console:
```javascript
// This should output your JWT token (not the raw token)
localStorage.getItem('adminJWT')
```

#### C. Test Admin Pages
Navigate to:
- `https://careconnectcourier.onrender.com/admin/shipments-list.html` ✅ Should show shipments
- `https://careconnectcourier.onrender.com/admin/chats.html` ✅ Should show chats
- `https://careconnectcourier.onrender.com/admin/dashboard.html` ✅ Should show stats

#### D. Test API Call Directly
Use curl to test:
```bash
# Step 1: Get JWT token
curl -X POST -H "Content-Type: application/json" \
  -d '{"token":"YOUR_ADMIN_TOKEN_HERE"}' \
  https://careconnectcourier.onrender.com/admin/login

# Response should be:
# {"ok":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","expiresIn":"12h"}

# Step 2: Use JWT to access protected endpoint
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  https://careconnectcourier.onrender.com/admin/shipments

# Response should be shipments data (not 401)
```

## 📋 Troubleshooting

### Issue 1: Still Getting 401 Error

**Check these:**

1. **Verify ADMIN_TOKEN is set in Render:**
   - Go to Render Dashboard → Your Service → Environment
   - Check that `ADMIN_TOKEN` and `JWT_SECRET` are present
   - Both should be long random strings (NOT demo-token-12345 in production)

2. **Verify JWT_SECRET is set:**
   ```
   JWT_SECRET = <your-64-character-random-string>
   ```

3. **Check browser localStorage:**
   ```javascript
   // F12 Console
   localStorage.getItem('adminJWT')  // Should show a JWT token
   ```

4. **Check browser Network tab:**
   - Look at the `/admin/login` request
   - Verify the raw token is being sent correctly
   - Check if response contains `{"ok":true,"token":"..."}`

### Issue 2: Login Not Working

**Solution:**
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + Shift + R`
3. Go back to `/admin/index.html`
4. Try logging in again

### Issue 3: Token Expires

JWT tokens expire after 12 hours. If you see 401 after 12 hours:
1. Go back to `/admin/index.html`
2. Login again with your token
3. You'll get a fresh JWT

## 🔒 Security Notes

### Production Setup
Do NOT use `demo-token-12345` in production. Use generated tokens:

```bash
# Generate a secure ADMIN_TOKEN
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate a secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Set in Render Environment Variables
1. Render Dashboard → Your Service → Environment
2. Update:
   ```
   ADMIN_TOKEN = <your-new-secure-token>
   JWT_SECRET = <your-new-secure-secret>
   ```
3. Your service will redeploy automatically

## 📊 Authentication Flow Details

### Frontend (client-side)
```javascript
// admin-auth.js - Login
POST /admin/login
Body: { token: "ADMIN_TOKEN" }
Response: { ok: true, token: "JWT", expiresIn: "12h" }

// All subsequent requests
GET /admin/shipments
Header: { Authorization: "Bearer JWT" }
```

### Backend (server-side)
```javascript
// server.js - adminAuth middleware
1. Extract token from Authorization header
2. Try to verify as raw ADMIN_TOKEN (legacy compatibility)
3. If not, try to verify as JWT
4. Return 401 if neither works
```

## 🎯 Next Steps

1. ✅ Deploy changes to Render
2. ✅ Test login flow on production
3. ✅ Verify all admin pages load without 401
4. ✅ Update your token if needed
5. ✅ Document your ADMIN_TOKEN securely

## 📞 Still Having Issues?

### Enable Debug Logging
Set in Render Environment:
```
DEBUG_AUTH = true
```

Then check Render Logs for detailed authentication debug messages.

### Common Error Messages

**"HTTP 401: Unauthorized"**
- Raw token doesn't match ADMIN_TOKEN
- Check that token is entered correctly (case-sensitive)

**"Invalid token - access denied"**
- JWT verification failed
- JWT_SECRET might not match between login and verification

**"Failed to create token"**
- JWT_SECRET environment variable is not set
- Server error generating JWT

---

**Status:** ✅ 401 Fix Applied  
**Last Updated:** February 3, 2026  
**Environment:** Render Production
