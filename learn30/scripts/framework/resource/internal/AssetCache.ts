import { Asset, isValid } from "cc";

export class AssetCache {
    private cache = new Map<string, Asset>();

    public get<T extends Asset>(path: string): T | null {
        const asset = this.cache.get(path);
        if (!asset || !isValid(asset)) {
            return null;
        }
        return asset as T;
    }

    public set(path: string, asset: Asset): void {
        this.cache.set(path, asset);
    }

    public has(path: string): boolean {
        return this.cache.has(path);
    }

    public remove(path: string): void {
        this.cache.delete(path);
    }

    public clear(): void {
        this.cache.clear();
    }
}
