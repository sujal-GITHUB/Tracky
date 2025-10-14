# Order State Management System

## Overview

The enhanced Order model now includes comprehensive state management with payment substates and detailed tracking of status changes.

## Features

### 1. Status Change Tracking
- **Status History**: Every status change is recorded with timestamp, who made the change, and reason
- **Valid Transitions**: Enforced business rules for status transitions
- **Audit Trail**: Complete history of all status changes

### 2. Payment Substates
For orders with status `delivered` or `cancelled`:
- **Payment Status**: Toggle between paid/unpaid
- **Payment Amount**: Track exact amount received
- **Payment Date**: Timestamp when payment was received
- **Payment Method**: Track how payment was made
- **Payment Reference**: Store transaction/reference numbers

### 3. New Schema Fields

#### Status History
```javascript
statusHistory: [{
  status: String,        // 'pending', 'delivered', 'cancelled'
  changedAt: Date,       // When status was changed
  changedBy: String,     // 'customer', 'seller', 'admin', 'system'
  reason: String         // Optional reason for change
}]
```

#### Payment Substate
```javascript
paymentSubstate: {
  isPaid: Boolean,           // Payment received status
  paidAmount: Number,        // Amount actually paid
  paymentDate: Date,         // When payment was received
  paymentMethod: String,     // 'cash', 'bank_transfer', 'card', etc.
  paymentReference: String   // Transaction/reference number
}
```

## API Methods

### Change Order Status
```javascript
await order.changeStatus('delivered', 'seller', 'Product delivered successfully');
```
- **Parameters**: newStatus, changedBy, reason
- **Valid Transitions**: 
  - pending → delivered/cancelled
  - delivered → pending/cancelled
  - cancelled → pending/delivered
- **Auto-reset**: Payment substate is reset when changing to delivered/cancelled

### Mark Payment Received
```javascript
await order.markPaymentReceived(1000, 'cash', 'CASH-001');
```
- **Parameters**: amount, paymentMethod, paymentReference
- **Validation**: Amount must be > 0 and ≤ order amount
- **Restriction**: Only works for delivered/cancelled orders

### Mark Payment Not Received
```javascript
await order.markPaymentNotReceived();
```
- Resets payment substate to unpaid
- Only works for delivered/cancelled orders

### Get Payment Status
```javascript
const status = order.getPaymentStatus();
// Returns: 'pending', 'paid', or 'unpaid'
```

### Get Status History
```javascript
const history = order.getStatusHistory();
// Returns: Sorted array of status changes (newest first)
```

## Virtual Fields

### New Virtual Fields
- `paymentStatusText`: Returns 'Pending', 'Paid', or 'Unpaid'
- `lastStatusChange`: Returns the date of the most recent status change
- Updated `isPaymentReceived`: Now uses payment substate

## Usage Examples

### Basic Workflow
```javascript
// Create order (starts as pending)
const order = new Order({...});
await order.save();

// Change to delivered
await order.changeStatus('delivered', 'seller', 'Delivered to customer');

// Mark payment received
await order.markPaymentReceived(1000, 'cash', 'CASH-001');

// Check payment status
console.log(order.getPaymentStatus()); // 'paid'
console.log(order.paymentSubstate.isPaid); // true
```

### Status History Tracking
```javascript
// Get complete history
const history = order.getStatusHistory();
history.forEach(change => {
  console.log(`${change.status} at ${change.changedAt} by ${change.changedBy}`);
});
```

## Business Rules

1. **Payment Tracking**: Only available for delivered/cancelled orders
2. **Status Transitions**: Enforced valid transitions between states
3. **Payment Reset**: Payment substate resets when changing to delivered/cancelled
4. **Amount Validation**: Payment amount cannot exceed order amount
5. **Audit Trail**: All status changes are permanently recorded

## Migration Notes

- Existing orders will have empty `statusHistory` arrays
- Existing orders will have default payment substate (unpaid)
- `receivedAmount` field is maintained for backward compatibility
- All existing virtual fields continue to work as before
