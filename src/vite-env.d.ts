
/// <reference types="vite/client" />
/// <reference types="@ionic/pwa-elements" />

declare module '@ionic/pwa-elements/loader' {
  export function defineCustomElements(window: Window): void;
}
