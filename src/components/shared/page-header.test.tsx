import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('should render the title', () => {
    render(<PageHeader title='Products' />);
    expect(
      screen.getByRole('heading', { name: 'Products' }),
    ).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <PageHeader title='Products' description='Manage your product catalog' />,
    );
    expect(screen.getByText('Manage your product catalog')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(<PageHeader title='Products' />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('should render action children', () => {
    render(
      <PageHeader title='Products'>
        <button>Add Product</button>
      </PageHeader>,
    );
    expect(
      screen.getByRole('button', { name: 'Add Product' }),
    ).toBeInTheDocument();
  });
});
