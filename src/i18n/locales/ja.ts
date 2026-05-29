// 日本語ロケール辞書(正準)。
// このファイルのキー集合が MessageKey 型の元になる。他ロケールは同じキーを持つ必要がある。
// 神託応答そのものの言語(persona.system / mode.systemAdd / prompt.ts)は
// ここではなく Workstream B(プロンプト多言語化)で扱う。ここは UI 文言のみ。
export const ja = {
  // アクセシビリティ(aria-label / title)
  'a11y.archive': 'アーカイブ',
  'a11y.newRoom': '新規ルーム',
  'a11y.deleteRoom': 'ルーム削除',
  'a11y.menu': 'メニュー',
  'a11y.help': 'ヘルプ',
  'a11y.share': '共有する',
  'a11y.modeSelect': 'モード選択',
  'a11y.switchPersona': '{name}に変更',
  'a11y.selectPersona': '{name}を選択',
  'a11y.closeError': 'エラーを閉じる',
  'a11y.messageInput': 'メッセージ入力',
  'a11y.send': '送信',
  'a11y.close': '閉じる',
  'a11y.copyText': 'テキストをコピー',
  'a11y.regenerateWith': '{name}で再生成',
  'a11y.regenerateWithTitle': '{name}の視点で再生成 (1回消費)',

  // サイドバー / サブスクリプション
  'sidebar.title': 'アーカイブ',
  'sidebar.empty': 'まだ対話がありません',
  'sidebar.emptyHint': 'あなたと鏡の対話は、\nここに静かに記録されていきます。',
  'subscription.title': 'サブスクリプション',
  'subscription.unlimited': '無限の導き（解放済）',
  'subscription.remainingToday': '本日の残り',
  'subscription.remainingCount': '{count} 回',
  'subscription.unlockPremium': 'プレミアムを解放',

  // ステータス
  'status.receiving': '天の流れを受信中…',
  'status.received': '神託が届きました',

  // 入力欄
  'input.locked': '今日の神託は終わりました',
  'input.placeholder': 'あなたの問いを鏡へ…',

  // トースト
  'toast.copied': 'コピーしました',
  'toast.copyFailed': 'コピーに失敗しました',
  'toast.questionNotFound': '元の問いが見つかりませんでした',

  // エラー
  'error.connection': '天との接続でエラーが発生しました',

  // 共有
  'share.text': '純粋な鏡を通じて、内なる声を聞く。',
  'share.dialogTitle': 'オラクルミラーを共有',

  // 購読モーダル
  'subscribe.priceLoading': '取得中...',
  'subscribe.priceUnknown': '不明',
  'subscribe.priceError': '確認できません',
  'subscribe.title': '本日の導きは\nここまでです',
  'subscribe.body': '無料プランでは1日{limit}回まで利用できます。\n月額プランに登録すると、登録期間中は回数制限なくOracle Mirrorを利用できます。',
  'subscribe.monthly': '月額 {price}',
  'subscribe.autoRenew': '自動更新・月額サブスクリプション',
  'subscribe.cta': '月額プランに登録する',
  'subscribe.processing': '処理中...',
  'subscribe.later': '今は閉じる（明日また引く）',
  'subscribe.restore': '購入を復元する',
  'subscribe.unlocked': 'プレミアムプランが有効になりました',
  'subscribe.restored': '購入を復元しました',
  'subscribe.noRestore': '復元可能な購入履歴がありません',
  'subscribe.purchaseFailed': '購入処理に失敗しました',
  'subscribe.restoreFailed': '復元処理に失敗しました',
  'subscribe.subscriptionNote': 'サブスクリプションは月ごとに自動更新されます。解約はApp Storeのアカウント設定からいつでも行えます。',

  // ヘルプモーダル
  'help.title': 'ミラーガイド',
  'help.channelsTitle': 'Channels — 対話の目的',
  'help.oraclesTitle': 'Oracles — 話し手の個性',
  'help.disclaimerTitle': '【免責・制限事項】',
  'help.disclaimerBody': '本アプリの神託やカードリーディングは娯楽および自己内省を目的としており、専門的な医療・法律・財務アドバイスの代替となるものではありません。',
  'help.disclaimerNote': '※ ペルソナの変更（別の視点での再生成）も、1回としてカウントされます。',
  'help.terms': '利用規約',
  'help.privacy': 'プライバシーポリシー',
  'help.support': 'お問い合わせ / サポート',
  'help.back': '鏡へ戻る',
  'help.language': '言語',
  'help.deleteAllHistory': 'すべての対話履歴を削除',
  'help.deleteAllHistoryConfirm': 'すべての対話履歴を削除しますか？\nこの操作は取り消せません。',

  // エラーバウンダリ
  'errorBoundary.title': '予期せぬエラーが発生しました',
  'errorBoundary.body': 'お手数ですが、アプリを再読み込みしてください。',
  'errorBoundary.reload': '再読み込み',

  // オンボーディング(初回体験)
  'onboarding.concept.title': '内なる声を映す鏡',
  'onboarding.concept.body': 'Oracle Mirror は、答えを与える占いではありません。\nあなたの内側にすでに在る声を、静かに映す鏡です。',
  'onboarding.persona.title': '鏡を選ぶ',
  'onboarding.persona.body': '3つの鏡が、それぞれ違う光であなたを映します。\nいつでも切り替えられます。',
  'onboarding.mode.title': '対話の仕方',
  'onboarding.mode.body': '問いの受け取り方を、2つから選べます。',
  'onboarding.ready.title': '準備が整いました',
  'onboarding.ready.body': '心に浮かんだ問いを、そっと鏡へ。',
  'onboarding.disclaimer': 'Oracle Mirror は娯楽および自己内省のためのアプリです。医療・法律・財務・緊急時の判断には使用せず、必要に応じて専門家や公的窓口に相談してください。',
  'onboarding.next': '次へ',
  'onboarding.back': '戻る',
  'onboarding.skip': 'スキップ',
  'onboarding.begin': '鏡を開く',
  'onboarding.progress': '{current} / {total}',

  // ペルソナ(表示用。id/アクセントカラー/system プロンプトは constants/personas.tsx が源)
  'persona.lumina.title': '寄り添う愛',
  'persona.zenith.title': '真実を射抜く',
  'persona.archivist.title': '宇宙の視座',
  'persona.lumina.guidance': '受容と癒やしの鏡。感情を優しく包み込み、安心感を与えます。',
  'persona.zenith.guidance': '確信と守護の鏡。迷いを断ち切り、今なすべきことを指し示します。',
  'persona.archivist.guidance': '客観と知性の鏡。高い視点から宇宙の法則や象徴を読み解きます。',

  // モード(表示用。id/systemAdd は constants/modes.tsx が源)
  'mode.pure.name': '純粋神託',
  'mode.card.name': '聖像解読',
  'mode.pure.guidance': '論理を手放し、詩的で抽象的なメッセージを受け取ります。感覚に浸りたい時に。',
  'mode.card.guidance': '象徴（カード）からインスピレーションを受け、その響きを感性で言葉にします。',
  'cards.drawnTitle': '現れたカード',

  // 言語名
  'language.ja': '日本語',
  'language.en': 'English',
} satisfies Record<string, string>;
