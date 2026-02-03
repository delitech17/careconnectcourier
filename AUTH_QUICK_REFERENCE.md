# ⚡ Quick Reference: Authentication Flow

## The Two-Step Process

### ❌ WRONG - Direct Token to /admin/shipments
```
GET /admin/shipments
Authorization: Bearer demo-token-12345
↓
❌ 401 Unauthorized (Raw token not valid for this endpoint)
```

### ✅ CORRECT - Token Exchange Pipeline

```
STEP 1: Exchange Raw Token for JWT
┌─────────────────────────────────────┐
│ POST /admin/login                   │
│ {                                   │
│   "token": "92922a6a6ffba..."      │
│ }                                   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ ✅ 200 OK                            │
│ {                                   │
│   "ok": true,                       │
│   "token": "eyJhbGc...",            │
│   "expiresIn": "12h"                │
│ }                                   │
└─────────────────────────────────────┘
           ↓
     STEP 2: Use JWT
┌─────────────────────────────────────┐
│ GET /admin/shipments                │
│ Authorization: Bearer eyJhbGc...    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ ✅ 200 OK                            │
│ [                                   │
│   { shipment1 },                    │
│   { shipment2 },                    │
│   ...                               │
│ ]                                   │
└─────────────────────────────────────┘
```

---

## Token Types

| Token | Purpose | Length | Example |
|-------|---------|--------|---------|
| **ADMIN_TOKEN** (Raw) | Sent to `/admin/login` | 64 hex chars | `92922a6a6ffba...` |
| **JWT Token** | Sent to `/admin/shipments` | ~200+ chars | `eyJhbGciOiJIUzI1NiIs...` |

**Key:** Raw token → JWT token → API access

---

## Testing Commands

### Test 1: Get JWT
```bash
node test-admin-login.js "92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545" "https://careconnectcourier.onrender.com"
```

**Expected Output:**
```
✅ SUCCESS! Login endpoint is working.
🎯 Your JWT token: eyJhbGc...
⏰ Expires in: 12h
```

### Test 2: Use JWT (in PowerShell)
```powershell
$jwt = "eyJhbGc..."  # From Step 1
$response = Invoke-WebRequest -Uri "https://careconnectcourier.onrender.com/admin/shipments" `
  -Headers @{"Authorization"="Bearer $jwt"}
$response.Content
```

**Expected:** Shipments data in JSON format

---

## Frontend Flow

### Login Page (`/admin/index.html`)
```
User enters: 92922a6a6ffba072548998f4b28d6aa8f9571321df39c264b9ea4e4dbf0d9545
                    ↓
Click "Access Admin Panel"
                    ↓
Frontend: POST /admin/login with raw token
                    ↓
Backend: Returns JWT
                    ↓
Frontend: Store JWT in localStorage
                    ↓
Show: "✓ Access granted!"
```

### Admin Pages (`/admin/shipments-list.html`)
```
Page loads
                    ↓
JavaScript: Get JWT from localStorage
                    ↓
Fetch: GET /admin/shipments with JWT
                    ↓
Backend: Verify JWT → OK
                    ↓
Return: Shipments data
                    ↓
Display: Shipments table
```

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on `/admin/shipments` | Using raw token instead of JWT | Go through `/admin/login` first |
| 401 on `/admin/login` | Raw token doesn't match ADMIN_TOKEN | Check token is correct |
| localStorage error | Browser privacy blocking | Use incognito/private window |
| CORS error | Domain not allowed | Check ALLOWED_ORIGINS |
| Token expired (after 12h) | JWT has expiry | Login again |

---

## Verification Checklist

- [ ] Backend `/admin/login` returns 200 ✅ (Already tested)
- [ ] JWT generated successfully ✅ (Already tested)
- [ ] Frontend exchanges token for JWT (Need to verify)
- [ ] JWT stored in localStorage (Need to verify)
- [ ] Frontend sends JWT in Authorization header (Need to verify)
- [ ] `/admin/shipments` returns 200 with JWT (Need to verify)

---

## Environment Variables ✅

| Variable | Status | Value |
|----------|--------|-------|
| ADMIN_TOKEN | ✅ Set | `92922a6a...` (64 chars) |
| JWT_SECRET | ✅ Set | `6ffaba7f...` (64 chars) |
| NODE_ENV | ✅ Set | `production` |
| ALLOWED_ORIGINS | ✅ Set | Includes your domain |

---

## Status

- **Backend:** ✅ Working (JWT generation verified)
- **Token Exchange:** ✅ Working (200 OK response)
- **CORS:** ✅ Configured
- **Frontend:** ⏳ Needs verification (should work after redeploy)

---

**Need Help?** Check [ADMIN_SHIPMENTS_401_SOLUTION.md](ADMIN_SHIPMENTS_401_SOLUTION.md) for complete details.
