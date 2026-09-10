import { sql } from "drizzle-orm";
import { randomRewardCandidates } from "./cosmetics";
import type { ActiveCharacterType } from "@/types";

// A single PostgreSQL statement is atomic, including inventory and grant consumption.
export function cosmeticRewardClaimQuery(userId: number, curriculumId: number, grantId: number, characterType: ActiveCharacterType) {
  const candidates = randomRewardCandidates(characterType, []);
  return sql`
    WITH eligible_grant AS MATERIALIZED (
      SELECT id, source_type FROM cosmetic_reward_grants
      WHERE id = ${grantId} AND user_id = ${userId} AND curriculum_id = ${curriculumId} AND claimed_at IS NULL
      FOR UPDATE
    ), candidate AS (
      SELECT item_key FROM unnest(ARRAY[${sql.join(candidates.map((key) => sql`${key}`), sql`, `)}]::text[]) AS items(item_key)
      WHERE NOT EXISTS (SELECT 1 FROM user_cosmetic_items owned WHERE owned.user_id = ${userId} AND owned.item_key = items.item_key)
      ORDER BY random() LIMIT 1
    ), acquired AS (
      INSERT INTO user_cosmetic_items (user_id, item_key, source)
      SELECT ${userId}, candidate.item_key, eligible_grant.source_type FROM eligible_grant CROSS JOIN candidate
      ON CONFLICT (user_id, item_key) DO NOTHING RETURNING item_key
    )
    UPDATE cosmetic_reward_grants AS reward
    SET selected_character = ${characterType}, item_key = acquired.item_key, claimed_at = now()
    FROM acquired, eligible_grant WHERE reward.id = eligible_grant.id
    RETURNING acquired.item_key AS "itemKey"
  `;
}
