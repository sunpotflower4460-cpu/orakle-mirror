import { Preferences, Purchases } from './capacitorMocks';
import type { CustomerInfo } from '../types';

export const PREMIUM_PREF_KEY = 'app_is_premium';

/** App Store のサブスクリプション管理画面。Guideline 3.1.2 の解約・管理導線。 */
export const APP_STORE_MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function hasActivePremium(customerInfo: CustomerInfo | null | undefined): boolean {
  return customerInfo?.entitlements?.active?.['premium'] !== undefined;
}

export function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string | number; userCancelled?: boolean };
  if (err.userCancelled === true) return true;
  const code = String(err.code ?? '');
  return code === '1'
    || code === 'PURCHASE_CANCELLED'
    || code === 'PURCHASE_CANCELLED_ERROR';
}

export async function configurePurchases(): Promise<boolean> {
  const rcApiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
  if (!rcApiKey || typeof Purchases.configure !== 'function') return false;
  try {
    await Purchases.configure({ apiKey: rcApiKey });
    return true;
  } catch (e) {
    console.error('[RevenueCat] configure failed:', e);
    return false;
  }
}

export async function readCachedPremium(): Promise<boolean> {
  const { value } = await Preferences.get({ key: PREMIUM_PREF_KEY });
  return value === 'true';
}

export async function writeCachedPremium(isPremium: boolean): Promise<void> {
  await Preferences.set({ key: PREMIUM_PREF_KEY, value: isPremium ? 'true' : 'false' });
}

export async function persistPremiumFromCustomerInfo(
  customerInfo: CustomerInfo | null | undefined,
): Promise<boolean> {
  const isPremium = hasActivePremium(customerInfo);
  await writeCachedPremium(isPremium);
  return isPremium;
}

/**
 * RevenueCat を正として premium を同期する。
 * Web モックではストア照会せずキャッシュを返す（開発用の購入モックを壊さない）。
 * 照会失敗時はキャッシュを維持する（通信障害で解放を剥奪しない）。
 */
export async function syncPremiumEntitlement(): Promise<boolean> {
  if (Purchases.isMock || typeof Purchases.getCustomerInfo !== 'function') {
    return readCachedPremium();
  }
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return persistPremiumFromCustomerInfo(customerInfo);
  } catch (e) {
    console.error('[RevenueCat] getCustomerInfo failed:', e);
    return readCachedPremium();
  }
}
