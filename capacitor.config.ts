
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0f9133d2714b4011b8d3b82bb10c7586',
  appName: 'acting-coach-ai',
  webDir: 'dist',
  server: {
    url: 'https://0f9133d2-714b-4011-b8d3-b82bb10c7586.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#000000'
  }
};

export default config;
