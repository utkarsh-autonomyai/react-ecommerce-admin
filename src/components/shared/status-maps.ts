import type { StatusConfig } from './status-badge';

const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: {
    label: 'Confirmed',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  PROCESSING: {
    label: 'Processing',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
  SHIPPED: {
    label: 'Shipped',
    variant: 'outline',
    className: 'border-indigo-500 text-indigo-600',
  },
  DELIVERED: { label: 'Delivered', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
} as const;

const PAYMENT_STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  SUCCEEDED: { label: 'Succeeded', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  REFUND_PENDING: {
    label: 'Refund Pending',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
  REFUNDED: {
    label: 'Refunded',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  PARTIALLY_REFUNDED: {
    label: 'Partially Refunded',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
} as const;

const REVIEW_STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  APPROVED: { label: 'Approved', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'default' },
} as const;

const COUPON_TYPE_MAP: Record<string, StatusConfig> = {
  PERCENTAGE: {
    label: 'Percentage',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  FIXED_AMOUNT: {
    label: 'Fixed Amount',
    variant: 'outline',
    className: 'border-green-500 text-green-600',
  },
} as const;

const STOCK_MOVEMENT_TYPE_MAP: Record<string, StatusConfig> = {
  ADJUSTMENT: {
    label: 'Adjustment',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
  RESTOCK: {
    label: 'Restock',
    variant: 'outline',
    className: 'border-green-500 text-green-600',
  },
  RETURN: {
    label: 'Return',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  SALE: { label: 'Sale', variant: 'default' },
  RESERVATION: {
    label: 'Reservation',
    variant: 'outline',
    className: 'border-indigo-500 text-indigo-600',
  },
  RELEASE: { label: 'Release', variant: 'secondary' },
} as const;

const COUPON_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Active', variant: 'default' },
  SCHEDULED: {
    label: 'Scheduled',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
} as const;

const NOTIFICATION_TYPE_MAP: Record<string, StatusConfig> = {
  ORDER_CREATED: {
    label: 'Order Created',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  ORDER_CONFIRMED: {
    label: 'Order Confirmed',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600',
  },
  ORDER_SHIPPED: {
    label: 'Order Shipped',
    variant: 'outline',
    className: 'border-indigo-500 text-indigo-600',
  },
  ORDER_DELIVERED: { label: 'Order Delivered', variant: 'default' },
  ORDER_CANCELLED: { label: 'Order Cancelled', variant: 'destructive' },
  PAYMENT_SUCCEEDED: { label: 'Payment Succeeded', variant: 'default' },
  PAYMENT_FAILED: { label: 'Payment Failed', variant: 'destructive' },
  REFUND_INITIATED: {
    label: 'Refund Initiated',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
  REFUND_COMPLETED: {
    label: 'Refund Completed',
    variant: 'outline',
    className: 'border-green-500 text-green-600',
  },
  REFUND_FAILED: { label: 'Refund Failed', variant: 'destructive' },
  LOW_STOCK: {
    label: 'Low Stock',
    variant: 'outline',
    className: 'border-amber-500 text-amber-600',
  },
  WELCOME: { label: 'Welcome', variant: 'secondary' },
  PASSWORD_CHANGED: { label: 'Password Changed', variant: 'secondary' },
} as const;

export {
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  REVIEW_STATUS_MAP,
  COUPON_TYPE_MAP,
  STOCK_MOVEMENT_TYPE_MAP,
  COUPON_STATUS_MAP,
  NOTIFICATION_TYPE_MAP,
};
