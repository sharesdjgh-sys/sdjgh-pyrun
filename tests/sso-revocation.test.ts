import assert from "node:assert/strict";
import test from "node:test";
import { exchangeSsoToken, verifySsoSession } from "../lib/ssoVerify";
import { isCurrentAuthToken, nativeAccessAllowed } from "../lib/sso-session";

test("PyRun asks for its own proof and revocation denies the next session read", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ token: string; appId: string }> = [];
  const registrationId = "11111111-1111-4111-8111-111111111111";
  let revoked = false;
  try {
    globalThis.fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      requests.push(body);
      if (revoked) return new Response(JSON.stringify({ valid: false }), { status: 401 });
      if (body.token === "fictional-platform-jwt") {
        return Response.json({ valid: true, user: {
          userId: "fictional-B-id", registrationId, uid: "24-10101", name: "가상 학생", role: "학생",
        }, sessionProof: "fictional-pyrun-proof" });
      }
      // 증명 자체에는 학번이 없지만 중앙 응답에는 현재 학번이 있다.
      return Response.json({ valid: true, user: { userId: "fictional-B-id", registrationId, uid: "24-10101" } });
    };
    const exchange = await exchangeSsoToken("fictional-platform-jwt");
    assert.equal(exchange?.sessionProof, "fictional-pyrun-proof");
    assert.equal(exchange?.user.userId, "fictional-B-id");
    const token = { authOrigin: "smart-campus-v2", centralUserId: "fictional-B-id",
      centralRegistrationId: registrationId, centralUid: "24-10101",
      ssoCredential: exchange!.sessionProof, userId: 7, schoolId: 1, role: "student" };
    const bindingCurrent = async () => true;
    assert.equal(await isCurrentAuthToken(token, verifySsoSession, bindingCurrent), true);
    revoked = true;
    assert.equal(await isCurrentAuthToken(token, verifySsoSession, bindingCurrent), false);
    assert.deepEqual(requests.map(request => request.appId), ["pyrun", "pyrun", "pyrun"]);
    assert.deepEqual(requests.map(request => request.token),
      ["fictional-platform-jwt", "fictional-pyrun-proof", "fictional-pyrun-proof"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("valid central proof cannot keep a session after its app binding changes", async () => {
  const token = { authOrigin: "smart-campus-v2", centralUserId: "fictional-B-id",
    centralRegistrationId: "11111111-1111-4111-8111-111111111111",
    centralUid: "24-10101", ssoCredential: "fictional-proof",
    userId: 7, schoolId: 1, role: "student" };
  const verify = async () => true;
  let seen: unknown = null;
  const bindingCurrent = async (identity: unknown) => { seen = identity; return false; };
  assert.equal(await isCurrentAuthToken(token, verify, bindingCurrent), false);
  assert.deepEqual(seen, { schoolId: 1, localUserId: 7, role: "student",
    centralUserId: "fictional-B-id", registrationId: token.centralRegistrationId });
  assert.equal(await isCurrentAuthToken(token, verify, async () => true), true);
  assert.equal(await isCurrentAuthToken({ ...token, userId: undefined }, verify, async () => true), false);
});

test("central identity mismatch and outage both reject an SSO session", async () => {
  const originalFetch = globalThis.fetch;
  const registrationId = "11111111-1111-4111-8111-111111111111";
  try {
    globalThis.fetch = async () => Response.json({ valid: true, user: {
      userId: "different-B-id", registrationId } });
    assert.equal(await verifySsoSession("fictional-proof", "fictional-B-id", registrationId, "24-10101"), false);
    globalThis.fetch = async () => Response.json({ valid: true, user: {
      userId: "fictional-B-id", registrationId: "22222222-2222-4222-8222-222222222222" } });
    assert.equal(await verifySsoSession("fictional-proof", "fictional-B-id", registrationId, "24-10101"), false);
    globalThis.fetch = async () => Response.json({ valid: true, user: {
      userId: "fictional-B-id", registrationId, uid: "24-20101" } });
    assert.equal(await verifySsoSession("fictional-proof", "fictional-B-id", registrationId, "24-10101"), false);
    globalThis.fetch = async () => { throw new Error("fictional network outage"); };
    assert.equal(await verifySsoSession("fictional-proof", "fictional-B-id", registrationId, "24-10101"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("native login remains local; unmarked legacy JWT cannot keep an old SSO session", async () => {
  let calls = 0;
  const verify = async () => { calls++; return true; };
  assert.equal(await isCurrentAuthToken({ authOrigin: "native-v2" }, verify), true);
  assert.equal(await isCurrentAuthToken({}, verify), false);
  assert.equal(await isCurrentAuthToken({ authOrigin: "smart-campus-v2" }, verify), false);
  assert.equal(await isCurrentAuthToken({ authOrigin: "smart-campus-v2",
    centralUserId: "fictional-B-id", ssoCredential: "old-proof" }, verify), false);
  assert.equal(calls, 0);
});

test("optional bound-account policy denies both new native login and an old native session", async () => {
  const bound = async () => true;
  const independent = async () => false;
  assert.equal(await nativeAccessAllowed(7, 1, bound, false), true);
  assert.equal(await nativeAccessAllowed(7, 1, bound, true), false);
  assert.equal(await nativeAccessAllowed(8, 1, independent, true), true);
  assert.equal(await nativeAccessAllowed(7, 1, async () => { throw new Error("db unavailable"); }, true), false);
  const nativeToken = { authOrigin: "native-v2", userId: 7, schoolId: 1 };
  assert.equal(await isCurrentAuthToken(nativeToken, async () => true,
    async () => true, async () => false), false);
  assert.equal(await isCurrentAuthToken(nativeToken, async () => true,
    async () => true, async () => true), true);
});
