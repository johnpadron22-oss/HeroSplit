import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.herosplit.app',
  appName: 'HeroSplit',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
  },
};

export default config;
