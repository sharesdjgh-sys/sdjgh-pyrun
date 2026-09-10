import test from "node:test";
import assert from "node:assert/strict";
import { PgDialect } from "drizzle-orm/pg-core";
import { cosmeticRewardClaimQuery } from "../lib/cosmetic-reward-query";
import { ACTIVE_CHARACTERS, randomRewardCandidates } from "../lib/cosmetics";

test("random claim SQL scopes the grant and commits ownership before consuming it", () => {
  for (const { type } of ACTIVE_CHARACTERS) {
    const query = new PgDialect().sqlToQuery(cosmeticRewardClaimQuery(11, 22, 33, type));
    assert.deepEqual(query.params.slice(0,3), [33,11,22]);
    assert.deepEqual(query.params.slice(3,16), randomRewardCandidates(type, []));
    assert.match(query.sql, /FOR UPDATE/);
    assert.match(query.sql, /claimed_at IS NULL/);
    assert.match(query.sql, /NOT EXISTS/);
    assert.match(query.sql, /ORDER BY random\(\) LIMIT 1/);
    assert.match(query.sql, /ON CONFLICT \(user_id, item_key\) DO NOTHING RETURNING item_key/);
    assert.match(query.sql, /FROM acquired, eligible_grant WHERE reward.id = eligible_grant.id/);
  }
});
