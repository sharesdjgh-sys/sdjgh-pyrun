const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

// Uses development-only pages and synthetic wardrobe data; never modifies student accounts.
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    await context.route('**/api/auth/session', route => route.fulfill({ json: null }));
    await context.route('**/api/customization', route => route.fulfill({ json: {
      activeCharacter: 'robot', inventory: [], pendingGrants: [],
      loadouts: { robot: {}, dog: {}, game: {}, wizard: {}, astronaut: {}, slime: {} }, aiProgress: { solved: 0, target: 3 },
    } }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = process.env.CHARACTER_QA_URL || 'http://127.0.0.1:3002';
    await page.goto(`${base}/character-size-preview`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: '크기 실행', exact: true }).waitFor({ timeout: 60000 });
    const results = [];
    const run = async (scale, direction, action) => {
      await page.getByRole('combobox', { name: '배율', exact: true }).selectOption(String(scale));
      await page.getByRole('combobox', { name: '방향', exact: true }).selectOption(direction);
      await page.getByRole('button', { name: action, exact: true }).click();
      await page.getByLabel('실행 상태').filter({ hasText: '완료' }).waitFor({ timeout: 15000 });
      // Allow interrupted dance/jump transforms to settle back to the requested size.
      await page.waitForFunction(() => [...document.querySelectorAll('[data-character] > svg')].every(svg => {
        const a = svg.getScreenCTM(); const b = svg.querySelector('g').getScreenCTM();
        return Math.abs(Math.hypot(a.a, a.b) - Math.hypot(b.a, b.b)) < .002 && Math.abs(Math.hypot(a.c, a.d) - Math.hypot(b.c, b.d)) < .002;
      }), { timeout: 10000 });
      const dimensions = await page.locator('[data-character] > svg').evaluateAll(elements => elements.map(svg => {
        const box = svg.getBoundingClientRect();
        return { character: svg.parentElement.dataset.character, width: box.width, height: box.height, flip: getComputedStyle(svg.parentElement).transform };
      }));
      assert.equal(dimensions.length, 2);
      for (const item of dimensions) {
        assert.ok(Math.abs(item.width - 70 * scale) < .1, JSON.stringify(item));
        assert.ok(Math.abs(item.height - 86 * scale) < .1, JSON.stringify(item));
        assert.equal(item.flip, direction === 'left' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'matrix(1, 0, 0, 1, 0, 0)');
      }
      results.push({ scale, direction, action, dimensions });
      console.log(`PASS size=${scale} direction=${direction} action=${action}`);
    };
    for (const scale of [.5, 1, 2.5, 3]) for (const direction of ['right', 'left']) await run(scale, direction, '크기 실행');
    for (const scale of [.5, 2.5]) {
      await run(scale, 'right', '점프 후 확인');
      await run(scale, 'left', '춤 후 확인');
      await page.screenshot({ path: `.next/robot-size-${scale}.png`, fullPage: true });
    }
    await run(1, 'right', '크기 실행');
    await page.goto(`${base}/character-preview`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: '꾸미기', exact: true }).click({ timeout: 60000 });
    const group = page.getByRole('group', { name: '옷장 캐릭터 선택' });
    const tiles = group.getByRole('button');
    const layout = await tiles.evaluateAll(elements => elements.map(el => ({
      name: el.getAttribute('aria-label'), x: Math.round(el.getBoundingClientRect().x), y: Math.round(el.getBoundingClientRect().y),
      fontSize: getComputedStyle(el.querySelector('span:nth-child(2)')).fontSize, overflow: el.scrollWidth > el.clientWidth,
    })));
    assert.equal(layout.length, 6);
    assert.equal(new Set(layout.map(x => x.x)).size, 2);
    assert.equal(new Set(layout.map(x => x.y)).size, 3);
    assert.ok(layout.every(x => x.fontSize === '11px' && !x.overflow));
    for (let i = 0; i < 6; i++) { await tiles.nth(i).click(); assert.equal(await group.locator('[aria-pressed="true"]').count(), 1); }
    await tiles.nth(0).click();
    await page.screenshot({ path: '.next/wardrobe-tiles-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.screenshot({ path: '.next/wardrobe-tiles-tablet.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ sizingCases: results.length, characters: 2, wardrobe: layout, pageErrors: errors }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
