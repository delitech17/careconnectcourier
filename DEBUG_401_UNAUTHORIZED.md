# 🔍 Debug 401 Unauthorized - Visual Guide

## Problem Flow Diagram

```
❌ CURRENT FLOW (Getting 401)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser Request
    ↓
GET /admin/shipments
    ↓
Headers: { 'Authorization': 'Bearer undefined' }
  (Token is null from localStorage)
    ↓
Server Middleware: adminAuth()
    ↓
token !== ADMIN_TOKEN
    ↓
❌ 401 Unauthorized Response
    ↓
Browser Console Error:
"Error: HTTP 401: Unauthorized"


✅ CORRECT FLOW (After Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visit /admin/index.html
    ↓
User sees login form
    ↓
User enters token:
Input: "demo-token-12345"
    ↓
Click "Access Admin Panel" button
    ↓
localStorage.setItem('adminToken', 'demo-token-12345')
    ↓
✅ Token saved in browser
    ↓
Visit /admin/shipments-list.html
    ↓
Browser Request
    ↓
GET /admin/shipments
    ↓
Headers: { 'Authorization': 'Bearer demo-token-12345' }
    ↓
Server Middleware: adminAuth()
    ↓
token === ADMIN_TOKEN ✓
    ↓
✅ 200 OK Response
    ↓
Shipment data loaded successfully
```

---

## Step-by-Step Visual Guide

### Step 1: Current State (Unauthorized)

```
┌─────────────────────────────────────────┐
│  http://localhost:3000/admin/...        │
│                                         │
│  Browser                                │
│  ├─ localStorage                        │
│  │  └─ adminToken: undefined  ❌       │
│  │  (Not set yet)                       │
│  │                                      │
│  └─ Network Request                     │
│     ├─ URL: /admin/shipments            │
│     ├─ Headers:                         │
│     │  └─ Authorization: undefined ❌   │
│     │                                   │
│     Server Response:                    │
│     ├─ Status: 401 ❌                   │
│     └─ Body: { error: "Unauthorized" }  │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: Login Page

```
┌─────────────────────────────────────────┐
│  http://localhost:3000/admin/index.html │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔐 Admin Access Required        │   │
│  │                                 │   │
│  │ Enter your admin token:         │   │
│  │ [__________________________]     │   │
│  │  demo-token-12345              │   │
│  │                                 │   │
│  │ [Access Admin Panel]            │   │
│  │                                 │   │
│  │ ✓ Access granted! Loading...   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: After Login (Token Saved)

```
┌─────────────────────────────────────────┐
│  http://localhost:3000/admin/...        │
│                                         │
│  Browser                                │
│  ├─ localStorage                        │
│  │  └─ adminToken: "demo-token-12345" ✅
│  │  (Token is now saved)                │
│  │                                      │
│  └─ Network Request                     │
│     ├─ URL: /admin/shipments            │
│     ├─ Headers:                         │
│     │  └─ Authorization:                │
│     │     "Bearer demo-token-12345" ✅ │
│     │                                   │
│     Server Response:                    │
│     ├─ Status: 200 ✅                   │
│     └─ Body: [{ shipment data }...]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Token Verification Process

```
┌──────────────────────────────────────────────┐
│ REQUEST WITH TOKEN                           │
├──────────────────────────────────────────────┤
│                                              │
│ Frontend:                                    │
│ const token = localStorage.getItem(...)     │
│ // Result: "demo-token-12345"               │
│                                              │
│ Request Header:                              │
│ Authorization: Bearer demo-token-12345      │
│                                              │
└──────────────────────────────────────────────┘
                   ↓↓↓
┌──────────────────────────────────────────────┐
│ BACKEND VERIFICATION                         │
├──────────────────────────────────────────────┤
│                                              │
│ Extract token from header:                   │
│ req.headers['authorization']                │
│   .replace('Bearer ', '')                   │
│                                              │
│ Result: "demo-token-12345"                  │
│                                              │
│ Compare with environment:                    │
│ ADMIN_TOKEN = "demo-token-12345"            │
│                                              │
│ Verification:                                │
│ if (token === ADMIN_TOKEN) ✅               │
│   Allow access → next()                     │
│ else ❌                                     │
│   Return 401 error                          │
│                                              │
└──────────────────────────────────────────────┘
                   ↓↓↓
┌──────────────────────────────────────────────┐
│ RESPONSE                                     │
├──────────────────────────────────────────────┤
│ Status 200 OK                                │
│ Body: [shipment data...]                    │
└──────────────────────────────────────────────┘
```

---

## Browser DevTools - Check Token

### Console Tab

```javascript
// Check if token is saved
localStorage.getItem('adminToken')
// Output: "demo-token-12345" ✓
// or: null ❌ (means not logged in)

// Check all localStorage items
localStorage
// Output:
// {
//   adminToken: "demo-token-12345",
//   length: 1
// }

// Clear token if needed
localStorage.removeItem('adminToken')

// Clear all storage
localStorage.clear()
```

### Network Tab

```
Request Headers:
┌──────────────────────────────────────┐
│ GET /admin/shipments HTTP/1.1       │
│ Host: localhost:3000                │
│ Authorization: Bearer demo-token... │  ← Check this!
│ Content-Type: application/json      │
└──────────────────────────────────────┘

