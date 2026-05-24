// 旧 Safari の AudioContext 互換
interface Window {
  webkitAudioContext?: typeof AudioContext;
}
