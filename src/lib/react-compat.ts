// @ts-nocheck
import React from 'react';

// プレビュー環境での互換性を保ちつつバッチングを行う安全なラッパー
export const safeStartTransition =
  typeof React.startTransition === 'function' ? React.startTransition : (cb) => cb();
