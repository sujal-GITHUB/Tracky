# Tracky Order Management Backend

A comprehensive order management system backend designed for Meesho sellers to track and manage their orders efficiently.

## Features

- **Order Management**: Create, read, update, and delete orders
- **Status Tracking**: Track order status from pending to delivered/received
- **Customer Management**: Store customer information and shipping details
- **Payment Tracking**: Monitor payment status and received amounts
- **Search & Filter**: Search orders by various criteria
- **Statistics**: Get comprehensive order statistics and analytics
- **Bulk Operations**: Perform bulk updates on multiple orders
- **Rate Limiting**: Built-in rate limiting for API protection
- **Authentication**: JWT-based authentication system
- **Validation**: Comprehensive input validation
- **Error Handling**: Robust error handling and logging

## Order Fields

Each order contains the following information:

- **Order Details**: Order number, product name, product ID, date of departure
- **Status**: pending, confirmed, shipped, delivered, received, cancelled
- **Financial**: Amount, received amount
- **Customer Info**: Name, phone, address, pincode
- **Seller Info**: Seller ID, seller name
- **Shipping Info**: Tracking number, courier service, estimated delivery
- **Payment Info**: Payment method, payment status, transaction ID
- **Additional**: Notes, cancellation reason, timestamps

## API Endpoints

### Authentication Required
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Order Operations
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders for seller
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `PUT /api/orders/:id` - Update order details
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order (soft delete)

### Search & Filter
- `GET /api/orders/search?q=query` - Search orders
- `GET /api/orders/status/:status` - Get orders by status
- `GET /api/orders/recent` - Get recent orders (last 7 days)

### Analytics
- `GET /api/orders/statistics` - Get order statistics

### Bulk Operations
- `PATCH /api/orders/bulk/update` - Bulk update orders

### Health Check
- `GET /api/orders/health` - Health check endpoint

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tracky/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tracky_orders
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Seed demo data (optional)**
   ```bash
   npm run seed
   ```

## API Usage Examples

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productName": "Wireless Headphones",
    "productId": "WH001",
    "dateOfDeparture": "2024-01-15T10:00:00Z",
    "amount": 1500,
    "customerInfo": {
      "name": "John Doe",
      "phone": "9876543210",
      "address": "123 Main Street, City",
      "pincode": "110001"
    },
    "sellerInfo": {
      "sellerName": "Tech Store"
    }
  }'
```

### Get Orders
```bash
curl -X GET "http://localhost:5000/api/orders?status=pending&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "delivered",
    "receivedAmount": 1500
  }'
```

### Search Orders
```bash
curl -X GET "http://localhost:5000/api/orders/search?q=headphones" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── index.js         # Configuration settings
├── controllers/
│   └── orderController.js # Order API controllers
├── middlewares/
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Input validation
│   ├── rateLimiting.js  # Rate limiting
│   └── logging.js       # Request logging
├── models/
│   └── Order.js         # Order MongoDB model
├── routes/
│   └── orderRoutes.js   # API routes
├── services/
│   └── orderService.js  # Business logic layer
├── utils/
│   ├── helpers.js       # Utility functions
│   └── errors.js        # Error handling
├── tests/               # Test files
├── app.js              # Express app configuration
├── server.js           # Server startup
└── package.json        # Dependencies
```

## Database Schema

The Order model includes comprehensive fields for:
- Order identification and tracking
- Product information
- Customer details
- Seller information
- Shipping and delivery
- Payment processing
- Status management
- Timestamps and metadata

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive validation
- **JWT Authentication**: Secure token-based auth
- **Error Handling**: Secure error responses

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript/Node.js conventions.

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRE`: JWT expiration time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
