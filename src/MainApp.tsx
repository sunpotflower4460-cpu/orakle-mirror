// このファイルは Phase 4.7 で TS strict 化済み。
import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Wind, Loader2, Menu,
  Plus, HelpCircle, X, Share2,
  Trash2, AlertCircle, Lock, Unlock, KeyRound
} from 'lucide-react';
import { GLOBAL_STYLES } from './styles/globals';
import { getRandomCardsQuantum } from './constants/cards';
import { pickKeywordsQuantum } from './lib/keywords';
import { MODES } from './constants/modes';
import { PERSONAS } from './constants/personas';
import { LS_KEY, genId, FREE_LIMIT, MAX_ROOMS } from './lib/constants';
import { buildDiscernmentMessages, buildReceptionMessages } from './lib/prompt';
import { clip } from './lib/clipboard';
import { getAudioContext, playMagicSound } from './lib/audio';
import { IS_PROD, USE_JS_KEYBOARD_PADDING } from './lib/env';
import { safeStartTransition } from './lib/react-compat';
import { Preferences, Share, Purchases, SplashScreen, Keyboard, StatusBar } from './lib/capacitorMocks';
import { fetchOracleTwoStage, fetchOracleTwoStageStreaming } from './lib/api';
import { Toast } from './components/Toast';
import { StreamingBubble } from './components/StreamingBubble';
import { SubscribeModal } from './components/SubscribeModal';
import { HelpModal } from './components/HelpModal';
import { OracleBubble } from './components/OracleBubble';
import { OracleOrb } from './components/OracleOrb';
import { Onboarding } from './components/Onboarding';
import { ExternalGuidanceBanner } from './components/ExternalGuidanceBanner';
import { SelfReadingView } from './features/selfReading/SelfReadingView';
import { detectGuidance } from './lib/guidanceDetector';
import { useT } from './i18n';
import type { Storage, OracleCard, Message, PersonaId, Mode, Persona, KeywordEntry } from './types';

// ─── Main App ─────────────────────────────────────────────────────────────────
// Phase L-3c: ストリーミング中の(まだ保存していない)応答の表示状態。
interface StreamingInfo {
  roomId: string;
  persona: Persona;
  mode: Mode;
  drawnCards: OracleCard[];
  keywords: KeywordEntry[];
  target: string;
  done: boolean;
  reduceMotion: boolean;
}

