import { Capacitor } from '@capacitor/core';
import type { PlatformFactory } from './PlatformFactory';
import { WebFactory } from './WebFactory';
import { TauriFactory } from './TauriFactory';
import { CapacitorFactory } from './CapacitorFactory';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: Record<string, unknown>;
  }
}

export function getPlatformFactory(): PlatformFactory {
  if (window.__TAURI_INTERNALS__) {
    console.log('[Platform] Detected Tauri environment');
    return new TauriFactory();
  } else if (Capacitor.isNativePlatform()) {
    console.log('[Platform] Detected Capacitor environment');
    return new CapacitorFactory();
  } else {
    console.log('[Platform] Detected Web environment');
    return new WebFactory();
  }
}

export const currentPlatform = getPlatformFactory();
