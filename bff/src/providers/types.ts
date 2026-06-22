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

/**
 * LLM プロバイダの抽象インターフェイス。
 * - supportsDeveloperRole: developer ロールをネイティブ対応するか。
 *   false の場合、呼び出し側で developer メッセージを system 末尾に連結する必要がある。
 * - call: 検証済みの messages / sampling / stage を受け取り、テキストまたはエラーを返す。
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
}
