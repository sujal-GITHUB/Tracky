# Tracky Dashboard - Order Management Frontend

A modern, responsive Next.js dashboard for managing orders in the Tracky order management system. Built specifically for Meesho sellers to track and manage their orders efficiently.

## 🚀 Features

### 📊 **Dashboard**
- **Real-time Statistics**: Total orders, revenue, received amounts, and order status breakdown
- **Recent Orders**: Quick view of latest orders with status indicators
- **Performance Metrics**: Order completion rates, cancellation rates, and financial summaries

### 📦 **Order Management**
- **Order Listing**: View all orders with advanced filtering and search
- **Order Creation**: Create new orders with comprehensive product and customer information
- **Order Details**: Detailed view of individual orders with status management
- **Status Updates**: Update order status from pending to delivered/received
- **Order Search**: Search orders by order number, product name, customer details

### 📈 **Analytics**
- **Visual Charts**: Pie charts for order status distribution, bar charts for revenue breakdown
- **Performance Metrics**: Completion rates, cancellation rates, collection rates
- **Financial Analytics**: Total revenue, received amounts, outstanding payments
- **Status Tracking**: Detailed breakdown of orders by status

### 🔐 **Authentication**
- **No Login Required**: Direct access to all features
- **Demo Token**: Automatic authentication with demo token
- **Seamless Experience**: No authentication barriers or redirects

### 🎨 **UI/UX**
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Loading States**: Proper loading indicators and error handling

## 🛠 **Technology Stack**

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **State Management**: React hooks and context

## 📁 **Project Structure**

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── orders/        # Order management pages
│   │   │   │   ├── create/    # Create new order
│   │   │   │   └── [id]/      # Order details page
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   └── settings/      # Settings page
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects to login)
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   └── ui/                # UI components (Button, Card, etc.)
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts             # API client configuration
│   │   ├── auth.ts            # Authentication service
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── providers/             # Context providers
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Navigate to dashboard directory**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/orders" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### 🎯 **Direct Access**
The dashboard is now accessible directly without login! Simply navigate to `http://localhost:3000` and you'll be taken straight to the admin dashboard.

## 📱 **Pages Overview**

### 🏠 **Dashboard** (`/admin`)
- Overview of all order statistics
- Recent orders list
- Quick status breakdown
- Performance metrics

### 📦 **Orders** (`/admin/orders`)
- Complete order listing with search and filters
- Status-based filtering
- Order creation button
- Quick actions for each order

### ➕ **Create Order** (`/admin/orders/create`)
- Comprehensive order creation form
- Product information
- Customer details
- Payment configuration
- Order summary

### 👁️ **Order Details** (`/admin/orders/[id]`)
- Complete order information
- Status management
- Customer details
- Payment information
- Shipping details
- Order actions (edit, delete)

### 📊 **Analytics** (`/admin/analytics`)
- Visual charts and graphs
- Order status distribution
- Revenue breakdown
- Performance metrics
- Financial summaries

## 🔧 **API Integration**

The frontend integrates with the Tracky backend API:

- **Base URL**: `http://localhost:5000/api/orders`
- **Authentication**: JWT tokens stored in localStorage
- **Endpoints**: All CRUD operations for orders
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Key API Functions

```typescript
// Order operations
orderAPI.getOrders()           // Get all orders
orderAPI.createOrder()         // Create new order
orderAPI.getOrderById()        // Get specific order
orderAPI.updateOrderStatus()   // Update order status
orderAPI.searchOrders()        // Search orders
orderAPI.getOrderStatistics()  // Get analytics data
```

## 🎨 **UI Components**

### Custom Components
- **Button**: Styled button with variants
- **Card**: Content containers with headers
- **Input**: Form input fields
- **Select**: Dropdown selections
- **Textarea**: Multi-line text input
- **Toast**: Notification system

### Design System
- **Colors**: Consistent color palette with dark mode support
- **Typography**: Manrope font family
- **Spacing**: Tailwind's spacing scale
- **Icons**: Lucide React icon library

## 🌙 **Dark Mode**

The application supports dark mode with:
- System preference detection
- Manual toggle in navigation
- Persistent user preference
- Consistent theming across all components

## 📱 **Responsive Design**

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive breakpoints
- **Navigation**: Collapsible sidebar for mobile
- **Touch Friendly**: Optimized for touch interactions

## 🔒 **Security Features**

- **Demo Authentication**: Simple demo token system for development
- **Input Validation**: Client-side validation for forms
- **Error Handling**: Secure error messages without sensitive data
- **CORS Protection**: Proper CORS configuration for API access

## 🚀 **Deployment**

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/orders
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Check the backend documentation
- Review the API endpoints
- Test with demo credentials
- Check browser console for errors

---

**Tracky Dashboard** - Empowering Meesho sellers with efficient order management! 🚀