export function MainApp() {
  const t = useT();
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  // Phase L-3c: タイプ表示中の応答(確定前)。確定したら storage に移して null に戻す。
  const [streaming, setStreaming] = useState<StreamingInfo | null>(null);
  const finishStreamRef = useRef<(() => void) | null>(null);
  const handleStreamFinished = useCallback(() => {
    const resolve = finishStreamRef.current;
    finishStreamRef.current = null;
    resolve?.();
  }, []);
  const [storage,         setStorage]         = useState<Storage>({ rooms: {}, roomOrder: [] });
  const [keyboardPadding, setKeyboardPadding] = useState<string>('0px');
  
  const storageRef = useRef(storage);
  useLayoutEffect(() => { storageRef.current = storage; }, [storage]);

  const hasStorageInitialized = useRef(false);
  useEffect(() => {
    if (!isStorageLoaded) return;
    if (!hasStorageInitialized.current) {
      hasStorageInitialized.current = true;
      return;
    }
    Preferences.set({ key: LS_KEY, value: JSON.stringify(storage) }).catch(console.error);
  }, [storage, isStorageLoaded]);

  const [isPremium,          setIsPremium]          = useState<boolean>(false);
  const [usageCount,         setUsageCount]         = useState<number>(0);
  const [lastUsageDate,      setLastUsageDate]      = useState<string>('');
  const [showSubscribeModal, setShowSubscribeModal] = useState<boolean>(false);
  const [isPurchasing,       setIsPurchasing]       = useState<boolean>(false);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [input,        setInput]        = useState<string>('');
  const [isLoading,    setIsLoading]    = useState<boolean>(false);
  
  const isLoadingRef = useRef(isLoading);
  useLayoutEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  const [sidebarOpen,  setSidebarOpen]  = useState<boolean>(false);
  const [appView,      setAppView]      = useState<'oracle' | 'reading'>('oracle');
  const [showHelp,     setShowHelp]     = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [persona,      setPersona]      = useState(PERSONAS.lumina);
  const [mode,         setMode]         = useState(MODES.PURE);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const [regenId,      setRegenId]      = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  const regenIdRef = useRef(regenId);
  useLayoutEffect(() => { regenIdRef.current = regenId; }, [regenId]);

  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef        = useRef<HTMLElement>(null);
  const asideRef       = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (mainRef.current) {
      if (sidebarOpen) mainRef.current.setAttribute('inert', '');
      else mainRef.current.removeAttribute('inert');
    }
    if (asideRef.current) {
      if (!sidebarOpen) asideRef.current.setAttribute('inert', '');
      else asideRef.current.removeAttribute('inert');
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (isStorageLoaded) {
      SplashScreen.hide().catch(console.error);
    }
  }, [isStorageLoaded]);

  useEffect(() => {
    StatusBar.setBackgroundColor({ color: persona.soft }).catch(() => {});
  }, [persona]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const matchMedia = window.matchMedia?.bind(window);
    const isStandalone = Boolean(matchMedia?.('(display-mode: standalone)').matches)
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const supports = {
      backdropFilter: CSS.supports('backdrop-filter: blur(1px)') || CSS.supports('-webkit-backdrop-filter: blur(1px)'),
      mixBlendMode: CSS.supports('mix-blend-mode: screen'),
      dvh: CSS.supports('height: 100dvh'),
    };
    const safeArea = getComputedStyle(document.documentElement);
    window.__oracleMirrorDiagnostics = {
      platform: Capacitor.getPlatform(),
      isNativePlatform: Capacitor.isNativePlatform(),
      isStandalone,
      prefersReducedMotion: Boolean(matchMedia?.('(prefers-reduced-motion: reduce)').matches),
      supports,
      safeArea: {
        sat: safeArea.getPropertyValue('--sat').trim(),
        sar: safeArea.getPropertyValue('--sar').trim(),
        sab: safeArea.getPropertyValue('--sab').trim(),
        sal: safeArea.getPropertyValue('--sal').trim(),
      },
    };
    // eslint-disable-next-line no-console
    console.info('[oracle-mirror] ui-diagnostics', window.__oracleMirrorDiagnostics);
  }, []);

  const sidebarOpenRef = useRef(sidebarOpen);
  useLayoutEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => { 
      touchStartX.current = e.touches[0].clientX; 
      touchStartY.current = e.touches[0].clientY; 
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      // スワイプ判定領域を 40 -> 50 に拡大し、iOSネイティブの戻るジェスチャーとの競合を緩和
      if (deltaY < 30) { 
        if (deltaX > 60 && touchStartX.current < 50) setSidebarOpen(true);
        else if (deltaX < -60 && sidebarOpenRef.current) setSidebarOpen(false);
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []); 

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') ctx.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!USE_JS_KEYBOARD_PADDING) return;
    const p1 = Keyboard.addListener('keyboardWillShow', info => {
      setKeyboardPadding(`${info.keyboardHeight}px`);
    });
    const p2 = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardPadding('0px');
    });

    return () => {
      p1.then(h => h.remove()).catch(() => {});
      p2.then(h => h.remove()).catch(() => {});
    };
  }, []);

  useEffect(() => {
    const initApp = async () => {
      // 本番環境でのモック外し忘れに対する警告
      if (IS_PROD && Purchases.isMock) {
        console.error('⚠️ [CRITICAL WARNING] App is running in PRODUCTION with mock plugins!');
      }

      // RevenueCat の初期設定（ネイティブ環境かつ API キーが設定されている場合のみ）
      const rcApiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
      if (rcApiKey && typeof Purchases.configure === 'function') {
        try {
          await Purchases.configure({ apiKey: rcApiKey });
        } catch (e) {
          console.error('[RevenueCat] configure failed:', e);
        }
      }

      let parsedStorage = { rooms: {}, roomOrder: [] };
      let premiumStatus = false;
      let todayCount = 0;
      let hasOnboarded = true;
      const today = new Date().toDateString();

      try {
        const { value: historyVal } = await Preferences.get({ key: LS_KEY });
        if (historyVal) {
          const candidate: unknown = JSON.parse(historyVal);
          if (
            candidate !== null &&
            typeof candidate === 'object' &&
            !Array.isArray(candidate) &&
            typeof (candidate as Record<string, unknown>).rooms === 'object' &&
            (candidate as Record<string, unknown>).rooms !== null &&
            !Array.isArray((candidate as Record<string, unknown>).rooms) &&
            Array.isArray((candidate as Record<string, unknown>).roomOrder)
          ) {
            parsedStorage = candidate as typeof parsedStorage;
          }
        }

        const { value: premiumVal } = await Preferences.get({ key: 'app_is_premium' });
        premiumStatus = premiumVal === 'true';

        const { value: usageVal } = await Preferences.get({ key: 'app_usage_data' });
        if (usageVal) {
          const parsed = JSON.parse(usageVal);
          if (parsed.date === today) todayCount = parsed.count || 0;
        }

        // 既存ユーザー(対話履歴あり)には初回オンボーディングを出さない。
        const hasExistingData = Array.isArray(parsedStorage.roomOrder) && parsedStorage.roomOrder.length > 0;
        const { value: onboardedVal } = await Preferences.get({ key: 'app_onboarded' });
        hasOnboarded = onboardedVal === 'true' || hasExistingData;

        const LEGACY_KEYS = Array.from({ length: 15 }, (_, i) => `oracle_mirror_v${i + 1}`);
        await Promise.allSettled(LEGACY_KEYS.map(key => Preferences.remove({ key })));
      } catch (e) {
        console.error('Storage Init Error', e);
      }

      safeStartTransition(() => {
        setStorage(parsedStorage);
        setIsPremium(premiumStatus);
        setUsageCount(todayCount);
        setLastUsageDate(today);
        setShowOnboarding(!hasOnboarded);
        setIsStorageLoaded(true);
      });
    };
    initApp();
  }, []);

  const hasUsageInitialized = useRef(false);
  useEffect(() => {
    if (!isStorageLoaded || isPremium) return;
    if (!hasUsageInitialized.current) {
      hasUsageInitialized.current = true;
      return;
    }
    Preferences.set({ 
      key: 'app_usage_data', 
      value: JSON.stringify({ count: usageCount, date: lastUsageDate }) 
    }).catch(console.error);
  }, [usageCount, lastUsageDate, isPremium, isStorageLoaded]);

  const lastUsageDateRef = useRef(lastUsageDate);
  useLayoutEffect(() => { lastUsageDateRef.current = lastUsageDate; }, [lastUsageDate]);

  const incrementUsage = useCallback(() => {
    if (isPremium) return;
    const today = new Date().toDateString();
    setUsageCount(c => lastUsageDateRef.current === today ? c + 1 : 1);
    setLastUsageDate(today);
  }, [isPremium]);

  const showToast = useCallback((msg: string) => { setToast(msg); }, []);
  const clearToast = useCallback(() => { setToast(null); }, []);

  const handleSubscribe = useCallback(async () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    try {
      const offerings = await Purchases.getOfferings();
      const monthly = offerings.current?.monthly;
      if (!monthly) throw new Error('商品が見つかりません');
      
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: monthly });
      const isActive = customerInfo?.entitlements?.active?.['premium'] !== undefined;
      
      if (isActive) {
        await Preferences.set({ key: 'app_is_premium', value: 'true' });
        setIsPremium(true);
        showToast(t('subscribe.unlocked'));
        setShowSubscribeModal(false);
      }
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== 'PURCHASE_CANCELLED') showToast(t('subscribe.purchaseFailed'));
    } finally {
      setIsPurchasing(false);
    }
  }, [showToast, isPurchasing, t]);

  const handleRestore = useCallback(async () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const isActive = customerInfo?.entitlements?.active?.['premium'] !== undefined;
      
      if (isActive) {
        await Preferences.set({ key: 'app_is_premium', value: 'true' });
        setIsPremium(true);
        showToast(t('subscribe.restored'));
        setShowSubscribeModal(false);
      } else {
        showToast(t('subscribe.noRestore'));
      }
    } catch (e) {
      showToast(t('subscribe.restoreFailed'));
    } finally {
      setIsPurchasing(false);
    }
  }, [showToast, isPurchasing, t]);

  const canUseOracleRef = useRef(false);
  const canUseOracle = useMemo(() => {
    if (!isStorageLoaded) return false;
    if (isPremium) return true;
    const today = new Date().toDateString();
    const effectiveCount = lastUsageDate === today ? usageCount : 0;
    return effectiveCount < FREE_LIMIT;
  }, [isStorageLoaded, isPremium, lastUsageDate, usageCount]);
  
  useLayoutEffect(() => { canUseOracleRef.current = canUseOracle; }, [canUseOracle]);

  const isLocked = !canUseOracle && !isPremium;

  const remainingDisplay = useMemo(() => {
    if (!isStorageLoaded) return '…';
    if (isPremium) return '∞';
    const today = new Date().toDateString();
    const effectiveCount = lastUsageDate === today ? usageCount : 0;
    return Math.max(0, FREE_LIMIT - effectiveCount);
  }, [isStorageLoaded, isPremium, lastUsageDate, usageCount]);

  const rooms = useMemo(() => {
    return storage.roomOrder
      .map(id => ({ id, ...storage.rooms[id] }))
      .filter(r => r && r.title !== undefined);
  }, [storage.roomOrder, storage.rooms]);
  
  const messages = useMemo(() => {
    if (!activeRoomId) return [];
    return storage.rooms[activeRoomId]?.messages || [];
  }, [activeRoomId, storage.rooms]);

  // 外部案内バナーの判定は messages にのみ依存する純粋計算。
  // 入力中の再レンダー等で毎回キーワード走査が走らないよう、メッセージ単位でメモ化する。
  const guidanceByIndex = useMemo(
    () => messages.map((msg, idx) =>
      msg.role === 'model'
        ? detectGuidance([
            idx > 0 && messages[idx - 1].role === 'user' ? messages[idx - 1].text : '',
            msg.text,
          ])
        : []
    ),
    [messages],
  );

  useEffect(() => {
    if (!messagesEndRef.current) return;
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (keyboardPadding !== '0px' && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [keyboardPadding]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [input]);

  // Q-3: サイドバーを Escape で閉じられるようにする（モーダル群と同じ作法）。
  // 開いているときだけ listener を張り、cleanup で必ず外す。
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen]);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current); };
  }, []);

  const handleCopy = useCallback(async (text: string, id?: string): Promise<void> => {
    const ok = await clip(text);
    if (!ok) {
      showToast(t('toast.copyFailed'));
      return;
    }

    if (id !== undefined && id !== null) {
      setCopiedId(id);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        setCopiedId(null);
        copiedTimerRef.current = null;
      }, 2000);
    } else {
      showToast(t('toast.copied'));
    }
  }, [showToast, t]);

  const handleShareApp = useCallback(async () => {
    await Share.share({
      title: 'Oracle Mirror',
      text: t('share.text'),
      url: 'https://oraclemirror.app',
      dialogTitle: t('share.dialogTitle')
    });
  }, [t]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoadingRef.current || regenIdRef.current) return;

    if (!canUseOracleRef.current) {
      setShowSubscribeModal(true); return;
    }

    const currentStorage = storageRef.current;
    
    getAudioContext(); 
    setInput(''); setError(null); setIsLoading(true);

    const targetRoomId = activeRoomId || genId();
    const isNewRoom = !activeRoomId;
    const userMsg: Message = { id: genId(), role: 'user', text };
    
    const currentMessages = activeRoomId && currentStorage.rooms[activeRoomId]
      ? currentStorage.rooms[activeRoomId].messages
      : [];

    // Phase L-2: カード抽選(QRNG)を UI 更新より前に起動し、setStorage の描画と取得を
    // オーバーラップさせる(数百 ms を隠す)。Stage 1 プロンプトにはカード名が必要なため
    // receptionMsgs 構築の直前で await する(順序依存・「引いた瞬間に取得」は不変)。pure は素通り。
    const drawPromise = mode.id === 'card'
      ? getRandomCardsQuantum(2)
      : Promise.resolve({ cards: [] as OracleCard[] });

    // ユーザーの問いはまず即座に表示する（QRNG 取得を待たせない）。
    setStorage(prev => {
      let newOrder = prev.roomOrder.includes(targetRoomId) ? prev.roomOrder : [targetRoomId, ...prev.roomOrder];
      let newRooms = { ...prev.rooms };

      // ストレージ肥大化対策：最大保存数を超えたら古いルームを削除
      if (newOrder.length > MAX_ROOMS) {
        const roomsToDelete = newOrder.slice(MAX_ROOMS);
        newOrder = newOrder.slice(0, MAX_ROOMS);
        roomsToDelete.forEach(id => delete newRooms[id]);
      }

      newRooms[targetRoomId] = {
        ...(newRooms[targetRoomId] || { title: text.slice(0, 20), personaId: persona.id }),
        messages: [...(newRooms[targetRoomId]?.messages || []), userMsg]
      };

      return {
        ...prev,
        rooms: newRooms,
        roomOrder: newOrder
      };
    });

    if (isNewRoom) setActiveRoomId(targetRoomId);

    // Phase 4.16 / L-2: 先行起動したカード抽選(QRNG)をここで受ける。UI 更新中に裏で
    // 取得が進むため体感負荷はほぼなく、失敗時は crypto で確定する（必ず引ける）。
    const { cards: drawnCards } = await drawPromise;

    const receptionMsgs = buildReceptionMessages(persona, mode, drawnCards, currentMessages, userMsg.text);

    // Phase A: 並走キーワードを量子乱数で選ぶ。AI 応答とは独立・並行に取得し、
    // AI のプロンプト(receptionMsgs)には一切渡さない(純度厳守)。失敗は握りつぶす
    // (キーワードが無ければ表示しないだけ。本文表示は止めない)。pure / card 両方で出す。
    const keywordsPromise = pickKeywordsQuantum().catch(() => ({ keywords: [] }));

    // Phase L-3c: Stage 2 をストリーミングし、タイプ表示する。OS の reduce-motion は即時表示。
    const reduceMotion = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      // 受信中の表示(本文が来るまでは空のバブル＋カーソル)。dots は streaming 中は出さない。
      setStreaming({ roomId: targetRoomId, persona, mode, drawnCards, keywords: [], target: '', done: false, reduceMotion });

      const result = await fetchOracleTwoStageStreaming(
        receptionMsgs,
        (raw) => buildDiscernmentMessages(persona, raw),
        (displaySoFar) => setStreaming((s) => (s ? { ...s, target: displaySoFar } : s)),
      );
      if (import.meta.env.DEV) {
        console.log('[Oracle Mirror] raw transmission:', result.raw);
        console.log('[Oracle Mirror] timings:', {
          reception: result.receptionMs,
          discernment: result.discernmentMs,
        });
      }
      const { keywords } = await keywordsPromise;

      // 最終本文を確定し、タイプが追いつき切る(StreamingBubble.onFinished)まで待つ。
      await new Promise<void>((resolve) => {
        finishStreamRef.current = resolve;
        setStreaming((s) => (s ? { ...s, target: result.final, keywords, done: true } : s));
      });

      const aiMsg: Message  = { id: genId(), role: 'model', text: result.final, personaId: persona.id, modeId: mode.id, drawnCards, keywords };

      setStorage(prev => {
        const room = prev.rooms[targetRoomId];
        if (!room) return prev;
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [targetRoomId]: {
              ...room,
              messages: [...room.messages, aiMsg]
            }
          }
        };
      });
      setStreaming(null);

      playMagicSound();
      incrementUsage();

    } catch (e: unknown) {
      finishStreamRef.current = null;
      setStreaming(null);
      setError(e instanceof Error ? e.message : t('error.connection'));
      setStorage(prev => {
        const room = prev.rooms[targetRoomId];
        if (!room) return prev;
        const msgs = room.messages.filter(m => m.id !== userMsg.id);
        if (msgs.length === 0 && isNewRoom) {
          const newRooms = { ...prev.rooms };
          delete newRooms[targetRoomId];
          return {
            ...prev,
            rooms: newRooms,
            roomOrder: prev.roomOrder.filter(id => id !== targetRoomId)
          };
        }
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [targetRoomId]: { ...room, messages: msgs }
          }
        };
      });
      if (isNewRoom) setActiveRoomId(null);
      setInput(text);
    }
    finally { setIsLoading(false); }
  }, [input, activeRoomId, persona, mode, incrementUsage, t]);

  const handleSwitch = useCallback(async (msgIdx: number, targetPersonaId: PersonaId): Promise<void> => {
    if (isLoadingRef.current || regenIdRef.current || !activeRoomId) return;

    if (!canUseOracleRef.current) {
      setShowSubscribeModal(true); return;
    }

    const currentStorage = storageRef.current;
    const currentRoom = currentStorage.rooms[activeRoomId];
    if (!currentRoom) return;
    const currentMessages = currentRoom.messages || [];

    const targetMsg = currentMessages[msgIdx];
    if (!targetMsg || targetMsg.role !== 'model') return;

    getAudioContext();

    const targetPersona = PERSONAS[targetPersonaId];
    const targetMode    = (targetMsg.modeId && MODES[targetMsg.modeId.toUpperCase() as 'PURE' | 'CARD']) || MODES.PURE;
    const drawnCards    = targetMsg.drawnCards || [];

    setRegenId(targetMsg.id || String(msgIdx));
    
    const previousMessages = currentMessages.slice(0, msgIdx);
    
    let userTextToRegenerate = null;
    for (let i = previousMessages.length - 1; i >= 0; i--) {
      if (previousMessages[i].role === 'user') {
        userTextToRegenerate = previousMessages[i].text;
        break;
      }
    }
    
    if (!userTextToRegenerate) {
      showToast(t('toast.questionNotFound'));
      setRegenId(null);
      return;
    }
    
    const receptionMsgs = buildReceptionMessages(
      targetPersona,
      targetMode,
      drawnCards,
      previousMessages,
      userTextToRegenerate
    );

    try {
      const result = await fetchOracleTwoStage(
        receptionMsgs,
        (raw) => buildDiscernmentMessages(targetPersona, raw),
      );
      const aiText = result.final;
      if (import.meta.env.DEV) {
        console.log('[Oracle Mirror] raw transmission:', result.raw);
        console.log('[Oracle Mirror] timings:', {
          reception: result.receptionMs,
          discernment: result.discernmentMs,
        });
      }
      
      setStorage(prev => {
        const room = prev.rooms[activeRoomId];
        if (!room) return prev;
        const updated = room.messages.map((m, i) =>
          i === msgIdx ? { ...m, text: aiText, personaId: targetPersonaId } : m
        );
        return {
          ...prev,
          rooms: {
            ...prev.rooms,
            [activeRoomId]: { ...room, messages: updated }
          }
        };
      });

      playMagicSound();
      incrementUsage();

    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('error.connection')); }
    finally { setRegenId(null); }

  }, [activeRoomId, incrementUsage, showToast, t]);

  const handleDeleteAllHistory = useCallback((): void => {
    setStorage({ rooms: {}, roomOrder: [] });
    setActiveRoomId(null);
    setError(null);
  }, []);

  const handleDeleteRoom = useCallback((roomId: string, e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setStorage(prev => {
      const rooms = { ...prev.rooms };
      delete rooms[roomId];
      return { ...prev, rooms, roomOrder: prev.roomOrder.filter(id => id !== roomId) };
    });
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
      setError(null);
    }
  }, [activeRoomId]);

  const handleNewRoom = useCallback(() => {
    setActiveRoomId(null); setSidebarOpen(false); setAppView('oracle'); setError(null); setInput('');
  }, []);

  const handleOnboardingComplete = useCallback((selectedPersona?: PersonaId) => {
    Preferences.set({ key: 'app_onboarded', value: 'true' }).catch(console.error);
    if (selectedPersona) setPersona(PERSONAS[selectedPersona]);
    setShowOnboarding(false);
  }, []);

  const isPhysicalKeyboardRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e: MediaQueryListEvent) => { isPhysicalKeyboardRef.current = e.matches; };
    isPhysicalKeyboardRef.current = mql.matches;
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else if (mql.addListener) {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && isPhysicalKeyboardRef.current) { 
      e.preventDefault(); 
      if (isLocked) {
        setShowSubscribeModal(true);
        return;
      }
      handleSend(); 
    }
  }, [handleSend, isLocked]);

  if (!isStorageLoaded) {
    return <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: PERSONAS.lumina.soft }}><Loader2 size={24} style={{ color: PERSONAS.lumina.accent, animation: 'spin 1s linear infinite' }}/></div>;
  }

  const p = persona;
  const modeEntries = Object.values(MODES) as Mode[];
  const activeModeIndex = modeEntries.findIndex(m => m.id === mode.id);

  return (
    <div className="app-shell" style={{
      display: 'flex',
      fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif",
      background: `
        radial-gradient(circle at 18% 22%, rgba(255,255,255,0.78), transparent 32%),
        radial-gradient(circle at 74% 14%, rgba(205,224,255,0.18), transparent 36%),
        radial-gradient(circle at 50% 72%, rgba(255,220,236,0.35), transparent 38%),
        linear-gradient(180deg, #fffefc 0%, #fff9fc 45%, #f8f3f9 100%)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      overflow: 'hidden', color: '#263044', position: 'relative'
    }}>
      <style>{GLOBAL_STYLES}</style>

      {toast && <Toast message={toast} onDone={clearToast}/>}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete}/>}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} onDeleteAllHistory={handleDeleteAllHistory}/>}
      {showSubscribeModal && <SubscribeModal onClose={() => setShowSubscribeModal(false)} onSubscribe={handleSubscribe} onRestore={handleRestore} isPurchasing={isPurchasing} />}

      {sidebarOpen && (
        // Q-4: 装飾的なマウス用クローズ領域。正規の閉じ手段は Esc(Q-3)とサイドバー内の操作。
        // スクリーンリーダーには余計な操作要素として読み上げさせない。
        <div aria-hidden="true" onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(80,70,78,0.26)',
          zIndex: 98, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
        }} />
      )}

      {/* Sidebar */}
      <aside ref={asideRef} aria-label={t('a11y.archive')} style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 99,
        width: sidebarOpen ? '82%' : 0,
        maxWidth: 300,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        borderRight: '1px solid rgba(215,224,240,0.45)',
        borderRadius: '0 28px 28px 0',
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        boxShadow: sidebarOpen ? 'var(--om-shadow-soft)' : 'none',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ paddingTop: 'calc(22px + var(--sat))', paddingLeft: 'calc(18px + var(--sal))', paddingRight: 18, paddingBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.3s ease 0.12s' }}>
          <span style={{ fontSize: 18, letterSpacing: '0.16em', fontWeight: 500, color: '#263044', whiteSpace: 'nowrap' }}>{t('sidebar.title')}</span>
          <button aria-label={t('a11y.newRoom')} onClick={handleNewRoom} style={{ minWidth: 52, minHeight: 52, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(220,210,216,0.35)', cursor: 'pointer', color: '#8a94a6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: -4, borderRadius: 16, boxShadow: 'var(--om-shadow-soft)' }}>
            <Plus size={18} strokeWidth={1.5}/>
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px', paddingLeft: 'calc(12px + var(--sal))', opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.3s ease 0.12s' }}>
          <button aria-label={t('a11y.sr.open')} onClick={() => { setAppView('reading'); setSidebarOpen(false); }} style={{
            width: '100%', textAlign: 'left', padding: '14px 12px', borderRadius: 18, minHeight: 52,
            cursor: 'pointer', border: '1px solid rgba(210,219,236,0.42)', marginBottom: 12,
            background: appView === 'reading' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.58)',
            boxShadow: appView === 'reading' ? 'var(--om-shadow-soft), inset 0 0 0 1px #eadde2' : 'var(--om-shadow-soft)',
            display: 'flex', alignItems: 'center', gap: 10, color: appView === 'reading' ? '#263044' : '#64748b'
          }}>
            <Wind size={16} strokeWidth={1.5} style={{ color: '#d77894', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em' }}>{t('nav.selfReading')}</span>
          </button>
          {rooms.length === 0 && (
            <div style={{
              borderRadius: 28, margin: '4px 0 16px',
              background: `
                radial-gradient(circle at 14px 14px, rgba(34,52,91,0.12) 0 1px, transparent 1.3px) 0 0 / 24px 24px,
                radial-gradient(circle at 50% 30%, rgba(244,190,205,0.20), transparent 60%),
                linear-gradient(150deg, rgba(255,250,252,0.92), rgba(248,251,255,0.76))
              `,
              border: '1px solid rgba(210,219,236,0.38)',
              boxShadow: 'var(--om-shadow-card)',
              padding: '36px 20px 40px',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
            }}>
              <div style={{ marginBottom: 2 }}>
                <OracleOrb size={54} variant="diamond" />
              </div>
              <p style={{ fontSize: 14, color: '#263044', fontWeight: 500, letterSpacing: '0.04em' }}>{t('sidebar.empty')}</p>
              <p style={{ fontSize: 12, color: '#8b95a5', lineHeight: 1.9, letterSpacing: '0.02em' }}>{t('sidebar.emptyHint')}</p>
            </div>
          )}
          {rooms.map(room => {
            const isActive = activeRoomId === room.id;
            const rp = PERSONAS[room.personaId] || PERSONAS.lumina;
            return (
              <div key={room.id} className="room-row" aria-current={isActive ? 'true' : undefined}
                role="button" tabIndex={0}
                onClick={() => { setActiveRoomId(room.id); setSidebarOpen(false); setAppView('oracle'); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveRoomId(room.id); setSidebarOpen(false); setAppView('oracle'); setError(null); } }}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px', borderRadius: 14, minHeight: 48,
                  cursor: 'pointer', border: 'none', marginBottom: 4, transition: 'all 0.2s',
                  background: isActive ? 'rgba(255,255,255,0.92)' : 'transparent',
                  boxShadow: isActive ? 'var(--om-shadow-soft), inset 0 0 0 1px #eadde2' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                <span style={{ color: rp.accent, flexShrink: 0, display: 'flex' }}>{rp.icon}</span>
                <span style={{ fontSize: 13, color: isActive ? '#374151' : '#64748b', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, whiteSpace: 'nowrap' }}>
                  {room.title || 'Divine Echo'}
                </span>
                <button className="room-del" aria-label={t('a11y.deleteRoom')} onClick={e => handleDeleteRoom(room.id, e)}
                  style={{ minWidth: 36, minHeight: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: -6 }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            );
          })}
        </div>
        
        {/* サイドバー下部：サブスクリプション導線 */}
        <div style={{ padding: '16px', paddingLeft: 'calc(16px + var(--sal))', borderTop: '1px solid rgba(220,210,216,0.30)', background: 'rgba(255,250,252,0.86)', paddingBottom: 'calc(16px + var(--sab))', flexShrink: 0, opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.3s ease 0.12s' }}>
          {/* 小星ライン区切り */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, width: 48, background: 'rgba(215,120,148,0.22)' }}/>
            <span style={{ color: '#d77894', fontSize: 10 }}>✦</span>
            <div style={{ height: 1, width: 48, background: 'rgba(215,120,148,0.22)' }}/>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', color: '#8994a6', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>{t('subscription.title')}</div>
          {isPremium ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
              <Unlock size={14} /> {t('subscription.unlimited')}
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.88), rgba(246,250,255,0.72), rgba(255,240,247,0.75))', border: '1px solid rgba(210,219,236,0.44)', borderRadius: 18, padding: 12, boxShadow: 'var(--om-shadow-soft)' }}>
              <div style={{ fontSize: 12, color: '#7f8998', marginBottom: 12, display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.72)', borderRadius: 14, padding: '10px 14px', border: '1px solid rgba(220,210,216,0.32)' }}>
                <span>{t('subscription.remainingToday')}</span>
                <span style={{ fontWeight: 700, color: typeof remainingDisplay === 'number' && remainingDisplay > 0 ? '#263044' : '#f43f5e' }}>{t('subscription.remainingCount', { count: remainingDisplay })}</span>
              </div>
              <button onClick={() => setShowSubscribeModal(true)} style={{
                width: '100%', padding: '14px 0',
                background: 'linear-gradient(135deg, #0b1532, #111f46 56%, #162a54)',
                color: '#fff',
                borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 16px 38px rgba(10,16,36,0.24), inset 0 1px 0 rgba(219,233,255,0.42)',
                letterSpacing: '0.12em'
              }}>
                <KeyRound size={12} /> {t('subscription.unlockPremium')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main ref={mainRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {appView === 'reading' ? (
          <SelfReadingView onBack={() => setAppView('oracle')} />
        ) : (
          <>
        <header className="app-header" style={{
          padding: 'calc(10px + var(--sat)) calc(16px + var(--sar)) 10px calc(16px + var(--sal))', flexShrink: 0,
          borderBottom: `1px solid rgba(217,164,181,0.22)`, background: 'rgba(255,253,253,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: 'var(--om-shadow-soft)'
        }}>
          {/* Phase U: ヘッダーの枠線・blur は全幅のまま。内側の中身だけ
              iPad で中央 720px に収める内側ラッパで包む(iPhone は不変)。 */}
          <div className="app-header-inner">
          <div className="app-header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="app-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button aria-label={t('a11y.menu')} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(v => !v)}
                style={{ minWidth: 52, minHeight: 52, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(210,218,226,0.42)', cursor: 'pointer', color: '#8792a2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, flexShrink: 0, boxShadow: 'var(--om-shadow-soft)' }}>
                <Menu size={18} strokeWidth={1.5}/>
              </button>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.42em', fontWeight: 500, color: '#8994a6', textTransform: 'uppercase', lineHeight: 1 }}>Oracle Mirror</div>
                <div style={{ fontSize: 11, color: p.accent, fontWeight: 600, marginTop: 5, letterSpacing: '0.06em' }}>
                  {p.name}
                </div>
              </div>
            </div>

            <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
              {Object.values(PERSONAS).map(px => (
                <button key={px.id} className="persona-chip" onClick={() => setPersona(px)} title={px.name} aria-label={t('a11y.switchPersona', { name: px.name })} aria-pressed={persona.id === px.id}
                  style={{
                    minWidth: 48, minHeight: 48, borderRadius: 999, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: persona.id === px.id ? 'rgba(255,255,255,0.88)' : 'transparent',
                    color: persona.id === px.id ? px.accent : '#9ca6b4',
                    boxShadow: persona.id === px.id ? `var(--om-shadow-soft), 0 0 0 1px ${px.border}, 0 0 26px ${px.accent}1f` : 'none',
                    transform: persona.id === px.id ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.25s', flexShrink: 0
                  }}>{px.icon}</button>
              ))}
              <div style={{ width: 1, height: 16, background: 'rgba(160,170,185,0.22)', margin: '0 8px', flexShrink: 0 }}/>
              <button className="header-icon-btn" aria-label={t('a11y.help')} onClick={() => setShowHelp(true)}
                style={{ minWidth: 42, minHeight: 42, background: 'none', border: '1px solid rgba(220,210,216,0.38)', cursor: 'pointer', color: '#9ca6b4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, flexShrink: 0 }}>
                <HelpCircle size={16} strokeWidth={1.5}/>
              </button>
              <button className="header-icon-btn" aria-label={t('a11y.share')} onClick={handleShareApp}
                style={{ minWidth: 42, minHeight: 42, background: 'none', border: '1px solid rgba(220,210,216,0.38)', cursor: 'pointer', color: '#9ca6b4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, flexShrink: 0 }}>
                <Share2 size={16} strokeWidth={1.5}/>
              </button>
            </div>
          </div>

          <div className="mode-switch" role="radiogroup" aria-label={t('a11y.modeSelect')} style={{
            position: 'relative', display: 'flex',
            background: 'linear-gradient(130deg, rgba(255,255,255,0.84), rgba(255,246,251,0.74), rgba(242,248,255,0.66))',
            borderRadius: 22,
            padding: 6, border: '1px solid rgba(206,220,240,0.42)',
            boxShadow: 'var(--om-shadow-soft)',
            marginTop: 10,
            height: 62,
            width: 300, maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto'
          }}>
            {/* スライドして移動するセグメントインジケータ */}
            <span aria-hidden="true" style={{
              position: 'absolute', top: 5, bottom: 5, width: 'calc(50% - 5px)',
              left: activeModeIndex <= 0 ? 5 : '50%',
              background: 'linear-gradient(130deg, #0c1633, #102044 58%, #172c58)',
              borderRadius: 16,
              boxShadow: '0 14px 36px rgba(10,16,36,0.24), inset 0 1px 0 rgba(214,230,255,0.38)',
              animation: 'iridescentShift 4.4s ease-in-out infinite',
              transition: 'left 0.35s cubic-bezier(0.16,1,0.3,1)'
            }} />
            {modeEntries.map((m: Mode) => (
              <button key={m.id} className="mode-switch-btn" role="radio" aria-checked={mode.id === m.id} onClick={() => setMode(m)}
                style={{
                  position: 'relative', zIndex: 1, flex: '1 1 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 14, cursor: 'pointer', border: 'none',
                  whiteSpace: 'nowrap', fontSize: 10, letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 700, transition: 'color 0.3s', background: 'transparent',
                  color: mode.id === m.id ? '#ffffff' : '#8f98a8'
                }}>
                {m.icon} {t(`mode.${m.id}.name`)}
              </button>
            ))}
          </div>
          </div>
        </header>

        <div className="chat-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '24px calc(18px + var(--sar)) 24px calc(18px + var(--sal))' }}>
          <div style={{ maxWidth: 660, margin: '0 auto' }}>
            {messages.length === 0 && !isLoading && (
              <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, paddingBottom: 32, gap: 0 }}>

                {/* ── Hero logo area ──────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'oracleReveal 1s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
                  <OracleOrb size={108} variant="compass" />

                  {/* ORACLE MIRROR below logo */}
                  <div style={{ marginTop: 18, textAlign: 'center' }}>
                    <h2 style={{ fontSize: 22, letterSpacing: '0.42em', fontWeight: 500, color: '#8994a6', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>Oracle Mirror</h2>
                  </div>

                  {/* Subtitle */}
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, letterSpacing: '0.38em', color: '#a9b0bd', textTransform: 'uppercase', fontWeight: 400 }}>Reflection of Higher Self</p>
                  </div>

                  {/* Ornament line + star */}
                  <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 1, width: 64, background: 'rgba(215,120,148,0.28)' }}/>
                    <span style={{ color: '#d77894', fontSize: 11, lineHeight: 1 }}>✦</span>
                    <div style={{ height: 1, width: 64, background: 'rgba(215,120,148,0.28)' }}/>
                  </div>
                </div>

                {/* ── Persona cards ────────────────────────────────── */}
                <div className="empty-persona-grid" style={{ display: 'flex', gap: 12, marginTop: 48, justifyContent: 'center', width: '100%', maxWidth: 400 }}>
                  {Object.values(PERSONAS).map((px, pi) => {
                    const isSelected = persona.id === px.id;
                    return (
                      <button key={px.id} className="empty-persona-card" onClick={() => setPersona(px)} aria-label={t('a11y.selectPersona', { name: px.name })}
                        style={{
                          flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 8,
                          padding: '22px 10px 20px',
                          borderRadius: 26, cursor: 'pointer',
                          animation: `fadeIn 0.7s cubic-bezier(0.16,1,0.3,1) ${0.5 + pi * 0.1}s both`,
                          background: 'rgba(255,255,255,0.84)',
                          boxShadow: isSelected
                            ? `var(--om-shadow-card), 0 0 42px rgba(215,120,148,0.08)`
                            : 'var(--om-shadow-card)',
                          border: isSelected
                            ? `1px solid rgba(215,120,148,0.50)`
                            : '1px solid rgba(220,210,220,0.32)',
                          transition: 'all 0.35s'
                        }}>
                        <span style={{ color: px.accent }}>{px.icon}</span>
                        <span style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, color: px.accent, whiteSpace: 'nowrap' }}>{px.name}</span>
                        <span style={{ fontSize: 11, color: '#7f8998', letterSpacing: '0.06em' }}>{t(`persona.${px.id}.title`)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {messages.map((msg: Message, idx: number) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    {isUser ? (
                      <div className="user-message" style={{
                        maxWidth: '85%', textAlign: 'right', paddingRight: 18, borderRight: `2px solid ${p.accent}30`,
                        paddingTop: 8, paddingBottom: 8, animation: 'userReveal 0.5s cubic-bezier(0.16,1,0.3,1) forwards'
                      }}>
                        <p style={{ fontSize: 15, color: '#64748b', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.8 }}>{msg.text}</p>
                      </div>
                    ) : (
                      <div style={{ width: '100%' }}>
                        <OracleBubble msg={msg} idx={idx} copiedId={copiedId} regeneratingId={regenId} onCopy={handleCopy} onSwitch={handleSwitch} />
                        <ExternalGuidanceBanner matches={guidanceByIndex[idx]} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Phase L-3c: Stage 2 のタイプ表示(確定前)。本文が来るまでは下のドット。 */}
              {streaming && streaming.target !== '' && streaming.roomId === activeRoomId && (
                <div style={{ width: '100%' }}>
                  <StreamingBubble
                    target={streaming.target}
                    done={streaming.done}
                    reduceMotion={streaming.reduceMotion}
                    persona={streaming.persona}
                    mode={streaming.mode}
                    drawnCards={streaming.drawnCards}
                    onFinished={handleStreamFinished}
                  />
                </div>
              )}

              {isLoading && (!streaming || streaming.target === '') && (
                <div aria-busy="true" style={{ display: 'flex', justifyContent: 'flex-start', animation: 'oracleReveal 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ padding: '20px 26px', background: 'rgba(255,255,255,0.95)', borderRadius: 24, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 8px 32px ${p.accent}12` }}>
                    <div style={{ display: 'flex', gap: 5 }} aria-hidden="true">
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: p.accent, animation: `breathe 1.4s ease-in-out ${i * 0.18}s infinite` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em' }}>{t('status.receiving')}</span>
                  </div>
                </div>
              )}

              {error && (
                <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff1f2', borderRadius: 16, border: '1px solid #fecdd3', animation: 'fadeIn 0.3s ease' }}>
                  <AlertCircle size={16} style={{ color: '#f43f5e', flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: '#be123c', flex: 1 }}>{error}</span>
                  <button aria-label={t('a11y.closeError')} onClick={() => setError(null)} style={{ minWidth: 32, minHeight: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></button>
                </div>
              )}
              <div ref={messagesEndRef}/>
              
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {isLoading ? t('status.receiving') : (messages.length > 0 && messages[messages.length - 1].role === 'model' ? t('status.received') : '')}
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: USE_JS_KEYBOARD_PADDING
            ? `10px calc(18px + var(--sar)) calc(max(18px, env(safe-area-inset-bottom)) + ${keyboardPadding}) calc(18px + var(--sal))`
            : `10px calc(18px + var(--sar)) max(18px, calc(env(safe-area-inset-bottom) + 8px)) calc(18px + var(--sal))`,
          flexShrink: 0
        }}>
          {/* Phase U: 外側パディング(safe-area)はそのまま。入力欄シェルだけ
              iPad で中央 720px に揃える内側ラッパで包む(iPhone は不変)。 */}
          <div className="input-area-inner">
          <div className="input-shell" style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: inputFocused ? 'linear-gradient(130deg, rgba(255,255,255,0.92), rgba(255,246,251,0.82), rgba(240,248,255,0.76))' : 'linear-gradient(130deg, rgba(255,255,255,0.88), rgba(255,246,251,0.78), rgba(240,248,255,0.68))',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 999, padding: '10px 10px 10px 26px',
            border: `1px solid ${inputFocused ? `rgba(173,205,238,0.78)` : 'rgba(214,204,225,0.56)'}`,
            transform: inputFocused ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: inputFocused
              ? `0 18px 48px rgba(120,80,90,0.09), 0 0 0 1px rgba(145,181,228,0.36), inset 0 0 24px rgba(247,214,233,0.45)`
              : '0 18px 48px rgba(120,80,90,0.05)'
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={isLocked ? t('input.locked') : t('input.placeholder')}
              aria-label={t('a11y.messageInput')}
              rows={1}
              disabled={isLocked}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', fontWeight: 300, color: '#263044', fontSize: 17,
                lineHeight: 1.65, overflowY: 'hidden', maxHeight: 120,
                fontFamily: 'inherit', caretColor: p.accent, paddingTop: 8, paddingBottom: 8,
                textAlign: input.trim().length > 0 ? 'left' : 'center',
                opacity: isLocked ? 0.5 : 1
              }}
            />
            {/* ボタンの disabled 条件は isLoading 時に限定。
              isLocked 状態でもタップ可能にし、onClick イベント側でガード（モーダルを開く処理）を発火させる。
            */}
            <button aria-label={t('a11y.send')}
              onClick={() => {
                if (isLocked) {
                  setShowSubscribeModal(true);
                  return;
                }
                handleSend();
              }} 
              disabled={isLoading || (!isLocked && !input.trim())} 
              className="send-btn"
              style={{
                width: 52, height: 52, borderRadius: 999, border: 'none', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                cursor: isLoading || (!isLocked && !input.trim()) ? 'not-allowed' : 'pointer',
                background: isLoading || (!isLocked && !input.trim()) ? 'rgba(248,233,238,0.86)' : 'linear-gradient(135deg, #0c1736, #12254d)',
                color: isLoading || (!isLocked && !input.trim()) ? '#c97890' : '#fff',
                transition: 'background 0.3s, color 0.3s',
                boxShadow: isLoading || (!isLocked && !input.trim()) ? 'none' : '0 16px 38px rgba(10,16,36,0.24), inset 0 1px 0 rgba(219,233,255,0.40)'
              }}>
              {isLoading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }}/>
                : (isLocked ? <Lock size={18} strokeWidth={1.5}/> : <Wind size={18} strokeWidth={1.5}/>)}
            </button>
          </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
