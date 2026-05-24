// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Purchases } from '../lib/capacitorMocks';

export function SubscribeModal({ onClose, onSubscribe, onRestore, isPurchasing }) {
  const [price, setPrice] = useState('取得中...');

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    let mounted = true;
    Purchases.getOfferings()
      .then(offerings => {
        if (mounted && offerings?.current?.monthly?.product?.priceString) {
          setPrice(offerings.current.monthly.product.priceString);
        } else {
          setPrice('不明');
        }
      })
      .catch(() => { if (mounted) setPrice('確認できません'); });
    return () => { mounted = false; };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="subscribeTitle" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 28, maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: 16, background: '#f8fafc', borderRadius: '50%', marginBottom: 20 }}>
          <Lock size={32} color="#64748b" />
        </div>
        <h2 id="subscribeTitle" style={{ fontSize: 18, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '0.1em' }}>
          本日の導きは<br/>ここまでです
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
          無料の鏡が映せるのは1日3回まで。<br/>
          月額プランにご登録いただくと、<br/>
          宇宙との繋がりが永遠に解放され、<br/>
          回数制限なく無限の神託を受け取れます。
        </p>
        
        {/* App Store審査対応: 価格表示 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>
          月額 {price} <span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>（自動更新）</span>
        </div>

        <button onClick={onSubscribe} disabled={isPurchasing} style={{
          width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: '#fff',
          borderRadius: 999, fontSize: 12, letterSpacing: '0.15em', minHeight: 48,
          fontWeight: 700, cursor: isPurchasing ? 'not-allowed' : 'pointer', border: 'none', 
          boxShadow: isPurchasing ? 'none' : '0 8px 24px rgba(15,23,42,0.25)', opacity: isPurchasing ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, transition: 'opacity 0.2s'
        }}>
          {isPurchasing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Unlock size={14} />} 
          {isPurchasing ? '処理中...' : '無限の導きを解放する'}
        </button>
        <button onClick={onClose} disabled={isPurchasing} style={{
          width: '100%', padding: '12px 0', background: 'transparent', color: '#94a3b8',
          borderRadius: 999, fontSize: 12, letterSpacing: '0.1em', minHeight: 44,
          fontWeight: 400, cursor: isPurchasing ? 'not-allowed' : 'pointer', border: 'none'
        }}>今は閉じる（明日また引く）</button>
        
        {/* App Store審査必須要件：リストア（復元）ボタン */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onRestore} disabled={isPurchasing} style={{
            background: 'none', border: 'none', color: '#64748b', fontSize: 11, 
            cursor: isPurchasing ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999
          }}>
            {isPurchasing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />} 
            購入を復元する
          </button>
        </div>
      </div>
    </div>
  );
}
