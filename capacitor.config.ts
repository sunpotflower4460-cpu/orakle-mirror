import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // TODO(phase-7): 本番申請前に Apple Developer で取得する正式な Bundle ID に差し替える
  appId: 'com.example.oraclemirror',
  appName: 'Oracle Mirror',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fff1f2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#fff1f2',
    },
  },
};

export default config;
