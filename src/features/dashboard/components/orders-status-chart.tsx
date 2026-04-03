import { useQuery } from '@tanstack/react-query';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ordersControllerGetAllOrdersOptions } from '@/api/generated/@tanstack/react-query.gen';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'var(--chart-1)',
  CONFIRMED: 'var(--chart-2)',
  PROCESSING: 'var(--chart-3)',
  SHIPPED: 'var(--chart-4)',
  DELIVERED: 'var(--chart-5)',
  CANCELLED: 'var(--destructive)',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

type StatusCount = {
  name: string;
  value: number;
  fill: string;
};

const OrdersStatusChart = () => {
  const pendingQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'PENDING' },
    }),
  );
  const confirmedQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'CONFIRMED' },
    }),
  );
  const processingQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'PROCESSING' },
    }),
  );
  const shippedQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'SHIPPED' },
    }),
  );
  const deliveredQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'DELIVERED' },
    }),
  );
  const cancelledQuery = useQuery(
    ordersControllerGetAllOrdersOptions({
      query: { limit: '1', status: 'CANCELLED' },
    }),
  );

  const queries = [
    pendingQuery,
    confirmedQuery,
    processingQuery,
    shippedQuery,
    deliveredQuery,
    cancelledQuery,
  ];

  const isLoading = queries.some((q) => q.isLoading);

  const chartData: StatusCount[] = ORDER_STATUSES.map((status, i) => ({
    name: STATUS_LABELS[status],
    value: queries[i].data?.meta?.total ?? 0,
    fill: STATUS_COLORS[status],
  })).filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
          <CardDescription>Current distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-75 w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>Current distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-62.5 sm:h-75'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              />
              <Tooltip formatter={(value) => [Number(value), 'Orders']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='mt-4 flex flex-wrap justify-center gap-4'>
          {chartData.map((entry) => (
            <div key={entry.name} className='flex items-center gap-2 text-sm'>
              <div
                className='size-3 rounded-full'
                style={{ backgroundColor: entry.fill }}
              />
              <span className='text-muted-foreground'>
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { OrdersStatusChart };
