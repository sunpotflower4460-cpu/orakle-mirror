import React from 'react';
import { Browser } from '../lib/capacitorMocks';
import { TERMS_URL, PRIVACY_URL, SUPPORT_URL, SUPPORT_EMAIL, isLegalUrlPlaceholder } from '../lib/env';
import { useT } from '../i18n';

interface LegalLinksProps {
  style?: React.CSSProperties;
}

/**
 * 利用規約 / プライバシーポリシー / サポートへのリンクを描画する共有コンポーネント。
 * VITE_TERMS_URL / VITE_PRIVACY_URL が未設定またはプレースホルダの場合は非表示。
 * App Store 審査必須要件（外部ブラウザで開くリンク）を満たす。
 */
export function LegalLinks({ style }: LegalLinksProps) {
  const t = useT();
  const showTerms = !isLegalUrlPlaceholder(TERMS_URL);
  const showPrivacy = !isLegalUrlPlaceholder(PRIVACY_URL);
  const showSupport = SUPPORT_URL.trim().length > 0 || SUPPORT_EMAIL.trim().length > 0;

  if (!showTerms && !showPrivacy && !showSupport) return null;

  const openLink = (url: string) => {
    Browser.open({ url }).catch(() => window.open(url, '_blank', 'noopener,noreferrer'));
  };

  const supportHref = SUPPORT_URL.trim() || `mailto:${SUPPORT_EMAIL.trim()}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', ...style }}>
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
      {showSupport && (
        <button
          onClick={() => openLink(supportHref)}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {t('help.support')}
        </button>
      )}
    </div>
  );
}
