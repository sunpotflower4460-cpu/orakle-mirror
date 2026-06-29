import type { ChatMessage, SamplingParams, Stage, Env } from '../types';

export interface ProviderCallResult {
  ok: true;
  text: string;
}

export interface ProviderCallError {
  ok: false;
  status: number;
  code: string;
  message: string;
}

export type ProviderResult = ProviderCallResult | ProviderCallError;

/** Phase L-3a: ストリーミングで届いた増分テキストを受け取るコールバック。 */
export type OnDelta = (delta: string) => void;

/**
 * LLM プロバイダの抽象インターフェイス。
 * - supportsDeveloperRole: developer ロールをネイティブ対応するか。
 *   false の場合、呼び出し側で developer メッセージを system 末尾に連結する必要がある。
 * - call: 検証済みの messages / sampling / stage を受け取り、テキストまたはエラーを返す。
 * - callStream(任意): 増分テキストを onDelta で流しつつ、最後に全文(または error)を返す。
 *   未実装のプロバイダ向けに optional。非対応なら BFF は非ストリームにフォールバックする。
 */
export interface LLMProvider {
  readonly name: string;
  readonly supportsDeveloperRole: boolean;
  call(
    messages: ChatMessage[],
    sampling: SamplingParams,
    stage: Stage,
    env: Env,
  ): Promise<ProviderResult>;
  callStream?(
    messages: ChatMessage[],
    sampling: SamplingParams,
    stage: Stage,
    env: Env,
    onDelta: OnDelta,
  ): Promise<ProviderResult>;
}
