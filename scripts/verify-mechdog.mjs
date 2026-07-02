import { chromium } from "playwright-core";

const BASE = "http://localhost:3001";
const shot = (page, name) => page.screenshot({ path: `scripts/shots/${name}.png` });

// 1. API 로 로그인해서 세션 쿠키 획득 (UI 로그인은 하이드레이션 레이스가 있어 우회)
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
const { csrfToken } = await csrfRes.json();
const csrfCookies = csrfRes.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  redirect: "manual",
  headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: csrfCookies },
  body: new URLSearchParams({ csrfToken, username: "mechdogtest2", password: "test1234" }),
});
const sessionCookie = loginRes.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .find((c) => c.includes("session-token"));
if (!sessionCookie) throw new Error("세션 쿠키 획득 실패");
const [name, ...rest] = sessionCookie.split("=");
console.log("session cookie:", name);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--disable-gpu", "--no-sandbox"],
});
const context = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await context.addCookies([
  { name, value: rest.join("="), url: BASE, httpOnly: true, sameSite: "Lax" },
]);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// 2. learn 페이지 → mechdog 모드 전환
await page.goto(`${BASE}/learn`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector("select", { timeout: 90000 });
await page.waitForTimeout(2000); // 하이드레이션 대기
await page.selectOption("select", "mechdog");
await page.waitForTimeout(2000);
await shot(page, "03-mechdog-mode");

// "동작 실행" 예제 선택 (악수/끄덕이기/권투 데모)
await page.locator("button", { hasText: "동작 실행" }).first().click();
await page.waitForTimeout(1000);

// 3. 파이썬 엔진 로드 대기 후 예제 실행
try {
  await page.waitForSelector("text=파이썬 엔진 로드 중", { state: "detached", timeout: 120000 });
} catch { /* 이미 사라진 경우 */ }
await page.waitForTimeout(1000);
const stage = page.locator('div[class*="aspect-"]').first();
await page.getByRole("button", { name: "실행", exact: true }).click();
// 애니메이션 시퀀스를 1.6초 간격으로 캡처
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(1600);
  await stage.screenshot({ path: `scripts/shots/seq-${String(i).padStart(2, "0")}.png` });
}

console.log("PAGE ERRORS:", errors.length ? errors.join("\n") : "(none)");
await browser.close();
