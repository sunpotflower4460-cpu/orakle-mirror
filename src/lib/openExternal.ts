import { Browser } from './capacitorMocks';

/**
 * 利用規約・サポート・サブ管理など、審査で外部ブラウザ遷移が必要な URL を開く。
 * mailto は Capacitor Browser が扱えないため OS のメーラーへ渡す。
 */
export function openExternalUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) return;
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    window.location.href = trimmed;
    return;
  }
  Browser.open({ url: trimmed }).catch(() => {
    window.open(trimmed, '_blank', 'noopener,noreferrer');
  });
}