Response Headers:
┌──────────────────────────────────────┐
│ HTTP/1.1 200 OK                     │  ← Should be 200
│ Content-Type: application/json      │
│ Content-Length: 1234                │
└──────────────────────────────────────┘

Response Body:
┌──────────────────────────────────────┐
│ [                                   │
│   {                                 │
│     "id": "SHIP001",               │
│     "tracking_code": "CC123...",   │
│     ...                            │
│   }                                │
│ ]                                  │
└──────────────────────────────────────┘
```

---

## Common Issues Visual

### Issue 1: No Token in localStorage

```
Browser
├─ localStorage
│  └─ ❌ adminToken: null (not set)
│
Request
├─ Headers
│  └─ Authorization: undefined ❌
│
Response
├─ Status: 401 ❌
└─ Message: "Unauthorized"

FIX:
1. Go to /admin/index.html
2. Enter: demo-token-12345
3. Click: Access Admin Panel
4. Now adminToken should be set ✓
```

### Issue 2: Wrong Token

```
localStorage
├─ adminToken: "wrong-token-123" ❌

Request
├─ Headers
│  └─ Authorization: Bearer wrong-token-123

Server Comparison
├─ Received token: "wrong-token-123" ❌
├─ Expected token: "demo-token-12345" ✓
└─ Result: Not equal → 401 error

FIX:
1. Clear localStorage: localStorage.clear()
2. Login with correct token: demo-token-12345
3. Verify: localStorage.getItem('adminToken')
```

### Issue 3: Token Present But Still 401

```
Possible Causes:
├─ ❌ Token case mismatch
│  └─ "DEMO-TOKEN" vs "demo-token"
│
├─ ❌ Extra spaces
│  └─ "demo-token-12345 " (extra space at end)
│
├─ ❌ Server using different token
│  └─ ADMIN_TOKEN env var set to different value
│
├─ ❌ Browser cache issue
│  └─ Stale data being used

FIXES:
1. Check case: localStorage.getItem('adminToken')
2. Trim spaces: token.trim()
3. Check server: console.log(ADMIN_TOKEN) in server.js
4. Clear cache: Ctrl+Shift+Delete (all-site data)
5. Hard refresh: Ctrl+Shift+R
```

---

## Debugging Checklist

```
┌─ 401 Error Troubleshooting
│
├─ Step 1: Check if logged in
│  └─ localStorage.getItem('adminToken') !== null?
│     ✓ Yes → Go to Step 2
│     ✗ No → Login at /admin/index.html
│
├─ Step 2: Check token format
│  └─ Token looks like: "demo-token-12345"?
│     ✓ Yes → Go to Step 3
│     ✗ No → Re-login with correct token
│
├─ Step 3: Check network request
│  └─ DevTools Network tab → Look at request headers
│     ✓ Authorization: Bearer demo-token-12345 → Go to Step 4
│     ✗ Missing or wrong → Check JS code
│
├─ Step 4: Check server
│  └─ Server logs show token?
│     ✓ Yes → Go to Step 5
│     ✗ No → Check server is running
│
├─ Step 5: Token verification
│  └─ Tokens match on server?
│     ✓ Yes → Should get 200 response ✓
│     ✗ No → Change token or update server
│
└─ ✓ RESOLVED - Should be working now!
```

---

## Quick Fix Flowchart

```
Got 401 Error?
     │
     ├─ Are you logged in?
     │  ├─ YES → Check token in localStorage
     │  │        Are they the same?
     │  │        ├─ YES → Check server logs
     │  │        │        Is token matching?
     │  │        │        ├─ YES → Should work!
     │  │        │        └─ NO → Change env var
     │  │        └─ NO → Copy exact token
     │  │
     │  └─ NO → Go to /admin/index.html
     │          Enter: demo-token-12345
     │          Click Access
     │          Then try again ✓
```

---

## Testing the Fix

### Manual Test

```javascript
// 1. Open DevTools Console (F12)

// 2. Check if logged in
localStorage.getItem('adminToken')
// Expected: "demo-token-12345"
// If null → Login first

// 3. Make a test request
fetch('/admin/shipments', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
})
.then(res => {
  console.log('Status:', res.status);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
})
.then(data => {
  console.log('✅ Success! Data:', data);
})
.catch(err => {
  console.error('❌ Error:', err.message);
});

// Should see: ✅ Success! Data: [...]
```

### Expected Success Output

```
Status: 200
✅ Success! Data: [
  {
    id: "SHIP001",
    tracking_code: "CC123456789",
    owner_name: "John Doe",
    ...
  },
  ...
]
```

### Expected Error Output

```
Status: 401
❌ Error: Request failed
```

---

## Summary

| Step | Action | Result |
|------|--------|--------|
| 1 | Visit `/admin/index.html` | See login form |
| 2 | Enter `demo-token-12345` | Token input filled |
| 3 | Click button | Token saved in localStorage |
| 4 | Visit admin pages | Can access now ✓ |
| 5 | Make API requests | Returns 200 + data ✓ |

---

**Your system is working correctly!**
**Just follow the steps and you'll get 200 OK responses.**

🎉
