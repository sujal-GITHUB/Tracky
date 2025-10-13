const mongoose = require('mongoose');
const Order = require('./models/Order');
const config = require('./config');

// Demo data for testing
const demoOrders = [
  {
    orderNumber: 'ORD000001',
    productName: 'Wireless Bluetooth Headphones',
    productId: 'WBH001',
    dateOfDeparture: new Date('2024-01-20T10:00:00Z'),
    status: 'delivered',
    amount: 2500,
    receivedAmount: 2500,
    customerInfo: {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      address: '123 MG Road, Bangalore, Karnataka',
      pincode: '560001'
    },
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
    dateOfDeparture: new Date('2024-01-18T14:30:00Z'),
    status: 'shipped',
    amount: 8500,
    receivedAmount: 0,
    customerInfo: {
      name: 'Priya Sharma',
      phone: '8765432109',
      address: '456 Park Street, Mumbai, Maharashtra',
      pincode: '400001'
    },
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'online',
      paymentStatus: 'paid'
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
    dateOfDeparture: new Date('2024-01-15T09:15:00Z'),
    status: 'pending',
    amount: 1200,
    receivedAmount: 0,
    customerInfo: {
      name: 'Amit Patel',
      phone: '7654321098',
      address: '789 Sector 15, Gurgaon, Haryana',
      pincode: '122001'
    },
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
    orderNumber: 'ORD000004',
    productName: 'Mechanical Gaming Keyboard',
    productId: 'MGK002',
    dateOfDeparture: new Date('2024-01-12T16:45:00Z'),
    status: 'confirmed',
    amount: 3500,
    receivedAmount: 0,
    customerInfo: {
      name: 'Sneha Reddy',
      phone: '6543210987',
      address: '321 Brigade Road, Chennai, Tamil Nadu',
      pincode: '600001'
    },
    sellerInfo: {
      sellerId: 'demo_seller_123',
      sellerName: 'Demo Seller'
    },
    paymentInfo: {
      paymentMethod: 'wallet',
      paymentStatus: 'paid'
    }
  },
  {
    orderNumber: 'ORD000005',
    productName: 'Wireless Mouse Ergonomic',
    productId: 'WME003',
    dateOfDeparture: new Date('2024-01-10T11:20:00Z'),
    status: 'cancelled',
    amount: 800,
    receivedAmount: 0,
    customerInfo: {
      name: 'Vikram Singh',
      phone: '5432109876',
      address: '654 Nehru Place, Delhi',
      pincode: '110019'
    },
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
    dateOfDeparture: new Date('2024-01-08T13:10:00Z'),
    status: 'received',
    amount: 1800,
    receivedAmount: 1800,
    customerInfo: {
      name: 'Anita Desai',
      phone: '4321098765',
      address: '987 Commercial Street, Pune, Maharashtra',
      pincode: '411001'
    },
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
