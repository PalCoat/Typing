import { writable } from 'svelte/store';
export let streams: Record<string, ReadableStreamDefaultController>;
export const count = writable(0);

export function Initialize() {
    streams = {};
    count.set(0);
}