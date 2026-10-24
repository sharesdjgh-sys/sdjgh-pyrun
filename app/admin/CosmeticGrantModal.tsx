"use client";

import { useEffect, useRef, useState } from "react";
import { Gift, LoaderCircle, X } from "lucide-react";
import CosmeticItemPreview from "@/components/customization/CosmeticItemPreview";
import { ACTIVE_CHARACTERS, characterCosmeticFamily, cosmeticItemKey, COSMETIC_FAMILIES } from "@/lib/cosmetics";
import type { ActiveCharacterType } from "@/types";
import styles from "./CosmeticGrantModal.module.css";

type Props = {
  user: { id: number; username: string; displayName: string | null; detail?: string };
  onClose: () => void;
};

export default function CosmeticGrantModal({ user, onClose }: Props) {
  const [character, setCharacter] = useState<ActiveCharacterType>("robot");
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeButton.current?.focus(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/users/${user.id}/cosmetics`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "아이템 목록을 불러오지 못했습니다.");
        setInventory(data.inventory ?? []);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "아이템 목록을 불러오지 못했습니다.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user.id]);

  async function grantItem() {
    if (!selectedItemKey || saving || inventory === null) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}/cosmetics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey: selectedItemKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "아이템을 지급하지 못했습니다.");
      setInventory((current) => current ? [...current, data.itemKey] : [data.itemKey]);
      setSelectedItemKey(null);
      const family = COSMETIC_FAMILIES.find((item) => cosmeticItemKey(item.key, character) === data.itemKey);
      setSuccess(`${family ? characterCosmeticFamily(family, character).nameKo : "아이템"} 지급을 완료했습니다.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "아이템을 지급하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = user.displayName || user.username;
  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="cosmetic-grant-title" onKeyDown={(event) => { if (event.key === "Escape" && !saving) onClose(); }}>
        <div className={styles.header}>
          <div>
            <h2 id="cosmetic-grant-title"><Gift size={20} aria-hidden="true" /> 꾸미기 아이템 지급</h2>
            <p><strong>{displayName}</strong> · @{user.username}{user.detail && <> · {user.detail}</>}</p>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} disabled={saving} aria-label="아이템 지급 창 닫기"><X size={18} /></button>
        </div>

        <div className={styles.body}>
          <p className={styles.hint}>지급할 캐릭터와 아이템을 선택하세요. 보유 중인 아이템은 다시 지급할 수 없습니다.</p>
          <div className={styles.characters} role="group" aria-label="캐릭터 선택">
            {ACTIVE_CHARACTERS.map((option) => (
              <button key={option.type} type="button" aria-pressed={character === option.type}
                className={character === option.type ? styles.characterActive : ""}
                onClick={() => { setCharacter(option.type); setSelectedItemKey(null); setError(""); setSuccess(""); }}>
                {option.label}
              </button>
            ))}
          </div>
          {loading ? <p className={styles.notice} role="status">보유 아이템을 확인하는 중...</p> : inventory === null ? (
            <p className={styles.notice}>보유 아이템을 확인할 수 없어 지급을 진행할 수 없습니다.</p>
          ) : (
            <div className={styles.items} role="group" aria-label={`${ACTIVE_CHARACTERS.find((option) => option.type === character)?.label} 아이템 선택`}>
              {COSMETIC_FAMILIES.map((family) => {
                const itemKey = cosmeticItemKey(family.key, character);
                const owned = inventory.includes(itemKey);
                const name = characterCosmeticFamily(family, character).nameKo;
                return (
                  <button key={itemKey} type="button" className={styles.item}
                    aria-pressed={selectedItemKey === itemKey} disabled={owned || saving}
                    onClick={() => { setSelectedItemKey(itemKey); setError(""); setSuccess(""); }}>
                    <CosmeticItemPreview family={family} characterType={character} />
                    <span><strong>{name}</strong><small>{owned ? "보유 중" : selectedItemKey === itemKey ? "선택됨" : "지급 가능"}</small></span>
                  </button>
                );
              })}
            </div>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          {success && <p className={styles.success} role="status">{success}</p>}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} disabled={saving}>닫기</button>
          <button type="button" onClick={() => void grantItem()} disabled={!selectedItemKey || inventory === null || saving}>
            {saving ? <><LoaderCircle size={16} className={styles.spin} /> 지급 중...</> : "선택한 아이템 지급"}
          </button>
        </div>
      </div>
    </div>
  );
}
