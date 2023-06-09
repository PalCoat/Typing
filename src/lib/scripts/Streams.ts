import { writable } from 'svelte/store';
export let streams: Record<string, ReadableStreamDefaultController>;

export function Initialize() {
    streams = {};
}