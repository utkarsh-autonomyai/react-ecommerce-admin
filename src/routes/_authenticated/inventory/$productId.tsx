import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

import {
  inventoryControllerGetStockOptions,
  inventoryControllerGetMovementHistoryOptions,
} from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdjustStockForm } from '@/features/inventory/components/adjust-stock-form';
import { stockHistoryColumns } from '@/features/inventory/components/stock-history-columns';

const historySearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/_authenticated/inventory/$productId')({
  validateSearch: historySearchSchema,
  component: InventoryDetailPage,
});

function InventoryDetailPage() {
  const { productId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: stockData, isLoading: isStockLoading } = useQuery(
    inventoryControllerGetStockOptions({ path: { productId } }),
  );

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    ...inventoryControllerGetMovementHistoryOptions({
      path: { productId },
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
      },
    }),
    placeholderData: keepPreviousData,
  });

  const handleHistoryStateChange = (state: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    navigate({
      to: '/inventory/$productId',
      params: { productId },
      search: state,
    });
  };

  const stock = stockData?.data;
  useDocumentTitle(stock ? `Inventory: ${stock.name}` : undefined);

  if (isStockLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!stock) {
    return <div>Product not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={stock.name}
        description='Manage stock levels and view movement history'
      >
        <Button variant='outline' asChild>
          <Link to='/inventory'>
            <ArrowLeft size={16} />
            Back to inventory
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                <div>
                  <p className='text-muted-foreground text-sm'>Total Stock</p>
                  <p className='text-2xl font-bold'>{stock.stock}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Reserved</p>
                  <p className='text-2xl font-bold'>{stock.reservedStock}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Available</p>
                  <p className='text-2xl font-bold'>{stock.availableStock}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Threshold</p>
                  <p className='text-2xl font-bold'>
                    {stock.lowStockThreshold}
                  </p>
                </div>
              </div>
              <div className='mt-4'>
                {stock.isLowStock ? (
                  <Badge variant='destructive'>Low Stock</Badge>
                ) : (
                  <Badge variant='default'>In Stock</Badge>
                )}
                {typeof stock.sku === 'string' && (
                  <span className='text-muted-foreground ml-3 font-mono text-sm'>
                    SKU: {stock.sku}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className='mb-4 text-lg font-semibold'>Movement History</h3>
            {isHistoryLoading && !historyData ? (
              <DataTableSkeleton columnCount={6} rowCount={search.limit} />
            ) : (
              <DataTable
                columns={stockHistoryColumns}
                data={historyData?.data ?? []}
                meta={historyData?.meta}
                state={search}
                onStateChange={handleHistoryStateChange}
              >
                <DataTablePagination />
              </DataTable>
            )}
          </div>
        </div>

        <div>
          <AdjustStockForm key={productId} productId={productId} />
        </div>
      </div>
    </div>
  );
}
