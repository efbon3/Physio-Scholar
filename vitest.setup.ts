import "@testing-library/jest-dom/vitest";
// fake-indexeddb/auto shims the global IndexedDB + IDBKeyRange in jsdom-land
// so Dexie-backed code can run in Vitest without a real browser.
import "fake-indexeddb/auto";
