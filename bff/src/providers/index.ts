import type { Env } from '../types';
import type { LLMProvider } from './types';
import { openaiProvider } from './openai';

/**
 * 現在は OpenAI 固定。将来、env.LLM_PROVIDER などで切り替え可能にする。
 * 切り替え実装は Phase 5.5c 以降で行う想定。
 */
export function selectProvider(_env: Env): LLMProvider {
  return openaiProvider;
}

export type { LLMProvider, ProviderResult, ProviderCallResult, ProviderCallError } from './types';
