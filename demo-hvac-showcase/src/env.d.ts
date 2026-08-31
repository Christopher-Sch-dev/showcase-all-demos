/// <reference path="../.astro/types.d.ts" />

// Tipado del contexto local de Astro (middleware.ts): expone el locale resuelto.
declare namespace App {
  interface Locals {
    locale: 'en' | 'es';
  }
}
