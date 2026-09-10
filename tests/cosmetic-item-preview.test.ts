import test from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CosmeticItemPreview from "../components/customization/CosmeticItemPreview";
import { COSMETIC_FAMILIES } from "../lib/cosmetics";

Object.assign(globalThis, { React });

test("every cosmetic has a cropped item-only thumbnail using its wearable art", () => {
  for (const family of COSMETIC_FAMILIES) {
    const markup = renderToStaticMarkup(React.createElement(CosmeticItemPreview, { family }));
    assert.ok(markup.includes(`data-cosmetic-preview="${family.key}"`));
    assert.ok(markup.includes(`aria-label="${family.nameKo}"`));
    assert.ok(!markup.includes('viewBox="0 0 200 250"'), "each item has an explicit crop");
    assert.ok(!markup.includes("data-character="), "no character is dressed for the thumbnail");
    assert.ok(markup.includes('aria-hidden="true"'));
  }
});
