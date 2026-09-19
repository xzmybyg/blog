import { expect, test, type Page, type Request } from '@playwright/test'

const json = (body: unknown) => ({
  contentType: 'application/json',
  body: JSON.stringify(body),
})

async function mockPublicApis(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())

    if (url.pathname === '/api/site-statistics/view') {
      await route.fulfill({ status: 204 })
    } else if (url.pathname === '/api/article/') {
      await route.fulfill(json([{
        id: 1,
        title: '测试文章',
        description: '用于验证公开文章导航',
        createTime: '2026-09-15T00:00:00.000Z',
        labelIds: [1],
        topicId: 1,
        topicName: '自动化测试',
      }]))
    } else if (url.pathname === '/api/label') {
      await route.fulfill(json([{ id: 1, label: '测试' }]))
    } else if (url.pathname === '/api/article-topic') {
      await route.fulfill(json([{ id: 1, name: '自动化测试', description: 'E2E' }]))
    } else if (url.pathname === '/api/site-notice') {
      await route.fulfill(json({ content: '测试公告' }))
    } else if (url.pathname === '/api/topic') {
      await route.fulfill({ contentType: 'text/markdown', body: '# E2E 正文' })
    } else if (url.pathname === '/api/article/navigation') {
      await route.fulfill(json({ topic: null, previous: null, next: null }))
    } else if (url.pathname === '/api/article/likes') {
      await route.fulfill(json({ likes: 3 }))
    } else if (url.pathname === '/api/comment') {
      await route.fulfill(json([]))
    } else {
      await route.fulfill(json({}))
    }
  })
}

async function mockAdminDashboardApis(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const responses: Record<string, unknown> = {
      '/api/certificate': {
        domain: 'example.test',
        validTo: '2030-01-01T00:00:00.000Z',
        remainingDays: 100,
        issuer: 'E2E',
      },
      '/api/site-statistics': { pageViews: 10, uniqueVisitors: 2 },
      '/api/home-content': {
        eyebrow: 'TEST',
        title: '测试首页',
        authorName: '测试用户',
        description: '自动化测试内容',
        typedTexts: ['开发者'],
      },
      '/api/site-notice': { content: '测试公告' },
      '/api/site-background/home/info': { exists: false },
      '/api/site-background/message/info': { exists: false },
    }

    await route.fulfill(json(responses[url.pathname] ?? {}))
  })
}

test('公开文章列表可以进入文章详情', async ({ page }) => {
  await mockPublicApis(page)

  await page.goto('/article')
  await expect(page.getByRole('heading', { name: '文章归档' })).toBeVisible()
  await page.getByRole('link', { name: '阅读文章：测试文章' }).click()

  await expect(page).toHaveURL(/\/topic\/1$/)
  await expect(page.getByRole('article', { name: '文章正文' })).toContainText('E2E 正文')
})

test('未登录访问后台会跳转，登录使用 POST 且密码不进入 URL', async ({ page }) => {
  let loginRequest: Request | undefined
  await page.route('**/api/users/login', async (route) => {
    loginRequest = route.request()
    await route.fulfill({ status: 401, ...json({ message: '账号或密码错误' }) })
  })

  await page.goto('/admin/error-monitor')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await page.getByPlaceholder('账号').fill('viewer_test')
  await page.getByPlaceholder('密码').fill('Secret-123')
  await page.getByRole('button', { name: /登\s*录/ }).click()

  await expect.poll(() => loginRequest?.method()).toBe('POST')
  expect(loginRequest?.postDataJSON()).toEqual({ username: 'viewer_test', password: 'Secret-123' })
  expect(loginRequest?.url()).not.toContain('Secret-123')
  await expect(page).not.toHaveURL(/password=/)
  await expect(page.getByText('账号或密码错误')).toBeVisible()
})

test('viewer 可以浏览后台但不能使用编辑功能', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('user-store', JSON.stringify({
      state: {
        id: 7,
        username: 'viewer_test',
        avatar: '',
        nickname: '只读访客',
        role: 'viewer',
        email: 'viewer@example.com',
        token: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjQxMDI0NDQ4MDB9.x',
      },
      version: 0,
    }))
  })
  await mockAdminDashboardApis(page)

  await page.goto('/admin/')

  await expect(page.getByText('只读浏览模式')).toBeVisible()
  await expect(page.getByText('添加文章')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '保存首页文案' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '保存站点公告' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '立即更新' })).toBeDisabled()
})
