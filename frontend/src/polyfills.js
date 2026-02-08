// src/polyfills.js
// Ensure `global` exists for libraries that expect a Node-like environment
if (typeof globalThis !== "undefined" && typeof globalThis.global === "undefined") {
    globalThis.global = globalThis;
}