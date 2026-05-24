
// 【重要】リリース後はこのキーを変更しないこと。変更するとユーザーデータが失われる。
// v17 以降へのマイグレーションが必要な場合は initApp 内でデータ移行処理を実装すること。
export const LS_KEY: string = 'oracle_mirror_v16';
export const genId = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const FREE_LIMIT: number = 3;
// ストレージ肥大化を防ぐための保持ルーム数上限
export const MAX_ROOMS: number = 50;
