const mongoose = require('mongoose');
const Order = require('./models/Order');
const config = require('./config');

// Demo data for testing
const demoOrders = [
  {
    orderNumber: 'ORD000001',
    productName: 'Wireless Bluetooth Headphones',
    productId: 'WBH001',
    dateOfDeparture: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'delivered',
    amount: 2500,
    receivedAmount: 2500, // Payment received
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'cod',
      paymentStatus: 'paid'
    },
    shippingInfo: {
      trackingNumber: 'TRK123456789',
      courierService: 'Blue Dart',
      estimatedDelivery: new Date('2024-01-22T18:00:00Z')
    }
  },
  {
    orderNumber: 'ORD000002',
    productName: 'Smart Watch Series 5',
    productId: 'SW005',
    dateOfDeparture: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'pending',
    amount: 8500,
    receivedAmount: 0, // Payment not received yet
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'online',
      paymentStatus: 'pending'
    },
    shippingInfo: {
      trackingNumber: 'TRK987654321',
      courierService: 'DTDC',
      estimatedDelivery: new Date('2024-01-25T12:00:00Z')
    }
  },
  {
    orderNumber: 'ORD000003',
    productName: 'Laptop Stand Adjustable',
    productId: 'LS001',
    dateOfDeparture: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'pending',
    amount: 1200,
    receivedAmount: 1200, // Payment received
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'cod',
      paymentStatus: 'paid'
    }
  },
  {
    orderNumber: 'ORD000004',
    productName: 'Mechanical Gaming Keyboard',
    productId: 'MGK002',
    dateOfDeparture: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    status: 'delivered',
    amount: 3500,
    receivedAmount: 0, // Payment not received
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'wallet',
      paymentStatus: 'pending'
    }
  },
  {
    orderNumber: 'ORD000005',
    productName: 'Wireless Mouse Ergonomic',
    productId: 'WME003',
    dateOfDeparture: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'cancelled',
    amount: 800,
    receivedAmount: 0, // Payment not received
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'cod',
      paymentStatus: 'refunded'
    },
    cancellationReason: 'Customer requested cancellation',
    cancelledBy: 'customer',
    cancelledAt: new Date('2024-01-11T10:30:00Z')
  },
  {
    orderNumber: 'ORD000006',
    productName: 'USB-C Hub Multiport',
    productId: 'UCH004',
    dateOfDeparture: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    status: 'cancelled',
    amount: 1800,
    receivedAmount: 1800, // Payment received before cancellation
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'online',
      paymentStatus: 'paid'
    },
    shippingInfo: {
      trackingNumber: 'TRK456789123',
      courierService: 'India Post',
      estimatedDelivery: new Date('2024-01-14T17:00:00Z')
    },
    cancellationReason: 'Product damaged during shipping',
    cancelledBy: 'seller',
    cancelledAt: new Date('2024-01-15T14:20:00Z')
  },
  {
    orderNumber: 'ORD000007',
    productName: 'Gaming Headset Pro',
    productId: 'GHP007',
    dateOfDeparture: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'pending',
    amount: 4500,
    receivedAmount: 0, // Payment not received yet
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'cod',
      paymentStatus: 'pending'
    }
  },
  {
    orderNumber: 'ORD000008',
    productName: 'Wireless Charging Pad',
    productId: 'WCP008',
    dateOfDeparture: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'pending',
    amount: 1500,
    receivedAmount: 1500, // Payment received
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'online',
      paymentStatus: 'paid'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Insert demo orders
    await Order.insertMany(demoOrders);
    console.log(`Inserted ${demoOrders.length} demo orders`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, demoOrders };
