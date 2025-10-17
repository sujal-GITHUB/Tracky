# Tracky API Routes Reference

## Base URLs

### Backend Server
- **Development:** `http://localhost:5000`
- **API Base:** `http://localhost:5000/api`

### API Endpoints

## 🔷 Order Routes (`/api/orders`)

### Create Order
```
POST /api/orders
Content-Type: multipart/form-data

Body:
- orderNumber: string
- productName: string
- productId: string
- amount: number
- dateOfDeparture: string (ISO date)
- sellerInfo: JSON string {"sellerId": "...", "sellerName": "..."}
- paymentInfo: JSON string {"paymentMethod": "cod|online|wallet", "paymentStatus": "pending|paid|failed|refunded"}
- notes: string (optional)
- invoice: file (PDF, optional, max 10MB)
```

### Get All Orders
```
GET /api/orders?status=pending&limit=50&skip=0
```

### Get Order by ID
```
GET /api/orders/:id
```

### Get Order by Order Number
```
GET /api/orders/number/:orderNumber
```

### Update Order
```
PUT /api/orders/:id
Content-Type: application/json

Body: {
  "productName": "Updated Name",
  "amount": 5000,
  ...
}
```

### Update Order Status
```
PATCH /api/orders/:id/status
Content-Type: application/json

Body: {
  "status": "delivered|cancelled|pending",
  "receivedAmount": 5000,
  "cancellationReason": "reason" (if cancelled)
}
```

### Toggle Payment Status
```
PATCH /api/orders/:id/payment
Content-Type: application/json

Body: {
  "receivedAmount": 5000
}
```

### Delete Order
```
DELETE /api/orders/:id
Content-Type: application/json

Body: {
  "reason": "Deletion reason"
}
```

### Search Orders
```
GET /api/orders/search?q=searchTerm
```

### Get Orders by Status
```
GET /api/orders/status/:status
where status = pending|delivered|cancelled
```

### Get Recent Orders
```
GET /api/orders/recent?limit=20
```

### Get Order Statistics
```
GET /api/orders/statistics?dateFrom=2025-01-01&dateTo=2025-12-31
```

### Bulk Update Orders
```
PATCH /api/orders/bulk/update
Content-Type: application/json

Body: {
  "orderIds": ["id1", "id2"],
  "updateData": { "status": "delivered" }
}
```

### Health Check
```
GET /api/orders/health
```

---

## 📊 Analytics Routes (`/api/analytics`)

### Get Current Month Analytics
```
GET /api/analytics/current
```

### Get Specific Month Analytics
```
GET /api/analytics/month/:year/:month
Example: GET /api/analytics/month/2025/10
```

### Get Last N Months Analytics
```
GET /api/analytics/recent?months=6
```

### Get Yearly Analytics
```
GET /api/analytics/year/:year
Example: GET /api/analytics/year/2025
```

### Get Analytics Range
```
GET /api/analytics/range?startYear=2025&startMonth=1&endYear=2025&endMonth=12
```

### Recalculate Monthly Analytics
```
POST /api/analytics/recalculate/:year/:month
Example: POST /api/analytics/recalculate/2025/10
```

### Recalculate All Analytics
```
POST /api/analytics/recalculate-all
```

---

## 📁 Static Files

### Access Uploaded Invoices
```
GET /uploads/invoices/:filename
Example: GET /uploads/invoices/invoice-1234567890.pdf
```

---

## Frontend Configuration

### Environment Variables
Create `.env.local` in dashboard folder:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Current Configuration
```javascript
// dashboard/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

---

## 🔧 How to Fix the Current Issue

### The Problem
Browser is calling: `http://localhost:5000/api/orders/orders` (wrong - double "orders")
Should be calling: `http://localhost:5000/api/orders` (correct)

### Solution

**Step 1: Stop Frontend Dev Server**
Press `Ctrl+C` in the terminal running the Next.js dev server

**Step 2: Clear Next.js Cache**
```bash
cd dashboard
rm -rf .next
# On Windows:
# rmdir /s .next
```

**Step 3: Restart Frontend**
```bash
npm run dev
```

**Step 4: Hard Refresh Browser**
- Chrome/Edge: `Ctrl + Shift + R` or `Ctrl + F5`
- Firefox: `Ctrl + Shift + R`
- Safari: `Cmd + Shift + R`

**Step 5: Clear Browser Cache (if still not working)**
- Open DevTools (F12)
- Right-click on the refresh button
- Select "Empty Cache and Hard Reload"

---

## 📝 Testing the API

### Using curl

**Create Order (without invoice):**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD001",
    "productName": "Test Product",
    "productId": "PROD001",
    "amount": 1000,
    "dateOfDeparture": "2025-10-17T00:00:00.000Z",
    "sellerInfo": {
      "sellerId": "admin",
      "sellerName": "Admin"
    },
    "paymentInfo": {
      "paymentMethod": "cod",
      "paymentStatus": "pending"
    }
  }'
```

**Get Current Month Analytics:**
```bash
curl http://localhost:5000/api/analytics/current
```

**Get Orders:**
```bash
curl http://localhost:5000/api/orders
```

---

## Common Issues & Solutions

### Issue: 404 Not Found
- **Check:** Backend server is running (`npm run dev` in backend folder)
- **Check:** Correct port (5000 for backend, 3000 for frontend)
- **Check:** Route spelling and URL structure

### Issue: CORS Error
- Backend already configured to allow localhost:3000
- Check `backend/app.js` CORS configuration

### Issue: File Upload Not Working
- **Check:** Using `multipart/form-data` content type
- **Check:** File size < 10MB
- **Check:** File type is PDF
- **Check:** `uploads/invoices/` folder exists in backend

### Issue: Analytics Empty
- No orders in database yet
- Run: `POST /api/analytics/recalculate-all` to generate analytics from existing orders

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Analytics Response
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "year": 2025,
    "month": 10,
    "totalOrders": 150,
    "totalRevenue": 75000,
    "totalReceivedAmount": 60000,
    "pendingOrders": 10,
    "deliveredOrders": 130,
    "cancelledOrders": 10,
    "ordersByType": {
      "cod": 80,
      "online": 50,
      "wallet": 20
    },
    "averageOrderValue": 500,
    "completionRate": 86.67,
    "cancellationRate": 6.67
  }
}
```

