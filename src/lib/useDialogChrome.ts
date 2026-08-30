import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const BODY_LOCK_ATTR = 'data-om-dialog-locks';

function isVisibleFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('inert') || el.closest('[inert]')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  return el.getClientRects().length > 0;
}

function collectFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisibleFocusable);
}

function lockScroll(): void {
  const n = Number(document.body.getAttribute(BODY_LOCK_ATTR) || '0');
  document.body.setAttribute(BODY_LOCK_ATTR, String(n + 1));
  if (n === 0) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
}

function unlockScroll(): void {
  const n = Number(document.body.getAttribute(BODY_LOCK_ATTR) || '1') - 1;
  if (n <= 0) {
    document.body.removeAttribute(BODY_LOCK_ATTR);
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  } else {
    document.body.setAttribute(BODY_LOCK_ATTR, String(n));
  }
}

/**
 * ダイアログの世界基準動作:
 * - 開いたらダイアログへフォーカス
 * - Tab を internally 循環(コンテナ自身や背景へ漏れない)
 * - Escape で閉じる(購入中などは allowClose=false)
 * - 背面を inert + スクロールロック
 * - 閉じたら元の要素へフォーカスを返す
 */
export function useDialogChrome(onClose: () => void, allowClose = true) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const allowCloseRef = useRef(allowClose);
  onCloseRef.current = onClose;
  allowCloseRef.current = allowClose;

  useEffect(() => {
    const node = ref.current;
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.focus();
    lockScroll();

    const inertRestored: { el: Element; had: boolean }[] = [];
    const parent = node?.parentElement;
    if (parent) {
      for (const child of Array.from(parent.children)) {
        if (child === node) continue;
        inertRestored.push({ el: child, had: child.hasAttribute('inert') });
        child.setAttribute('inert', '');
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (allowCloseRef.current) onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const list = collectFocusable(node);
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && node.contains(active);

      // 背面や tabindex=-1 のコンテナにいるときは、循環の端へ引き戻す。
      if (!inside || active === node) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      unlockScroll();
      inertRestored.forEach(({ el, had }) => {
        if (had) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
      prev?.focus();
    };
  }, []);

  return ref;
}
