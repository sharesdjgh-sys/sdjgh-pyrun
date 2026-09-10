import test from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CosmeticItemPreview from "../components/customization/CosmeticItemPreview";
import { ACTIVE_CHARACTERS, COSMETIC_FAMILIES, characterCosmeticFamily } from "../lib/cosmetics";
import CharacterCosmetics from "../components/robot/CharacterCosmetics";

Object.assign(globalThis, { React });

test("every cosmetic has a cropped item-only thumbnail using its wearable art", () => {
  for (const { type: characterType } of ACTIVE_CHARACTERS) for (const family of COSMETIC_FAMILIES) {
    const markup = renderToStaticMarkup(React.createElement(CosmeticItemPreview, { family, characterType }));
    assert.ok(markup.includes(`data-cosmetic-preview="${family.key}:${characterType}"`));
    assert.ok(markup.includes(`aria-label="${characterCosmeticFamily(family, characterType).nameKo}"`));
    assert.ok(!markup.includes('viewBox="0 0 200 250"'), "each item has an explicit crop");
    assert.ok(!markup.includes("data-character="), "no character is dressed for the thumbnail");
    assert.ok(markup.includes('aria-hidden="true"'));
  }
});

test("all 78 character items have distinct names and character-specific geometry", () => {
  const names = ACTIVE_CHARACTERS.flatMap(({type})=>COSMETIC_FAMILIES.map(f=>characterCosmeticFamily(f,type).nameKo));
  assert.equal(new Set(names).size, 78);
  for (const family of COSMETIC_FAMILIES) {
    const art = ACTIVE_CHARACTERS.map(({type}) => {
      const markup = renderToStaticMarkup(React.createElement(CosmeticItemPreview, { family, characterType: type }));
      return [...markup.matchAll(/\bd="([^"]+)"/g)].map(match=>match[1]).join("|");
    });
    assert.equal(new Set(art).size, 6, family.key);
  }
});

test("wearable rendering rejects the wrong character and wrong slot", () => {
  for (const loadout of [{head:"pastel-cap:dog"}, {head:"round-glasses:robot"}]) {
    const markup = renderToStaticMarkup(React.createElement(CharacterCosmetics, { characterType:"robot", loadout, layer:"front" }));
    assert.ok(!markup.includes("data-item-art"));
  }
});
