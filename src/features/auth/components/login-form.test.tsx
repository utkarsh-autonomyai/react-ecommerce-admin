import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogin = vi.fn();

vi.mock('../api/auth.api', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  AdminRoleError: class AdminRoleError extends Error {
    constructor() {
      super('Access denied. Admin privileges required.');
      this.name = 'AdminRoleError';
    }
  },
}));

describe('LoginForm', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('should call login and navigate on successful submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'password');
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('should navigate to redirectTo path on success', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginForm redirectTo='/products' />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/products' });
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid email or password. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('should show admin role error message', async () => {
    const user = userEvent.setup();
    const { AdminRoleError } = await import('../api/auth.api');
    mockLogin.mockRejectedValueOnce(new AdminRoleError());
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'customer@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Access denied. Admin privileges required.'),
      ).toBeInTheDocument();
    });
  });

  it('should show submitting state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin: () => void;
    mockLogin.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: 'Signing in...' }),
    ).toBeDisabled();

    resolveLogin!();
  });
});
