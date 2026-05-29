import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunpotflower.oraclemirror',
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
