const { test, expect } = require('@playwright/test');

test('renders the correct number of Casilla components', async ({ page }) => {
  // Go to your app's page
  await page.goto('http://localhost:3000');

  // Count the number of Casilla components
  const casillaCount = await page.$$eval('.casilla-base', casillas => casillas.length);

  // Assuming that your Tablero component should render 64 Casilla components
  // for an 8x8 chess board
  expect(casillaCount).toBe(64);
});