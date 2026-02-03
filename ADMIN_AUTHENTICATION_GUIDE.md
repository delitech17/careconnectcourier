# 🔐 Admin Authentication Guide - Fix 401 Unauthorized

## 📋 Problem Analysis

You're getting a **401 Unauthorized** error when trying to access `/admin/shipments` because:

1. **No token in localStorage** - The admin token hasn't been saved yet
2. **Admin page requires authentication** - You must login first before accessing protected endpoints
3. **Token verification on backend** - Server checks if the token matches `ADMIN_TOKEN`

---

## ✅ Solution: Step-by-Step

### Step 1: Navigate to Admin Panel
1. Open your browser: `http://localhost:3000/admin/index.html`
2. You should see an authentication section:
   ```
   🔐 Admin Access Required
   Enter your admin token to access the dashboard.
   
   [Input field: "Enter admin token"]
   [Button: "Access Admin Panel"]
   ```

### Step 2: Enter the Default Admin Token
1. In the input field, enter: **`demo-token-12345`** (default)
2. Click the **"Access Admin Panel"** button
3. You should see a success message: ✓ Access granted! Loading...

### Step 3: Verify Token is Saved
In your browser console (F12), check:
```javascript
// Run in browser console
localStorage.getItem('adminToken')
// Should output: "demo-token-12345"
```

### Step 4: Access Admin Pages
Now you can visit:
- `http://localhost:3000/admin/index.html` - Dashboard
- `http://localhost:3000/admin/shipments-list.html` - View shipments
- `http://localhost:3000/admin/movements.html` - Track movements
- `http://localhost:3000/admin/chats.html` - Chat messages

---

## 🔍 How Authentication Works

### Frontend Flow (admin-auth.js)
```javascript
1. User enters token in login form
   ↓
2. Token stored in localStorage.setItem('adminToken', token)
   ↓
3. Token retrieved when needed: localStorage.getItem('adminToken')
   ↓
4. Token sent in request header: 'Authorization': 'Bearer ' + token
   ↓
5. Backend verifies token matches ADMIN_TOKEN
```

### Backend Flow (server.js)
```javascript
// Incoming request with Authorization header
GET /admin/shipments
Headers: { 'Authorization': 'Bearer demo-token-12345' }
   ↓
// adminAuth middleware
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  // Extract: 'demo-token-12345'
  
  if (token !== ADMIN_TOKEN) {
    // If tokens don't match → 401 Unauthorized
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();  // If tokens match → proceed
}
   ↓
// Route handler executes
GET /admin/shipments → returns shipment data
```

---

## 🛠️ Troubleshooting

### Issue 1: "401 Unauthorized" Still Appears

**Solution:**
1. Clear browser cache/localStorage:
   ```javascript
   localStorage.clear();
   ```

2. Reload the page: `Ctrl + Shift + R` (hard refresh)

3. Go back to `/admin/index.html` and login again

4. Check if token is saved:
   ```javascript
   localStorage.getItem('adminToken')  // Should not be null
   ```

### Issue 2: Token Not Saving

**Check the auth JavaScript:**
```javascript
// In admin-auth.js, around line 30
localStorage.setItem('adminToken', token);

// Verify it's being called
console.log('Token saved:', localStorage.getItem('adminToken'));
```

### Issue 3: Wrong Token Entered

**Solutions:**
- Default token: `demo-token-12345`
- Check capitalization (case-sensitive)
- No spaces before/after the token
- If using custom token, ensure it's set in environment

### Issue 4: Backend Not Recognizing Token

**Check server.js:**
```javascript
// Line ~15
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo-token-12345';

console.log('Expected token:', ADMIN_TOKEN);
```

**Debug incoming request:**
```javascript
// Add this to server.js temporarily
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  console.log('Received token:', token);        // Log what we got
  console.log('Expected token:', ADMIN_TOKEN);  // Log what we expect
  
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

---

## 📊 Request/Response Flow

### Successful Request
```
FRONTEND REQUEST:
GET /admin/shipments
Headers: {
  'Authorization': 'Bearer demo-token-12345'
}

↓ (Token matches)

BACKEND RESPONSE:
Status: 200 OK
Body: [
  {
    "id": "SHIP001",
    "tracking_code": "CC123456789",
    "owner_name": "John Doe",
    ...
  }
]
```

### Failed Request (401)
```
FRONTEND REQUEST:
GET /admin/shipments
Headers: {
  'Authorization': 'Bearer wrong-token'  ← Wrong token
}

