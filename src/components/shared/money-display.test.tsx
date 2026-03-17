import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoneyDisplay } from './money-display';

describe('MoneyDisplay', () => {
  it('should format amount as PLN currency', () => {
    render(<MoneyDisplay amount={99.99} />);
    expect(screen.getByText(/99,99/)).toBeInTheDocument();
    expect(screen.getByText(/zł/)).toBeInTheDocument();
  });

  it('should format zero amount', () => {
    render(<MoneyDisplay amount={0} />);
    expect(screen.getByText(/0,00/)).toBeInTheDocument();
  });

  it('should format large amounts', () => {
    render(<MoneyDisplay amount={1234.5} />);
    expect(screen.getByText(/1[\s\u00a0]?234,50/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MoneyDisplay amount={10} className='text-green-500' />,
    );
    expect(container.firstChild).toHaveClass('text-green-500');
  });
});
