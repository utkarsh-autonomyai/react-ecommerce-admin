import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useDataTable } from './data-table-context';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DataTablePagination = () => {
  const { meta, state, onStateChange } = useDataTable();

  const currentPage = state.page;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    onStateChange({ ...state, page });
  };

  const handlePageSizeChange = (value: string) => {
    onStateChange({ ...state, page: 1, limit: Number(value) });
  };

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-muted-foreground text-sm'>
        {total} result{total !== 1 ? 's' : ''}
      </p>

      <div className='flex flex-wrap items-center gap-x-6 gap-y-3'>
        <div className='flex items-center gap-2'>
          <p className='hidden text-sm sm:inline'>Rows per page</p>
          <Select
            value={String(state.limit)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className='h-8 w-18'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className='text-sm'>
          Page {currentPage} of {totalPages}
        </p>

        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => handlePageChange(1)}
            disabled={!canGoPrev}
          >
            <ChevronsLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canGoPrev}
          >
            <ChevronLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            <ChevronRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => handlePageChange(totalPages)}
            disabled={!canGoNext}
          >
            <ChevronsRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DataTablePagination };