↓ (Token doesn't match)

BACKEND RESPONSE:
Status: 401 Unauthorized
Body: {
  "error": "Unauthorized"
}
```

---

## 🔐 Changing the Admin Token

### Option 1: Change Default Token (Development)
Edit `node_server/server.js`:
```javascript
// Line ~15
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-new-token-here';
```

### Option 2: Use Environment Variable (Production)
Create `.env` file:
```
ADMIN_TOKEN=your-secure-token-here
```

### Option 3: Generate Secure Token
```bash
# Run in terminal/PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testing the Authentication

### Test 1: Browser Console
```javascript
// 1. Get current token
const token = localStorage.getItem('adminToken');
console.log('Token:', token);

// 2. Make a test request
fetch('http://localhost:3000/admin/shipments', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

### Test 2: Using curl (Terminal/PowerShell)
```bash
# Test with default token
curl -H "Authorization: Bearer demo-token-12345" \
  http://localhost:3000/admin/shipments
```

### Test 3: Using Postman
1. Open Postman
2. Create new GET request
3. URL: `http://localhost:3000/admin/shipments`
4. Headers tab → Add:
   - Key: `Authorization`
   - Value: `Bearer demo-token-12345`
5. Send request → Should get 200 OK with shipment data

---

## 📋 Admin Authentication Checklist

- [ ] Visited `/admin/index.html`
- [ ] Saw login form with token input
- [ ] Entered `demo-token-12345`
- [ ] Clicked "Access Admin Panel" button
- [ ] Saw success message
- [ ] Token appears in localStorage:
  ```javascript
  localStorage.getItem('adminToken') === 'demo-token-12345'
  ```
- [ ] Can access admin pages without 401 error
- [ ] Shipments load successfully
- [ ] Can view movements, chats, etc.

---

## 🔄 Token Lifecycle

### 1. Login
```
User enters token in form
↓
localStorage.setItem('adminToken', token)
↓
Auth section hidden
Admin panel shown
```

### 2. On Each Protected Request
```
Get token: localStorage.getItem('adminToken')
↓
Add to header: 'Authorization': 'Bearer ' + token
↓
Send to server
↓
Server verifies token
↓
If valid → Return data (200 OK)
If invalid → Return error (401 Unauthorized)
```

### 3. Logout
```
User clicks Logout button
↓
localStorage.removeItem('adminToken')
↓
Admin panel hidden
Auth section shown again
```

---

## 💾 Token Storage

### Where Token is Stored
- **Browser localStorage** - Persists across page refreshes
- **Not secure for sensitive data** - This is for demo purposes

### For Production
Use secure options:
- HTTP-only cookies (most secure)
- SessionStorage (session-only)
- Redux/Context (memory)
- IndexedDB (encrypted)

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token in localStorage | Login with token first |
| 401 Unauthorized | Wrong token | Use correct token |
| 401 Unauthorized | Token expired | Login again |
| Network error | Server not running | Start `npm start` |
| CORS error | Different port | Check server CORS config |
| 404 Not Found | Wrong endpoint | Use `/admin/shipments` |

---

## 🔐 Security Notes

### Development
- ✅ Using default token: `demo-token-12345`
- ✅ Token in localStorage is okay for development
- ✅ No HTTPS required for localhost

### Production (Render)
- ⚠️ **MUST** change the default token
- ⚠️ Use environment variables for tokens
- ⚠️ Enable HTTPS (Render provides it)
- ⚠️ Consider using secure HTTP-only cookies
- ⚠️ Implement token expiration

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| **Login Page** | `/admin/index.html` |
| **Default Token** | `demo-token-12345` |
| **Protected Endpoint** | `/admin/shipments` |
| **Header Format** | `Authorization: Bearer TOKEN` |
| **Token Storage** | localStorage |
| **Middleware** | adminAuth() |
| **Error Response** | 401 Unauthorized |

---

## ✨ Next Steps

1. **Login** - Go to `/admin/index.html` and enter token
2. **Verify** - Check localStorage has your token
3. **Access** - Visit `/admin/shipments-list.html`
4. **Test** - Create a shipment to test the flow
5. **Deploy** - When ready, change token for production

---

## 📞 Need More Help?

Check these files for reference:
- **Frontend Auth:** `frontend/admin/js/admin-auth.js`
- **Admin Shipments:** `frontend/admin/js/admin-shipments-list.js`
- **Backend Auth:** `node_server/server.js` (lines 107-115)

---

**Status:** Your authentication system is working correctly. 
Just login with the token to access the admin panel!

**Token:** `demo-token-12345`

**Ready to go!** 🚀
