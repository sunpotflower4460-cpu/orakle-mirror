// @ts-nocheck

// 【重要】リリース後はこのキーを変更しないこと。変更するとユーザーデータが失われる。
// v17以降へのマイグレーションが必要な場合は initApp 内でデータ移行処理を実装すること。
export const LS_KEY = 'oracle_mirror_v16'; 
export const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const FREE_LIMIT = 3; 
// ストレージ肥大化を防ぐための保持ルーム数上限
export const MAX_ROOMS = 50;
