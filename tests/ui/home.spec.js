import { test, expect } from '@playwright/test'

function boxesOverlap(a, b) {
  if (!a || !b) return false
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  )
}

async function setTheme(page, theme) {
  await page.evaluate((value) => {
    document.documentElement.dataset.theme = value
    document.documentElement.classList.toggle('dark', value === 'dark')
    localStorage.setItem('bootcamp.theme', value)
    localStorage.setItem('bootcamp.uiMode', 'docs')
    document.documentElement.dataset.ui = 'docs'
    document.documentElement.classList.remove('ninja')
  }, theme)
}

test.describe('Home page UI', () => {
  test('loads hero, navigation, and primary CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1.display')).toContainText('Local-First')
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Empezar Clase 1/i })).toBeVisible()
  })

  test('desktop light: hero copy and logo do not overlap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await setTheme(page, 'light')

    const title = await page.locator('h1.display').boundingBox()
    const logo = await page.locator('.hero-logo img').boundingBox()

    expect(title).toBeTruthy()
    expect(logo).toBeTruthy()
    expect(boxesOverlap(title, logo)).toBe(false)
    expect(logo.x).toBeGreaterThan(title.x + title.width * 0.5)
  })

  test('desktop dark: hero copy and logo do not overlap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await setTheme(page, 'dark')

    const title = await page.locator('h1.display').boundingBox()
    const logo = await page.locator('.hero-logo img').boundingBox()

    expect(title).toBeTruthy()
    expect(logo).toBeTruthy()
    expect(boxesOverlap(title, logo)).toBe(false)
  })

  test('mobile: logo stacks above copy without covering title', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await setTheme(page, 'light')

    const title = await page.locator('h1.display').boundingBox()
    const logo = await page.locator('.hero-logo img').boundingBox()

    expect(title).toBeTruthy()
    expect(logo).toBeTruthy()
    expect(boxesOverlap(title, logo)).toBe(false)
    expect(logo.y + logo.height).toBeLessThanOrEqual(title.y + 4)
  })
})

test.describe('Core routes', () => {
  test('curriculum and class pages render', async ({ page }) => {
    await page.goto('/curriculum')
    await expect(page.locator('h1')).toBeVisible()

    await page.goto('/class/01')
    await expect(page.locator('h1')).toContainText('Airplane-Mode')
  })
})
