import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * ダイアログの世界基準動作:
 * - 開いたらダイアログへフォーカス
 * - Tab を internally 循環
 * - Escape で閉じる(購入中などは allowClose=false)
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

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!allowCloseRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const list = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .filter(el => !el.hasAttribute('inert'));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      prev?.focus();
    };
  }, []);

  return ref;
}
