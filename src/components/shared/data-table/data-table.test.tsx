import { render, screen } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './data-table';
import type { DataTableState } from './types';

type TestRow = {
  id: string;
  name: string;
  price: number;
};

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'price', header: 'Price' },
];

const testData: TestRow[] = [
  { id: '1', name: 'Widget', price: 9.99 },
  { id: '2', name: 'Gadget', price: 19.99 },
  { id: '3', name: 'Doohickey', price: 29.99 },
];

const defaultState: DataTableState = {
  page: 1,
  limit: 10,
};

describe('DataTable', () => {
  it('should render column headers', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        state={defaultState}
        onStateChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        state={defaultState}
        onStateChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.getByText('Doohickey')).toBeInTheDocument();
  });

  it('should render cell values', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        state={defaultState}
        onStateChange={vi.fn()}
      />,
    );
    expect(screen.getByText('9.99')).toBeInTheDocument();
    expect(screen.getByText('19.99')).toBeInTheDocument();
  });

  it('should render empty message when no data', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        state={defaultState}
        onStateChange={vi.fn()}
      />,
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        state={defaultState}
        onStateChange={vi.fn()}
        emptyMessage='No products available.'
      />,
    );
    expect(screen.getByText('No products available.')).toBeInTheDocument();
  });

  it('should render children (toolbar slot)', () => {
    render(
      <DataTable
        columns={columns}
        data={testData}
        state={defaultState}
        onStateChange={vi.fn()}
      >
        <div>Toolbar Content</div>
      </DataTable>,
    );
    expect(screen.getByText('Toolbar Content')).toBeInTheDocument();
  });
});
