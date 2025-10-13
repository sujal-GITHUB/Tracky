#!/usr/bin/env node

/**
 * Demo script to test the Tracky Order Management API
 * This script demonstrates how to use the API endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/orders';

// Mock JWT token (in production, this would come from authentication)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxsZXJJZCI6InNlbGxlcl8xMjMiLCJpYXQiOjE3MDQwNzIwMDB9.mock';

const headers = {
  'Authorization': `Bearer ${MOCK_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAPI() {
  console.log('🚀 Testing Tracky Order Management API\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Create Order
    console.log('2. Creating a new order...');
    const orderData = {
      productName: 'Wireless Bluetooth Headphones',
      productId: 'WBH001',
      dateOfDeparture: new Date('2024-01-20T10:00:00Z'),
      amount: 2500,
      customerInfo: {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        address: '123 MG Road, Bangalore, Karnataka',
        pincode: '560001'
      },
      sellerInfo: {
        sellerName: 'Tech Gadgets Store'
      },
      paymentInfo: {
        paymentMethod: 'cod',
        paymentStatus: 'pending'
      }
    };

    const createResponse = await axios.post(API_BASE_URL, orderData, { headers });
    const createdOrder = createResponse.data.data;
    console.log('✅ Order Created:', createdOrder.orderNumber);
    console.log('   Product:', createdOrder.productName);
    console.log('   Amount:', createdOrder.amount);
    console.log('');

    // Test 3: Get Orders
    console.log('3. Fetching all orders...');
    const ordersResponse = await axios.get(API_BASE_URL, { headers });
    console.log('✅ Orders Retrieved:', ordersResponse.data.count, 'orders');
    console.log('');

    // Test 4: Update Order Status
    console.log('4. Updating order status to "confirmed"...');
    const updateResponse = await axios.patch(
      `${API_BASE_URL}/${createdOrder._id}/status`,
      { status: 'confirmed' },
      { headers }
    );
    console.log('✅ Order Status Updated:', updateResponse.data.data.status);
    console.log('');

    // Test 5: Search Orders
    console.log('5. Searching orders...');
    const searchResponse = await axios.get(`${API_BASE_URL}/search?q=headphones`, { headers });
    console.log('✅ Search Results:', searchResponse.data.count, 'orders found');
    console.log('');

    // Test 6: Get Order Statistics
    console.log('6. Fetching order statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/statistics`, { headers });
    const stats = statsResponse.data.data;
    console.log('✅ Order Statistics:');
    console.log('   Total Orders:', stats.totalOrders);
    console.log('   Total Amount:', stats.totalAmount);
    console.log('   Pending Orders:', stats.pendingOrders);
    console.log('   Confirmed Orders:', stats.confirmedOrders);
    console.log('');

    // Test 7: Update Order Status to Delivered
    console.log('7. Updating order status to "delivered"...');
    const deliverResponse = await axios.patch(
      `${API_BASE_URL}/${createdOrder._id}/status`,
      { 
        status: 'delivered',
        receivedAmount: 2500
      },
      { headers }
    );
    console.log('✅ Order Delivered:', deliverResponse.data.data.status);
    console.log('   Received Amount:', deliverResponse.data.data.receivedAmount);
    console.log('');

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Health check: ✅');
    console.log('- Order creation: ✅');
    console.log('- Order retrieval: ✅');
    console.log('- Status updates: ✅');
    console.log('- Search functionality: ✅');
    console.log('- Statistics: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the demo
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
