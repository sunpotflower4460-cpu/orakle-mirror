import React from 'react';
import { Browser } from '../lib/capacitorMocks';
import { TERMS_URL, PRIVACY_URL, isLegalUrlPlaceholder } from '../lib/env';
import { useT } from '../i18n';

interface LegalLinksProps {
  style?: React.CSSProperties;
}

/**
 * 利用規約 / プライバシーポリシーへのリンクを描画する共有コンポーネント。
 * VITE_TERMS_URL / VITE_PRIVACY_URL が未設定またはプレースホルダの場合は何も表示しない。
 * App Store 審査必須要件（外部ブラウザで開くリンク）を満たす。
 */
export function LegalLinks({ style }: LegalLinksProps) {
  const t = useT();
  const showTerms = !isLegalUrlPlaceholder(TERMS_URL);
  const showPrivacy = !isLegalUrlPlaceholder(PRIVACY_URL);

  if (!showTerms && !showPrivacy) return null;

  const openLink = (url: string) => {
    Browser.open({ url }).catch(() => window.open(url, '_blank', 'noopener,noreferrer'));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, ...style }}>
      {showTerms && (
        <button
          onClick={() => openLink(TERMS_URL)}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {t('help.terms')}
        </button>
      )}
      {showPrivacy && (
        <button
          onClick={() => openLink(PRIVACY_URL)}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {t('help.privacy')}
        </button>
      )}
    </div>
  );
}
