import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';

import type { OrderDetailDto } from '@/api/generated/types.gen';
import { MoneyDisplay } from '@/components/shared/money-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { ORDER_STATUS_MAP } from '@/components/shared/status-maps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
type OrderDetailProps = {
  order: OrderDetailDto;
};

export const OrderDetail = ({ order }: OrderDetailProps) => {
  return (
    <div className='space-y-6'>
      {/* Order Info */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <dt className='text-muted-foreground text-sm'>Order Number</dt>
              <dd className='font-mono font-medium'>{order.orderNumber}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-sm'>Status</dt>
              <dd className='mt-1'>
                <StatusBadge
                  status={order.status}
                  statusMap={ORDER_STATUS_MAP}
                />
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-sm'>Created</dt>
              <dd>{format(new Date(order.createdAt), 'PPP p')}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground text-sm'>Last Updated</dt>
              <dd>{format(new Date(order.updatedAt), 'PPP p')}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Customer & Shipping */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='font-medium'>{order.shippingFullName}</p>
            <p className='text-muted-foreground text-sm'>
              {order.shippingPhone}
            </p>
            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className='text-muted-foreground text-sm'>
                    Customer Notes
                  </p>
                  <p className='text-sm'>{String(order.notes)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1'>
            <p>{order.shippingStreet}</p>
            <p>
              {order.shippingPostalCode} {order.shippingCity}
            </p>
            {order.shippingRegion && <p>{String(order.shippingRegion)}</p>}
            <p>{order.shippingCountry}</p>
            {order.shippingMethodName && (
              <>
                <Separator className='my-2' />
                <p className='text-muted-foreground text-sm'>
                  Shipping method:{' '}
                  <span className='text-foreground'>
                    {String(order.shippingMethodName)}
                  </span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className='text-right'>Unit Price</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.productImageUrl ? (
                      <img
                        src={String(item.productImageUrl)}
                        alt={item.productName}
                        className='h-10 w-10 rounded-md border object-cover'
                      />
                    ) : (
                      <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-md border text-xs'>
                        —
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {item.productName}
                  </TableCell>
                  <TableCell className='text-muted-foreground font-mono text-sm'>
                    {item.productSku ? String(item.productSku) : '—'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <MoneyDisplay amount={parseFloat(item.unitPrice)} />
                  </TableCell>
                  <TableCell className='text-right'>{item.quantity}</TableCell>
                  <TableCell className='text-right'>
                    <MoneyDisplay amount={parseFloat(item.lineTotal)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='space-y-2'>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Subtotal</dt>
              <dd>
                <MoneyDisplay amount={parseFloat(order.subtotal)} />
              </dd>
            </div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>
                  Discount
                  {order.couponCode && (
                    <span className='ml-1 font-mono text-xs'>
                      ({String(order.couponCode)})
                    </span>
                  )}
                </dt>
                <dd className='text-destructive'>
                  -<MoneyDisplay amount={parseFloat(order.discountAmount)} />
                </dd>
              </div>
            )}
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Shipping</dt>
              <dd>
                <MoneyDisplay amount={parseFloat(order.shippingCost)} />
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-muted-foreground'>Tax</dt>
              <dd>
                <MoneyDisplay amount={parseFloat(order.tax)} />
              </dd>
            </div>
            <Separator />
            <div className='flex justify-between text-lg font-semibold'>
              <dt>Total</dt>
              <dd>
                <MoneyDisplay amount={parseFloat(order.total)} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      {order.adminNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm whitespace-pre-wrap'>
              {String(order.adminNotes)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Link */}
      <div className='flex justify-end'>
        <Button variant='outline' asChild>
          <Link to='/payments'>View Payments</Link>
        </Button>
      </div>
    </div>
  );
};
