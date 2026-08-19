import assert from "node:assert/strict";
import test from "node:test";
import { makeBrowserSessionCookie } from "../lib/browser-session-cookie";

test("removes persistence attributes from a newly issued Auth.js session cookie", () => {
  const response = new Response(null, {
    headers: {
      "set-cookie": "__Secure-authjs.session-token=token; Path=/; Expires=Fri, 18 Sep 2026 12:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
    },
  });

  makeBrowserSessionCookie(response);

  const cookie = response.headers.getSetCookie()[0];
  assert.match(cookie, /__Secure-authjs\.session-token=token/);
  assert.doesNotMatch(cookie, /Expires=/i);
  assert.doesNotMatch(cookie, /Max-Age=/i);
});

test("keeps an expired empty session cookie so sign-out can delete it", () => {
  const response = new Response(null, {
    headers: {
      "set-cookie": "__Secure-authjs.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
    },
  });

  makeBrowserSessionCookie(response);

  assert.match(response.headers.getSetCookie()[0], /Expires=Thu, 01 Jan 1970/i);
});

test("does not change non-session Auth.js cookies", () => {
  const response = new Response(null, {
    headers: {
      "set-cookie": "__Host-authjs.csrf-token=token; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax",
    },
  });

  makeBrowserSessionCookie(response);

  assert.match(response.headers.getSetCookie()[0], /Max-Age=900/i);
});
