import { test, expect } from './fixtures/auth.fixture';
import { mockOrdersApi } from './fixtures/mock-api';

test.describe('Order Status Workflow', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await mockOrdersApi(authenticatedPage);
  });

  test('should display orders list with mock data', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Orders' })
      .click();

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Orders' }),
    ).toBeVisible();

    // Verify order data
    await expect(authenticatedPage.getByText('ORD-20250601-001')).toBeVisible();
  });

  test('should navigate to order detail page', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Orders' })
      .click();

    await expect(authenticatedPage.getByText('ORD-20250601-001')).toBeVisible();

    // Open actions menu and click "View details"
    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'ORD-20250601-001' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    await authenticatedPage
      .getByRole('menuitem', { name: 'View details' })
      .click();

    // Verify order detail page loaded
    await expect(
      authenticatedPage.getByRole('heading', {
        name: 'Order ORD-20250601-001',
      }),
    ).toBeVisible();

    // Verify key sections
    await expect(
      authenticatedPage.getByText('Order Information'),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText('Customer', { exact: true }),
    ).toBeVisible();
    await expect(authenticatedPage.getByText('Shipping Address')).toBeVisible();
    await expect(authenticatedPage.getByText('Order Items')).toBeVisible();
    await expect(
      authenticatedPage.getByText('Financial Summary'),
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText('Update Status', { exact: true }).first(),
    ).toBeVisible();

    // Verify customer info
    await expect(authenticatedPage.getByText('John Doe')).toBeVisible();

    // Verify order item
    await expect(
      authenticatedPage.getByText('Wireless Headphones'),
    ).toBeVisible();
  });

  test('should update order status from Pending to Confirmed', async ({
    authenticatedPage,
  }) => {
    // Navigate to order detail
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Orders' })
      .click();

    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'ORD-20250601-001' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    await authenticatedPage
      .getByRole('menuitem', { name: 'View details' })
      .click();

    // Wait for detail page
    await expect(
      authenticatedPage.getByText('Update Status', { exact: true }).first(),
    ).toBeVisible();

    // "Confirmed" is already the default selection (first valid transition from PENDING)
    // Add admin notes via placeholder since label association may not exist
    await authenticatedPage
      .getByPlaceholder('Optional notes about this status change...')
      .fill('Order verified, proceeding to confirmation');

    // Submit
    await authenticatedPage
      .getByRole('button', { name: 'Update Status' })
      .click();

    // Verify success toast
    await expect(
      authenticatedPage.getByText('Order status updated'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should show back to orders link', async ({ authenticatedPage }) => {
    // Navigate to order detail
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Orders' })
      .click();

    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'ORD-20250601-001' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    await authenticatedPage
      .getByRole('menuitem', { name: 'View details' })
      .click();

    // Click back to orders
    await authenticatedPage
      .getByRole('link', { name: 'Back to orders' })
      .click();

    // Should be back on orders list
    await expect(
      authenticatedPage.getByRole('heading', { name: 'Orders' }),
    ).toBeVisible();
  });
});
