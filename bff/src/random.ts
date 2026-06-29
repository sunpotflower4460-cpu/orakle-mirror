import type { Env } from './types';

// Phase 4.16-b: 量子乱数(QRNG)プロバイダ。ANU Quantum Numbers API を呼び出し、
// フロントが扱いやすい正規化バイト列に変換する。ANU 固有形はフロントに漏らさない
// (Phase 5.5 のプロバイダ抽象化と同じ思想)。
//
// セキュリティ: API キー(env.ANU_API_KEY)は絶対にレスポンスやログに含めない。

const ANU_ENDPOINT = 'https://api.quantumnumbers.anu.edu.au';
// Phase L-1: ANU が正常なら数百 ms で返る。フロント側(RANDOM_TIMEOUT_MS=1500) ≧
// BFF 側(1200) の関係にする。BFF が先にタイムアウトして正規化エラーを返せば、
// フロントは無駄に待たず即 crypto フォールバックできる（待ちすぎを防ぐ）。
const ANU_TIMEOUT_MS = 1200;
const ANU_MAX_LENGTH = 1024;

export interface QuantumBytesSuccess {
  ok: true;
  bytes: number[];
  source: 'qrng';
}

export interface QuantumBytesFailure {
  ok: false;
  status: number;
  code: string;
  message: string;
}

export type QuantumBytesResult = QuantumBytesSuccess | QuantumBytesFailure;

/**
 * ANU から uint8 を length 個取得し、0-255 の number[] に正規化して返す。
 * 失敗・タイムアウト・形不正・キー未設定はすべて構造化エラーにする
 * (フロントが crypto フォールバックへ切れるように)。
 */
export async function fetchQuantumBytes(byteLength: number, env: Env): Promise<QuantumBytesResult> {
  if (!env.ANU_API_KEY) {
    return { ok: false, status: 500, code: 'SERVER_MISCONFIGURED', message: 'QRNG provider is not configured' };
  }

  const length = Math.max(1, Math.min(ANU_MAX_LENGTH, Math.floor(byteLength)));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANU_TIMEOUT_MS);
  try {
    const url = `${ANU_ENDPOINT}?length=${length}&type=uint8`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': env.ANU_API_KEY },
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, status: 502, code: 'UPSTREAM_ERROR', message: `QRNG provider returned HTTP ${res.status}` };
    }

    const data = (await res.json()) as { success?: unknown; type?: unknown; data?: unknown };
    if (data.success !== true || !Array.isArray(data.data)) {
      return { ok: false, status: 502, code: 'UPSTREAM_ERROR', message: 'QRNG provider returned an invalid response' };
    }

    const bytes: number[] = [];
    for (const v of data.data) {
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 255) {
        return { ok: false, status: 502, code: 'UPSTREAM_ERROR', message: 'QRNG provider returned non-uint8 data' };
      }
      bytes.push(v);
    }

    if (bytes.length < length) {
      return { ok: false, status: 502, code: 'UPSTREAM_ERROR', message: 'QRNG provider returned too few bytes' };
    }

    return { ok: true, bytes, source: 'qrng' };
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    return {
      ok: false,
      status: aborted ? 504 : 502,
      code: 'UPSTREAM_ERROR',
      message: aborted ? 'QRNG provider timed out' : 'QRNG provider request failed',
    };
  } finally {
    clearTimeout(timer);
  }
}
