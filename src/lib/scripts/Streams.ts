export let streams: Record<string, {controller: ReadableStreamDefaultController, name: string}>;

export function Initialize() {
    streams = {};
}