// Example usage of the enhanced Order state management system
const Order = require('../models/Order');

async function demonstrateOrderStateManagement() {
  try {
    // Create a new order
    const order = new Order({
      productName: 'Sample Product',
      productId: 'PROD001',
      dateOfDeparture: new Date('2024-02-01'),
      amount: 1000,
      sellerInfo: {
        sellerId: 'SELLER001',
        sellerName: 'John Doe'
      }
    });

    await order.save();
    console.log('Order created:', order.orderNumber, 'Status:', order.status);

    // Change status from pending to delivered
    await order.changeStatus('delivered', 'seller', 'Product successfully delivered to customer');
    console.log('Status changed to delivered. Payment substate:', order.paymentSubstate.isPaid);

    // Mark payment as received
    await order.markPaymentReceived(1000, 'cash', 'CASH-001');
    console.log('Payment marked as received. Amount:', order.paymentSubstate.paidAmount);
    console.log('Payment date:', order.paymentSubstate.paymentDate);

    // Change status to cancelled
    await order.changeStatus('cancelled', 'admin', 'Customer requested cancellation');
    console.log('Status changed to cancelled. Payment substate reset:', order.paymentSubstate.isPaid);

    // Mark payment as not received (for cancelled order)
    console.log('Payment status after cancellation:', order.getPaymentStatus());

    // Get status history
    const history = order.getStatusHistory();
    console.log('Status history:', history);

    // Change back to delivered and mark partial payment
    await order.changeStatus('delivered', 'admin', 'Order reactivated');
    await order.markPaymentReceived(500, 'bank_transfer', 'TXN-12345');
    console.log('Partial payment received:', order.paymentSubstate.paidAmount);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example of error handling
async function demonstrateErrorHandling() {
  try {
    const order = new Order({
      productName: 'Test Product',
      productId: 'PROD002',
      dateOfDeparture: new Date('2024-02-01'),
      amount: 500,
      sellerInfo: {
        sellerId: 'SELLER002',
        sellerName: 'Jane Doe'
      }
    });

    await order.save();

    // Try to mark payment for pending order (should fail)
    await order.markPaymentReceived(500);
  } catch (error) {
    console.log('Expected error:', error.message);
  }
}

module.exports = {
  demonstrateOrderStateManagement,
  demonstrateErrorHandling
};
