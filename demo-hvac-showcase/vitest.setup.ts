import '@testing-library/jest-dom';

// rol: proveer window.localStorage a jsdom.
// Node 26 expone un global `localStorage` experimental que queda `undefined` sin
// --localstorage-file y shadowea la implementación de jsdom (que sí crea
// sessionStorage). Un Storage en memoria deja los tests deterministas y sin
// depender de flags del runtime.
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
      return this.store.size;
    }

    clear(): void {
      this.store.clear();
    }

    getItem(key: string): string | null {
      return this.store.has(key) ? this.store.get(key)! : null;
    }

    setItem(key: string, value: string): void {
      this.store.set(String(key), String(value));
    }

    removeItem(key: string): void {
      this.store.delete(key);
    }

    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}
