// Global type declarations for browser and third-party libraries

// Service Worker API
declare const clients: Clients;

// Google Analytics
declare function gtag(...args: any[]): void;

// Bootstrap (loaded via CDN)
declare const bootstrap: typeof import('bootstrap');

// Drupal globals
declare const Drupal: any;
declare const drupalSettings: any;
declare function once(id: string, selector: string, context?: Document | Element): Element[];

// Request types (for older TypeScript)
declare type RequestInit = globalThis.RequestInit;
