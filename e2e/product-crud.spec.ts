import { test, expect } from './fixtures/auth.fixture';
import { mockProductsApi } from './fixtures/mock-api';

test.describe('Product CRUD', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await mockProductsApi(authenticatedPage);
  });

  test('should display products list', async ({ authenticatedPage }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Products' }),
    ).toBeVisible();

    await expect(
      authenticatedPage.getByText('Wireless Headphones'),
    ).toBeVisible();
  });

  test('should navigate to create product page', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await authenticatedPage
      .getByRole('link', { name: 'Create product' })
      .click();

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Create Product' }),
    ).toBeVisible();

    // Verify form fields are visible
    await expect(authenticatedPage.getByLabel('Name')).toBeVisible();
    await expect(
      authenticatedPage.getByRole('spinbutton', { name: /^Price/ }),
    ).toBeVisible();
  });

  test('should create a new product', async ({ authenticatedPage }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await authenticatedPage
      .getByRole('link', { name: 'Create product' })
      .click();

    // Fill required fields
    await authenticatedPage.getByLabel('Name').fill('Test Product');
    await authenticatedPage
      .getByRole('spinbutton', { name: /^Price/ })
      .fill('99.99');

    // Select category from the Radix combobox dropdown
    await authenticatedPage.locator('#categoryId').click();
    await authenticatedPage
      .getByRole('option', { name: 'Electronics' })
      .click();

    // Fill optional fields
    await authenticatedPage
      .getByLabel('Description')
      .fill('A great test product');
    await authenticatedPage.getByLabel('SKU').fill('TP-001');
    await authenticatedPage.getByLabel('Stock').fill('25');

    // Submit
    await authenticatedPage
      .getByRole('button', { name: 'Create product' })
      .click();

    // Verify success toast
    await expect(authenticatedPage.getByText('Product created')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('should show validation errors on submit attempt', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await authenticatedPage
      .getByRole('link', { name: 'Create product' })
      .click();

    // Type something to make form dirty, then clear it
    await authenticatedPage.getByLabel('Name').fill('x');
    await authenticatedPage.getByLabel('Name').clear();

    // Submit with force to bypass disabled state
    await authenticatedPage
      .getByRole('button', { name: 'Create product' })
      .click({ force: true });

    // Verify validation errors appear
    await expect(
      authenticatedPage.getByText('Name must be at least 2 characters'),
    ).toBeVisible();
  });

  test('should navigate to edit product page', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await expect(
      authenticatedPage.getByText('Wireless Headphones'),
    ).toBeVisible();

    // Open actions menu and click "View details"
    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'Wireless Headphones' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    await authenticatedPage
      .getByRole('menuitem', { name: 'View details' })
      .click();

    // Verify edit page loaded with product data
    await expect(
      authenticatedPage.getByRole('heading', {
        name: 'Wireless Headphones',
      }),
    ).toBeVisible();

    // Verify form is pre-filled
    await expect(authenticatedPage.getByLabel('Name')).toHaveValue(
      'Wireless Headphones',
    );
    await expect(
      authenticatedPage.getByRole('spinbutton', { name: /^Price/ }),
    ).toHaveValue('199.99');
  });

  test('should deactivate a product via actions menu', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await expect(
      authenticatedPage.getByText('Wireless Headphones'),
    ).toBeVisible();

    // Open actions menu
    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'Wireless Headphones' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    // Click "Deactivate"
    await authenticatedPage
      .getByRole('menuitem', { name: 'Deactivate' })
      .click();

    // Confirm in the dialog
    await expect(
      authenticatedPage.getByText('Deactivate product'),
    ).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Deactivate' }).click();

    // Verify success toast
    await expect(
      authenticatedPage.getByText('Product deactivated'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should delete a product via actions menu', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage
      .getByRole('navigation')
      .getByRole('link', { name: 'Products' })
      .click();

    await expect(
      authenticatedPage.getByText('Wireless Headphones'),
    ).toBeVisible();

    // Open actions menu
    await authenticatedPage
      .getByRole('row')
      .filter({ hasText: 'Wireless Headphones' })
      .getByRole('button', { name: 'Open menu' })
      .click();

    // Click "Delete"
    await authenticatedPage.getByRole('menuitem', { name: 'Delete' }).click();

    // Confirm in the dialog
    await expect(authenticatedPage.getByText('Delete product')).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Delete' }).click();

    // Verify success toast
    await expect(authenticatedPage.getByText('Product deleted')).toBeVisible({
      timeout: 5_000,
    });
  });
});
