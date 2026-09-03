import { Asset } from "cc";
import { ResourceScopeId } from "../api/ResourceTypes";

export interface CacheEntry<T extends Asset = Asset> {
    asset: T;
    holders: Set<ResourceScopeId>;
}

export class AssetCache {
    private cache = new Map<string, CacheEntry>();

    public get<T extends Asset>(key: string): CacheEntry<T> | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        return entry as CacheEntry<T>;
    }

    public set(key: string, entry: CacheEntry): void {
        this.cache.set(key, entry);
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }

    public remove(key: string): void {
        this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }
}
