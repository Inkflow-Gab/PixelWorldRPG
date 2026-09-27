import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'game.emberwake.app',
  appName: 'Emberwake',
  webDir: 'dist',
  // Landscape-only: the game is designed for thumb play in landscape.
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
