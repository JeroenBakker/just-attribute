export default class MemoryStorage implements Storage {
    public constructor(
        private store: Record<string, string> = {},
    ) {
    }

    public getItem(key: string): string|null {
        return this.store[key] ?? null;
    }

    public setItem(key: string, value: string) {
        this.store[key] = value;
    }

    public clear() {
        this.store = {};
    }

    // the members below have not been implemented

    [name: string]: any;

    public readonly length: number;

    public key(index: number): string | null {
        return undefined;
    }

    public removeItem(key: string): void {
    }
}
