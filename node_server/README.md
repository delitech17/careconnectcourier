# CareConnectCourier - Node Express Server

A production-ready Express.js backend for shipment tracking and logistics management, with JSON-based data storage.

## Quick Start

1. Install dependencies
```bash
cd node_server
npm install
```

2. Start the server
```bash
npm start
```

3. Open http://localhost:3000 in your browser

## Admin Dashboard

Access the admin panel at `/admin.html` to:
- Create shipments with tracking codes
- Add movements to track shipment progress
- View real-time shipment details

**Default admin token:** `demo-token-12345`

Set a custom token via environment variable:
```bash
set ADMIN_TOKEN=your-secure-token-here
npm start
```

## API Endpoints

### Public Tracking
- `GET /api/track/<tracking_code>` — Retrieve shipment details, movements, and current location with coordinates for embedded maps

### Admin Endpoints (require Bearer token)
- `POST /admin/create_shipment` — Create a new shipment
  ```json
  {
    "owner_name": "John Doe",
    "company": "TechCorp",
    "description": "Electronics",
    "origin": "Lagos, Nigeria",
    "destination": "Accra, Ghana",
    "eta": "2026-01-28",
    "weight": "25 kg",
    "service": "air",
    "origin_lat": 6.5244,
    "origin_lng": 3.3792,
    "dest_lat": 5.6037,
    "dest_lng": -0.1870
  }
  ```

- `POST /admin/add_movement` — Add movement to shipment
  ```json
  {
    "tracking_code": "CC123456789",
    "location": "Lagos Airport",
    "lat": 6.5779,
    "lng": 3.3208,
    "status": "In transit",
    "note": "Loaded on flight"
  }
  ```

### Service & Contact
- `GET /api/services` — List all services
- `GET /api/testimonials` — Load testimonials
- `POST /api/contact` — Submit contact message
- `POST /api/quote` — Request a shipping quote

## Data Storage

All data is stored as JSON files in the `data/` folder:
- `shipments.json` — Shipment records
- `movements.json` — Shipment movement history
- `services.json` — Service offerings
- `testimonials.json` — Customer testimonials
- `messages.json` — Contact form submissions
- `quotes.json` — Quote requests

## Production Hardening

For production deployment:

1. **Environment Variables**
   - Set `ADMIN_TOKEN` to a strong, random token
   - Set `PORT` if running on a different port
   - Set `NODE_ENV=production`

2. **Authentication**
   - All admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header
   - Implement rate limiting for public endpoints (recommend express-rate-limit)
   - Add input validation and sanitization

3. **HTTPS**
   - Deploy behind a reverse proxy (nginx, Apache) with SSL/TLS
   - Use environment variables for sensitive configs

4. **Database Migration**
   - Replace JSON files with a real database (MongoDB, PostgreSQL) when scaling
   - Current structure is easily portable to any DB

5. **Validation**
   - Incoming data is validated for required fields
   - Email validation on contact forms
   - Numeric validation on coordinates

## Example Admin Requests

```bash
# Create shipment
curl -X POST http://localhost:3000/admin/create_shipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-12345" \
  -d '{
    "owner_name": "Alice",
    "description": "Package",
    "origin": "Lagos",
    "destination": "Accra"
  }'

# Add movement
curl -X POST http://localhost:3000/admin/add_movement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-12345" \
  -d '{
    "tracking_code": "CC123456789",
    "location": "In Transit",
    "status": "On the way",
    "lat": 6.5,
    "lng": 3.4
  }'

# Track shipment (public, no auth needed)
curl http://localhost:3000/api/track/CC123456789
```

## Notes

- The frontend in `../frontend/` is served automatically
- Admin dashboard at `/admin.html` handles shipment management
- Tracking page displays embedded Google Maps for current location
- Ready to integrate with real payment systems, notifications, and advanced analytics

