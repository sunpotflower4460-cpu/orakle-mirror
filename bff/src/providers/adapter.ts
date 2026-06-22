import type { ChatMessage } from '../types';

/**
 * developer ロール非対応プロバイダ向けに、developer メッセージを
 * system メッセージの末尾に連結する。Stage 1 / Stage 2 の責任分業を
 * 保ったまま、developer 層の意図を system 層に流し込む。
 *
 * 入力: [system, developer, user, assistant, ...user]
 * 出力: [system+developer, user, assistant, ...user]
 *
 * developer メッセージが複数あれば、すべて連結する。
 * system がなければ、developer の合成内容を system として先頭に置く。
 */
export function foldDeveloperIntoSystem(messages: ChatMessage[]): ChatMessage[] {
  const systems = messages.filter((m) => m.role === 'system');
  const developers = messages.filter((m) => m.role === 'developer');
  const rest = messages.filter((m) => m.role !== 'system' && m.role !== 'developer');

  if (systems.length === 0 && developers.length === 0) return messages;

  const mergedSystemContent = [
    ...systems.map((m) => m.content),
    ...developers.map((m) => m.content),
  ].join('\n\n');

  return [
    { role: 'system', content: mergedSystemContent },
    ...rest,
  ];
}
